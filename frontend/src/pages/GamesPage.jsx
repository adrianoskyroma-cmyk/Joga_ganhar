import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import AdBanner from '../components/AdBanner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function GamesPage() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const response = await axios.get(`${API}/games`);
      setGames(response.data.games);
    } catch (error) {
      console.error('Error loading games:', error);
      toast.error('Erro ao carregar jogos');
    } finally {
      setLoading(false);
    }
  };

  const handleGameClick = (gameId) => {
    navigate(`/game/${gameId}`);
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
      
      <div className="container mx-auto p-4 pb-8" data-testid="games-page">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-white" data-testid="back-button">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-white" style={{fontFamily: 'Nunito'}}>Escolha seu Jogo</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Card 
              key={game.id} 
              className="game-card cursor-pointer hover:shadow-2xl transition-all"
              onClick={() => handleGameClick(game.id)}
              data-testid={`game-card-${game.id}`}
            >
              <CardHeader className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
                <CardTitle className="text-center">
                  <div className="text-6xl mb-3">{game.icon}</div>
                  <div className="text-2xl" style={{fontFamily: 'Nunito'}}>{game.name}</div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2 text-center">
                  <p className="text-sm text-muted-foreground">Tempo mínimo: {game.min_time}s</p>
                  <Button className="w-full" data-testid={`play-${game.id}-button`}>
                    Jogar Agora
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
