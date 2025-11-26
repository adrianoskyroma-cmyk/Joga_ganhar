# Jogar Ganhar - Aplicativo de Mini-Jogos com Recompensas

## 📱 Sobre o App

**Jogar Ganhar** é uma plataforma de mini-jogos onde usuários podem jogar, assistir anúncios e ganhar dinheiro real via Pix.

### Características Principais:
- ✅ 5 Mini-jogos: Cobrinha, Flappy Bird, Jogo da Memória, Quiz, Quebra-cabeça
- ✅ Sistema de moedas: 10.000 moedas = R$ 1,00
- ✅ Anúncios recompensados integrados com AdMob
- ✅ Bônus diário: Primeiros 5 anúncios = R$ 0,50 cada
- ✅ Sistema de saque via Pix (mínimo R$ 10,00)
- ✅ Ranking com bots para engajamento
- ✅ Sistema antifraude automático
- ✅ Central de ajuda
- ✅ Painel administrativo

---

## 🎮 Mini-Jogos Disponíveis

1. **Cobrinha (Snake)** - Controle com setas do teclado
2. **Flappy Bird** - Clique ou Espaço para pular
3. **Jogo da Memória** - Encontre todos os pares
4. **Quiz** - Responda perguntas de conhecimentos gerais
5. **Quebra-cabeça** - Organize os números em ordem

---

## 💰 Sistema de Moedas e Recompensas

### Conversão
- 200 moedas = R$ 0,02 (padrão por anúncio)
- 10.000 moedas = R$ 1,00
- Bônus: Primeiros 5 anúncios do dia = R$ 0,50 cada (5.000 moedas)

### Limites de Anúncios
- **Por hora**: 15 anúncios recompensados (rolling window)
- **Por dia**: 80 anúncios recompensados
- **Cooldown**: 45 segundos entre anúncios
- **Comportamento**: Quando atingir o limite, pode assistir anúncios mas não recebe moedas até o limite reiniciar

### Anúncios Obrigatórios
1. **5 anúncios diários** - Necessário no primeiro acesso do dia para liberar o app
2. **1 anúncio ao entrar no jogo** - Necessário no primeiro jogo do dia

---

## 💸 Sistema de Saque

### Requisitos para Sacar
✅ Assistir 5 anúncios diários  
✅ Assistir 5 anúncios ao entrar no jogo  
✅ Saldo mínimo: R$ 10,00  
✅ Tempo mínimo de jogo: 60 minutos  
✅ Jogar pelo menos 3 jogos diferentes  
✅ Conta sem flag de suspeita  
✅ 1 saque por dispositivo a cada 48h  
✅ Máximo semanal: R$ 20,00  

### Processo de Saque
1. Usuário solicita saque via Pix
2. Sistema valida requisitos
3. Admin aprova manualmente no painel
4. Pagamento processado em até 48h

---

## 🔒 Sistema Antifraude

### Métricas Monitoradas
- Taxa de anúncios por minuto
- Anúncios na última hora e no dia
- Tempo de sessão vs quantidade de anúncios
- Mudanças de IP frequentes
- Detecção de emulador
- Padrões de cliques automatizados

### Ações Automáticas ao Detectar Fraude
- ❌ **NÃO bloqueia** exibição de anúncios
- ⚠️ Marca conta com `suspect_flag = true`
- 🚫 Bloqueia saques até revisão
- ⬇️ Reduz recompensas (200 → 50 moedas)
- ⏱️ Aumenta cooldown (45s → 180s)
- 📧 Notifica admin para revisão manual

---

## 🏆 Sistema de Ranking

- Top 50 jogadores por moedas ganhas
- 10 bots misturados para criar competição
- Filtros: Hoje / Semana / Mês
- Atualização dinâmica dos bots

---

## 🛠️ Tecnologias Utilizadas

### Backend
- FastAPI (Python)
- MongoDB (motor)
- JWT para autenticação
- Bcrypt para senhas

### Frontend
- React 19
- React Router
- Shadcn UI Components
- Tailwind CSS
- Axios

### Integrações
- AdMob (IDs configurados)
  - App ID: `ca-app-pub-1117855481975276~7365411747`
  - Banner: `ca-app-pub-1117855481975276/2635829244`
  - Interstitial: `ca-app-pub-1117855481975276/6364865851`
  - Rewarded: `ca-app-pub-1117855481975276/5027733451`

---

## 📋 Estrutura do Banco de Dados

### Collections

#### users
```javascript
{
  id: string,
  name: string,
  email: string,
  password: string (hashed),
  device_id: string,
  coins: number,
  total_play_time: number (seconds),
  ads_today_count: number,
  ads_total_count: number,
  daily_first_5_count: number,
  daily_access_unlocked: boolean,
  first_game_ad_done: boolean,
  suspect_flag: boolean,
  status: string,
  games_played_distinct: array,
  last_daily_reset: datetime,
  created_at: datetime,
  ads_timestamps: array
}
```

#### ads_events
```javascript
{
  id: string,
  user_id: string,
  ad_type: string,
  game_id: string,
  timestamp: datetime,
  reward_amount: number,
  reward_granted: boolean
}
```

#### withdrawals
```javascript
{
  id: string,
  user_id: string,
  device_id: string,
  amount: float,
  coins_deducted: number,
  method: string,
  pix_key: string,
  status: string, // pending, processed, rejected
  requested_at: datetime,
  processed_at: datetime
}
```

#### fraud_flags
```javascript
{
  user_id: string,
  flag_type: string,
  details: string,
  created_at: datetime
}
```

---

## 🎯 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Fazer login

### Usuário
- `GET /api/user/{user_id}` - Obter dados do usuário
- `GET /api/user/sync-balance/{user_id}` - Sincronizar saldo

