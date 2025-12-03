import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen, StageProgress, ThemeProps } from '../types';
import ActionButton from '../components/ActionButton';
import AnimatedScreen from '../components/AnimatedScreen';
import Quiz from './Study/Quiz';
import Reflection from './Study/Reflection';
import StageStepper from '../components/StageStepper';
import { useSound } from '../hooks/useSound';
import { SOUNDS, QUIZ_BGM_URLS } from '../constants';
import PlayerStatusBar from '../components/PlayerStatusBar'; // ⬅️ NOVO IMPORT
import AchievementsPanel from "../components/AchievementsPanel";


type StudyStep = 'video' | 'quiz' | 'reflection';

const getStageTheme = (stageId: number): ThemeProps => {
  const id = ((stageId - 1) % 6) + 1;

  return {
    cardBorder: `border-stage-${id}-dark`,
    accentText: `text-stage-${id}-light`,
    accentBg: `bg-stage-${id}`,
    accentIcon: `text-stage-${id}-light`,
    progressFrom: `from-stage-${id}`,
    progressTo: `to-stage-${id}-light`,
  };
};

// Converte links normais do YouTube (youtu.be ou watch?v=)
// para o formato embed que pode ser usado no iframe
const getYoutubeEmbedUrl = (url: string): string => {
  try {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&]+)/i
    );
    if (!match) return url;
    const videoId = match[1];
    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  } catch {
    return url;
  }
};

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
    bgmUrls,
  } = useAppContext();

  const [studyStep, setStudyStep] = useState<StudyStep>('video');
  const [currentQuizScore, setCurrentQuizScore] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const playStageCompleteSound = useSound(SOUNDS.STAGE_COMPLETE.id, 0.4);
  const playClickSound = useSound(SOUNDS.CLICK.id, 0.3);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  const currentStageData = useMemo(
    () => stagesData.find((s) => s.id === currentStageId),
    [stagesData, currentStageId]
  );

  const theme = useMemo(() => getStageTheme(currentStageId), [currentStageId]);

  useEffect(() => {
    if (!currentStageData) navigateTo(Screen.Welcome);
  }, [currentStageData, navigateTo]);

  useEffect(() => {
    setStudyStep('video');
    setVideoEnded(false);
  }, [currentStageId]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if ((window as any).lucide) (window as any).lucide.createIcons();
    }, 0);
    return () => clearTimeout(timerId);
  }, [currentStageId, studyStep]);

  useEffect(() => {
    if (studyStep === 'quiz' && isAudioUnlocked && currentStageData) {
      const stageIndex = currentStageData.id - 1;
      const audioUrl =
        (bgmUrls && bgmUrls[stageIndex]) ||
        QUIZ_BGM_URLS[stageIndex % QUIZ_BGM_URLS.length];

      const currentBgm = bgmRef.current;

      if (!audioUrl) {
        if (currentBgm) currentBgm.pause();
        bgmRef.current = null;
        return;
      }

      if (currentBgm && currentBgm.src === audioUrl) {
        if (currentBgm.paused) currentBgm.play().catch(() => {});
        return;
      }

      if (currentBgm) currentBgm.pause();

      const newBgm = new Audio(audioUrl);
      newBgm.loop = true;
      newBgm.volume = 0.2;
      newBgm.play().catch(() => {});
      bgmRef.current = newBgm;
    } else if (studyStep !== 'quiz' && bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
      bgmRef.current = null;
    }

    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
      }
    };
  }, [studyStep, isAudioUnlocked, currentStageData, bgmUrls]);

  if (!currentStageData) return null;

  const handleGoBack = () => {
    playClickSound();
    if (currentStageId > 1) setCurrentStageId(currentStageId - 1);
  };

  const handleQuizComplete = (score: number) => {
    setCurrentQuizScore(score);
    setStudyStep('reflection');
  };

  const handleReflectionComplete = (reflectionText: string) => {
    playStageCompleteSound();
    updateStageProgress(currentStageId, currentQuizScore, reflectionText);

    const isLastStage = currentStageId === stagesData.length;
    if (isLastStage) navigateTo(Screen.Declaration);
    else setCurrentStageId(currentStageId + 1);
  };

  const completedStagesCount = useMemo(
    () =>
      Object.values(stageProgress).filter(
        (p) => (p as StageProgress).completed
      ).length,
    [stageProgress]
  );

  const progressPercentage =
    stagesData.length > 0
      ? (completedStagesCount / stagesData.length) * 100
      : 0;

  const renderContent = () => {
    switch (studyStep) {
      case 'video': {
        const isMp4 = /\.mp4($|\?)/i.test(currentStageData.videoUrl);
        const iframeSrc = isMp4
          ? currentStageData.videoUrl
          : getYoutubeEmbedUrl(currentStageData.videoUrl);

        return (
          <div
            className={`w-full max-w-4xl p-6 bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-2xl shadow-2xl border ${theme.cardBorder} text-white text-center animate-fade-in`}
          >
            <div
              className={`aspect-w-16 aspect-h-9 w-full rounded-lg overflow-hidden shadow-lg mb-6 border-2 ${theme.cardBorder}`}
            >
              {isMp4 ? (
                <video
                  className="w-full h-full"
                  src={currentStageData.videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  onEnded={() => setVideoEnded(true)}
                />
              ) : (
                <iframe
                  className="w-full h-full"
                  src={iframeSrc}
                  title={currentStageData.title}
                  frameBorder={0}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {isMp4 ? (
              videoEnded ? (
                <ActionButton onClick={() => setStudyStep('quiz')}>
                  Vamos para o Quiz!
                </ActionButton>
              ) : (
                <p className="text-gray-400 italic mt-4">
                  ⏳ Assista o vídeo completo para continuar...
                </p>
              )
            ) : (
              <ActionButton onClick={() => setStudyStep('quiz')}>
                Já assisti, vamos para o Quiz!
              </ActionButton>
            )}
          </div>
        );
      }

      case 'quiz':
        return (
          <Quiz
            questions={currentStageData.questions}
            onQuizComplete={handleQuizComplete}
            onWatchVideoAgain={() => setStudyStep('video')}
            theme={theme}
          />
        );

      case 'reflection':
        return (
          <Reflection
            biblicalReflection={currentStageData.biblicalReflection}
            motivationalPhrase={currentStageData.motivationalPhrase}
            onReflectionComplete={handleReflectionComplete}
            theme={theme}
          />
        );

      default:
        return null;
    }
  };

  return (
    <AnimatedScreen>
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <div className="mb-8 w-full px-4">
          <h2 className={`text-xl font-bold text-center ${theme.accentText} mb-2`}>
            Progresso da Jornada de {userName}
          </h2>
          <div className="w-full bg-gray-700 rounded-full h-4 shadow-inner">
            <div
              className={`h-4 rounded-full transition-all duration-500 ease-out flex items-center bg-gradient-to-r ${theme.progressFrom} ${theme.progressTo}`}
              style={{ width: `${progressPercentage}%` }}
            >
              {progressPercentage > 10 && (
                <span className="text-xs font-bold text-white pl-2">
                  {Math.round(progressPercentage)}%
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            {stagesData.map((stage) => (
              <div key={stage.id} className="flex-1 text-center font-bold">
                <span
                  className={`px-2 py-1 rounded-full transition-colors ${
                    currentStageId === stage.id
                      ? `text-white ${theme.accentBg}`
                      : ''
                  } ${
                    stageProgress[stage.id]?.completed ? 'text-green-400' : ''
                  }`}
                >
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
                <i data-lucide="arrow-left" className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-2xl md:text-3xl font-bold px-10">
              {currentStageData.title}
            </h1>
          </div>
          <p className="text-gray-300 mt-2">
            {currentStageData.motivationalPhrase}
          </p>
        </div>

        <StageStepper currentStep={studyStep} />

        {renderContent()}
      </div>

      {/* ⬇️ NOVO: barra de status fixa para o player/jornada */}
      <PlayerStatusBar />
    </AnimatedScreen>
  );
};

{/* Painel de conquistas da jornada */}
<AchievementsPanel />

export default StudyScreen;