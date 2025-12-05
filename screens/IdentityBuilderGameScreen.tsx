// screens/IdentityBuilderGame.tsx
import React, { useEffect, useState } from "react";
import ActionButton from "../components/ActionButton";
import { useSound } from "../hooks/useSound";
import confetti from "canvas-confetti";
import { SOUNDS } from "../constants";

interface IdentityBuilderGameProps {
  onComplete: () => void;
  onBack: () => void;
}

type CardState = "pending" | "correct" | "wrong";

interface IdentityStatement {
  id: string;
  text: string;
  isTruth: boolean;
  verse: string;
}

const STATEMENTS: IdentityStatement[] = [
  {
    id: "1",
    text: "Em Cristo eu sou amado(a) por Deus.",
    isTruth: true,
    verse: "Romanos 8:38-39",
  },
  {
    id: "2",
    text: "Eu só tenho valor se for perfeito(a).",
    isTruth: false,
    verse: "Efésios 2:8-9",
  },
  {
    id: "3",
    text: "Em Cristo eu sou perdoado(a) e lavado(a).",
    isTruth: true,
    verse: "1 João 1:9",
  },
  {
    id: "4",
    text: "Meu passado define quem eu sou hoje.",
    isTruth: false,
    verse: "2 Coríntios 5:17",
  },
  {
    id: "5",
    text: "Em Cristo eu sou escolhido(a) e enviado(a).",
    isTruth: true,
    verse: "1 Pedro 2:9",
  },
];

