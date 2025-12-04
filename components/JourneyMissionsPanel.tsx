import React, { useMemo } from "react";
import { useAppContext } from "../context/AppContext";

const JourneyMissionsPanel: React.FC = () => {
  const { stageProgress, stagesData, completedBonusGames, posts, userName } =
    useAppContext();

  const {
    completedStagesCount,
    totalStages,
    bonusGamesCount,
    userPostsCount,
  } = useMemo(() => {
    const completedStagesLocal = Object.values(stageProgress || {}).filter(
      (sp: any) => sp && sp.completed
    ).length;

    const totalStagesLocal = stagesData?.length ?? 0;
    const bonusGamesLocal = completedBonusGames?.length ?? 0;
    const userPostsLocal = (posts || []).filter((p: any) => p.isUserPost)
      .length;

    return {
      completedStagesCount: completedStagesLocal,
      totalStages: totalStagesLocal,
      bonusGamesCount: bonusGamesLocal,
      userPostsCount: userPostsLocal,
    };
  }, [stageProgress, stagesData, completedBonusGames, posts]);

  const missions = [
    {
      id: 1,
      title: "Comece sua jornada",
      description: "Conclua pelo menos 1 etapa do estudo.",
      done: completedStagesCount >= 1,
    },
    {
      id: 2,
      title: "Aprofunde-se na Palavra",
      description: "Conclua 3 ou mais etapas da jornada.",
      done: completedStagesCount >= 3,
    },
    {
      id: 3,
      title: "Compartilhe com a comunidade",
      description: "Publique pelo menos 1 reflexão no mural.",
      done: userPostsCount >= 1,
    },
    {
      id: 4,
      title: "Treine com os jogos bônus",
      description: "Conclua pelo menos 1 jogo bônus.",
      done: bonusGamesCount >= 1,
    },
  ];

  const usernameFirst =
    userName && userName.trim().length > 0
      ? userName.split(" ")[0]
      : "você";

  return (
    <div className="w-full max-w-4xl mx-auto mb-6 px-4">
      <div className="bg-slate-900/80 border border-cyan-600/60 rounded-2xl p-4 text-white shadow-lg shadow-cyan-500/20">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
              Missões da Jornada
            </p>
            <p className="text-sm text-slate-200">
              {usernameFirst}, veja como está seu progresso geral:
            </p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>
              Etapas:{" "}
              <span className="text-cyan-300 font-semibold">
                {completedStagesCount}/{totalStages || "?"}
              </span>
            </p>
            <p>
              Jogos bônus:{" "}
              <span className="text-emerald-300 font-semibold">
                {bonusGamesCount}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {missions.map((mission) => (
            <div
              key={mission.id}
              className={`flex items-start gap-3 rounded-xl border px-3 py-2 text-xs md:text-sm transition-all duration-200 ${
                mission.done
                  ? "bg-emerald-900/30 border-emerald-500/70"
                  : "bg-slate-800/70 border-slate-700 hover:border-cyan-400/80"
              }`}
            >
              <div className="mt-1">
                {mission.done ? (
                  <i
                    data-lucide="check-circle-2"
                    className="w-5 h-5 text-emerald-400"
                  />
                ) : (
                  <i
                    data-lucide="sparkles"
                    className="w-5 h-5 text-cyan-300"
                  />
                )}
              </div>
              <div>
                <p
                  className={`font-semibold ${
                    mission.done ? "text-emerald-200" : "text-slate-100"
                  }`}
                >
                  {mission.title}
                </p>
                <p className="text-slate-300 text-[11px] md:text-xs">
                  {mission.description}
                </p>
                {mission.done && (
                  <p className="text-[11px] text-emerald-300 mt-1">
                    Missão concluída! 👏
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-[11px] text-slate-400">
          Essas missões são para te lembrar de viver a jornada por completo:
          estudo, reflexão, prática e comunhão.
        </p>
      </div>
    </div>
  );
};

export default JourneyMissionsPanel;
