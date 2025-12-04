import React, { useEffect, useState } from "react";
import AnimatedScreen from "../components/AnimatedScreen";
import ActionButton from "../components/ActionButton";
import { useAppContext } from "../context/AppContext";
import { Screen } from "../types";

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
}

const STORAGE_KEY = "identidade:weeklyChallengesCompleted";

const CHALLENGES: WeeklyChallenge[] = [
  {
    id: "cartaDeus",
    title: "Carta para Deus",
    description:
      "Escreva uma carta para Deus falando suas inseguranças, medos e sonhos.",
  },
  {
    id: "audioAgradecimento",
    title: "Áudio de agradecimento",
    description:
      "Envie um áudio de agradecimento para alguém que marcou sua vida.",
  },
  {
    id: "versiculoMural",
    title: "Versículo no mural",
    description:
      "Escolha um versículo que falou com você e poste no mural da comunidade.",
  },
];

const WeeklyChallengesScreen: React.FC = () => {
  const { navigateTo } = useAppContext();
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as string[];
      setCompletedIds(parsed);
    } catch (err) {
      console.error("Erro ao carregar desafios semanais:", err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds));
    } catch (err) {
      console.error("Erro ao salvar desafios semanais:", err);
    }
  }, [completedIds]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleChallenge = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <AnimatedScreen>
      <div className="w-full max-w-3xl mx-auto px-4 py-6 text-white">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-amber-300">
              Desafios Semanais
            </p>
            <h1 className="text-2xl md:text-3xl font-bold">
              Missões para viver na prática
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Use esses desafios para colocar em ação o que você aprendeu na
              jornada.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo(Screen.Final)}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-800 border border-slate-600 hover:bg-slate-700 transition"
          >
            Voltar ao Certificado
          </button>
        </div>

        <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-slate-300">
              Marque o que já conseguiu cumprir. Você pode usar o Diário
              Espiritual para registrar o que viveu em cada desafio.
            </p>
            <ActionButton onClick={() => navigateTo(Screen.SpiritualDiary)}>
              Abrir Diário Espiritual
            </ActionButton>
          </div>

          <div className="space-y-3">
            {CHALLENGES.map((challenge) => {
              const done = completedIds.includes(challenge.id);
              return (
                <button
                  key={challenge.id}
                  type="button"
                  onClick={() => toggleChallenge(challenge.id)}
                  className={`w-full text-left rounded-2xl border px-4 py-3 transition flex items-start gap-3 ${
                    done
                      ? "bg-amber-500/15 border-amber-400/70"
                      : "bg-slate-900 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  <div className="mt-1">
                    {done ? (
                      <i
                        data-lucide="check-circle-2"
                        className="w-5 h-5 text-amber-300"
                      />
                    ) : (
                      <i
                        data-lucide="circle"
                        className="w-5 h-5 text-slate-500"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-amber-100">
                      {challenge.title}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {challenge.description}
                    </p>
                    {done && (
                      <p className="text-[11px] text-amber-300 mt-1">
                        Marcado como concluído. Que isso vire um estilo de vida!
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AnimatedScreen>
  );
};

export default WeeklyChallengesScreen;
