import React, { useState, useMemo, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { Screen, StageProgress, ThemeProps } from "../types";
import ActionButton from "../components/ActionButton";
import AnimatedScreen from "../components/AnimatedScreen";
import Quiz from "./Study/Quiz";
import Reflection from "./Study/Reflection";
import StageStepper from "../components/StageStepper";
import { useSound } from "../hooks/useSound";
import { SOUNDS, QUIZ_BGM_URLS } from "../constants";
import PlayerStatusBar from "../components/PlayerStatusBar";
import AchievementsPanel from "../components/AchievementsPanel";

type StudyStep = "video" | "quiz" | "reflection";

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

  const [studyStep, setStudyStep] = useState<StudyStep>("video");
  const [currentQuizScore, setCurrentQuizScore] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const playStageCompleteSound = useSound(SOUNDS.STAGE_COMPLETE.id, 0.4);
  const playClickSound = useSound(SOUNDS.CLICK.id, 0.3);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  // ⭐ Modal de “etapa concluída”
  const [showStageComplete, setShowStageComplete] = useState(false);
  const [lastStageScore, setLastStageScore] = useState(0);
  const [lastStageId, setLastStageId] = useState<number | null>(null);
  const [lastReflectionText, setLastReflectionText] = useState<string | null>(
    null
  );

  const currentStageData = useMemo(
    () => stagesData.find((s) => s.id === currentStageId),
    [stagesData, currentStageId]
  );

  const theme = useMemo(
    () => getStageTheme(currentStageId),
    [currentStageId]
  );

  const displayName = userName || "você";

  useEffect(() => {
    if (!currentStageData) navigateTo(Screen.Welcome);
  }, [currentStageData, navigateTo]);

  useEffect(() => {
    setStudyStep("video");
    setVideoEnded(false);
  }, [currentStageId]);

  // Lucide icons
  useEffect(() => {
    const timerId = setTimeout(() => {
      if ((window as any).lucide) (window as any).lucide.createIcons();
    }, 0);
    return () => clearTimeout(timerId);
  }, [currentStageId, studyStep, showStageComplete]);

  // BGM do quiz
  useEffect(() => {
    if (studyStep === "quiz" && isAudioUnlocked && currentStageData) {
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
    } else if (studyStep !== "quiz" && bgmRef.current) {
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

  const handleGoToProfile = () => {
    playClickSound();
    navigateTo(Screen.UserProfile);
  };

  const handleQuizComplete = (score: number) => {
    setCurrentQuizScore(score);
    setStudyStep("reflection");
  };

  // Salva progresso e abre modal
  const handleReflectionComplete = (reflectionText: string) => {
    playStageCompleteSound();
    updateStageProgress(currentStageId, currentQuizScore, reflectionText);

    setLastStageScore(currentQuizScore);
    setLastStageId(currentStageId);
    setLastReflectionText(reflectionText);

    setShowStageComplete(true);
  };

  // Próxima etapa ou declaração final
  const handleGoToNextStage = () => {
    if (!lastStageId) {
      setShowStageComplete(false);
      return;
    }

    const isLastStage = lastStageId === stagesData.length;

    setShowStageComplete(false);

    if (isLastStage) {
      navigateTo(Screen.Declaration);
      return;
    }

    setCurrentStageId(lastStageId + 1);
    setStudyStep("video");
    setVideoEnded(false);
  };

  const handleGoToBonus = () => {
    setShowStageComplete(false);
    navigateTo(Screen.Bonus);
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
      case "video": {
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
                <ActionButton onClick={() => setStudyStep("quiz")}>
                  Vamos para o Quiz!
                </ActionButton>
              ) : (
                <p className="text-gray-400 italic mt-4">
                  ⏳ Assista o vídeo completo para continuar...
                </p>
              )
            ) : (
              <ActionButton onClick={() => setStudyStep("quiz")}>
                Já assisti, vamos para o Quiz!
              </ActionButton>
            )}
          </div>
        );
      }

      case "quiz":
        return (
          <Quiz
            questions={currentStageData.questions}
            onQuizComplete={handleQuizComplete}
            onWatchVideoAgain={() => setStudyStep("video")}
            theme={theme}
          />
        );

      case "reflection":
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
          {/* linha título + botão de perfil */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <h2
              className={`text-xl font-bold text-center flex-1 ${theme.accentText}`}
            >
              Progresso da Jornada de {displayName}
            </h2>
            <button
              type="button"
              onClick={handleGoToProfile}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] border border-cyan-400/70 bg-gray-900/70 text-cyan-100 hover:bg-cyan-500/10 transition whitespace-nowrap"
            >
              <i data-lucide="user-circle-2" className="w-4 h-4" />
              <span>Meu Perfil</span>
            </button>
          </div>

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
                      : ""
                  } ${
                    stageProgress[stage.id]?.completed ? "text-green-400" : ""
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

      {/* Rodapé gamificado: conquistas + HUD do jogador (lado a lado) */}
      <div className="w-full max-w-4xl mx-auto mt-4 px-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <AchievementsPanel />
        {/* Aqui o HUD vem em modo inline, não fixo */}
        <PlayerStatusBar fixed={false} />
      </div>

      {/* ⭐ MODAL DE ETAPA CONCLUÍDA */}
      {showStageComplete && lastStageId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl bg-gray-900/95 border border-blue-500/70 p-6 text-white shadow-2xl">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-blue-300/80">
                  Etapa concluída
                </p>
                <h2 className="text-2xl font-extrabold mt-1">
                  {currentStageData.title}
                </h2>
              </div>
              <button
                onClick={() => setShowStageComplete(false)}
                className="text-gray-400 hover:text-gray-200 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-200 mb-4">
              Parabéns, {displayName}! Você concluiu a{" "}
              <span className="font-semibold">
                etapa {lastStageId} da jornada
              </span>
              . Deus está construindo algo em você a cada resposta, reflexão e
              decisão. 💙
            </p>

            <div className="grid grid-cols-3 gap-2 text-xs mb-4">
              <div className="bg-gray-800/80 rounded-xl p-2 border border-blue-500/40 text-center">
                <p className="text-[10px] text-gray-400 uppercase">
                  Pontos da etapa
                </p>
                <p className="text-lg font-bold text-emerald-300">
                  {lastStageScore}
                </p>
              </div>
              <div className="bg-gray-800/80 rounded-xl p-2 border border-green-500/40 text-center">
                <p className="text-[10px] text-gray-400 uppercase">
                  Etapas concl.
                </p>
                <p className="text-lg font-bold text-green-300">
                  {completedStagesCount}/{stagesData.length}
                </p>
              </div>
              <div className="bg-gray-800/80 rounded-xl p-2 border border-amber-500/40 text-center">
                <p className="text-[10px] text-gray-400 uppercase">
                  Progresso
                </p>
                <p className="text-lg font-bold text-amber-300">
                  {Math.round(progressPercentage)}%
                </p>
              </div>
            </div>

            {lastReflectionText && (
              <div className="mb-4 bg-gray-800/70 border border-gray-700 rounded-xl p-3 text-xs text-gray-200 max-h-32 overflow-y-auto">
                <p className="text-[10px] text-gray-400 uppercase mb-1">
                  Um trecho da sua reflexão
                </p>
                <p className="whitespace-pre-wrap">
                  {lastReflectionText.length > 220
                    ? lastReflectionText.slice(0, 220) + "..."
                    : lastReflectionText}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <ActionButton onClick={handleGoToNextStage}>
                Ir para a próxima etapa
              </ActionButton>
              <button
                type="button"
                onClick={handleGoToBonus}
                className="w-full text-xs text-blue-300 hover:text-blue-100 mt-1"
              >
                Quero jogar um desafio bônus antes de continuar 🎮
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatedScreen>
  );
};

export default StudyScreen;
