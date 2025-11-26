import React, { useState, useEffect } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const GRID_SIZE = 3;
const TILE_COUNT = GRID_SIZE * GRID_SIZE - 1;

export default function PuzzleGame({ onScoreChange, onGameEnd, playing }) {
  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (isSolved(tiles) && tiles.length > 0) {
      setSolved(true);
      const score = Math.max(0, 200 - moves * 2);
      onScoreChange(score);
      onGameEnd(score);
    }
  }, [tiles]);

  const initGame = () => {
    const initialTiles = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);
    
    // Shuffle
    for (let i = 0; i < 100; i++) {
      const emptyIndex = initialTiles.indexOf(0);
      const neighbors = getNeighbors(emptyIndex);
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      [initialTiles[emptyIndex], initialTiles[randomNeighbor]] = [initialTiles[randomNeighbor], initialTiles[emptyIndex]];
    }

    setTiles(initialTiles);
    setMoves(0);
    setSolved(false);
  };

  const getNeighbors = (index) => {
    const neighbors = [];
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;

    if (row > 0) neighbors.push(index - GRID_SIZE);
    if (row < GRID_SIZE - 1) neighbors.push(index + GRID_SIZE);
    if (col > 0) neighbors.push(index - 1);
    if (col < GRID_SIZE - 1) neighbors.push(index + 1);

    return neighbors;
  };

  const isSolved = (tiles) => {
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i] !== i) return false;
    }
    return tiles[tiles.length - 1] === 0;
  };

  const handleTileClick = (index) => {
    if (!playing || solved) return;

    const emptyIndex = tiles.indexOf(0);
    const neighbors = getNeighbors(emptyIndex);

    if (neighbors.includes(index)) {
      const newTiles = [...tiles];
      [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
      setTiles(newTiles);
      setMoves(prev => prev + 1);
    }
  };

  return (
    <CardContent className="p-6">
      <div className="max-w-md mx-auto">
        <div className="mb-4 text-center">
          <p className="text-lg font-semibold">Movimentos: {moves}</p>
          <p className="text-sm text-muted-foreground">Organize os números em ordem</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {tiles.map((tile, index) => (
            <button
              key={index}
              onClick={() => handleTileClick(index)}
              className={`aspect-square rounded-lg text-2xl font-bold flex items-center justify-center transition-all ${
                tile === 0
                  ? 'bg-gray-200'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
              disabled={!playing || tile === 0}
              data-testid={`puzzle-tile-${index}`}
            >
              {tile !== 0 && tile}
            </button>
          ))}
        </div>

        {solved && (
          <div className="text-center mb-4">
            <p className="text-xl font-bold text-green-600">Parabéns! Você venceu!</p>
            <p className="text-sm">Pontuação: {Math.max(0, 200 - moves * 2)}</p>
          </div>
        )}

        <div className="text-center">
          <Button onClick={initGame} variant="outline" size="sm" data-testid="reset-puzzle-button">
            Reiniciar
          </Button>
        </div>
      </div>
    </CardContent>
  );
}
