import React, { useEffect, useRef, useState } from 'react';
import { CardContent } from '@/components/ui/card';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const GRAVITY = 0.5;
const JUMP_STRENGTH = -8;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;

export default function FlappyGame({ onScoreChange, onGameEnd, playing }) {
  const canvasRef = useRef(null);
  const [bird, setBird] = useState({ y: 200, velocity: 0 });
  const [pipes, setPipes] = useState([{ x: 400, topHeight: 100 }]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameLoopRef = useRef(null);

  const jump = () => {
    if (!gameOver && playing) {
      setBird(prev => ({ ...prev, velocity: JUMP_STRENGTH }));
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver, playing]);

  useEffect(() => {
    if (!playing) {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    const gameLoop = () => {
      setBird(prev => {
        const newVelocity = prev.velocity + GRAVITY;
        const newY = prev.y + newVelocity;

        // Check collision with ground/ceiling
        if (newY < 0 || newY > CANVAS_HEIGHT - 30) {
          setGameOver(true);
          onGameEnd(score);
          return prev;
        }

        return { y: newY, velocity: newVelocity };
      });

      setPipes(prev => {
        const newPipes = prev.map(pipe => ({ ...pipe, x: pipe.x - 3 }));

        // Remove off-screen pipes
        const filtered = newPipes.filter(pipe => pipe.x > -PIPE_WIDTH);

        // Add new pipe
        if (filtered.length === 0 || filtered[filtered.length - 1].x < CANVAS_WIDTH - 250) {
          filtered.push({
            x: CANVAS_WIDTH,
            topHeight: Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 100) + 50
          });
        }

        // Check collision
        filtered.forEach(pipe => {
          if (
            pipe.x < 100 &&
            pipe.x + PIPE_WIDTH > 50 &&
            (bird.y < pipe.topHeight || bird.y > pipe.topHeight + PIPE_GAP - 30)
          ) {
            setGameOver(true);
            onGameEnd(score);
          }

          // Score
          if (pipe.x + PIPE_WIDTH === 50) {
            setScore(prev => {
              const newScore = prev + 1;
              onScoreChange(newScore);
              return newScore;
            });
          }
        });

        return filtered;
      });

      if (!gameOver) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [playing, bird, pipes, score, gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw pipes
    ctx.fillStyle = '#22c55e';
    pipes.forEach(pipe => {
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT);
    });

    // Draw bird
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(75, bird.y, 15, 0, Math.PI * 2);
    ctx.fill();

    // Draw score
    ctx.fillStyle = '#000';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
  }, [bird, pipes, score]);

  return (
    <CardContent className="flex flex-col items-center justify-center p-4 bg-blue-100">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={jump}
        className="border-2 border-purple-500 rounded cursor-pointer"
        data-testid="flappy-canvas"
      />
      {gameOver && (
        <div className="mt-4 text-center">
          <p className="text-xl font-bold">Game Over!</p>
          <p>Pontuação: {score}</p>
        </div>
      )}
      <p className="mt-2 text-sm">Clique ou pressione Espaço para pular</p>
    </CardContent>
  );
}
