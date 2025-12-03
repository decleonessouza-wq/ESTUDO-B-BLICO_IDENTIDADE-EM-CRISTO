import React, { useMemo } from "react";
import { useAppContext } from "../context/AppContext";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  category: "progresso" | "compartilhar" | "bonus" | "tempo";
}

const AchievementsPanel: React.FC = () => {
  const {
    userName,
    stagesData,
    stageProgress,
    totalScore,
    posts,
    completedBonusGames,
    journeyStartAt,
    completedAt,
    totalTimeMinutes,
  } = useAppContext();

  const displayName = userName || "jogador";

  const totalStages = stagesData.length || 1;
  const completedStages = Object.values(stageProgress).filter(
    (sp) => sp && (sp as any).completed
  ).length;

  const userPostsCount = posts.filter((p) => p.isUserPost).length;
  const bonusCount = completedBonusGames.length;

  const achievements = useMemo<Achievement[]>(() => {
    const all: Achievement[] = [
      {
        id: "first-step",
        title: "Primeiro Passo",
        description: "Concluiu a primeira etapa da jornada.",
        icon: "👣",
        category: "progresso",
        unlocked: completedStages >= 1,
      },
      {
        id: "halfway",
        title: "No Meio do Caminho",
        description: "Chegou ou passou da metade das etapas.",
        icon: "🛤️",
        category: "progresso",
        unlocked: completedStages >= Math.ceil(totalStages / 2),
      },
      {
        id: "finish-journey",
        title: "Firme até o Fim",
        description: "Concluiu todas as etapas da jornada.",
        icon: "🏁",
        category: "progresso",
        unlocked: completedStages >= totalStages && !!completedAt,
      },
      {
        id: "high-score",
        title: "Mente Afiada",
        description: "Alcançou 80 pontos ou mais no total.",
        icon: "🧠",
        category: "progresso",
        unlocked: totalScore >= 80,
      },
      {
        id: "share-1",
        title: "Coração que Compartilha",
        description: "Publicou sua primeira reflexão no mural.",
        icon: "💬",
        category: "compartilhar",
        unlocked: userPostsCount >= 1,
      },
      {
        id: "share-3",
        title: "Influencer da Fé",
        description: "Publicou 3 ou mais reflexões no mural.",
        icon: "📣",
        category: "compartilhar",
        unlocked: userPostsCount >= 3,
      },
      {
        id: "bonus-1",
        title: "Explorador",
        description: "Concluiu o primeiro jogo bônus.",
        icon: "🧭",
        category: "bonus",
        unlocked: bonusCount >= 1,
      },
      {
        id: "bonus-3",
        title: "Caçador de Bônus",
        description: "Concluiu 3 jogos bônus ou mais.",
        icon: "🎯",
        category: "bonus",
        unlocked: bonusCount >= 3,
      },
      {
        id: "focus-fast",
        title: "Foco Total",
        description: "Concluiu a jornada em até 60 minutos.",
        icon: "⚡",
        category: "tempo",
        unlocked:
          !!completedAt &&
          typeof totalTimeMinutes === "number" &&
          totalTimeMinutes > 0 &&
          totalTimeMinutes <= 60,
      },
      {
        id: "focus-consistent",
        title: "Constante em Cristo",
        description: "Concluiu a jornada levando mais de 3 dias, sem desistir.",
        icon: "📆",
        category: "tempo",
        unlocked: (() => {
          if (!journeyStartAt || !completedAt) return false;
          const start = new Date(journeyStartAt).getTime();
          const end = new Date(completedAt).getTime();
          const diffDays = (end - start) / (1000 * 60 * 60 * 24);
          return diffDays >= 3;
        })(),
      },
    ];

    return all;
  }, [
    completedStages,
    totalStages,
    totalScore,
    userPostsCount,
    bonusCount,
    journeyStartAt,
    completedAt,
    totalTimeMinutes,
  ]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  if (!userName) {
    // Antes de o usuário se identificar, não precisa mostrar nada
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      <div className="bg-slate-900/80 border border-blue-800/70 rounded-2xl p-4 md:p-5 shadow-lg shadow-blue-900/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
              <span>Conquistas da Jornada</span>
              <span className="text-xl">🏅</span>
            </h2>
            <p className="text-xs md:text-sm text-gray-300">
              {displayName}, veja os sinais de como Deus já está
              trabalhando em você ao longo desta jornada.
            </p>
          </div>
          <div className="flex gap-3 text-xs md:text-sm">
            <div className="px-3 py-1 rounded-full bg-blue-950/60 border border-blue-700/60 text-blue-200">
              {unlockedCount} de {achievements.length} conquistas
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/60 text-emerald-200">
              Pontos: {totalScore}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`relative rounded-xl border px-3 py-3 text-xs md:text-sm transition-all duration-200 ${
                a.unlocked
                  ? "bg-slate-800/80 border-emerald-500/70 shadow-md shadow-emerald-500/20"
                  : "bg-slate-900/60 border-slate-700/80 opacity-70"
              }`}
            >
              <div className="flex items-start gap-2">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-lg ${
                    a.unlocked
                      ? "bg-gradient-to-br from-emerald-400 to-cyan-400"
                      : "bg-slate-800/80 text-slate-400"
                  }`}
                >
                  {a.icon}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-semibold ${
                      a.unlocked ? "text-emerald-200" : "text-gray-300"
                    }`}
                  >
                    {a.title}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {a.description}
                  </p>
                </div>
              </div>

              {/* Etiqueta de categoria */}
              <div className="mt-2 flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-wide text-gray-500">
                  {a.category === "progresso"
                    ? "Progresso na jornada"
                    : a.category === "compartilhar"
                    ? "Compartilhar & comunidade"
                    : a.category === "bonus"
                    ? "Jogos bônus"
                    : "Tempo & constância"}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    a.unlocked
                      ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/60"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {a.unlocked ? "Desbloqueada" : "Bloqueada"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-[11px] text-gray-400">
          Dica: continue respondendo com atenção, refletindo com sinceridade e
          compartilhando suas percepções. As conquistas não são só “medalhas”,
          são lembranças de como Deus está formando sua identidade em Cristo.
        </p>
      </div>
    </div>
  );
};

export default AchievementsPanel;
