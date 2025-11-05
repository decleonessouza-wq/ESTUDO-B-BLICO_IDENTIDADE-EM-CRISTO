import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen, BonusGameId } from '../types';
import ActionButton from '../components/ActionButton';
import AnimatedScreen from '../components/AnimatedScreen';
import { useSound } from '../hooks/useSound';
import confetti from 'canvas-confetti';
import IdentityBuilderGame from './IdentityBuilderGame';
import WordSearchGame from './WordSearchGame';
import MemoryGame from './MemoryGame';
import VictoryLeapGame from './VictoryLeapGame';
import MindBattleGame from './MindBattleGame';
import CompleteWordSearchGame from './CompleteWordSearchGame';
import { SOUNDS } from '../constants';

type BonusView = 'gratitude' | 'hub' | BonusGameId | 'reward';

type ShareData = {
  title: string;
  icon: string;
};

interface BonusScreenProps {
  initialView?: BonusView;
}

const GAMES_CONFIG: Array<{
  id: BonusGameId;
  title: string;
  description: string;
  icon: string;
  colors: {
    border: string;
    bg: string;
    icon: string;
    button: string;
  };
}> = [
  {
    id: 'identityBuilder',
    title: 'Firmando a Verdade',
    description: 'Arraste verdades e mentiras para seus lugares.',
    icon: 'shield-check',
    colors: {
      border: 'border-blue-700',
      bg: 'bg-blue-900/40',
      icon: 'text-cyan-400',
      button: 'bg-cyan-600 hover:bg-cyan-500',
    },
  },
  {
    id: 'wordSearch',
    title: 'Encontrando a Verdade',
    description: 'Ache palavras-chave da sua identidade.',
    icon: 'search',
    colors: {
      border: 'border-teal-700',
      bg: 'bg-teal-900/40',
      icon: 'text-teal-400',
      button: 'bg-teal-600 hover:bg-teal-500',
    },
  },
  {
    id: 'completeWordSearch',
    title: 'Mapa da Identidade',
    description: 'Desvende todas as palavras-chave do estudo completo.',
    icon: 'map',
    colors: {
      border: 'border-emerald-700',
      bg: 'bg-emerald-900/40',
      icon: 'text-emerald-400',
      button: 'bg-emerald-600 hover:bg-emerald-500',
    },
  },
  {
    id: 'memory',
    title: 'Memória da Verdade',
    description: 'Combine versículos com suas verdades.',
    icon: 'brain',
    colors: {
      border: 'border-indigo-700',
      bg: 'bg-indigo-900/40',
      icon: 'text-indigo-400',
      button: 'bg-indigo-600 hover:bg-indigo-500',
    },
  },
  {
    id: 'victoryLeap',
    title: 'Pulo da Vitória',
    description: 'Pule nas verdades para chegar à vitória.',
    icon: 'award',
    colors: {
      border: 'border-amber-600',
      bg: 'bg-amber-900/40',
      icon: 'text-amber-400',
      button: 'bg-amber-500 hover:bg-amber-400',
    },
  },
  {
    id: 'mindBattle',
    title: 'Batalha da Mente',
    description: 'Defenda seu coração das mentiras.',
    icon: 'brain-circuit',
    colors: {
      border: 'border-rose-700',
      bg: 'bg-rose-900/40',
      icon: 'text-rose-400',
      button: 'bg-rose-600 hover:bg-rose-500',
    },
  },
];

