import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { QuizQuestion } from '../../types';
import ActionButton from '../../components/ActionButton';
import { useSound } from '../../hooks/useSound';
import confetti from 'canvas-confetti';

interface QuizProps {
  questions: QuizQuestion[];
  onQuizComplete: (score: number) => void;
  onWatchVideoAgain: () => void;
}

interface ShuffledOption {
  text: string;
  originalIndex: number;
}

const Quiz: React.FC<QuizProps> = ({ questions, onQuizComplete, onWatchVideoAgain }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerOriginalIndex, setSelectedAnswerOriginalIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(1);
  const [incorrectlySelected, setIncorrectlySelected] = useState<Set<number>>(new Set());
  const [shuffledOptions, setShuffledOptions] = useState<ShuffledOption[]>([]);

  const playCorrectSound = useSound('https://www.soundjay.com/buttons/sounds/button-3.mp3', 0.4);
  const playIncorrectSound = useSound('https://www.soundjay.com/buttons/sounds/button-10.mp3', 0.4);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  const shuffleOptions = useCallback(() => {
    const optionsWithOriginalIndex = currentQuestion.options.map((opt, index) => ({
      text: opt,
      originalIndex: index,
    }));
    setShuffledOptions(optionsWithOriginalIndex.sort(() => Math.random() - 0.5));
  }, [currentQuestion]);

  useEffect(() => {
    shuffleOptions();
  }, [currentQuestion, shuffleOptions]);
  
  useEffect(() => {
    // Re-render icons on mount and when feedback appears.
    const timerId = setTimeout(() => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 0);
    return () => clearTimeout(timerId);
  }, [showFeedback]);

  useEffect(() => {
    // This effect handles the confetti animation as a side effect of the answer being correct.
    // It runs only after the component has re-rendered to show the feedback.
    if (isCorrect && showFeedback) {
      const duration = 2 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
  
      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }
  
      const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
  
      // Cleanup the interval when the component unmounts or dependencies change.
      return () => clearInterval(interval);
    }
  }, [isCorrect, showFeedback]);

  const handleAnswerSelect = (originalIndex: number) => {
    if (!showFeedback && !incorrectlySelected.has(originalIndex)) {
      setSelectedAnswerOriginalIndex(originalIndex);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswerOriginalIndex === null) return;

    const correct = selectedAnswerOriginalIndex === currentQuestion.correctAnswerIndex;
    
    if (correct) {
      const points = { 1: 100, 2: 75, 3: 50, 4: 25 }[attempts] || 25;
      setScore(prev => prev + points);
      setIsCorrect(true);
      setShowFeedback(true);
      playCorrectSound();
    } else {
      setIncorrectlySelected(prev => new Set(prev).add(selectedAnswerOriginalIndex));
      setAttempts(prev => prev + 1);
      setSelectedAnswerOriginalIndex(null);
      playIncorrectSound();
      shuffleOptions(); // Re-shuffle on incorrect attempt
      if (attempts >= 4) {
          setIsCorrect(false);
          setShowFeedback(true);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex >= questions.length - 1) {
      onQuizComplete(score);
      return;
    }

    setShowFeedback(false);
    setSelectedAnswerOriginalIndex(null);
    setIsCorrect(null);
    setAttempts(1);
    setIncorrectlySelected(new Set());
    setCurrentQuestionIndex(prev => prev + 1);
    // shuffleOptions will be called by the useEffect for the new question
  };

  const getButtonClass = (originalIndex: number) => {
    if (showFeedback) {
        if (originalIndex === currentQuestion.correctAnswerIndex) {
            return 'bg-green-600 ring-4 ring-green-400';
        }
        if (incorrectlySelected.has(originalIndex)) {
            return 'bg-red-600 opacity-50';
        }
        return 'bg-gray-700 opacity-50';
    }

    if (incorrectlySelected.has(originalIndex)) {
        return 'bg-red-700 opacity-60 cursor-not-allowed';
    }
    
    return selectedAnswerOriginalIndex === originalIndex 
      ? 'bg-blue-600 ring-4 ring-blue-400' 
      : 'bg-gray-700 hover:bg-blue-800';
  };

  return (
    <div className="w-full max-w-3xl p-6 bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-700 text-white text-center">
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <p className="text-blue-400 font-bold">Pergunta {currentQuestionIndex + 1} de {questions.length}</p>
          <p className="text-white font-bold">Pontos: {score}</p>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
        </div>
        <div className="text-right mt-2">
            <button
                onClick={onWatchVideoAgain}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-700 ml-auto"
                aria-label="Assistir ao vídeo novamente"
            >
                <i data-lucide="video" className="w-4 h-4"></i>
                <span>Assistir ao Vídeo Novamente</span>
            </button>
        </div>
      </div>

      <h2 className="text-2xl font-semibold my-6 min-h-[6rem] flex items-center justify-center">{currentQuestion.question}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {shuffledOptions.map((option) => (
          <button
            key={option.originalIndex}
            onClick={() => handleAnswerSelect(option.originalIndex)}
            disabled={showFeedback || incorrectlySelected.has(option.originalIndex)}
            className={`p-4 rounded-lg text-left transition-all duration-300 transform hover:scale-105 disabled:scale-100 ${getButtonClass(option.originalIndex)}`}
          >
            <span className="font-semibold">{option.text}</span>
          </button>
        ))}
      </div>

      {!showFeedback ? (
        <ActionButton onClick={handleSubmit} disabled={selectedAnswerOriginalIndex === null}>
          Confirmar Resposta
        </ActionButton>
      ) : (
        <div className="animate-fade-in text-center p-4 rounded-lg min-h-[140px]">
          {isCorrect ? (
            <div>
              <h3 className="text-xl font-bold mb-2 text-green-400">
                <i data-lucide="check-circle" className="inline-block mr-2 w-6 h-6"></i>
                Resposta Correta!
              </h3>
              <p className="text-gray-300">{currentQuestion.explanation}</p>
            </div>
          ) : (
             <div>
                <h3 className="text-xl font-bold mb-2 text-red-400">
                    <i data-lucide="x-circle" className="inline-block mr-2 w-6 h-6"></i>
                    Todas as tentativas esgotadas.
                </h3>
                <p className="text-gray-300">A resposta correta era: <span className="font-bold">{currentQuestion.options[currentQuestion.correctAnswerIndex]}</span></p>
            </div>
          )}
          <ActionButton onClick={handleNext} className="mt-4">
            {currentQuestionIndex < questions.length - 1 ? 'Próxima Pergunta' : 'Finalizar Quiz'}
          </ActionButton>
        </div>
      )}
    </div>
  );
};

export default Quiz;