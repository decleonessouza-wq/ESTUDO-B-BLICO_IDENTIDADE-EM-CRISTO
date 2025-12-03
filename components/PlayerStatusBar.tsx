import React, { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";

const MAX_LEVEL = 5;
const XP_PER_LEVEL = 200; // ajuste se quiser subir de nível mais rápido/devagar

const PlayerStatusBar: React.FC = () => {
  const {
    userName,
    totalScore,
    stageProgress,
    stagesData,
    currentStageId,
    completedBonusGames,
  } = useAppContext();

  const [isOpen, setIsOpen] = useState(false);

  // 👉 animação “+X pts”
  const [lastScore, setLastScore] = useState(totalScore);
  const [scoreDelta, setScoreDelta] = useState<number | null>(null);

  useEffect(() => {
    if (totalScore > lastScore) {
      const delta = totalScore - lastScore;
      setScoreDelta(delta);
      const timeout = setTimeout(() => setScoreDelta(null), 900);
      setLastScore(totalScore);
      return () => clearTimeout(timeout);
    }
    setLastScore(totalScore);
  }, [totalScore, lastScore]);

  const {
    totalStages,
    completedStages,
    completionPercent,
    level,
    levelProgress,
    nextLevelXp,
    currentLevelXp,
  } = useMemo(() => {
    const totalStagesLocal = stagesData.length;
    const completedStagesLocal = Object.values(stageProgress).filter(
      (sp) => sp && (sp as any).completed
    ).length;

    const completionPercentLocal =
      totalStagesLocal > 0
        ? Math.round((completedStagesLocal / totalStagesLocal) * 100)
        : 0;

    const rawLevel = Math.floor(totalScore / XP_PER_LEVEL) + 1;
    const levelLocal = Math.min(MAX_LEVEL, Math.max(1, rawLevel));

    const currentLevelXpLocal = (levelLocal - 1) * XP_PER_LEVEL;
    const nextLevelXpLocal = levelLocal * XP_PER_LEVEL;
    const levelProgressLocal =
      nextLevelXpLocal - currentLevelXpLocal > 0
        ? Math.min(
            1,
            (totalScore - currentLevelXpLocal) /
              (nextLevelXpLocal - currentLevelXpLocal)
          )
        : 0;

    return {
      totalStages: totalStagesLocal,
      completedStages: completedStagesLocal,
      completionPercent: completionPercentLocal,
      level: levelLocal,
      levelProgress: levelProgressLocal,
      nextLevelXp: nextLevelXpLocal,
      currentLevelXp: currentLevelXpLocal,
    };
  }, [stagesData, stageProgress, totalScore]);

  const currentStageTitle =
    stagesData.find((s) => s.id === currentStageId)?.title ||
    `Etapa ${currentStageId}`;

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30">
      {/* HUD “mini” recolhido */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-cyan-500/50 shadow-lg shadow-cyan-500/30 text-xs text-cyan-50 hover:bg-slate-800/90 transition"
        >
          <span className="text-[11px] font-semibold">
            {userName ? userName.split(" ")[0] : "Jornada"}
          </span>
          <span className="h-5 w-px bg-cyan-500/40" />
          <span className="text-[11px]">
            Nível <strong>{level}</strong> • {completionPercent}% concluído
          </span>
          <span className="ml-1 text-[10px] opacity-80">↑ abrir</span>
        </button>
      )}

      {/* HUD expandido */}
      {isOpen && (
        <div className="w-[360px] max-w-[95vw] rounded-2xl bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 border border-cyan-500/60 shadow-2xl shadow-cyan-500/40 p-3 text-xs text-slate-50 backdrop-blur">
          {/* header + botão fechar */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] text-cyan-200 font-semibold uppercase tracking-wide">
                Jornada de{" "}
                {userName ? userName.split(" ")[0] : "convidado(a)"}
              </p>
              <p className="text-[11px] text-slate-300">
                {completedStages}/{totalStages} etapas • {completionPercent}%
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[10px] px-2 py-1 rounded-full bg-slate-800/80 border border-slate-600 hover:bg-slate-700 transition"
            >
              fechar
            </button>
          </div>

          {/* Nível / XP */}
          <div className="mt-2 mb-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-cyan-500/20 border border-cyan-400/70 flex items-center justify-center text-[11px] font-bold text-cyan-100">
                {level}
              </div>
              <div>
                <p className="text-[11px] text-slate-200 font-semibold">
                  Nível {level}
                </p>
                <p className="text-[10px] text-slate-400">
                  XP: {totalScore}/{nextLevelXp}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400">
                Próx. nível em{" "}
                {Math.max(0, nextLevelXp - totalScore)} pts
              </p>
              <p className="text-[10px] text-emerald-300">
                Bônus concl.: {completedBonusGames.length}
              </p>
            </div>
          </div>

          {/* barra de XP */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2 border border-slate-700/80">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${levelProgress * 100}%` }}
            />
          </div>

          {/* etapa atual */}
          <div className="mt-1 flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">
                Etapa atual
              </p>
              <p className="text-[11px] font-semibold text-slate-50">
                {currentStageTitle}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400">
                Pontuação total
              </p>
              <p className="text-[13px] font-bold text-emerald-300">
                {totalScore}
              </p>
            </div>
          </div>

          {/* animação de +pts */}
          {scoreDelta !== null && scoreDelta > 0 && (
            <div className="mt-1 flex justify-end pr-1">
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/60 animate-bounce">
                +{scoreDelta} pts!
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerStatusBar;
