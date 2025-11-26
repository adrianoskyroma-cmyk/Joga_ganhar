import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Trophy, Medal, Crown } from 'lucide-react';
import { toast } from 'sonner';
import AdBanner from '../components/AdBanner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function RankingPage() {
  const navigate = useNavigate();
  const [ranking, setRanking] = useState([]);
  const [period, setPeriod] = useState('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRanking();
  }, [period]);

  const loadRanking = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/ranking?period=${period}`);
      setRanking(response.data.ranking);
    } catch (error) {
      console.error('Error loading ranking:', error);
      toast.error('Erro ao carregar ranking');
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position) => {
    if (position === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return <span className="font-bold text-lg w-6 text-center">{position}</span>;
  };

  const getPositionBg = (position) => {
    if (position === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (position === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (position === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    return 'bg-muted/30';
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <AdBanner />
      
      <div className="container mx-auto p-4 pb-8" data-testid="ranking-page">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-white" data-testid="back-button">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-2" style={{fontFamily: 'Nunito'}}>
              <Trophy className="w-8 h-8" />
              Ranking
            </h1>
            <p className="text-white/80 text-sm">Veja os melhores jogadores</p>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <Tabs value={period} onValueChange={setPeriod} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="today" data-testid="tab-today">Hoje</TabsTrigger>
                <TabsTrigger value="week" data-testid="tab-week">Semana</TabsTrigger>
                <TabsTrigger value="month" data-testid="tab-month">Mês</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="spinner"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {ranking.map((player) => (
                  <div 
                    key={player.user_id} 
                    className={`flex items-center justify-between p-4 rounded-lg ${getPositionBg(player.position)}`}
                    data-testid={`ranking-item-${player.position}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 flex justify-center">
                        {getPositionIcon(player.position)}
                      </div>
                      <div>
                        <p className="font-semibold">{player.name}</p>
                        {player.is_bot && (
                          <p className="text-xs opacity-70">Jogador</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{player.coins_earned.toLocaleString()} moedas</p>
                      <p className="text-xs opacity-70">R$ {(player.coins_earned / 10000).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
