import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, MessageCircle, HelpCircle, Ban, Zap, Coins as CoinsIcon, Lock } from 'lucide-react';
import { toast } from 'sonner';
import AdBanner from '../components/AdBanner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HelpPage() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const helpTopics = [
    {
      id: 'payment',
      title: 'Pagamento não caiu',
      icon: <CoinsIcon className="w-6 h-6" />,
      response: 'Pagamentos levam até 48h para serem processados. Verifique se cumpriu todos os requisitos: 5 anúncios diários + 5 anúncios do jogo, 60 minutos de jogo, 3 jogos diferentes e saldo mínimo de R$ 10,00. Se sim e já passou o prazo, abra um chamado de suporte.'
    },
    {
      id: 'ad_not_showing',
      title: 'Anúncio não apareceu',
      icon: <Ban className="w-6 h-6" />,
      response: 'Anúncios dependem da sua conexão e disponibilidade do AdMob. Tente reiniciar o app e verificar sua internet. Se o problema persistir, pode ser falta de inventário de anúncios na sua região. Aguarde alguns minutos e tente novamente.'
    },
    {
      id: 'game_crashed',
      title: 'Jogo travou',
      icon: <Zap className="w-6 h-6" />,
      response: 'Limpe o cache do navegador e reinicie o app. Se o problema continuar, pode ser um problema temporário. Tente novamente em alguns minutos. Se persistir, abra um chamado descrevendo o que aconteceu.'
    },
    {
      id: 'coins_missing',
      title: 'Minhas moedas sumiram',
      icon: <CoinsIcon className="w-6 h-6" />,
      response: 'Isso pode ser efeito de sincronização. Vá em "MOEDAS" e clique no botão de sincronizar. Se suas moedas não voltarem, pode ser que sua conta esteja em modo de segurança por atividade suspeita detectada.'
    },
    {
      id: 'withdraw_blocked',
      title: 'Saque bloqueado',
      icon: <Lock className="w-6 h-6" />,
      response: 'Seu saque pode estar bloqueado por: (1) Requisitos não cumpridos (verifique na tela de saque), (2) Conta sob análise por suspeita de fraude, (3) Já atingiu o limite semanal de R$ 20,00, (4) Aguardando prazo de 48h do último saque do dispositivo.'
    },
    {
      id: 'contact',
      title: 'Falar com atendente',
      icon: <MessageCircle className="w-6 h-6" />,
      response: null
    }
  ];

  const handleTopicClick = (topic) => {
    if (topic.id === 'contact') {
      setSelectedTopic(topic);
    } else {
      setSelectedTopic(topic);
    }
  };

  const handleSubmitTicket = async () => {
    if (!message.trim()) {
      toast.error('Digite sua mensagem');
      return;
    }

    setSubmitting(true);
    
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      await axios.post(`${API}/support/ticket`, {
        user_id: storedUser.id,
        type: selectedTopic.id,
        message: message
      });
      
      toast.success('Chamado aberto! Resposta em até 48h.');
      setMessage('');
      setSelectedTopic(null);
    } catch (error) {
      toast.error('Erro ao enviar chamado');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <AdBanner />
      
      <div className="container mx-auto p-4 pb-8 max-w-3xl" data-testid="help-page">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-white" data-testid="back-button">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-2" style={{fontFamily: 'Nunito'}}>
              <HelpCircle className="w-8 h-8" />
              Central de Ajuda
            </h1>
            <p className="text-white/80 text-sm">Como podemos ajudar?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {helpTopics.map((topic) => (
            <Card 
              key={topic.id}
              className="cursor-pointer hover:shadow-xl transition-all"
              onClick={() => handleTopicClick(topic)}
              data-testid={`help-topic-${topic.id}`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="text-purple-600">{topic.icon}</div>
                  <span className="text-lg">{topic.title}</span>
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Response Modal */}
      <Dialog open={!!selectedTopic} onOpenChange={() => setSelectedTopic(null)}>
        <DialogContent className="max-w-md" data-testid="help-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTopic?.icon}
              {selectedTopic?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTopic?.id === 'contact' ? (
            <div className="space-y-4">
              <DialogDescription>
                Descreva seu problema e entraremos em contato em até 48 horas.
              </DialogDescription>
              <Textarea
                placeholder="Descreva seu problema..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                data-testid="ticket-message-input"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmitTicket} 
                  className="flex-1"
                  disabled={submitting}
                  data-testid="submit-ticket-button"
                >
                  {submitting ? 'Enviando...' : 'Enviar Chamado'}
                </Button>
                <Button variant="outline" onClick={() => setSelectedTopic(null)}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <DialogDescription className="text-base leading-relaxed">
                {selectedTopic?.response}
              </DialogDescription>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setSelectedTopic(helpTopics.find(t => t.id === 'contact'));
                  }}
                  className="flex-1"
                  data-testid="open-ticket-button"
                >
                  Abrir Chamado
                </Button>
                <Button variant="outline" onClick={() => setSelectedTopic(null)}>Fechar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
