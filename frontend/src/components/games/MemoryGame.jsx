import React, { useState, useEffect, useCallback } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ICONS = ['🍎', '🍊', '🍇', '🍓', '🍉', '🍌', '🍒', '🍑'];

export default function MemoryGame({ onScoreChange, onGameEnd, playing }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [canFlip, setCanFlip] = useState(true);
  const [gameComplete, setGameComplete] = useState(false);

  const initGame = useCallback(() => {
    const gameCards = [...ICONS, ...ICONS]
      .map((icon, index) => ({ id: index, icon }))
      .sort(() => Math.random() - 0.5);
    
    setCards(gameCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setCanFlip(true);
    setGameComplete(false);
    onScoreChange(0);
  }, [onScoreChange]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0 && !gameComplete) {
      setGameComplete(true);
      const score = Math.max(0, 100 - moves * 2);
      onScoreChange(score);
      onGameEnd(score);
    }
  }, [matched, cards, moves, gameComplete, onScoreChange, onGameEnd]);

  const handleCardClick = useCallback((index) => {
    if (!playing || !canFlip || flipped.includes(index) || matched.includes(index)) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setCanFlip(false);
      setMoves(prev => prev + 1);
      
      const [first, second] = newFlipped;
      
      if (cards[first].icon === cards[second].icon) {
        // Match found
        setTimeout(() => {
          setMatched(prev => [...prev, first, second]);
          setFlipped([]);
          setCanFlip(true);
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setFlipped([]);
          setCanFlip(true);
        }, 1000);
      }
    }
  }, [playing, canFlip, flipped, matched, cards]);

  return (
    <CardContent className="p-6 bg-gradient-to-br from-purple-900 to-indigo-900 min-h-[600px]">
      <div className="mb-6 text-center">
        <p className="text-3xl font-bold text-white mb-2">Jogo da Memória</p>
        <div className="flex justify-center gap-8 text-white">
          <div>
            <p className="text-sm opacity-70">Movimentos</p>
            <p className="text-2xl font-bold">{moves}</p>
          </div>
          <div>
            <p className="text-sm opacity-70">Pares Encontrados</p>
            <p className="text-2xl font-bold">{matched.length / 2} / {cards.length / 2}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto mb-6">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          const isMatched = matched.includes(index);
          
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={`aspect-square rounded-xl text-5xl flex items-center justify-center transition-all duration-300 transform ${
                isFlipped
                  ? isMatched
                    ? 'bg-green-500 scale-105 shadow-lg shadow-green-500/50'
                    : 'bg-white scale-105'
                  : 'bg-purple-600 hover:bg-purple-500 hover:scale-105 shadow-lg'
              } ${!canFlip && !isFlipped ? 'opacity-50' : ''}`}
              disabled={!playing}
              data-testid={`memory-card-${index}`}
            >
              <span className={`transition-all duration-300 ${
                isFlipped ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
              }`}>
                {isFlipped ? card.icon : ''}
              </span>
              {!isFlipped && (
                <span className="text-white text-6xl">?</span>
              )}
            </button>
          );
        })}
      </div>

      {gameComplete && (
        <div className="mt-6 text-center space-y-4">
          <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-4">
            <p className="text-2xl font-bold text-white mb-2">🎉 Parabéns!</p>
            <p className="text-lg text-white">Você completou em {moves} movimentos</p>
            <p className="text-xl text-yellow-400 font-bold mt-2">
              Pontuação: {Math.max(0, 100 - moves * 2)}
            </p>
          </div>
        </div>
      )}

      <div className="text-center">
        <Button 
          onClick={initGame} 
          variant="outline" 
          size="lg" 
          className="bg-white/10 text-white hover:bg-white/20"
          data-testid="reset-memory-button"
        >
          Reiniciar Jogo
        </Button>
      </div>
    </CardContent>
  );
}
