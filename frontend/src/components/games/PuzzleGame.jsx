import React, { useState, useEffect, useCallback } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const GRID_SIZE = 3;

export default function PuzzleGame({ onScoreChange, onGameEnd, playing }) {
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);
  const [animating, setAnimating] = useState(false);

  const generateSolvablePuzzle = useCallback(() => {
    const goal = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);
    let current = [...goal];
    
    // Shuffle with valid moves to ensure solvability
    for (let i = 0; i < 100; i++) {
      const emptyIndex = current.indexOf(0);
      const neighbors = getNeighbors(emptyIndex);
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      [current[emptyIndex], current[randomNeighbor]] = [current[randomNeighbor], current[emptyIndex]];
    }
    
    return current;
  }, []);

  const initGame = useCallback(() => {
    const puzzle = generateSolvablePuzzle();
    setTiles(puzzle);
    setMoves(0);
    setSolved(false);
    setAnimating(false);
    onScoreChange(0);
  }, [generateSolvablePuzzle, onScoreChange]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const getNeighbors = useCallback((index) => {
    const neighbors = [];
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;

    if (row > 0) neighbors.push(index - GRID_SIZE);
    if (row < GRID_SIZE - 1) neighbors.push(index + GRID_SIZE);
    if (col > 0) neighbors.push(index - 1);
    if (col < GRID_SIZE - 1) neighbors.push(index + 1);

    return neighbors;
  }, []);

  const isSolved = useCallback((tiles) => {
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i] !== i) return false;
    }
    return tiles[tiles.length - 1] === 0;
  }, []);

  useEffect(() => {
    if (isSolved(tiles) && tiles.length > 0 && !solved && moves > 0) {
      setSolved(true);
      const score = Math.max(0, 200 - moves * 3);
      onScoreChange(score);
      onGameEnd(score);
    }
  }, [tiles, solved, moves, isSolved, onScoreChange, onGameEnd]);

  const handleTileClick = useCallback((index) => {
    if (!playing || solved || animating) return;

    const emptyIndex = tiles.indexOf(0);
    const neighbors = getNeighbors(emptyIndex);

    if (neighbors.includes(index)) {
      setAnimating(true);
      
      const newTiles = [...tiles];
      [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
      
      setTiles(newTiles);
      setMoves(prev => prev + 1);
      
      setTimeout(() => setAnimating(false), 200);
    }
  }, [playing, solved, animating, tiles, getNeighbors]);

  const getTileColor = (tile) => {
    if (tile === 0) return 'bg-gray-800/50';
    const hue = (tile * 40) % 360;
    return `bg-gradient-to-br from-purple-500 to-indigo-600`;
  };

  return (
    <CardContent className="p-6 bg-gradient-to-br from-gray-900 to-indigo-900 min-h-[600px]">
      <div className="max-w-md mx-auto">
        <div className="mb-6 text-center">
          <p className="text-3xl font-bold text-white mb-4">Quebra-Cabeça</p>
          <div className="flex justify-center gap-8">
            <div className="bg-white/10 backdrop-blur rounded-lg px-6 py-3">
              <p className="text-sm text-white/70">Movimentos</p>
              <p className="text-3xl font-bold text-white">{moves}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg px-6 py-3">
              <p className="text-sm text-white/70">Objetivo</p>
              <p className="text-3xl font-bold text-yellow-400">1-8</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-3 gap-3">
            {tiles.map((tile, index) => {
              const isCorrect = tile === index && tile !== 0;
              
              return (
                <button
                  key={index}
                  onClick={() => handleTileClick(index)}
                  className={`aspect-square rounded-xl text-4xl font-bold flex items-center justify-center transition-all duration-200 transform ${
                    tile === 0
                      ? 'bg-gray-800/50 cursor-default'
                      : `${getTileColor(tile)} hover:scale-105 hover:shadow-2xl text-white shadow-lg`
                  } ${
                    isCorrect ? 'ring-2 ring-green-400' : ''
                  } ${
                    animating ? 'scale-95' : ''
                  }`}
                  disabled={!playing || tile === 0}
                  data-testid={`puzzle-tile-${index}`}
                >
                  {tile !== 0 && (
                    <div className="relative">
                      <span className="relative z-10">{tile}</span>
                      {isCorrect && (
                        <span className="absolute -top-1 -right-1 text-sm">✓</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {solved && (
          <div className="mb-6 text-center space-y-4">
            <div className="bg-green-500/20 border-2 border-green-500 rounded-xl p-6 backdrop-blur">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-2xl font-bold text-white mb-2">Parabéns!</p>
              <p className="text-lg text-white/90">Resolvido em {moves} movimentos</p>
              <div className="mt-4 inline-block bg-yellow-500/30 rounded-lg px-6 py-3">
                <p className="text-sm text-yellow-400">Pontuação</p>
                <p className="text-3xl font-bold text-yellow-400">{Math.max(0, 200 - moves * 3)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button 
            onClick={initGame} 
            variant="outline" 
            size="lg" 
            className="w-full bg-white/10 text-white hover:bg-white/20 border-white/30"
            data-testid="reset-puzzle-button"
          >
            Novo Jogo
          </Button>
          
          <div className="text-center text-white/60 text-sm">
            <p>Organize os números de 1 a 8 em ordem</p>
            <p className="mt-1">Clique nos números adjacentes ao espaço vazio</p>
          </div>
        </div>
      </div>
    </CardContent>
  );
}
