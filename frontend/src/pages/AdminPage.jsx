import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import AdBanner from '../components/AdBanner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminPage() {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [suspects, setSuspects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [withdrawalsRes, suspectsRes] = await Promise.all([
        axios.get(`${API}/admin/withdrawals`),
        axios.get(`${API}/admin/suspects`)
      ]);
      
      setWithdrawals(withdrawalsRes.data.withdrawals);
      setSuspects(suspectsRes.data.suspects);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalAction = async (withdrawalId, action) => {
    const reason = action === 'reject' ? prompt('Motivo da rejeição:') : null;
    
    try {
      await axios.post(`${API}/admin/withdrawal-action`, {
        withdrawal_id: withdrawalId,
        action,
        reason
      });
      
      toast.success(action === 'approve' ? 'Saque aprovado!' : 'Saque rejeitado');
      loadData();
    } catch (error) {
      toast.error('Erro ao processar ação');
    }
  };

  const handleClearSuspect = async (userId) => {
    try {
      await axios.post(`${API}/admin/clear-suspect?user_id=${userId}`);
      toast.success('Suspeita removida');
      loadData();
    } catch (error) {
      toast.error('Erro ao processar ação');
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
      
      <div className="container mx-auto p-4 pb-8" data-testid="admin-page">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-white" data-testid="back-button">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-white" style={{fontFamily: 'Nunito'}}>Painel Admin</h1>
        </div>

        <Tabs defaultValue="withdrawals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-white">
            <TabsTrigger value="withdrawals" data-testid="tab-withdrawals">
              Saques Pendentes ({withdrawals.length})
            </TabsTrigger>
            <TabsTrigger value="suspects" data-testid="tab-suspects">
              Contas Suspeitas ({suspects.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="withdrawals" className="space-y-4">
            {withdrawals.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Nenhum saque pendente</p>
                </CardContent>
              </Card>
            ) : (
              withdrawals.map((w) => (
                <Card key={w.id} data-testid={`withdrawal-${w.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{w.user?.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{w.user?.email}</p>
                      </div>
                      <Badge>R$ {w.amount.toFixed(2)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Chave Pix:</p>
                        <p className="font-semibold">{w.pix_key}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Solicitado em:</p>
                        <p className="font-semibold">{new Date(w.requested_at).toLocaleString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tempo de jogo:</p>
                        <p className="font-semibold">{Math.floor(w.user?.total_play_time / 60)} min</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Jogos diferentes:</p>
                        <p className="font-semibold">{w.user?.games_played_distinct?.length}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleWithdrawalAction(w.id, 'approve')} 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        data-testid={`approve-${w.id}`}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button 
                        onClick={() => handleWithdrawalAction(w.id, 'reject')} 
                        variant="destructive"
                        className="flex-1"
                        data-testid={`reject-${w.id}`}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="suspects" className="space-y-4">
            {suspects.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Nenhuma conta suspeita</p>
                </CardContent>
              </Card>
            ) : (
              suspects.map((user) => (
                <Card key={user.id} data-testid={`suspect-${user.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          {user.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge variant="destructive">Suspeito</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Anúncios hoje:</p>
                        <p className="font-semibold">{user.ads_today_count}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total anúncios:</p>
                        <p className="font-semibold">{user.ads_total_count}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tempo de jogo:</p>
                        <p className="font-semibold">{Math.floor(user.total_play_time / 60)} min</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Moedas:</p>
                        <p className="font-semibold">{user.coins.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {user.fraud_flags && user.fraud_flags.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-sm font-semibold text-red-800 mb-2">Flags de Fraude:</p>
                        {user.fraud_flags.map((flag, idx) => (
                          <p key={idx} className="text-xs text-red-700">
                            • {flag.flag_type}: {flag.details}
                          </p>
                        ))}
                      </div>
                    )}
                    
                    <Button 
                      onClick={() => handleClearSuspect(user.id)} 
                      variant="outline"
                      className="w-full"
                      data-testid={`clear-suspect-${user.id}`}
                    >
                      Remover Suspeita
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
