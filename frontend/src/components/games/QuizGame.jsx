import React, { useState, useEffect } from 'react';
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
  }
];

export default function QuizGame({ onScoreChange, onGameEnd, playing }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleAnswer = (index) => {
    if (!playing || answered) return;

    setSelectedAnswer(index);
    setAnswered(true);

    if (index === QUESTIONS[currentQuestion].correct) {
      const newScore = score + 20;
      setScore(newScore);
      onScoreChange(newScore);
    }

    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setAnswered(false);
        setSelectedAnswer(null);
      } else {
        onGameEnd(score + (index === QUESTIONS[currentQuestion].correct ? 20 : 0));
      }
    }, 1500);
  };

  const question = QUESTIONS[currentQuestion];

  return (
    <CardContent className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Pergunta {currentQuestion + 1} de {QUESTIONS.length}
          </p>
          <p className="text-2xl font-bold mb-4">{question.question}</p>
          <p className="text-lg font-semibold text-purple-600">Pontuação: {score}</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {question.options.map((option, index) => {
            let buttonClass = 'w-full p-4 text-left rounded-lg transition-all ';
            
            if (answered) {
              if (index === question.correct) {
                buttonClass += 'bg-green-500 text-white';
              } else if (index === selectedAnswer) {
                buttonClass += 'bg-red-500 text-white';
              } else {
                buttonClass += 'bg-gray-200';
              }
            } else {
              buttonClass += 'bg-white hover:bg-purple-100 border-2 border-gray-300';
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={buttonClass}
                disabled={!playing || answered}
                data-testid={`quiz-option-${index}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </CardContent>
  );
}
