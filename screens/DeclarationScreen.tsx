import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Screen } from "../types";
import { DECLARATIONS, SOUNDS } from "../constants";
import ActionButton from "../components/ActionButton";
import AnimatedScreen from "../components/AnimatedScreen";
import { useSound } from "../hooks/useSound";

const DeclarationScreen: React.FC = () => {
  const { navigateTo } = useAppContext();
  const [declared, setDeclared] = useState<Set<number>>(new Set());
  const playDeclareSound = useSound(SOUNDS.DECLARE.id, 0.5);

  // atualiza ícones do Lucide
  useEffect(() => {
    const timerId = setTimeout(() => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 0);
    return () => clearTimeout(timerId);
  }, [declared]);

  const handleDeclare = (index: number) => {
    playDeclareSound();
    // cria um novo Set para evitar mutação direta do estado anterior
    setDeclared((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const total = DECLARATIONS.length;
  const quantidadeDeclarada = declared.size;
  const allDeclared = quantidadeDeclarada === total;
  const progressPercent = total > 0 ? (quantidadeDeclarada / total) * 100 : 0;

  return (
    <AnimatedScreen>
      <div className="w-full max-w-5xl mx-auto text-center text-white px-4 py-8">
        {/* Badge / título pequeno */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-200 text-[11px] uppercase tracking-[0.25em]">
            <i data-lucide="sparkles" className="w-3 h-3" />
            Identidade em Cristo
          </span>
        </div>

        {/* Título principal */}
        <h1 className="text-3xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(56,189,248,0.35)]">
          Declare as Verdades!
        </h1>

        <p className="text-sm md:text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
          Clique em cada declaração, leia em voz alta e celebre quem você é em
          Cristo. Complete todas para liberar sua pontuação final. ✨
        </p>

        {/* Barra de progresso + contagem */}
        <div className="mb-8 max-w-xl mx-auto">
          <div className="flex items-center justify-between text-xs md:text-sm text-gray-300 mb-2">
            <span>
              Declaradas:{" "}
              <span className="font-semibold text-emerald-300">
                {quantidadeDeclarada}/{total}
              </span>
            </span>
            <span>{Math.round(progressPercent)}% concluído</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden shadow-inner">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-300 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Declarações em grade responsiva */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-10">
          {DECLARATIONS.map((declaration, index) => {
            const isDeclared = declared.has(index);

            return (
              <button
                key={index}
                type="button"
                onClick={() => handleDeclare(index)}
                className={`group relative w-full px-4 sm:px-5 py-3 rounded-2xl text-sm sm:text-base font-semibold flex items-center justify-center gap-2 border transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/80 focus:ring-offset-2 focus:ring-offset-slate-950
                  ${
                    isDeclared
                      ? "bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-900 border-emerald-300 shadow-[0_0_25px_rgba(74,222,128,0.35)] scale-[1.03]"
                      : "bg-slate-800/80 border-slate-600/70 text-slate-100 hover:border-emerald-400/70 hover:bg-slate-700 hover:scale-[1.02]"
                  }`}
              >
                {/* Número da declaração */}
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold
                    ${
                      isDeclared
                        ? "bg-slate-900/70 text-emerald-300 border border-emerald-300/70"
                        : "bg-slate-900/70 text-slate-300 border border-slate-600"
                    }`}
                >
                  {index + 1}
                </span>

                {/* Ícone / check */}
                {isDeclared ? (
                  <i
                    data-lucide="check-circle-2"
                    className="w-5 h-5 text-emerald-700"
                  />
                ) : (
                  <i
                    data-lucide="volume-2"
                    className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform"
                  />
                )}

                <span className="text-left">{declaration}</span>
              </button>
            );
          })}
        </div>

        {/* Botão final */}
        <div className="flex flex-col items-center gap-2">
          <ActionButton
            onClick={() => navigateTo(Screen.Congratulations)}
            disabled={!allDeclared}
          >
            Ver minha pontuação
          </ActionButton>
          {!allDeclared && (
            <p className="text-[11px] md:text-xs text-gray-400">
              Clique em todas as declarações para liberar a pontuação final. 🙌
            </p>
          )}
        </div>
      </div>
    </AnimatedScreen>
  );
};

export default DeclarationScreen;
