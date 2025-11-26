import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const GRAVITY = 0.4;
const JUMP_STRENGTH = -7;
const PIPE_WIDTH = 60;
const PIPE_GAP = 160;
const PIPE_SPEED = 2;
const BIRD_SIZE = 25;

export default function FlappyGame({ onScoreChange, onGameEnd, playing }) {
  const canvasRef = useRef(null);
  const [bird, setBird] = useState({ y: CANVAS_HEIGHT / 2, velocity: 0 });
  const [pipes, setPipes] = useState([{ x: CANVAS_WIDTH, topHeight: 150 }]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  
  const birdRef = useRef({ y: CANVAS_HEIGHT / 2, velocity: 0 });
  const pipesRef = useRef([{ x: CANVAS_WIDTH, topHeight: 150 }]);
  const scoreRef = useRef(0);
  const animationRef = useRef(null);

  const jump = useCallback(() => {
    if (!gameOver && playing && started) {
      setBird(prev => {
        const newBird = { ...prev, velocity: JUMP_STRENGTH };
        birdRef.current = newBird;
        return newBird;
      });
    } else if (!started && !gameOver) {
      setStarted(true);
    }
  }, [gameOver, playing, started]);

  const resetGame = useCallback(() => {
    const initialBird = { y: CANVAS_HEIGHT / 2, velocity: 0 };
    const initialPipes = [{ x: CANVAS_WIDTH, topHeight: 150 }];
    
    setBird(initialBird);
    setPipes(initialPipes);
    setScore(0);
    setGameOver(false);
    setStarted(false);
    
    birdRef.current = initialBird;
    pipesRef.current = initialPipes;
    scoreRef.current = 0;
    
    onScoreChange(0);
  }, [onScoreChange]);

  // Input handlers
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    const handleClick = () => jump();

    window.addEventListener('keydown', handleKeyPress);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('click', handleClick);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (canvas) {
        canvas.removeEventListener('click', handleClick);
      }
    };
  }, [jump]);

  // Game loop
  useEffect(() => {
    if (!playing || gameOver || !started) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const gameLoop = () => {
      // Update bird
      const currentBird = birdRef.current;
      const newVelocity = currentBird.velocity + GRAVITY;
      const newY = currentBird.y + newVelocity;

      // Check collision with ground/ceiling
      if (newY < 0 || newY > CANVAS_HEIGHT - BIRD_SIZE) {
        setGameOver(true);
        onGameEnd(scoreRef.current);
        return;
      }

      const updatedBird = { y: newY, velocity: newVelocity };
      birdRef.current = updatedBird;
      setBird(updatedBird);

      // Update pipes
      const currentPipes = pipesRef.current;
      const newPipes = currentPipes.map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }));

      // Remove off-screen pipes
      const filtered = newPipes.filter(pipe => pipe.x > -PIPE_WIDTH);

      // Add new pipe
      if (filtered.length === 0 || filtered[filtered.length - 1].x < CANVAS_WIDTH - 250) {
        const minHeight = 80;
        const maxHeight = CANVAS_HEIGHT - PIPE_GAP - 80;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
        filtered.push({ x: CANVAS_WIDTH, topHeight });
      }

      // Check collision and score
      filtered.forEach(pipe => {
        const birdX = 60;
        const birdY = updatedBird.y;

        // Collision detection
        if (
          birdX + BIRD_SIZE > pipe.x &&
          birdX < pipe.x + PIPE_WIDTH &&
          (birdY < pipe.topHeight || birdY + BIRD_SIZE > pipe.topHeight + PIPE_GAP)
        ) {
          setGameOver(true);
          onGameEnd(scoreRef.current);
          return;
        }

        // Score increment
        if (pipe.x + PIPE_WIDTH === birdX) {
          const newScore = scoreRef.current + 1;
          scoreRef.current = newScore;
          setScore(newScore);
          onScoreChange(newScore);
        }
      });

      pipesRef.current = filtered;
      setPipes(filtered);

      if (!gameOver) {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [playing, started, gameOver, onScoreChange, onGameEnd]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#e0f6ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(100, 80, 30, 0, Math.PI * 2);
    ctx.arc(130, 80, 35, 0, Math.PI * 2);
    ctx.arc(160, 80, 30, 0, Math.PI * 2);
    ctx.fill();

    // Pipes
    pipes.forEach(pipe => {
      // Top pipe
      ctx.fillStyle = '#2d5016';
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      ctx.fillStyle = '#3a6b1f';
      ctx.fillRect(pipe.x + 5, 0, PIPE_WIDTH - 10, pipe.topHeight);
      
      // Top pipe cap
      ctx.fillStyle = '#2d5016';
      ctx.fillRect(pipe.x - 5, pipe.topHeight - 30, PIPE_WIDTH + 10, 30);
      
      // Bottom pipe
      const bottomY = pipe.topHeight + PIPE_GAP;
      ctx.fillStyle = '#2d5016';
      ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, CANVAS_HEIGHT - bottomY);
      ctx.fillStyle = '#3a6b1f';
      ctx.fillRect(pipe.x + 5, bottomY, PIPE_WIDTH - 10, CANVAS_HEIGHT - bottomY);
      
      // Bottom pipe cap
      ctx.fillStyle = '#2d5016';
      ctx.fillRect(pipe.x - 5, bottomY, PIPE_WIDTH + 10, 30);
    });

    // Bird
    const birdX = 60;
    const birdY = bird.y;
    
    // Bird body
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(birdX + BIRD_SIZE / 2, birdY + BIRD_SIZE / 2, BIRD_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Bird wing
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(birdX + BIRD_SIZE / 2, birdY + BIRD_SIZE / 2, BIRD_SIZE / 3, BIRD_SIZE / 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Bird eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(birdX + BIRD_SIZE / 2 + 5, birdY + BIRD_SIZE / 2 - 3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(birdX + BIRD_SIZE / 2 + 6, birdY + BIRD_SIZE / 2 - 3, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Bird beak
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(birdX + BIRD_SIZE, birdY + BIRD_SIZE / 2);
    ctx.lineTo(birdX + BIRD_SIZE + 8, birdY + BIRD_SIZE / 2 - 3);
    ctx.lineTo(birdX + BIRD_SIZE + 8, birdY + BIRD_SIZE / 2 + 3);
    ctx.fill();

    // Score
    ctx.fillStyle = '#000';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(score, CANVAS_WIDTH / 2, 50);
    
    // Start message
    if (!started) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, CANVAS_HEIGHT / 2 - 40, CANVAS_WIDTH, 80);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Clique para começar!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }
  }, [bird, pipes, score, started]);

  return (
    <CardContent className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-900 to-blue-700">
      <div className="mb-4">
        <p className="text-2xl font-bold text-white text-center">Pontuação: {score}</p>
      </div>
      
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-4 border-yellow-400 rounded-lg cursor-pointer shadow-2xl"
        data-testid="flappy-canvas"
      />
      
      {gameOver && (
        <div className="mt-6 text-center space-y-4 w-full max-w-md">
          <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-4">
            <p className="text-2xl font-bold text-white mb-2">Game Over!</p>
            <p className="text-lg text-white">Pontuação Final: {score}</p>
          </div>
          <Button onClick={resetGame} size="lg" className="w-full" data-testid="reset-flappy-button">
            Jogar Novamente
          </Button>
        </div>
      )}
      
      <p className="mt-4 text-white text-sm text-center">Clique ou pressione Espaço para pular</p>
    </CardContent>
  );
}
