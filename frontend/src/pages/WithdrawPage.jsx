import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Wallet, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import AdBanner from '../components/AdBanner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function WithdrawPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pixKey, setPixKey] = useState('');
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const [userResponse, withdrawalsResponse] = await Promise.all([
        axios.get(`${API}/user/${storedUser.id}`),
        axios.get(`${API}/withdrawals/${storedUser.id}`)
      ]);
      
      setUser(userResponse.data);
      setWithdrawals(withdrawalsResponse.data.withdrawals);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    if (!pixKey.trim()) {
      toast.error('Digite sua chave Pix');
      return;
    }

    setSubmitting(true);
    
    try {
      await axios.post(`${API}/withdraw`, {
        user_id: user.id,
        amount: 10.00,
        method: 'pix',
        pix_key: pixKey
      });
      
      toast.success('Solicitação enviada! Pagamento em até 48h.');
      setPixKey('');
      loadData();
    } catch (error) {
      const errors = error.response?.data?.detail?.errors || [error.response?.data?.detail || 'Erro ao solicitar saque'];
      errors.forEach(err => toast.error(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <div className="spinner"></div>
      </div>
    );
  }

  const canWithdraw = 
    user?.daily_access_unlocked &&
    user?.first_game_ad_done &&
    user?.money_balance >= 10.00 &&
    (user?.total_play_time / 60) >= 60 &&
    user?.games_played_distinct?.length >= 3 &&
    !user?.suspect_flag;

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <AdBanner />
      
      <div className="container mx-auto p-4 pb-8 max-w-2xl" data-testid="withdraw-page">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-white" data-testid="back-button">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-white" style={{fontFamily: 'Nunito'}}>Sacar Dinheiro</h1>
        </div>

        {/* Balance Card */}
        <Card className="mb-6 shadow-xl" data-testid="balance-card">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-700 text-white">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-6 h-6" />
              Saldo Disponível
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold" style={{fontFamily: 'Nunito'}} data-testid="money-balance">R$ {user?.money_balance?.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-2">{user?.coins?.toLocaleString()} moedas</p>
            </div>
          </CardContent>
        </Card>

        {/* Requirements Checklist */}
        <Card className="mb-6" data-testid="requirements-card">
          <CardHeader>
            <CardTitle>Requisitos para Saque</CardTitle>
            <CardDescription>Saque mínimo: R$ 10,00</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              {user?.daily_access_unlocked ? 
                <CheckCircle2 className="w-5 h-5 text-green-600" data-testid="check-daily" /> : 
                <XCircle className="w-5 h-5 text-red-500" data-testid="uncheck-daily" />
              }
              <span className="text-sm">Assistir 5 anúncios diários</span>
            </div>
            <div className="flex items-center gap-3">
              {user?.first_game_ad_done ? 
                <CheckCircle2 className="w-5 h-5 text-green-600" data-testid="check-game-ad" /> : 
                <XCircle className="w-5 h-5 text-red-500" data-testid="uncheck-game-ad" />
              }
              <span className="text-sm">Assistir anúncio ao entrar no jogo</span>
            </div>
            <div className="flex items-center gap-3">
              {user?.money_balance >= 10 ? 
                <CheckCircle2 className="w-5 h-5 text-green-600" data-testid="check-balance" /> : 
                <XCircle className="w-5 h-5 text-red-500" data-testid="uncheck-balance" />
              }
              <span className="text-sm">Saldo mínimo R$ 10,00</span>
            </div>
            <div className="flex items-center gap-3">
              {(user?.total_play_time / 60) >= 60 ? 
                <CheckCircle2 className="w-5 h-5 text-green-600" data-testid="check-playtime" /> : 
                <XCircle className="w-5 h-5 text-red-500" data-testid="uncheck-playtime" />
              }
              <span className="text-sm">60 minutos de jogo ({Math.floor(user?.total_play_time / 60)} min)</span>
            </div>
            <div className="flex items-center gap-3">
              {user?.games_played_distinct?.length >= 3 ? 
                <CheckCircle2 className="w-5 h-5 text-green-600" data-testid="check-games" /> : 
                <XCircle className="w-5 h-5 text-red-500" data-testid="uncheck-games" />
              }
              <span className="text-sm">3 jogos diferentes ({user?.games_played_distinct?.length} jogos)</span>
            </div>
            <div className="flex items-center gap-3">
              {!user?.suspect_flag ? 
                <CheckCircle2 className="w-5 h-5 text-green-600" data-testid="check-suspect" /> : 
                <XCircle className="w-5 h-5 text-red-500" data-testid="uncheck-suspect" />
              }
              <span className="text-sm">Conta sem restrições</span>
            </div>
          </CardContent>
        </Card>

        {/* Withdraw Form */}
        <Card className="mb-6" data-testid="withdraw-form-card">
          <CardHeader>
            <CardTitle>Solicitar Saque via Pix</CardTitle>
            <CardDescription>Valor fixo: R$ 10,00 | Prazo: até 48h</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pixKey">Chave Pix</Label>
                <Input
                  id="pixKey"
                  type="text"
                  placeholder="CPF, e-mail, telefone ou chave aleatória"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  disabled={!canWithdraw}
                  data-testid="pix-key-input"
                />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ O pagamento será processado manualmente em até 48 horas. Você receberá uma notificação quando for concluído.
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={!canWithdraw || submitting}
                data-testid="submit-withdraw-button"
              >
                {submitting ? 'Processando...' : 'Solicitar Saque R$ 10,00'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Withdrawals History */}
        {withdrawals.length > 0 && (
          <Card data-testid="withdrawals-history">
            <CardHeader>
              <CardTitle>Histórico de Saques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {withdrawals.map((w, index) => (
                  <div key={w.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg" data-testid={`withdrawal-item-${index}`}>
                    <div>
                      <p className="font-semibold">R$ {w.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(w.requested_at).toLocaleString('pt-BR')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Pix: {w.pix_key}
                      </p>
                    </div>
                    <div className="text-right">
                      {w.status === 'pending' && (
                        <div className="flex items-center gap-2 text-yellow-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-semibold">Pendente</span>
                        </div>
                      )}
                      {w.status === 'processed' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-semibold">Pago</span>
                        </div>
                      )}
                      {w.status === 'rejected' && (
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm font-semibold">Rejeitado</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
