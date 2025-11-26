import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Play, Pause, Trophy, Coins } from 'lucide-react';
import { toast } from 'sonner';
import AdBanner from '../components/AdBanner';
import SnakeGame from '../components/games/SnakeGame';
import FlappyGame from '../components/games/FlappyGame';
import MemoryGame from '../components/games/MemoryGame';
import QuizGame from '../components/games/QuizGame';
import PuzzleGame from '../components/games/PuzzleGame';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function GamePlayPage() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [showEntryAd, setShowEntryAd] = useState(false);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [canWatchAd, setCanWatchAd] = useState(true);
  const [nextAdTime, setNextAdTime] = useState(null);
  const [score, setScore] = useState(0);
  const timerRef = useRef(null);
  const sessionStartRef = useRef(null);

  useEffect(() => {
    loadUserAndStartGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const loadUserAndStartGame = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const userResponse = await axios.get(`${API}/user/${storedUser.id}`);
      setUser(userResponse.data);

      const startResponse = await axios.post(`${API}/game/start`, {
        user_id: storedUser.id,
        game_id: gameId
      });

      setSessionId(startResponse.data.session_id);

      if (startResponse.data.needs_entry_ad) {
        setShowEntryAd(true);
      } else {
        startGameSession();
      }
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error('Erro ao iniciar jogo');
    }
  };

  const startGameSession = () => {
    sessionStartRef.current = Date.now();
    setPlaying(true);
    
    timerRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
  };

  const watchEntryAd = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const completeResponse = await axios.post(`${API}/ads/complete`, {
        user_id: user.id,
        ad_type: 'interstitial',
        game_id: gameId
      });

      if (completeResponse.data.reward_granted) {
        toast.success(`+R$ ${completeResponse.data.money_earned.toFixed(2)}`);
      }

      setShowEntryAd(false);
      startGameSession();
    } catch (error) {
      toast.error('Erro ao processar anúncio');
    }
  };

  const requestRewardedAd = async () => {
    try {
      const reqResponse = await axios.post(`${API}/ads/request`, {
        user_id: user.id,
        ad_type: 'rewarded',
        game_id: gameId
      });

      if (!reqResponse.data.allow) {
        if (reqResponse.data.reason === 'cooldown') {
          toast.error(`Aguarde ${reqResponse.data.seconds_remaining}s`);
        } else {
          toast.error('Anúncio não disponível no momento');
        }
        return;
      }

      if (!reqResponse.data.allowReward) {
        toast.info('Limite atingido. Assistir sem ganhar moedas.');
      }

      setShowRewardedAd(true);
    } catch (error) {
      toast.error('Erro ao solicitar anúncio');
    }
  };

  const watchRewardedAd = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const completeResponse = await axios.post(`${API}/ads/complete`, {
        user_id: user.id,
        ad_type: 'rewarded',
        game_id: gameId,
        session_play_time: sessionTime
      });

      if (completeResponse.data.reward_granted) {
        toast.success(`+${completeResponse.data.coins_earned} moedas! (R$ ${completeResponse.data.money_earned.toFixed(2)})`);
      } else {
        toast.info('Anúncio assistido (sem recompensa no momento)');
      }

      setShowRewardedAd(false);
      
      // Update cooldown
      setTimeout(async () => {
        try {
          const reqResponse = await axios.post(`${API}/ads/request`, {
            user_id: user.id,
            ad_type: 'rewarded'
          });
          
          if (!reqResponse.data.allow && reqResponse.data.next_allowed_time) {
            setNextAdTime(reqResponse.data.next_allowed_time);
            setCanWatchAd(false);
          } else {
            setCanWatchAd(true);
          }
        } catch (error) {
          console.error('Error checking ad availability:', error);
        }
      }, 1000);
    } catch (error) {
      toast.error('Erro ao processar anúncio');
    }
  };

  const handleGameEnd = async (finalScore) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    try {
      await axios.post(`${API}/game/complete`, {
        user_id: user.id,
        game_id: gameId,
        session_time: sessionTime,
        score: finalScore,
        level_completed: finalScore > 0
      });
      
      toast.success(`Jogo finalizado! Pontuação: ${finalScore}`);
    } catch (error) {
      console.error('Error completing game:', error);
    }
  };

  const handleExit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    handleGameEnd(score);
    navigate('/games');
  };

  const renderGame = () => {
    const gameProps = {
      onScoreChange: setScore,
      onGameEnd: handleGameEnd,
      playing
    };

    switch (gameId) {
      case 'snake':
        return <SnakeGame {...gameProps} />;
      case 'flappy':
        return <FlappyGame {...gameProps} />;
      case 'memory':
        return <MemoryGame {...gameProps} />;
      case 'quiz':
        return <QuizGame {...gameProps} />;
      case 'puzzle':
        return <PuzzleGame {...gameProps} />;
      default:
        return <p>Jogo não encontrado</p>;
    }
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <AdBanner />
      
      <div className="container mx-auto p-4 pb-8" data-testid="gameplay-page">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" onClick={handleExit} className="text-white" data-testid="exit-button">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          
          <div className="flex items-center gap-4 text-white">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <span className="font-bold" data-testid="score-display">{score}</span>
            </div>
            <div className="text-sm" data-testid="time-display">
              {Math.floor(sessionTime / 60)}:{String(sessionTime % 60).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Game Area */}
        <Card className="mb-4 overflow-hidden" data-testid="game-canvas">
          {renderGame()}
        </Card>

        {/* Controls */}
        <div className="flex gap-2">
          <Button 
            onClick={() => setPlaying(!playing)} 
            className="flex-1"
            data-testid="pause-play-button"
          >
            {playing ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
            {playing ? 'Pausar' : 'Continuar'}
          </Button>
          
          <Button 
            onClick={requestRewardedAd} 
            className="flex-1 bg-yellow-500 hover:bg-yellow-600"
            disabled={!canWatchAd || sessionTime < 30}
            data-testid="watch-ad-button"
          >
            <Coins className="w-5 h-5 mr-2" />
            {sessionTime < 30 ? `Aguarde ${30 - sessionTime}s` : 'Assistir +200 moedas'}
          </Button>
        </div>
      </div>

      {/* Entry Ad Modal */}
      <Dialog open={showEntryAd} onOpenChange={() => {}}>
        <DialogContent className="max-w-md" data-testid="entry-ad-modal">
          <DialogHeader>
            <DialogTitle>Anúncio Obrigatório</DialogTitle>
            <DialogDescription>
              Ao entrar no jogo você precisa assistir 1 anúncio. Depois, 4 anúncios recompensados opcionais estarão disponíveis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
              <p className="text-center text-muted-foreground">Simulando anúncio intersticial...</p>
            </div>
            <Button onClick={watchEntryAd} className="w-full" data-testid="watch-entry-ad-button">
              Continuar após anúncio
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rewarded Ad Modal */}
      <Dialog open={showRewardedAd} onOpenChange={setShowRewardedAd}>
        <DialogContent className="max-w-md" data-testid="rewarded-ad-modal">
          <DialogHeader>
            <DialogTitle>Anúncio Recompensado</DialogTitle>
            <DialogDescription>
              Assista o anúncio completo para ganhar moedas!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 min-h-[250px] flex items-center justify-center">
              <p className="text-center text-muted-foreground">Simulando anúncio recompensado...</p>
            </div>
            <Button onClick={watchRewardedAd} className="w-full" data-testid="watch-rewarded-ad-button">
              Concluir e receber recompensa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