const BonusScreen: React.FC<BonusScreenProps> = ({ initialView = 'gratitude' }) => {
  const {
    userName,
    navigateTo,
    setPhysicalRewardChoice,
    physicalRewardChoice,
    completedBonusGames,
    markBonusGameAsComplete,
  } = useAppContext();

  const completedBonusGamesSet = useMemo(
    () => new Set<BonusGameId>(completedBonusGames),
    [completedBonusGames],
  );

  const [currentView, setCurrentView] = useState<BonusView>(initialView);
  const shareableCardRef = useRef<HTMLDivElement>(null);
  const [shareData, setShareData] = useState<ShareData>({ title: '', icon: '' });

  const playSelectSound = useSound(SOUNDS.CLICK.id, 0.4);
  const playConfettiSound = useSound(SOUNDS.SUCCESS.id, 0.3);

  useEffect(() => {
    setCurrentView(initialView);
  }, [initialView]);

  useEffect(() => {
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [currentView, completedBonusGames]);

  const handleGameComplete = (gameId: BonusGameId) => {
    markBonusGameAsComplete(gameId);
    setCurrentView('hub');
  };

  const handleShare = async (title: string, icon: string) => {
    setShareData({ title, icon });

    setTimeout(async () => {
      if (!shareableCardRef.current || !(window as any).html2canvas) return;
      const element = shareableCardRef.current;

      try {
        const canvas = await (window as any).html2canvas(element, {
          backgroundColor: '#111827',
          scale: 2,
        });

        canvas.toBlob(async (blob: Blob | null) => {
          if (blob && navigator.share) {
            const file = new File([blob], 'conquista-jogo.png', { type: 'image/png' });
            try {
              await navigator.share({
                title: 'Conquista de Jogo - Identidade em Cristo',
                text: `Eu completei o jogo "${title}" na jornada Identidade em Cristo!`,
                files: [file],
              });
            } catch (err) {
              console.error('Erro ao compartilhar:', err);
            }
          } else {
            const link = document.createElement('a');
            link.download = 'conquista-jogo.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
          }
        }, 'image/png');
      } catch (error) {
        console.error('Error generating shareable image:', error);
      }
    }, 100);
  };

  const GratitudeView = () => (
    <div className="animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Uma Mensagem Especial para Você</h1>
      <p className="text-lg text-gray-300 mb-6">
        Que alegria ver você chegar até aqui! Agradeço por dedicar seu tempo a esta jornada. Lembre-se, esta não é apenas informação; é uma transformação que ecoa na eternidade.
      </p>
      <ActionButton
        onClick={() => {
          playSelectSound();
          setCurrentView('hub');
        }}
      >
        Ir para o Salão de Jogos
      </ActionButton>
    </div>
  );

  const GameHub = () => {
    const allGamesCompleted = completedBonusGamesSet.size === GAMES_CONFIG.length;
    return (
      <div className="animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Salão de Jogos da Identidade</h1>
        <p className="text-lg text-gray-300 mb-8">Escolha um jogo para reforçar o que aprendeu!</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAMES_CONFIG.map((game) => {
            const isCompleted = completedBonusGamesSet.has(game.id);
            const cardBorder = isCompleted ? 'border-green-500' : game.colors.border;
            const iconColor = isCompleted ? 'text-green-400' : game.colors.icon;

            return (
              <div
                key={game.id}
                className={`group p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${cardBorder} ${game.colors.bg}`}
              >
                <div className="flex items-center gap-3">
                  <i data-lucide={game.icon} className={`w-8 h-8 ${iconColor}`}></i>
                  <h2 className="text-xl font-bold">{game.title}</h2>
                  {isCompleted && (
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => handleShare(game.title, game.icon)}
                        aria-label={`Compartilhar conquista do jogo ${game.title}`}
                        className="p-1 rounded-full hover:bg-white/20"
                      >
                        <i data-lucide="share-2" className="w-5 h-5 text-cyan-300"></i>
                      </button>
                      <i data-lucide="check-circle" className="w-6 h-6 text-green-400"></i>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-300 my-3 h-10">{game.description}</p>
                <button
                  onClick={() => {
                    playSelectSound();
                    setCurrentView(game.id);
                  }}
                  className={`w-full text-white font-bold py-2 rounded-lg transition-colors ${game.colors.button}`}
                >
                  {isCompleted ? 'Jogar Novamente' : 'Jogar'}
                </button>
              </div>
            );
          })}
        </div>
        {allGamesCompleted && (
          <div className="mt-8">
            <p className="text-xl font-bold text-yellow-300 mb-4">Todos os jogos concluídos! Você está pronto(a)!</p>
            <ActionButton
              onClick={() => {
                playSelectSound();
                setCurrentView('reward');
              }}
            >
              Receber Recompensa Final
            </ActionButton>
          </div>
        )}
      </div>
    );
  };

  const RewardView: React.FC = () => {
    const [choiceMade, setChoiceMade] = useState<'yes' | 'no' | null>(physicalRewardChoice);
    const [showButtons, setShowButtons] = useState(!physicalRewardChoice);
    const [showConfirmation, setShowConfirmation] = useState(!!physicalRewardChoice);

    useEffect(() => {
      if (!physicalRewardChoice) {
        playConfettiSound();
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
      }
    }, [physicalRewardChoice]);

    const handleChoice = (choice: 'yes' | 'no') => {
      playSelectSound();
      setPhysicalRewardChoice(choice);
      setChoiceMade(choice);
      setShowButtons(false);
      setTimeout(() => setShowConfirmation(true), 500);
    };

    return (
      <div className="animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Recompensa Bônus Final!</h1>
        <div className="space-y-4 text-left md:text-center text-gray-200 mb-10">
          <p>
            Queridos jovens e adolescentes, obrigado por caminharem comigo nesta jornada. Vocês são respostas vivas do amor de
            Cristo, e é uma honra servir a cada um de vocês.
          </p>
          <p className="italic text-cyan-200 font-semibold">
            "Quem vive a verdade não apenas conhece sua identidade, mas transforma o mundo ao seu redor."
          </p>
          <p className="text-sm md:text-base text-gray-300">
            "Portanto, se alguém está em Cristo, é nova criação. As coisas antigas já passaram; eis que surgiram coisas novas!"
            — 2 Coríntios 5:17
          </p>
        </div>
        <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl border border-cyan-700 bg-black/40 mb-10" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src="https://www.youtube.com/embed/VM3x-6CWKPM"
            title="Mensagem Final ao Grupo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
        <p className="text-xl text-gray-300 mb-8">
          Deseja receber uma recompensa física especial (ex: adesivo) pelo correio?
        </p>
        {showButtons && (
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10">
            <ActionButton onClick={() => handleChoice('yes')} tooltip="Concordo em compartilhar dados de contato para o envio.">
              Sim, eu quero!
            </ActionButton>
            <ActionButton onClick={() => handleChoice('no')}>Não, obrigado(a).</ActionButton>
          </div>
        )}
        {showConfirmation && (
          <div className="animate-fade-in-up mt-8">
            <p className="text-lg text-gray-200">
              {choiceMade === 'yes'
                ? 'Ótima escolha! Entraremos em contato para o envio.'
                : 'Entendido! Suas recompensas espirituais são eternas!'}
            </p>
            <ActionButton onClick={() => navigateTo(Screen.Final)} className="mt-8">
              Continuar para o Final
            </ActionButton>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'gratitude':
        return <GratitudeView />;
      case 'hub':
        return <GameHub />;
      case 'identityBuilder':
        return <IdentityBuilderGame onComplete={() => handleGameComplete('identityBuilder')} onBack={() => setCurrentView('hub')} />;
      case 'wordSearch':
        return <WordSearchGame onComplete={() => handleGameComplete('wordSearch')} onBack={() => setCurrentView('hub')} />;
      case 'completeWordSearch':
        return (
          <CompleteWordSearchGame
            onComplete={() => handleGameComplete('completeWordSearch')}
            onBack={() => setCurrentView('hub')}
          />
        );
      case 'memory':
        return <MemoryGame onComplete={() => handleGameComplete('memory')} onBack={() => setCurrentView('hub')} />;
      case 'victoryLeap':
        return <VictoryLeapGame onComplete={() => handleGameComplete('victoryLeap')} onBack={() => setCurrentView('hub')} />;
      case 'mindBattle':
        return <MindBattleGame onComplete={() => handleGameComplete('mindBattle')} onBack={() => setCurrentView('hub')} />;
      case 'reward':
        return <RewardView />;
      default:
        return <GratitudeView />;
    }
  };

  return (
    <AnimatedScreen>
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl max-w-4xl w-full text-white text-center border border-blue-700 min-h-[500px]">
        {renderContent()}
      </div>
      <div
        ref={shareableCardRef}
        className="fixed top-0 left-0 -z-10 p-8 bg-gray-900 text-white w-[400px]"
        style={{ visibility: 'hidden' }}
      >
        <div className="border-4 border-cyan-400 p-6 rounded-lg text-center bg-gradient-to-br from-gray-900 to-blue-900">
          <i data-lucide={shareData.icon ? shareData.icon.toLowerCase() : ''} className="w-16 h-16 mx-auto mb-4 text-yellow-400"></i>
          <h2 className="text-2xl font-bold mb-2">Jogo Concluído!</h2>
          <p className="text-lg mb-4 text-gray-300">{userName} venceu o desafio:</p>
          <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 mb-6">
            {shareData.title}
          </h3>
          <p className="text-sm font-semibold">JORNADA IDENTIDADE EM CRISTO</p>
        </div>
      </div>
    </AnimatedScreen>
  );
};

export default BonusScreen;
