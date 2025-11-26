import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const GAME_SPEED = 100;

export default function SnakeGame({ onScoreChange, onGameEnd, playing }) {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([{x: 10, y: 10}]);
  const [direction, setDirection] = useState({x: 1, y: 0});
  const [food, setFood] = useState({x: 15, y: 15});
  const [gameOver, setGameOver] = useState(false);
  const [localScore, setLocalScore] = useState(0);
  
  const directionRef = useRef({x: 1, y: 0});
  const snakeRef = useRef([{x: 10, y: 10}]);
  const foodRef = useRef({x: 15, y: 15});
  const gameLoopRef = useRef(null);

  // Sync refs with state
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  const generateFood = useCallback(() => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake = [{x: 10, y: 10}];
    const initialFood = generateFood();
    setSnake(initialSnake);
    setDirection({x: 1, y: 0});
    setFood(initialFood);
    setGameOver(false);
    setLocalScore(0);
    onScoreChange(0);
    directionRef.current = {x: 1, y: 0};
    snakeRef.current = initialSnake;
    foodRef.current = initialFood;
  }, [generateFood, onScoreChange]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver || !playing) return;
      
      const currentDir = directionRef.current;
      
      switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y === 0) {
            setDirection({x: 0, y: -1});
            directionRef.current = {x: 0, y: -1};
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y === 0) {
            setDirection({x: 0, y: 1});
            directionRef.current = {x: 0, y: 1};
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x === 0) {
            setDirection({x: -1, y: 0});
            directionRef.current = {x: -1, y: 0};
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x === 0) {
            setDirection({x: 1, y: 0});
            directionRef.current = {x: 1, y: 0};
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, playing]);

  // Game loop
  useEffect(() => {
    if (!playing || gameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      return;
    }

    gameLoopRef.current = setInterval(() => {
      const currentSnake = [...snakeRef.current];
      const currentDirection = directionRef.current;
      const currentFood = foodRef.current;

      const head = currentSnake[0];
      const newHead = {
        x: (head.x + currentDirection.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + currentDirection.y + GRID_SIZE) % GRID_SIZE
      };

      // Check collision with self
      if (currentSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        onGameEnd(currentSnake.length - 1);
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        return;
      }

      const newSnake = [newHead, ...currentSnake];

      // Check if food eaten
      if (newHead.x === currentFood.x && newHead.y === currentFood.y) {
        const newFood = generateFood();
        setFood(newFood);
        foodRef.current = newFood;
        
        const newScore = newSnake.length - 1;
        setLocalScore(newScore);
        onScoreChange(newScore);
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
      snakeRef.current = newSnake;
    }, GAME_SPEED);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [playing, gameOver, generateFood, onScoreChange, onGameEnd]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#2a2a4e';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw snake with gradient
    snake.forEach((segment, index) => {
      const alpha = 1 - (index / snake.length) * 0.5;
      ctx.fillStyle = index === 0 ? '#22c55e' : `rgba(34, 197, 94, ${alpha})`;
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
      
      // Head eyes
      if (index === 0) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(segment.x * CELL_SIZE + 5, segment.y * CELL_SIZE + 5, 3, 3);
        ctx.fillRect(segment.x * CELL_SIZE + 12, segment.y * CELL_SIZE + 5, 3, 3);
      }
    });

    // Draw food with glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ef4444';
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [snake, food]);

  return (
    <CardContent className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="mb-4 text-center">
        <p className="text-2xl font-bold text-white">Pontuação: {localScore}</p>
      </div>
      
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="border-4 border-purple-500 rounded-lg shadow-2xl"
        data-testid="snake-canvas"
      />
      
      {gameOver && (
        <div className="mt-6 text-center space-y-4">
          <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-4">
            <p className="text-2xl font-bold text-white mb-2">Game Over!</p>
            <p className="text-lg text-white">Pontuação Final: {localScore}</p>
          </div>
          <Button onClick={resetGame} size="lg" className="w-full" data-testid="reset-snake-button">
            Jogar Novamente
          </Button>
        </div>
      )}
      
      <div className="mt-4 text-center">
        <p className="text-white text-sm mb-2">Controles:</p>
        <p className="text-white/70 text-xs">Setas do teclado ou WASD</p>
      </div>
    </CardContent>
  );
}