const IdentityBuilderGame: React.FC<IdentityBuilderGameProps> = ({
  onComplete,
  onBack,
}) => {
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [showResult, setShowResult] = useState(false);

  const playClick = useSound(SOUNDS.CLICK.id, 0.4);
  const playSuccess = useSound(SOUNDS.SUCCESS.id, 0.5);
  const playError = useSound(SOUNDS.INCORRECT.id, 0.5);

  // inicializa estados
  useEffect(() => {
    const initialStates: Record<string, CardState> = {};
    const initialAnswers: Record<string, boolean | null> = {};
    STATEMENTS.forEach((s) => {
      initialStates[s.id] = "pending";
      initialAnswers[s.id] = null;
    });
    setCardStates(initialStates);
    setAnswers(initialAnswers);
  }, []);

  // icones lucide
  useEffect(() => {
    const timerId = setTimeout(() => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 0);
    return () => clearTimeout(timerId);
  }, [cardStates, showResult]);

  const handleAnswer = (statement: IdentityStatement, userSaysTruth: boolean) => {
    playClick();

    const isCorrect = userSaysTruth === statement.isTruth;

    setCardStates((prev) => ({
      ...prev,
      [statement.id]: isCorrect ? "correct" : "wrong",
    }));

    setAnswers((prev) => ({
      ...prev,
      [statement.id]: userSaysTruth,
    }));

    if (isCorrect) {
      playSuccess();
    } else {
      playError();
    }
  };

  const allAnswered = STATEMENTS.every((s) => answers[s.id] !== null);
  const allCorrect = STATEMENTS.every(
    (s) => answers[s.id] === s.isTruth
  );

  const handleFinish = () => {
    playClick();
    setShowResult(true);

    if (allCorrect) {
      playSuccess();
      confetti({ particleCount: 160, spread: 100, origin: { y: 0.6 } });
    }
  };

  const handleContinue = () => {
    playClick();
    onComplete();
  };

  return (
    <div className="w-full h-full flex flex-col items-center text-white animate-fade-in">
      {/* topo */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-600 bg-slate-900/70 text-xs text-slate-100 hover:bg-slate-800 hover:border-cyan-400 transition"
        >
          <i data-lucide="arrow-left" className="w-4 h-4" />
          <span>Voltar ao salão de jogos</span>
        </button>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
          <i data-lucide="shield-check" className="w-4 h-4 text-cyan-300" />
          <span>Identity Builder · Verdades x Mentiras</span>
        </div>
      </div>

      {/* título / instruções */}
      <div className="mb-6 text-center max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Firmando a Verdade
        </h1>
        <p className="text-sm md:text-base text-slate-300">
          Para cada frase, escolha se ela é uma{" "}
          <span className="text-emerald-300 font-semibold">VERDADE</span> em
          Cristo ou uma{" "}
          <span className="text-rose-300 font-semibold">MENTIRA</span> que
          precisa ser derrubada.
        </p>
      </div>

      {/* cartas */}
      <div className="w-full max-w-3xl space-y-3 mb-4">
        {STATEMENTS.map((s) => {
          const state = cardStates[s.id] ?? "pending";
          const answered = answers[s.id] !== null;

          const borderClass =
            state === "correct"
              ? "border-emerald-500/80"
              : state === "wrong"
              ? "border-rose-500/80"
              : "border-slate-700/80";

          const bgClass =
            state === "correct"
              ? "bg-emerald-900/30"
              : state === "wrong"
              ? "bg-rose-900/30"
              : "bg-slate-900/70";

          return (
            <div
              key={s.id}
              className={`rounded-2xl border ${borderClass} ${bgClass} p-3 md:p-4 flex flex-col gap-3 transition-all`}
            >
              <div className="flex items-start gap-2">
                <i
                  data-lucide={
                    state === "correct"
                      ? "sparkles"
                      : state === "wrong"
                      ? "shield-off"
                      : "help-circle"
                  }
                  className={`w-5 h-5 mt-0.5 ${
                    state === "correct"
                      ? "text-emerald-300"
                      : state === "wrong"
                      ? "text-rose-300"
                      : "text-sky-300"
                  }`}
                />
                <p className="text-sm md:text-base text-slate-100">
                  {s.text}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleAnswer(s, true)}
                  className={`px-3 py-1.5 rounded-full text-[11px] md:text-xs border transition ${
                    answered && answers[s.id] === true
                      ? "bg-emerald-600 border-emerald-300 text-white"
                      : "bg-slate-800 border-slate-600 hover:bg-emerald-700/70 hover:border-emerald-400/70"
                  }`}
                >
                  É VERDADE em Cristo
                </button>
                <button
                  type="button"
                  onClick={() => handleAnswer(s, false)}
                  className={`px-3 py-1.5 rounded-full text-[11px] md:text-xs border transition ${
                    answered && answers[s.id] === false
                      ? "bg-rose-600 border-rose-300 text-white"
                      : "bg-slate-800 border-slate-600 hover:bg-rose-700/70 hover:border-rose-400/70"
                  }`}
                >
                  É MENTIRA / distorção
                </button>
              </div>

              {answered && (
                <div className="text-[11px] text-slate-300 flex items-center gap-2">
                  <i data-lucide="book-open" className="w-3 h-3 text-sky-300" />
                  <span>
                    Verso de apoio:{" "}
                    <span className="font-semibold text-sky-200">
                      {s.verse}
                    </span>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* rodapé do jogo */}
      <div className="mt-4 w-full max-w-3xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-300">
        <p className="text-center md:text-left">
          Respondidas:{" "}
          <span className="font-semibold">
            {Object.values(answers).filter((a) => a !== null).length}/
            {STATEMENTS.length}
          </span>{" "}
          · Acertos:{" "}
          <span className="font-semibold">
            {
              STATEMENTS.filter(
                (s) => answers[s.id] !== null && answers[s.id] === s.isTruth
              ).length
            }
          </span>
        </p>

        {!showResult && (
          <ActionButton
            onClick={handleFinish}
            disabled={!allAnswered}
            className="text-xs md:text-sm"
          >
            Conferir Resultado
          </ActionButton>
        )}

        {showResult && (
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <p className="text-center md:text-left">
              {allCorrect ? (
                <>
                  <span className="text-emerald-300 font-semibold">
                    Muito bom!
                  </span>{" "}
                  Você alinhou seus pensamentos com a verdade de Deus. 💚
                </>
              ) : (
                <>
                  <span className="text-amber-300 font-semibold">
                    Quase lá!
                  </span>{" "}
                  Reveja as frases marcadas como mentira/verdade e confira os
                  versículos.
                </>
              )}
            </p>
            <ActionButton
              onClick={handleContinue}
              className="text-xs md:text-sm"
            >
              Voltar ao Salão de Jogos
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdentityBuilderGame;
