import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Coins } from 'lucide-react';
import { toast } from 'sonner';
import AdBanner from '../components/AdBanner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CoinsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const [userResponse, historyResponse] = await Promise.all([
        axios.get(`${API}/user/${storedUser.id}`),
        axios.get(`${API}/coins-history/${storedUser.id}`)
      ]);
      
      setUser(userResponse.data);
      setHistory(historyResponse.data.history);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`${API}/user/sync-balance/${storedUser.id}`);
      toast.success('Saldo sincronizado!');
      setUser(prev => ({
        ...prev,
        coins: response.data.coins,
        money_balance: response.data.money_balance
      }));
    } catch (error) {
      toast.error('Erro ao sincronizar');
    }
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
      
      <div className="container mx-auto p-4 pb-8" data-testid="coins-page">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-white" data-testid="back-button">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-white" style={{fontFamily: 'Nunito'}}>Minhas Moedas</h1>
        </div>

        {/* Balance Card */}
        <Card className="mb-6 shadow-xl" data-testid="balance-card">
          <CardHeader className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Coins className="w-6 h-6" />
                Saldo Atual
              </span>
              <Button variant="ghost" size="sm" onClick={handleSync} className="text-white" data-testid="sync-button">
                <RefreshCw className="w-5 h-5" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold" style={{fontFamily: 'Nunito'}} data-testid="coin-balance">{user?.coins?.toLocaleString()} moedas</p>
              <p className="text-3xl font-semibold text-green-600 mt-3" data-testid="money-balance">R$ {user?.money_balance?.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-4">10.000 moedas = R$ 1,00</p>
            </div>
          </CardContent>
        </Card>

        {/* History */}
        <Card data-testid="history-card">
          <CardHeader>
            <CardTitle>Histórico de Ganhos</CardTitle>
            <CardDescription>Últimos 30 eventos</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum histórico ainda</p>
            ) : (
              <div className="space-y-3">
                {history.map((event, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg" data-testid={`history-item-${index}`}>
                    <div>
                      <p className="font-semibold">{event.ad_type === 'rewarded' ? 'Anúncio Recompensado' : 'Anúncio'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+{event.reward_amount} moedas</p>
                      <p className="text-xs text-muted-foreground">R$ {(event.reward_amount / 10000).toFixed(2)}</p>
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
