from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import math

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

# Constants
COINS_PER_CENT = 10000  # 10000 coins = R$ 1.00
STANDARD_AD_REWARD_COINS = 200  # R$ 0.02
BONUS_FIRST_5_ADS_BRL = 0.50  # R$ 0.50 for first 5 ads
BONUS_FIRST_5_ADS_COINS = int(BONUS_FIRST_5_ADS_BRL * COINS_PER_CENT)
AD_COOLDOWN_SECONDS = 45
HOURLY_AD_LIMIT = 15
DAILY_AD_LIMIT = 80
MIN_WITHDRAW_BRL = 10.00
WEEKLY_WITHDRAW_LIMIT_BRL = 20.00
WITHDRAW_DEVICE_COOLDOWN_HOURS = 48
MIN_PLAY_TIME_MINUTES = 60
MIN_GAMES_PLAYED = 3
MIN_SESSION_TIME_FOR_AD = 30  # seconds

# Create the main app
app = FastAPI(title="Jogar Ganhar API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Models
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    device_id: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    coins: int = 0
    total_play_time: int = 0  # in seconds
    ads_today_count: int = 0
    ads_total_count: int = 0
    daily_first_5_count: int = 0
    daily_access_unlocked: bool = False
    first_game_ad_done: bool = False
    suspect_flag: bool = False
    status: str = "active"
    games_played_distinct: List[str] = []
    last_daily_reset: str
    created_at: str
    device_id: str

class AdRequest(BaseModel):
    user_id: str
    game_id: Optional[str] = None
    ad_type: str  # "rewarded", "interstitial", "banner"

class AdComplete(BaseModel):
    user_id: str
    ad_type: str
    game_id: Optional[str] = None
    session_play_time: int = 0

class GameStart(BaseModel):
    user_id: str
    game_id: str

class GameComplete(BaseModel):
    user_id: str
    game_id: str
    session_time: int
    score: int = 0
    level_completed: bool = False

class WithdrawRequest(BaseModel):
    user_id: str
    amount: float
    method: str  # "pix"
    pix_key: str

class SupportTicket(BaseModel):
    user_id: str
    type: str
    message: str

class AdminAction(BaseModel):
    withdrawal_id: str
    action: str  # "approve" or "reject"
    reason: Optional[str] = None

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_token(credentials.credentials)
    user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

async def check_and_reset_daily(user: dict) -> dict:
    """Reset daily counters if new day"""
    now = datetime.now(timezone.utc)
    last_reset = datetime.fromisoformat(user.get('last_daily_reset', now.isoformat()))
    
    if last_reset.date() < now.date():
        await db.users.update_one(
            {"id": user['id']},
            {"$set": {
                "ads_today_count": 0,
                "daily_first_5_count": 0,
                "daily_access_unlocked": False,
                "first_game_ad_done": False,
                "last_daily_reset": now.isoformat()
            }}
        )
        user['ads_today_count'] = 0
        user['daily_first_5_count'] = 0
        user['daily_access_unlocked'] = False
        user['first_game_ad_done'] = False
        user['last_daily_reset'] = now.isoformat()
    
    return user

async def get_ads_last_hour(user_id: str) -> List[dict]:
    """Get ads watched in the last hour"""
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    ads = await db.ads_events.find({
        "user_id": user_id,
        "timestamp": {"$gte": one_hour_ago.isoformat()},
        "reward_granted": True
    }).to_list(None)
    return ads

async def check_fraud_signals(user_id: str) -> bool:
    """Check for fraud patterns"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        return False
    
    # Calculate ads per minute
    recent_ads = await db.ads_events.find({
        "user_id": user_id,
        "timestamp": {"$gte": (datetime.now(timezone.utc) - timedelta(minutes=10)).isoformat()}
    }).to_list(None)
    
    if len(recent_ads) > 5:  # More than 5 ads in 10 minutes = suspicious
        ads_per_minute = len(recent_ads) / 10
        if ads_per_minute > 0.5:
            await db.fraud_flags.insert_one({
                "user_id": user_id,
                "flag_type": "high_ad_rate",
                "details": f"ads_per_minute: {ads_per_minute}",
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            await db.users.update_one({"id": user_id}, {"$set": {"suspect_flag": True}})
            return True
    
    return False

# Routes
@api_router.post("/auth/register")
async def register(data: UserRegister):
    # Check if email exists
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    user_doc = {
        "id": user_id,
        "name": data.name,
        "email": data.email,
        "password": hash_password(data.password),
        "device_id": data.device_id,
        "coins": 0,
        "total_play_time": 0,
        "ads_today_count": 0,
        "ads_total_count": 0,
        "daily_first_5_count": 0,
        "daily_access_unlocked": False,
        "first_game_ad_done": False,
        "suspect_flag": False,
        "status": "active",
        "games_played_distinct": [],
        "last_daily_reset": now,
        "created_at": now,
        "ads_timestamps": []
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id)
    del user_doc['password']
    del user_doc['_id']
    
    return {"token": token, "user": user_doc}

@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'])
    del user['password']
    
    return {"token": token, "user": user}

@api_router.get("/user/{user_id}")
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check and reset daily
    user = await check_and_reset_daily(user)
    
    # Calculate money balance
    money_balance = user['coins'] / COINS_PER_CENT
    
    return {
        **user,
        "money_balance": round(money_balance, 2),
        "coins_per_real": COINS_PER_CENT
    }

@api_router.get("/games")
async def get_games():
    games = [
        {"id": "snake", "name": "Cobrinha", "icon": "🐍", "min_time": 120},
        {"id": "flappy", "name": "Flappy Bird", "icon": "🐦", "min_time": 90},
        {"id": "memory", "name": "Jogo da Memória", "icon": "🧠", "min_time": 60},
        {"id": "quiz", "name": "Quiz", "icon": "❓", "min_time": 180},
        {"id": "puzzle", "name": "Quebra-cabeça", "icon": "🧩", "min_time": 120}
    ]
    return {"games": games}

@api_router.post("/game/start")
async def game_start(data: GameStart):
    user = await db.users.find_one({"id": data.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = await check_and_reset_daily(user)
    
    session_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    session_doc = {
        "id": session_id,
        "user_id": data.user_id,
        "game_id": data.game_id,
        "start_time": now,
        "end_time": None,
        "elapsed_time": 0
    }
    
    await db.game_sessions.insert_one(session_doc)
    
    return {
        "session_id": session_id,
        "needs_entry_ad": not user['first_game_ad_done'],
        "daily_unlocked": user['daily_access_unlocked']
    }

@api_router.post("/game/complete")
async def game_complete(data: GameComplete):
    user = await db.users.find_one({"id": data.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update play time
    new_total = user.get('total_play_time', 0) + data.session_time
    
    # Add game to distinct list
    games_played = user.get('games_played_distinct', [])
    if data.game_id not in games_played:
        games_played.append(data.game_id)
    
    await db.users.update_one(
        {"id": data.user_id},
        {"$set": {
            "total_play_time": new_total,
            "games_played_distinct": games_played
        }}
    )
    
    # Reward coins for level completion
    if data.level_completed:
        await db.users.update_one(
            {"id": data.user_id},
            {"$inc": {"coins": 50}}
        )
    
    return {"success": True, "total_play_time": new_total}

@api_router.post("/ads/request")
async def ad_request(data: AdRequest):
    user = await db.users.find_one({"id": data.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = await check_and_reset_daily(user)
    
    now = datetime.now(timezone.utc)
    
    # Get last hour ads
    last_hour_ads = await get_ads_last_hour(data.user_id)
    ads_last_hour_count = len(last_hour_ads)
    
    # Check daily limit
    if user['ads_today_count'] >= DAILY_AD_LIMIT:
        return {
            "allow": True,
            "allowReward": False,
            "reason": "daily_limit_reached",
            "next_allowed_time": (now + timedelta(days=1)).replace(hour=0, minute=0).isoformat()
        }
    
    # Check hourly limit
    if ads_last_hour_count >= HOURLY_AD_LIMIT:
        # Find oldest ad in last hour
        oldest_ad = min(last_hour_ads, key=lambda x: x['timestamp'])
        next_time = datetime.fromisoformat(oldest_ad['timestamp']) + timedelta(hours=1)
        
        return {
            "allow": True,
            "allowReward": False,
            "reason": "hourly_limit_reached",
            "next_allowed_time": next_time.isoformat(),
            "ads_last_hour": ads_last_hour_count
        }
    
    # Check cooldown
    ads_timestamps = user.get('ads_timestamps', [])
    if ads_timestamps:
        last_ad_time = datetime.fromisoformat(ads_timestamps[-1])
        time_since_last = (now - last_ad_time).total_seconds()
        
        if time_since_last < AD_COOLDOWN_SECONDS:
            next_time = last_ad_time + timedelta(seconds=AD_COOLDOWN_SECONDS)
            return {
                "allow": False,
                "allowReward": False,
                "reason": "cooldown",
                "next_allowed_time": next_time.isoformat(),
                "seconds_remaining": int(AD_COOLDOWN_SECONDS - time_since_last)
            }
    
    return {
        "allow": True,
        "allowReward": True,
        "ads_today_count": user['ads_today_count'],
        "ads_last_hour": ads_last_hour_count
    }

@api_router.post("/ads/complete")
async def ad_complete(data: AdComplete):
    user = await db.users.find_one({"id": data.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = await check_and_reset_daily(user)
    now = datetime.now(timezone.utc)
    
    # Check if reward should be granted
    request_result = await ad_request(AdRequest(
        user_id=data.user_id,
        game_id=data.game_id,
        ad_type=data.ad_type
    ))
    
    reward_granted = request_result['allowReward']
    reward_amount = 0
    
    if reward_granted:
        # Check if first 5 ads (bonus)
        if user['daily_first_5_count'] < 5:
            reward_amount = BONUS_FIRST_5_ADS_COINS
            await db.users.update_one(
                {"id": data.user_id},
                {"$inc": {"daily_first_5_count": 1}}
            )
        else:
            reward_amount = STANDARD_AD_REWARD_COINS
        
        # Grant coins
        await db.users.update_one(
            {"id": data.user_id},
            {
                "$inc": {"coins": reward_amount, "ads_today_count": 1, "ads_total_count": 1},
                "$push": {"ads_timestamps": now.isoformat()}
            }
        )
    else:
        # Still count as ad viewed but no reward
        await db.users.update_one(
            {"id": data.user_id},
            {"$push": {"ads_timestamps": now.isoformat()}}
        )
    
    # Log ad event
    ad_event = {
        "id": str(uuid.uuid4()),
        "user_id": data.user_id,
        "ad_type": data.ad_type,
        "game_id": data.game_id,
        "timestamp": now.isoformat(),
        "reward_amount": reward_amount,
        "reward_granted": reward_granted
    }
    await db.ads_events.insert_one(ad_event)
    
    # Check fraud
    await check_fraud_signals(data.user_id)
    
    return {
        "success": True,
        "reward_granted": reward_granted,
        "reward_amount": reward_amount,
        "coins_earned": reward_amount,
        "money_earned": round(reward_amount / COINS_PER_CENT, 2)
    }

@api_router.get("/ranking")
async def get_ranking(period: str = "today"):
    # Get real users
    now = datetime.now(timezone.utc)
    
    if period == "today":
        start = now.replace(hour=0, minute=0, second=0)
    elif period == "week":
        start = now - timedelta(days=7)
    else:
        start = now.replace(day=1, hour=0, minute=0, second=0)
    
    # Aggregate coins earned in period
    pipeline = [
        {"$match": {"timestamp": {"$gte": start.isoformat()}, "reward_granted": True}},
        {"$group": {"_id": "$user_id", "coins_earned": {"$sum": "$reward_amount"}}},
        {"$sort": {"coins_earned": -1}},
        {"$limit": 40}
    ]
    
    user_rankings = await db.ads_events.aggregate(pipeline).to_list(None)
    
    # Get user details
    ranking = []
    for item in user_rankings:
        user = await db.users.find_one({"id": item['_id']}, {"_id": 0, "password": 0})
        if user:
            ranking.append({
                "user_id": user['id'],
                "name": user['name'],
                "coins_earned": item['coins_earned'],
                "is_bot": False
            })
    
    # Add bots
    bot_names = [
        "Lucas Silva", "Maria Santos", "João Oliveira", "Ana Costa",
        "Pedro Almeida", "Julia Ferreira", "Carlos Souza", "Beatriz Lima",
        "Rafael Pereira", "Camila Rodrigues"
    ]
    
    import random
    random.seed(now.hour)
    
    for i, name in enumerate(bot_names):
        base_score = 15000 - (i * 1000)
        offset = random.randint(-500, 500)
        ranking.insert(random.randint(0, min(len(ranking), 10)), {
            "user_id": f"bot_{i}",
            "name": name,
            "coins_earned": base_score + offset,
            "is_bot": True
        })
    
    # Re-sort and add positions
    ranking = sorted(ranking, key=lambda x: x['coins_earned'], reverse=True)[:50]
    for i, item in enumerate(ranking):
        item['position'] = i + 1
    
    return {"ranking": ranking}

@api_router.post("/withdraw")
async def request_withdraw(data: WithdrawRequest):
    user = await db.users.find_one({"id": data.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = await check_and_reset_daily(user)
    
    # Check requirements
    errors = []
    
    money_balance = user['coins'] / COINS_PER_CENT
    
    if not user['daily_access_unlocked']:
        errors.append("Você precisa assistir 5 anúncios diários para liberar o saque")
    
    if not user['first_game_ad_done']:
        errors.append("Você precisa assistir o anúncio ao entrar no jogo")
    
    if money_balance < MIN_WITHDRAW_BRL:
        errors.append(f"Saldo mínimo: R$ {MIN_WITHDRAW_BRL:.2f}")
    
    if user['total_play_time'] < MIN_PLAY_TIME_MINUTES * 60:
        errors.append(f"Tempo mínimo de jogo: {MIN_PLAY_TIME_MINUTES} minutos")
    
    if len(user.get('games_played_distinct', [])) < MIN_GAMES_PLAYED:
        errors.append(f"Você precisa jogar pelo menos {MIN_GAMES_PLAYED} jogos diferentes")
    
    if user['suspect_flag']:
        errors.append("Sua conta está sob análise. Entre em contato com o suporte.")
    
    # Check device cooldown
    last_withdraw = await db.withdrawals.find_one(
        {"device_id": user['device_id'], "status": "processed"},
        sort=[("processed_at", -1)]
    )
    
    if last_withdraw and last_withdraw.get('processed_at'):
        last_time = datetime.fromisoformat(last_withdraw['processed_at'])
        hours_since = (datetime.now(timezone.utc) - last_time).total_seconds() / 3600
        if hours_since < WITHDRAW_DEVICE_COOLDOWN_HOURS:
            errors.append(f"Aguarde {int(WITHDRAW_DEVICE_COOLDOWN_HOURS - hours_since)}h para próximo saque")
    
    # Check weekly limit
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    weekly_withdrawals = await db.withdrawals.find({
        "user_id": data.user_id,
        "status": "processed",
        "processed_at": {"$gte": week_ago.isoformat()}
    }).to_list(None)
    
    weekly_total = sum(w['amount'] for w in weekly_withdrawals)
    if weekly_total + data.amount > WEEKLY_WITHDRAW_LIMIT_BRL:
        errors.append(f"Limite semanal: R$ {WEEKLY_WITHDRAW_LIMIT_BRL:.2f}")
    
    if errors:
        raise HTTPException(status_code=400, detail={"errors": errors})
    
    # Create withdrawal request
    withdrawal_id = str(uuid.uuid4())
    withdrawal_doc = {
        "id": withdrawal_id,
        "user_id": data.user_id,
        "device_id": user['device_id'],
        "amount": data.amount,
        "coins_deducted": int(data.amount * COINS_PER_CENT),
        "method": data.method,
        "pix_key": data.pix_key,
        "status": "pending",
        "requested_at": datetime.now(timezone.utc).isoformat(),
        "processed_at": None
    }
    
    await db.withdrawals.insert_one(withdrawal_doc)
    
    # Deduct coins
    await db.users.update_one(
        {"id": data.user_id},
        {"$inc": {"coins": -withdrawal_doc['coins_deducted']}}
    )
    
    return {
        "success": True,
        "withdrawal_id": withdrawal_id,
        "message": "Solicitação recebida! Pagamento em até 48h."
    }

@api_router.get("/withdrawals/{user_id}")
async def get_user_withdrawals(user_id: str):
    withdrawals = await db.withdrawals.find({"user_id": user_id}, {"_id": 0}).to_list(None)
    return {"withdrawals": withdrawals}

@api_router.post("/support/ticket")
async def create_ticket(data: SupportTicket):
    ticket_id = str(uuid.uuid4())
    ticket_doc = {
        "id": ticket_id,
        "user_id": data.user_id,
        "type": data.type,
        "message": data.message,
        "status": "open",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.support_tickets.insert_one(ticket_doc)
    return {"success": True, "ticket_id": ticket_id}

@api_router.get("/coins-history/{user_id}")
async def get_coins_history(user_id: str, limit: int = 30):
    events = await db.ads_events.find(
        {"user_id": user_id, "reward_granted": True},
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(None)
    
    return {"history": events}

# Admin Routes
@api_router.get("/admin/withdrawals")
async def get_pending_withdrawals():
    withdrawals = await db.withdrawals.find(
        {"status": "pending"},
        {"_id": 0}
    ).sort("requested_at", 1).to_list(None)
    
    # Enrich with user data
    for w in withdrawals:
        user = await db.users.find_one({"id": w['user_id']}, {"_id": 0, "password": 0})
        w['user'] = user
    
    return {"withdrawals": withdrawals}

@api_router.post("/admin/withdrawal-action")
async def admin_withdrawal_action(data: AdminAction):
    withdrawal = await db.withdrawals.find_one({"id": data.withdrawal_id}, {"_id": 0})
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")
    
    if data.action == "approve":
        await db.withdrawals.update_one(
            {"id": data.withdrawal_id},
            {"$set": {
                "status": "processed",
                "processed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        return {"success": True, "message": "Saque aprovado"}
    
    elif data.action == "reject":
        # Refund coins
        await db.users.update_one(
            {"id": withdrawal['user_id']},
            {"$inc": {"coins": withdrawal['coins_deducted']}}
        )
        
        await db.withdrawals.update_one(
            {"id": data.withdrawal_id},
            {"$set": {
                "status": "rejected",
                "reject_reason": data.reason,
                "processed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        return {"success": True, "message": "Saque rejeitado e moedas devolvidas"}

@api_router.get("/admin/suspects")
async def get_suspect_users():
    suspects = await db.users.find(
        {"suspect_flag": True},
        {"_id": 0, "password": 0}
    ).to_list(None)
    
    # Get fraud flags
    for user in suspects:
        flags = await db.fraud_flags.find({"user_id": user['id']}, {"_id": 0}).to_list(None)
        user['fraud_flags'] = flags
    
    return {"suspects": suspects}

@api_router.post("/admin/clear-suspect")
async def clear_suspect(user_id: str):
    await db.users.update_one({"id": user_id}, {"$set": {"suspect_flag": False}})
    return {"success": True}

@api_router.get("/user/sync-balance/{user_id}")
async def sync_balance(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "coins": user['coins'],
        "money_balance": round(user['coins'] / COINS_PER_CENT, 2)
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
