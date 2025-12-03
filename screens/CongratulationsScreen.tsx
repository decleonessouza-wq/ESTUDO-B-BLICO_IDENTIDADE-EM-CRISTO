import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen } from '../types';
import ActionButton from '../components/ActionButton';
import AnimatedScreen from '../components/AnimatedScreen';
import { useSound } from '../hooks/useSound';
import { SOUNDS } from '../constants';

const CongratulationsScreen: React.FC = () => {
  const {
    userName,
    totalScore,
    navigateTo,
    xp,
    level,
    levelTitle,
    medals,
  } = useAppContext();

  const playSuccessSound = useSound(SOUNDS.SUCCESS.id, 0.3);

  useEffect(() => {
    playSuccessSound();

    // Garante que o Lucide inicialize os ícones após o render
    const timerId = setTimeout(() => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 0);

    return () => clearTimeout(timerId);
  }, [playSuccessSound]);

  const hasMedals = medals && medals.length > 0;

  return (
    <AnimatedScreen>
      <div className="bg-gray-900/80 bg-opacity-80 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl max-w-3xl w-full text-white text-center border border-blue-700/80">
        {/* Ícone / destaque */}
        <div className="flex justify-center mb-4">
          <i
            data-lucide="party-popper"
            className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_18px_rgba(250,204,21,0.8)]"
          ></i>
        </div>

        {/* Título principal */}
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
          Parabéns, {userName}!
        </h1>
        <p className="text-base md:text-lg text-gray-300 mb-6">
          Você completou a jornada <span className="font-semibold text-cyan-300">Identidade em Cristo</span>.
        </p>

        {/* Bloco de nível / XP */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
          <div className="bg-gray-950/80 rounded-xl border border-indigo-500 px-4 py-3 inline-flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label="escudo">
              🛡️
            </span>
            <div className="text-left">
              <p className="text-[11px] uppercase tracking-widest text-indigo-300">
                Nível {level}
              </p>
              <p className="font-semibold text-indigo-100 text-sm">
                {levelTitle}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                XP total: <span className="font-semibold text-cyan-300">{xp}</span>
              </p>
            </div>
          </div>

          {/* Pontuação final */}
          <div className="bg-gray-950/80 rounded-xl border border-sky-500 px-5 py-4 text-center">
            <p className="text-xs uppercase tracking-widest text-sky-300 mb-1">
              Sua pontuação final
            </p>
            <p className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 drop-shadow-[0_0_18px_rgba(56,189,248,0.5)]">
              {totalScore}
            </p>
          </div>
        </div>

        {/* Mensagem de identidade em Cristo */}
        <div className="bg-gradient-to-r from-emerald-600/20 via-indigo-600/10 to-cyan-600/20 border border-emerald-500/40 rounded-xl px-5 py-4 mb-6">
          <p className="text-sm md:text-base text-gray-200 leading-relaxed">
            Mais do que um número, essa jornada te lembrou que{' '}
            <span className="font-semibold text-emerald-300">
              seu valor está em quem Cristo diz que você é
            </span>, e não no que o mundo diz sobre você.
          </p>
        </div>

        {/* Medalhas desbloqueadas */}
        {hasMedals && (
          <div className="bg-gray-950/80 border border-amber-500/70 rounded-2xl px-5 py-4 mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-xl" role="img" aria-label="medalha">
                🏅
              </span>
              <p className="text-sm md:text-base font-semibold text-amber-200">
                Medalhas desbloqueadas nesta jornada
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {medals.map((medal) => (
                <div
                  key={medal.id}
                  className="px-3 py-2 rounded-full bg-gray-900 border border-gray-700 flex items-center gap-2 text-xs md:text-sm max-w-xs"
                >
                  <span className="text-lg md:text-xl">{medal.icon}</span>
                  <div className="text-left">
                    <p className="font-semibold text-gray-100">{medal.name}</p>
                    <p className="text-[11px] text-gray-400">
                      {medal.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!hasMedals && (
          <p className="text-xs md:text-sm text-gray-400 mb-8">
            Continue firme na jornada e explore os jogos bônus para desbloquear
            <span className="text-amber-300 font-semibold"> medalhas especiais</span>.
          </p>
        )}

        {/* CTA principal */}
        <ActionButton onClick={() => navigateTo(Screen.Rewards)}>
          Receber Minhas Recompensas
        </ActionButton>
      </div>
    </AnimatedScreen>
  );
};

export default CongratulationsScreen;
