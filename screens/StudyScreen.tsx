// Fix: Create the StudyScreen component to manage study stages
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
// Fix: Import StageProgress to be used for type casting and fixing type error.
import { Screen, StageProgress } from '../types';
import AnimatedScreen from '../components/AnimatedScreen';
import Quiz from './Study/Quiz';
import Reflection from './Study/Reflection';
import ActionButton from '../components/ActionButton';

type StudySubScreen = 'video' | 'quiz' | 'reflection';

const StudyScreen: React.FC = () => {
  const { 
    stagesData, 
    currentStageId, 
    setCurrentStageId,
    updateStageProgress,
    navigateTo,
    stageProgress
  } = useAppContext();
  
  const [subScreen, setSubScreen] = useState<StudySubScreen>('video');
  const [quizScore, setQuizScore] = useState(0);

  const currentStage = stagesData.find(s => s.id === currentStageId);

  useEffect(() => {
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, []);

  if (!currentStage) {
    // Should not happen if logic is correct
    return <div>Stage not found!</div>;
  }

  const handleQuizComplete = (score: number) => {
    setQuizScore(score);
    setSubScreen('reflection');
  };

  const handleReflectionComplete = (reflectionText: string) => {
    updateStageProgress(currentStageId, quizScore, reflectionText);
    
    if (currentStageId < stagesData.length) {
      setCurrentStageId(currentStageId + 1);
      setSubScreen('video');
    } else {
      navigateTo(Screen.Declaration);
    }
  };
  
  const totalStages = stagesData.length;
  // Fix: Cast p to StageProgress because Object.values returns unknown type for this object structure.
  const completedStagesCount = Object.values(stageProgress).filter(p => (p as StageProgress).completed).length;
  const progressPercentage = (completedStagesCount / totalStages) * 100;

  return (
    <AnimatedScreen>
      <div className="w-full max-w-4xl">
        <div className="mb-6 bg-gray-800 p-4 rounded-xl shadow-lg border border-blue-800">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Etapa {currentStageId}: {currentStage.title}</h1>
            <span className="text-blue-300 font-semibold">{completedStagesCount} / {totalStages} Concluídas</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        {subScreen === 'video' && (
          <div className="w-full p-6 bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-700 text-white text-center animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Vídeo de Estudo</h2>
            <div className="aspect-w-16 aspect-h-9 mb-6 rounded-lg overflow-hidden shadow-lg">
                <iframe 
                    className="w-full aspect-video"
                    src={currentStage.videoUrl} 
                    title={currentStage.title} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen>
                </iframe>
            </div>
            <p className="text-gray-300 mb-6">{currentStage.biblicalReflection}</p>
            <ActionButton onClick={() => setSubScreen('quiz')}>
              Iniciar Quiz
            </ActionButton>
          </div>
        )}

        {subScreen === 'quiz' && (
          <Quiz 
            key={currentStage.id} 
            questions={currentStage.questions} 
            onQuizComplete={handleQuizComplete} 
          />
        )}

        {subScreen === 'reflection' && (
          <Reflection
            biblicalReflection={currentStage.biblicalReflection}
            motivationalPhrase={currentStage.motivationalPhrase}
            onReflectionComplete={handleReflectionComplete}
          />
        )}
      </div>
    </AnimatedScreen>
  );
};

export default StudyScreen;
