import React, { useState, useEffect, useCallback } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const QUESTIONS = [
  {
    question: 'Qual é a capital do Brasil?',
    options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
    correct: 2
  },
  {
    question: 'Quantos continentes existem?',
    options: ['5', '6', '7', '8'],
    correct: 2
  },
  {
    question: 'Qual é o maior planeta do sistema solar?',
    options: ['Terra', 'Marte', 'Júpiter', 'Saturno'],
    correct: 2
  },
  {
    question: 'Quem pintou a Mona Lisa?',
    options: ['Michelangelo', 'Leonardo da Vinci', 'Rafael', 'Donatello'],
    correct: 1
  },
  {
    question: 'Qual é o oceano mais profundo?',
    options: ['Atlântico', 'Pacífico', 'Índico', 'Ártico'],
    correct: 1
  },
  {
    question: 'Em que ano o homem pisou na Lua pela primeira vez?',
    options: ['1965', '1969', '1971', '1975'],
    correct: 1
  },
  {
    question: 'Qual é o menor país do mundo?',
    options: ['Mônaco', 'San Marino', 'Vaticano', 'Liechtenstein'],
    correct: 2
  },
  {
    question: 'Quantos ossos tem o corpo humano adulto?',
    options: ['186', '206', '226', '246'],
    correct: 1
  },
  {
    question: 'Qual é o animal terrestre mais rápido?',
    options: ['Leão', 'Guepardo', 'Cavalo', 'Leopardo'],
    correct: 1
  },
  {
    question: 'Qual é o rio mais longo do mundo?',
    options: ['Nilo', 'Amazonas', 'Yangtzé', 'Mississipi'],
    correct: 0
  }
];

export default function QuizGame({ onScoreChange, onGameEnd, playing }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const resetGame = useCallback(() => {
    setCurrentQuestion(0);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setGameComplete(false);
    setCorrectCount(0);
    onScoreChange(0);
  }, [onScoreChange]);

  const handleAnswer = useCallback((index) => {
    if (!playing || answered) return;

    setSelectedAnswer(index);
    setAnswered(true);

    const isCorrect = index === QUESTIONS[currentQuestion].correct;
    
    if (isCorrect) {
      const newScore = score + 10;
      setScore(newScore);
      setCorrectCount(prev => prev + 1);
      onScoreChange(newScore);
    }

    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setAnswered(false);
        setSelectedAnswer(null);
      } else {
        setGameComplete(true);
        const finalScore = score + (isCorrect ? 10 : 0);
        onGameEnd(finalScore);
      }
    }, 1500);
  }, [playing, answered, currentQuestion, score, onScoreChange, onGameEnd]);

  const question = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  return (
    <CardContent className="p-6 bg-gradient-to-br from-indigo-900 to-purple-900 min-h-[600px]">
      {!gameComplete ? (
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-white text-sm mb-2">
              <span>Progresso</span>
              <span>{currentQuestion + 1} / {QUESTIONS.length}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Score */}
          <div className="text-center mb-6">
            <div className="inline-block bg-yellow-500/20 border-2 border-yellow-500 rounded-lg px-6 py-3">
              <p className="text-sm text-yellow-400 mb-1">Pontuação</p>
              <p className="text-3xl font-bold text-white">{score}</p>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8 text-center">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6">
              <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                {question.question}
              </p>
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-4">
            {question.options.map((option, index) => {
              let buttonClass = 'w-full p-5 text-left rounded-xl transition-all duration-300 transform text-lg font-medium ';
              
              if (answered) {
                if (index === question.correct) {
                  buttonClass += 'bg-green-500 text-white scale-105 shadow-lg shadow-green-500/50';
                } else if (index === selectedAnswer) {
                  buttonClass += 'bg-red-500 text-white scale-95';
                } else {
                  buttonClass += 'bg-gray-700 text-gray-400 opacity-50';
                }
              } else {
                buttonClass += 'bg-white/10 hover:bg-white/20 text-white hover:scale-105 hover:shadow-xl border-2 border-white/30';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={buttonClass}
                  disabled={!playing || answered}
                  data-testid={`quiz-option-${index}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {answered && index === question.correct && (
                      <span className="text-2xl">✔️</span>
                    )}
                    {answered && index === selectedAnswer && index !== question.correct && (
                      <span className="text-2xl">❌</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 shadow-2xl">
            <p className="text-5xl mb-4">🎉</p>
            <p className="text-3xl font-bold text-white mb-4">Quiz Completo!</p>
            <div className="bg-white/20 rounded-xl p-6 mb-4">
              <p className="text-6xl font-bold text-white mb-2">{score}</p>
              <p className="text-xl text-white/90">Pontuação Final</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-white">
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-3xl font-bold">{correctCount}</p>
                <p className="text-sm opacity-80">Acertos</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-3xl font-bold">{QUESTIONS.length - correctCount}</p>
                <p className="text-sm opacity-80">Erros</p>
              </div>
            </div>
          </div>
          <Button 
            onClick={resetGame} 
            size="lg" 
            className="w-full max-w-md bg-white text-purple-900 hover:bg-gray-100 font-bold text-lg py-6"
            data-testid="reset-quiz-button"
          >
            Jogar Novamente
          </Button>
        </div>
      )}
    </CardContent>
  );
}
