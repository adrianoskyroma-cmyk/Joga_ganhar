import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Coins, Gamepad2, Trophy, Wallet, HelpCircle, LogOut, Star } from 'lucide-react';
import AdBanner from '../components/AdBanner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [dailyAdsWatched, setDailyAdsWatched] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`${API}/user/${storedUser.id}`);
      setUser(response.data);
      
      // Check if needs daily unlock
      if (!response.data.daily_access_unlocked) {
        setShowDailyModal(true);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const watchDailyAd = async () => {
    try {
      // Request ad
      const reqResponse = await axios.post(`${API}/ads/request`, {
        user_id: user.id,
        ad_type: 'rewarded'
      });

      if (!reqResponse.data.allow) {
        toast.error('Anúncio não disponível no momento');
        return;
      }

      // Simulate ad watch (in production, this would be AdMob SDK)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Complete ad
      const completeResponse = await axios.post(`${API}/ads/complete`, {
        user_id: user.id,
        ad_type: 'rewarded'
      });

      if (completeResponse.data.reward_granted) {
        toast.success(`+R$ ${completeResponse.data.money_earned.toFixed(2)}`);
      }

      const newCount = dailyAdsWatched + 1;
      setDailyAdsWatched(newCount);

      if (newCount >= 5) {
        toast.success('Acesso diário liberado! Agora você pode jogar.');
        setShowDailyModal(false);
        loadUser();
      }
    } catch (error) {
      console.error('Error watching ad:', error);
      toast.error('Erro ao processar anúncio');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <AdBanner />
      
      <div className="container mx-auto p-4 pb-8" data-testid="home-page">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white" style={{fontFamily: 'Nunito'}}>Olá, {user?.name}!</h1>
            <p className="text-white/80 text-sm mt-1">Bem-vindo ao Jogar Ganhar</p>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-white" data-testid="logout-button">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Balance Card */}
        <Card className="mb-6 shadow-xl" data-testid="balance-card">
          <CardHeader className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-6 h-6" />
              Seu Saldo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold" style={{fontFamily: 'Nunito'}} data-testid="coin-balance">{user?.coins?.toLocaleString()} moedas</p>
                <p className="text-2xl font-semibold text-green-600 mt-2" data-testid="money-balance">R$ {user?.money_balance?.toFixed(2)}</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>10.000 moedas = R$ 1,00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Button 
            onClick={() => navigate('/games')} 
            className="h-24 flex flex-col gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            data-testid="play-button"
          >
            <Gamepad2 className="w-8 h-8" />
            <span className="font-semibold">JOGAR</span>
          </Button>
          
          <Button 
            onClick={() => navigate('/coins')} 
            className="h-24 flex flex-col gap-2 bg-yellow-500 hover:bg-yellow-600 text-white"
            data-testid="coins-button"
          >
            <Coins className="w-8 h-8" />
            <span className="font-semibold">MOEDAS</span>
          </Button>
          
          <Button 
            onClick={() => navigate('/ranking')} 
            className="h-24 flex flex-col gap-2 bg-orange-500 hover:bg-orange-600 text-white"
            data-testid="ranking-button"
          >
            <Trophy className="w-8 h-8" />
            <span className="font-semibold">RANKING</span>
          </Button>
          
          <Button 
            onClick={() => navigate('/withdraw')} 
            className="h-24 flex flex-col gap-2 bg-green-600 hover:bg-green-700 text-white"
            disabled={!user?.daily_access_unlocked}
            data-testid="withdraw-button"
          >
            <Wallet className="w-8 h-8" />
            <span className="font-semibold">SACAR</span>
          </Button>
        </div>

        {/* Stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Suas Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Tempo de Jogo</span>
                <span className="text-sm font-semibold">{Math.floor((user?.total_play_time || 0) / 60)} min / 60 min</span>
              </div>
              <Progress value={Math.min(((user?.total_play_time || 0) / 60 / 60) * 100, 100)} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Jogos Diferentes</span>
                <span className="text-sm font-semibold">{user?.games_played_distinct?.length || 0} / 3</span>
              </div>
              <Progress value={Math.min(((user?.games_played_distinct?.length || 0) / 3) * 100, 100)} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Anúncios Hoje</span>
                <span className="text-sm font-semibold">{user?.ads_today_count || 0} / 80</span>
              </div>
              <Progress value={Math.min(((user?.ads_today_count || 0) / 80) * 100, 100)} />
            </div>
          </CardContent>
        </Card>

        {/* Help Button */}
        <Button 
          onClick={() => navigate('/help')} 
          variant="outline" 
          className="w-full"
          data-testid="help-button"
        >
          <HelpCircle className="w-5 h-5 mr-2" />
          Central de Ajuda
        </Button>
      </div>

      {/* Daily Access Modal */}
      <Dialog open={showDailyModal} onOpenChange={setShowDailyModal}>
        <DialogContent className="max-w-md" data-testid="daily-modal">
          <DialogHeader>
            <DialogTitle className="text-2xl" style={{fontFamily: 'Nunito'}}>Bônus Diário</DialogTitle>
            <DialogDescription>
              Assista 5 anúncios obrigatórios para liberar o app hoje e habilitar o saque.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-purple-600">{dailyAdsWatched} / 5</p>
              <p className="text-sm text-muted-foreground mt-2">Anúncios assistidos</p>
            </div>
            <Progress value={(dailyAdsWatched / 5) * 100} className="h-3" />
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold">Primeiros 5 anúncios = R$ 0,50 cada!</span>
              </p>
            </div>
            <Button 
              onClick={watchDailyAd} 
              className="w-full" 
              size="lg"
              disabled={dailyAdsWatched >= 5}
              data-testid="watch-daily-ad-button"
            >
              {dailyAdsWatched >= 5 ? 'Concluído!' : 'Assistir Anúncio'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
