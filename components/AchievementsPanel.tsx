import React, { useMemo, useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { StageProgress } from "../types";

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

const AchievementsPanel: React.FC = () => {
  const {
    userName,
    totalScore,
    stageProgress,
    stagesData,
    completedBonusGames,
    posts,
  } = useAppContext();

  const [isOpen, setIsOpen] = useState(false);

  // Re-render ícones do Lucide quando abrir/fechar
  useEffect(() => {
    const timerId = setTimeout(() => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 0);

    return () => clearTimeout(timerId);
  }, [isOpen]);

  const {
    achievements,
    unlockedCount,
    totalAchievements,
  } = useMemo(() => {
    const stageList = Object.values(stageProgress || {}) as StageProgress[];

    const totalStages = stagesData.length;
    const completedStages = stageList.filter((s) => s.completed).length;

    const allStagesDone =
      totalStages > 0 && completedStages === totalStages;

    const allBonusDone =
      completedBonusGames && completedBonusGames.length > 0 &&
      completedBonusGames.length >= 5; // qtde de jogos bônus

    const userPosts = posts.filter((p) => p.isUserPost);
    const hasFirstPost = userPosts.length > 0;
    const hasPopularPost = userPosts.some((p) => p.likes >= 5);

    const hasHighStageScore = stageList.some((s) => s.score >= 800);
    const hasAnyReflection = stageList.some(
      (s) => s.reflection && s.reflection.trim().length >= 80
    );

    const hasBigTotalScore = totalScore >= 3000;

    const list: Achievement[] = [
      {
        id: "all-stages",
        title: "Jornada Completa",
        description: "Você concluiu todas as etapas do estudo bíblico.",
        unlocked: allStagesDone,
      },
      {
        id: "all-bonus",
        title: "Mestre dos Jogos",
        description: "Você completou todos os jogos bônus disponíveis.",
        unlocked: allBonusDone,
      },
      {
        id: "first-post",
        title: "Voz Ativa",
        description: "Você fez sua primeira publicação no mural.",
        unlocked: hasFirstPost,
      },
      {
        id: "popular-post",
        title: "Post Abençoando Muitos",
        description: "Um dos seus posts recebeu 5 ou mais curtidas.",
        unlocked: hasPopularPost,
      },
      {
        id: "high-stage-score",
        title: "Resposta Afiada",
        description: "Você tirou uma pontuação alta em uma das etapas.",
        unlocked: hasHighStageScore,
      },
      {
        id: "deep-reflection",
        title: "Coração Aberto",
        description:
          "Você escreveu uma reflexão pessoal mais profunda em alguma etapa.",
        unlocked: hasAnyReflection,
      },
      {
        id: "total-score",
        title: "Fome de Deus",
        description:
          "Sua pontuação total mostra que você mergulhou firme na jornada.",
        unlocked: hasBigTotalScore,
      },
    ];

    const unlocked = list.filter((a) => a.unlocked).length;

    return {
      achievements: list,
      unlockedCount: unlocked,
      totalAchievements: list.length,
    };
  }, [stageProgress, stagesData, completedBonusGames, posts, totalScore]);

  // Se ainda não tem nome, não mostra o painel
  if (!userName) return null;

  // Primeira parte do nome para deixar mais pessoal
  const firstName = userName.split(" ")[0];

  return (
    <div
      className="
        fixed
        bottom-16
        left-1/2
        -translate-x-1/2
        z-30
        w-full
        px-3
        flex
        justify-center
        pointer-events-none
      "
    >
      <div className="pointer-events-auto max-w-sm w-full flex flex-col items-center gap-2">
        {/* Botão colapsado */}
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="
              inline-flex items-center gap-2
              px-4 py-2
              rounded-full
              bg-slate-900/90
              border border-amber-400/70
              shadow-lg shadow-amber-500/30
              text-xs text-amber-50
              hover:bg-slate-800/90
              transition
            "
          >
            <i
              data-lucide="trophy"
              className="w-4 h-4 text-amber-300"
            ></i>
            <span className="font-semibold">
              Conquistas: {unlockedCount}/{totalAchievements}
            </span>
            <span className="text-[10px] opacity-80">↑ abrir</span>
          </button>
        )}

        {/* Painel expandido */}
        {isOpen && (
          <div
            className="
              w-full
              rounded-2xl
              bg-slate-950/95
              border border-amber-500/70
              shadow-2xl shadow-amber-500/40
              p-3
              text-xs text-slate-50
              backdrop-blur
            "
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-amber-300/90">
                  Conquistas da Jornada
                </p>
                <p className="text-[11px] text-slate-200 mt-1">
                  {firstName}, você já desbloqueou{" "}
                  <span className="font-semibold">
                    {unlockedCount}/{totalAchievements}
                  </span>{" "}
                  conquistas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="
                  text-[10px]
                  px-2 py-1
                  rounded-full
                  bg-slate-800/80
                  border border-slate-600
                  hover:bg-slate-700
                  transition
                "
              >
                fechar
              </button>
            </div>

            <div className="mt-1 max-h-[60vh] overflow-y-auto pr-1 space-y-2">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`
                    rounded-xl
                    border
                    p-2.5
                    flex
                    items-start
                    gap-2
                    ${
                      ach.unlocked
                        ? "border-emerald-500/70 bg-emerald-900/20"
                        : "border-slate-700/70 bg-slate-900/40"
                    }
                  `}
                >
                  <div className="mt-0.5">
                    <i
                      data-lucide={ach.unlocked ? "sparkles" : "lock"}
                      className={`w-4 h-4 ${
                        ach.unlocked
                          ? "text-emerald-300"
                          : "text-slate-500"
                      }`}
                    ></i>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold">
                      {ach.title}
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {ach.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-3 text-[10px] text-slate-400 text-center">
              Continue avançando: cada etapa, jogo bônus e partilha no mural
              pode desbloquear novas conquistas. 🏆
            </p>

            <div className="mt-1 text-[9px] text-slate-500 text-right">
              Dev tools: OFF
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsPanel;
