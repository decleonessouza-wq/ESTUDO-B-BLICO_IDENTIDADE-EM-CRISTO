
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
// FIX: Import `StageProgress` to use it for type casting.
import { Screen, StageProgress } from '../types';
import ActionButton from '../components/ActionButton';
import AnimatedScreen from '../components/AnimatedScreen';
import Quiz from './Study/Quiz';
import Reflection from './Study/Reflection';
import StageStepper from '../components/StageStepper';
import { useSound } from '../hooks/useSound';
import { SOUNDS, QUIZ_BGM_URLS } from '../constants';

type StudyStep = 'video' | 'quiz' | 'reflection';

const StudyScreen: React.FC = () => {
  const { 
    currentStageId, 
    stagesData, 
    navigateTo, 
    updateStageProgress, 
    setCurrentStageId,
    stageProgress,
    userName,
    isAudioUnlocked,
    // Fix: Get bgmUrls from context to use custom music.
    bgmUrls,
  } = useAppContext();
  
  const [studyStep, setStudyStep] = useState<StudyStep>('video');
  const [currentQuizScore, setCurrentQuizScore] = useState(0);
  const playStageCompleteSound = useSound(SOUNDS.STAGE_COMPLETE.id, 0.4);
  const playClickSound = useSound(SOUNDS.CLICK.id, 0.3);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  
  const currentStageData = useMemo(() => stagesData.find(s => s.id === currentStageId), [stagesData, currentStageId]);
  
  // If stage data is not found for any reason, redirect to welcome to prevent errors.
  useEffect(() => {
    if (!currentStageData) {
      navigateTo(Screen.Welcome);
    }
  }, [currentStageData, navigateTo]);

  // When stage changes, reset the view to the video
  useEffect(() => {
    setStudyStep('video');
  }, [currentStageId]);
  
  // Re-render icons when the stage or step changes
  useEffect(() => {
    // Use a timeout to allow React's render to complete before Lucide scans the DOM.
    // This helps prevent race conditions that can cause script errors.
    const timerId = setTimeout(() => {
        if ((window as any).lucide) {
            (window as any).lucide.createIcons();
        }
    }, 0);
    return () => clearTimeout(timerId);
  }, [currentStageId, studyStep]);

  // Effect to manage background music for the quiz
  useEffect(() => {
    if (studyStep === 'quiz' && isAudioUnlocked && currentStageData) {
      const stageIndex = currentStageData.id - 1;
      const audioUrl = (bgmUrls && bgmUrls[stageIndex]) || QUIZ_BGM_URLS[stageIndex % QUIZ_BGM_URLS.length];
      
      const currentBgm = bgmRef.current;
      
      // If no valid URL, stop any playing music
      if (!audioUrl) {
          if (currentBgm) {
              currentBgm.pause();
              bgmRef.current = null;
          }
          return;
      }
      
      // If the correct music is already loaded, ensure it's playing
      if (currentBgm && currentBgm.src === audioUrl) {
          if (currentBgm.paused) {
            currentBgm.play().catch(e => console.error("BGM resume failed:", e));
          }
          return;
      }
      
      // If other music is playing, pause it
      if (currentBgm) {
        currentBgm.pause();
      }
      
      // Create and play new BGM
      const newBgm = new Audio(audioUrl);
      newBgm.loop = true;
      newBgm.volume = 0.2;
      newBgm.play().catch(e => {
        // Only log error if it's not the benign interruption error
        if (e.name !== 'AbortError') {
          console.error("BGM play failed:", e);
        }
      });
      bgmRef.current = newBgm;

    } else if (bgmRef.current) {
      // If not in quiz step, pause the music
      bgmRef.current.pause();
    }
  }, [studyStep, currentStageData, isAudioUnlocked, bgmUrls]);

  // Cleanup effect to stop music when the component unmounts
  useEffect(() => {
    return () => {
        if (bgmRef.current) {
            bgmRef.current.pause();
            bgmRef.current = null;
        }
    };
  }, []);


  if (!currentStageData) {
    return null; // Render nothing while redirecting
  }

  const handleGoBack = () => {
    playClickSound();
    if (currentStageId > 1) {
      setCurrentStageId(currentStageId - 1);
    }
  };

  const handleQuizComplete = (score: number) => {
    setCurrentQuizScore(score);
    setStudyStep('reflection');
  };

  const handleReflectionComplete = (reflectionText: string) => {
    playStageCompleteSound();
    updateStageProgress(currentStageId, currentQuizScore, reflectionText);
    
    const isLastStage = currentStageId === stagesData.length;
    if (isLastStage) {
      navigateTo(Screen.Declaration);
    } else {
      setCurrentStageId(currentStageId + 1);
    }
  };

  const completedStagesCount = useMemo(() => {
    // FIX: Cast the parameter `p` to `StageProgress` to access the `completed` property safely.
    return Object.values(stageProgress).filter(p => (p as StageProgress).completed).length;
  }, [stageProgress]);

  const progressPercentage = stagesData.length > 0 ? (completedStagesCount / stagesData.length) * 100 : 0;

  const renderContent = () => {
    switch(studyStep) {
      case 'video':
        return (
          <div className="w-full max-w-4xl p-6 bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-700 text-white text-center animate-fade-in">
            <div className="aspect-w-16 aspect-h-9 w-full rounded-lg overflow-hidden shadow-lg mb-6 border-2 border-blue-600">
              <iframe
                className="aspect-video"
                src={currentStageData.videoUrl}
                title={currentStageData.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <ActionButton onClick={() => setStudyStep('quiz')}>
              Vamos para o Quiz!
            </ActionButton>
          </div>
        );
      case 'quiz':
        return <Quiz 
          questions={currentStageData.questions} 
          onQuizComplete={handleQuizComplete} 
          onWatchVideoAgain={() => setStudyStep('video')}
        />;
      case 'reflection':
        return (
          <Reflection 
            biblicalReflection={currentStageData.biblicalReflection} 
            motivationalPhrase={currentStageData.motivationalPhrase}
            onReflectionComplete={handleReflectionComplete}
          />
        );
      default:
        return null;
    }
  }

  return (
    <AnimatedScreen>
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <div className="mb-8 w-full px-4">
            <h2 className="text-xl font-bold text-center text-blue-300 mb-2">Progresso da Jornada de {userName}</h2>
            <div className="w-full bg-gray-700 rounded-full h-4 shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-4 rounded-full transition-all duration-500 ease-out flex items-center" 
                style={{ width: `${progressPercentage}%` }}
              >
                {progressPercentage > 10 && <span className="text-xs font-bold text-white pl-2">{Math.round(progressPercentage)}%</span>}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
                {stagesData.map(stage => (
                     <div key={stage.id} className={`flex-1 text-center font-bold`}>
                        <span className={`px-2 py-1 rounded-full transition-colors ${currentStageId === stage.id ? 'text-white bg-blue-600' : ''} ${stageProgress[stage.id]?.completed ? 'text-green-400' : ''}`}>
                            {stage.id}
                        </span>
                     </div>
                ))}
            </div>
        </div>
        
        <div className="w-full max-w-4xl text-center text-white mb-6 px-4">
            <div className="flex items-center justify-center relative">
                {currentStageId > 1 && (
                    <button 
                        onClick={handleGoBack}
                        className="absolute left-0 p-2 rounded-full hover:bg-gray-700 transition-all duration-200 transform hover:scale-110"
                        aria-label="Voltar Etapa"
                    >
                        <i data-lucide="arrow-left" className="w-6 h-6"></i>
                    </button>
                )}
                <h1 className="text-2xl md:text-3xl font-bold px-10">
                    {currentStageData.title}
                </h1>
            </div>
            <p className="text-gray-300 mt-2">{currentStageData.motivationalPhrase}</p>
        </div>

        <StageStepper currentStep={studyStep} />

        {renderContent()}
      </div>
    </AnimatedScreen>
  );
};

export default StudyScreen;