### Jogos
- `GET /api/games` - Listar jogos disponíveis
- `POST /api/game/start` - Iniciar sessão de jogo
- `POST /api/game/complete` - Finalizar sessão

### Anúncios
- `POST /api/ads/request` - Solicitar anúncio (verifica limites)
- `POST /api/ads/complete` - Completar anúncio (credita moedas)

### Moedas
- `GET /api/coins-history/{user_id}` - Histórico de ganhos

### Ranking
- `GET /api/ranking?period=today` - Obter ranking (today/week/month)

### Saque
- `POST /api/withdraw` - Solicitar saque
- `GET /api/withdrawals/{user_id}` - Histórico de saques

### Suporte
- `POST /api/support/ticket` - Abrir chamado de suporte

### Admin
- `GET /api/admin/withdrawals` - Listar saques pendentes
- `POST /api/admin/withdrawal-action` - Aprovar/Rejeitar saque
- `GET /api/admin/suspects` - Listar contas suspeitas
- `POST /api/admin/clear-suspect` - Limpar flag de suspeita

---

## 🚀 Como Rodar

### Backend
```bash
cd /app/backend
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Frontend
```bash
cd /app/frontend
yarn install
yarn start
```

### Variáveis de Ambiente

**Backend (.env)**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=jogar_ganhar_db
CORS_ORIGINS=*
JWT_SECRET=your-secret-key
```

**Frontend (.env)**
```
REACT_APP_BACKEND_URL=https://your-backend-url.com
```

---

## 📱 Páginas do App

1. **Login/Registro** - Autenticação de usuários
2. **Home** - Dashboard principal com saldo e estatísticas
3. **Games** - Lista de mini-jogos disponíveis
4. **GamePlay** - Tela de jogo com anúncios recompensados
5. **Moedas** - Histórico de ganhos e sincronização
6. **Ranking** - Top 50 jogadores
7. **Saque** - Solicitação de saque via Pix
8. **Ajuda** - Central de ajuda com tópicos comuns
9. **Admin** - Painel administrativo

---

## 🎨 Design

### Cores
- Primary: Purple (#667eea, #764ba2)
- Secondary: Yellow/Gold (moedas)
- Success: Green (aprovações)
- Danger: Red (rejeições)

### Fontes
- Títulos: Nunito (700, 800)
- Corpo: Inter (400, 500, 600)

### Componentes
- Shadcn UI para componentes base
- Tailwind CSS para estilização
- Animações suaves em hover/transições

---

## 📞 Central de Ajuda - Tópicos

1. **Pagamento não caiu** - Orientações sobre prazo e requisitos
2. **Anúncio não apareceu** - Dicas de troubleshooting
3. **Jogo travou** - Soluções para problemas técnicos
4. **Minhas moedas sumiram** - Sincronização de saldo
5. **Saque bloqueado** - Explicação de requisitos e restrições
6. **Falar com atendente** - Abrir chamado de suporte

---

## ⚙️ Configurações Ajustáveis

Todas as constantes estão no início do arquivo `server.py` para fácil ajuste:

```python
COINS_PER_CENT = 10000  # 10000 moedas = R$ 1.00
STANDARD_AD_REWARD_COINS = 200  # R$ 0.02
BONUS_FIRST_5_ADS_BRL = 0.50  # R$ 0.50
AD_COOLDOWN_SECONDS = 45
HOURLY_AD_LIMIT = 15
DAILY_AD_LIMIT = 80
MIN_WITHDRAW_BRL = 10.00
WEEKLY_WITHDRAW_LIMIT_BRL = 20.00
WITHDRAW_DEVICE_COOLDOWN_HOURS = 48
MIN_PLAY_TIME_MINUTES = 60
MIN_GAMES_PLAYED = 3
MIN_SESSION_TIME_FOR_AD = 30
```

---

## 📝 Notas Importantes

### Integração AdMob Real
Para produção, você precisa:
1. Integrar o SDK do AdMob no frontend
2. Implementar callbacks reais de anúncios
3. Validar tokens de recompensa do AdMob no backend
4. Configurar medição de anúncios corretamente

### Sistema de Pagamento
Atualmente configurado para **aprovação manual** via painel admin. Para automação, integre com:
- Mercado Pago API
- PagSeguro API
- Asaas API
- Ou outro gateway de sua preferência

### Segurança
- ⚠️ Trocar `JWT_SECRET` em produção
- ⚠️ Implementar rate limiting
- ⚠️ Usar HTTPS obrigatoriamente
- ⚠️ Implementar CAPTCHA para ações sensíveis
- ⚠️ Validar tokens do AdMob server-side

---

## 📊 Métricas Importantes

Monitore no painel admin:
- DAU/MAU (Usuários ativos)
- Ads served / day
- Payouts / day
- Fraud rate (%)
- Retention rate
- ARPU (Average Revenue Per User)

---

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Verificar logs
tail -f /var/log/supervisor/backend.err.log

# Verificar MongoDB
sudo supervisorctl status mongodb
```

### Frontend não compila
```bash
# Limpar cache
cd /app/frontend
rm -rf node_modules package-lock.json
yarn install
```

### Anúncios não aparecem
- Verificar IDs do AdMob
- Verificar disponibilidade de inventário na sua região
- Implementar SDK real do AdMob (atualmente simulado)

---

## 📄 Licença

Projeto desenvolvido para fins educacionais.

---

## 👨‍💻 Desenvolvido por

Emergent AI - Sistema de desenvolvimento automatizado

**Data**: Janeiro 2025
**Stack**: FastAPI + React + MongoDB
**Hospedagem**: Emergent Platform
