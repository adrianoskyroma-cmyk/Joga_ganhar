import React, { useState, useEffect } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ICONS = ['🍎', '🍊', '🍇', '🍓', '🍉', '🍌', '🍒', '🍑'];

export default function MemoryGame({ onScoreChange, onGameEnd, playing }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      const score = Math.max(0, 100 - moves);
      onScoreChange(score);
      onGameEnd(score);
    }
  }, [matched, cards]);

  const initGame = () => {
    const gameCards = [...ICONS, ...ICONS]
      .map((icon, index) => ({ id: index, icon, matched: false }))
      .sort(() => Math.random() - 0.5);
    setCards(gameCards);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  const handleCardClick = (index) => {
    if (!playing || flipped.length === 2 || flipped.includes(index) || matched.includes(index)) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      
      const [first, second] = newFlipped;
      if (cards[first].icon === cards[second].icon) {
        setMatched(prev => [...prev, first, second]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  return (
    <CardContent className="p-4">
      <div className="mb-4 text-center">
        <p className="text-lg font-semibold">Movimentos: {moves}</p>
        <p className="text-sm text-muted-foreground">Encontre todos os pares!</p>
      </div>
      
      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={`aspect-square rounded-lg text-4xl flex items-center justify-center transition-all ${
                isFlipped
                  ? 'bg-white border-2 border-purple-500'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
              disabled={!playing}
              data-testid={`memory-card-${index}`}
            >
              {isFlipped ? card.icon : '?'}
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <Button onClick={initGame} variant="outline" size="sm" data-testid="reset-memory-button">
          Reiniciar
        </Button>
      </div>
    </CardContent>
  );
}
