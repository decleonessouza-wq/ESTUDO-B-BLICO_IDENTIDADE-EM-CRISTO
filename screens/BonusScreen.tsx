import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { Screen, BonusGameId } from "../types";
import ActionButton from "../components/ActionButton";
import AnimatedScreen from "../components/AnimatedScreen";
import { useSound } from "../hooks/useSound";
import confetti from "canvas-confetti";
import IdentityBuilderGame from "./IdentityBuilderGame";
import WordSearchGame from "./WordSearchGame";
import MemoryGame from "./MemoryGame";
import VictoryLeapGame from "./VictoryLeapGame";
import MindBattleGame from "./MindBattleGame";
import { SOUNDS } from "../constants";

type BonusView =
  | "gratitude"
  | "hub"
  | BonusGameId
  | "reward"
  | "identityFiles"; // mini-game extra

type ShareData = {
  title: string;
  icon: string;
};

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
    id: "identityBuilder",
    title: "Firmando a Verdade",
    description: "Arraste verdades e mentiras para seus lugares.",
    icon: "shield-check",
    colors: {
      border: "border-blue-700",
      bg: "bg-blue-900/40",
      icon: "text-cyan-400",
      button: "bg-cyan-600 hover:bg-cyan-500",
    },
  },
  {
    id: "wordSearch",
    title: "Encontrando a Verdade",
    description: "Ache palavras-chave da sua identidade.",
    icon: "search",
    colors: {
      border: "border-teal-700",
      bg: "bg-teal-900/40",
      icon: "text-teal-400",
      button: "bg-teal-600 hover:bg-teal-500",
    },
  },
  {
    id: "memory",
    title: "Memória da Verdade",
    description: "Combine versículos com suas verdades.",
    icon: "brain",
    colors: {
      border: "border-indigo-700",
      bg: "bg-indigo-900/40",
      icon: "text-indigo-400",
      button: "bg-indigo-600 hover:bg-indigo-500",
    },
  },
  {
    id: "victoryLeap",
    title: "Pulo da Vitória",
    description: "Pule nas verdades para chegar à vitória.",
    icon: "award",
    colors: {
      border: "border-amber-600",
      bg: "bg-amber-900/40",
      icon: "text-amber-400",
      button: "bg-amber-500 hover:bg-amber-400",
    },
  },
  {
    id: "mindBattle",
    title: "Batalha da Mente",
    description: "Defenda seu coração das mentiras.",
    icon: "brain-circuit",
    colors: {
      border: "border-rose-700",
      bg: "bg-rose-900/40",
      icon: "text-rose-400",
      button: "bg-rose-600 hover:bg-rose-500",
    },
  },
];

/* ===========================
   SUPORTE P/ DIÁRIO ESPIRITUAL
   =========================== */

const DIARY_STORAGE_KEY = "identidade:spiritualDiary";

type DiaryEntryFromMiniGame = {
  id: string;
  category: string;
  text: string;
  createdAt: string;
};

const appendDiaryEntryFromIdentityFiles = (content: string) => {
  try {
    const raw = localStorage.getItem(DIARY_STORAGE_KEY);
    const list: DiaryEntryFromMiniGame[] = raw ? JSON.parse(raw) : [];

    const entry: DiaryEntryFromMiniGame = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      category: "oqueDeusFalou", // entra no diário como "O que Deus falou comigo"
      text: content,
      createdAt: new Date().toISOString(),
    };

    const updated = [entry, ...list];
    localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error(
      "Erro ao salvar entrada do Identity Files no diário:",
      err
    );
  }
};

/**
 * 🎮 Mini-game: Identity Files
 * Gera um arquivo / texto com declarações de identidade em Cristo,
 * com 6+ declarações + uma declaração personalizada do usuário,
 * pré-visualização e criação automática de entrada no Diário Espiritual.
 */
const IdentityFilesMiniGame: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => {
  const { userName } = useAppContext();
  const [tone, setTone] = useState<"firm" | "soft" | "warrior">("firm");
  const [userDeclaration, setUserDeclaration] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const displayName = userName || "Filho(a) amado(a)";

  const buildLines = (
    currentTone: "firm" | "soft" | "warrior",
    custom: string
  ): string[] => {
    const common: string[] = [
      "Em Cristo, sou uma nova criatura (2 Co 5:17).",
      "Nada pode me separar do amor de Deus (Rm 8:38-39).",
      "Fui comprado(a) por alto preço, tenho valor para Deus (1 Co 6:20).",
      "Sou chamado(a) das trevas para a sua maravilhosa luz (1 Pe 2:9).",
    ];

    let extra: string[] = [];

    if (currentTone === "firm") {
      extra = [
        "Eu escolho crer no que Deus diz sobre mim, acima dos meus sentimentos.",
        "Minha identidade não está nos meus erros, mas na cruz de Cristo.",
        "Hoje decido caminhar como filho(a) amado(a), não mais como escravo(a) do medo.",
        "A opinião de Deus sobre mim é mais forte do que qualquer rótulo deste mundo.",
      ];
    } else if (currentTone === "soft") {
      extra = [
        "Deus me conhece pelo nome e se importa com cada detalhe da minha história.",
        "Mesmo quando não me sinto suficiente, em Cristo sou completamente amado(a).",
        "Posso descansar: Deus está comigo em cada etapa da minha jornada.",
        "Quando meu coração se sente pesado, o amor de Deus me abraça e me sustenta.",
      ];
    } else {
      // warrior
      extra = [
        "Eu visto a armadura de Deus e enfrento as mentiras com a verdade da Palavra.",
        "Nenhuma acusação do inimigo define quem eu sou; só Jesus define minha identidade.",
        "Em Cristo, sou mais que vencedor(a) sobre o pecado, o medo e a condenação.",
        "Eu não recuo: avanço em fé, porque Deus luta as minhas batalhas.",
      ];
    }

    const all = [...common, ...extra];

    let final = all;

    if (custom.trim()) {
      final = [...all, `Minha declaração pessoal: ${custom.trim()}`];
    }

    return final;
  };

  const previewLines = useMemo(
    () => buildLines(tone, userDeclaration),
    [tone, userDeclaration]
  );

  const buildFullContent = (): string => {
    const header =
      "IDENTITY BUILDER – DECLARAÇÕES DE IDENTIDADE EM CRISTO\n\n";
    const intro = `Estas declarações foram geradas para ${displayName} reforçar quem é em Cristo.\nLeia em voz alta, medite e compartilhe se quiser.\n\n`;
    const outro =
      "\n\nDica: leia uma dessas declarações todos os dias por pelo menos 7 dias.\n" +
      "Se quiser, compartilhe algumas com um amigo(a) ou registre no seu Diário Espiritual.\n";

    return header + intro + previewLines.join("\n") + outro;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const content = buildFullContent();

      // 1) cria entrada no Diário Espiritual (local)
      appendDiaryEntryFromIdentityFiles(content);

      // 2) se tiver Web Share API (celular), abre o menu de compartilhar
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Declarações de Identidade em Cristo",
            text: content,
          });
        } catch (err) {
          console.error("Erro ao compartilhar declarações:", err);
        }
      }

      // 3) SEMPRE disponibiliza download .txt como extra
      const blob = new Blob([content], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "identity-builder-declaracoes.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => setIsGenerating(false), 300);
    }
  };

  return (
    <div className="animate-fade-in text-left">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Construindo Minha Identidade
          </h1>
          <p className="text-sm md:text-base text-gray-300 mt-1 max-w-2xl">
            Gere declarações da sua identidade em Cristo para ler depois, usar
            no seu Diário Espiritual, imprimir ou compartilhar com alguém.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs px-3 py-1.5 rounded-full bg-slate-800 border border-slate-600 hover:bg-slate-700 transition"
        >
          Voltar ao Salão de Jogos
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-[1.2fr,1fr] gap-4">
        {/* lado esquerdo – configuração + geração */}
        <div className="bg-slate-900/80 border border-cyan-500/50 rounded-2xl p-4 space-y-3">
          <p className="text-sm text-slate-200">
            Arquivo gerado para:{" "}
            <span className="font-semibold text-cyan-300">{displayName}</span>
          </p>
          <p className="text-xs text-slate-400">
            Escolha o estilo das declarações, escreva a sua própria frase e
            depois gere o arquivo/compartilhamento.
          </p>

          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            <button
              type="button"
              onClick={() => setTone("firm")}
              className={`px-3 py-1.5 rounded-full border transition ${
                tone === "firm"
                  ? "bg-cyan-600 border-cyan-300 text-white"
                  : "bg-slate-800 border-slate-600 text-slate-200"
              }`}
            >
              Firme em Deus
            </button>
            <button
              type="button"
              onClick={() => setTone("soft")}
              className={`px-3 py-1.5 rounded-full border transition ${
                tone === "soft"
                  ? "bg-emerald-600 border-emerald-300 text-white"
                  : "bg-slate-800 border-slate-600 text-slate-200"
              }`}
            >
              Cuidado e Consolo
            </button>
            <button
              type="button"
              onClick={() => setTone("warrior")}
              className={`px-3 py-1.5 rounded-full border transition ${
                tone === "warrior"
                  ? "bg-amber-600 border-amber-300 text-white"
                  : "bg-slate-800 border-slate-600 text-slate-200"
              }`}
            >
              Guerreiro da Fé
            </button>
          </div>

          {/* declaração pessoal */}
          <div className="mt-3">
            <label className="block text-xs text-slate-400 mb-1">
              Sua declaração pessoal
            </label>
            <textarea
              rows={3}
              value={userDeclaration}
              onChange={(e) => setUserDeclaration(e.target.value)}
              placeholder='Ex: "Em Cristo, eu rejeito a mentira da rejeição e recebo a verdade de que sou filho(a) amado(a) de Deus."'
              className="w-full rounded-lg bg-slate-800/70 border border-slate-600 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div className="mt-4">
            <ActionButton onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating
                ? "Gerando e salvando..."
                : "Gerar e salvar declarações"}
            </ActionButton>
          </div>

          <p className="mt-3 text-[11px] text-slate-400">
            As declarações também são salvas automaticamente como uma entrada
            no seu <span className="font-semibold">Diário Espiritual</span>.
          </p>
        </div>

        {/* lado direito – pré-visualização */}
        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-4 text-xs text-slate-200 flex flex-col">
          <p className="font-semibold text-sky-200 mb-2">
            Prévia das declarações ({previewLines.length} frases)
          </p>
          <div className="flex-1 rounded-lg bg-slate-950/70 border border-slate-700 p-3 overflow-y-auto">
            {previewLines.length === 0 ? (
              <p className="text-slate-500">
                Comece escolhendo um estilo e (se quiser) escrevendo a sua
                declaração pessoal.
              </p>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {previewLines.map((line, idx) => (
                  <li key={idx} className="whitespace-pre-wrap">
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="mt-3 text-[11px] text-slate-400">
            No celular, o app abre o menu de compartilhar com o texto
            completo. No computador, um arquivo{" "}
            <span className="font-mono">.txt</span> também é baixado.
          </p>
        </div>
      </div>
    </div>
  );
};

const BonusScreen: React.FC = () => {
  const {
    userName,
    navigateTo,
    setPhysicalRewardChoice,
    physicalRewardChoice,
    completedBonusGames,
    markBonusGameAsComplete,
    // 👇 usados para avançar de etapa ao voltar para a jornada
    currentStageId,
    stageProgress,
    completedAt,
    stagesData,
    setCurrentStageId,
  } = useAppContext();

  const completedBonusGamesSet = useMemo(
    () => new Set<BonusGameId>(completedBonusGames),
    [completedBonusGames]
  );

  const [currentView, setCurrentView] = useState<BonusView>("gratitude");
  const shareableCardRef = useRef<HTMLDivElement>(null);
  const [shareData, setShareData] = useState<ShareData>({
    title: "",
    icon: "",
  });

  const playSelectSound = useSound(SOUNDS.CLICK.id, 0.4);
  const playConfettiSound = useSound(SOUNDS.SUCCESS.id, 0.3);

  useEffect(() => {
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [currentView, completedBonusGames]);

  // ✅ Detecta se a jornada já foi concluída
  const isJourneyCompleted = useMemo(() => {
    // Se já temos completedAt salvo, a jornada foi finalizada
    if (completedAt) return true;

    if (!stagesData || stagesData.length === 0) return false;

    const totalStages = stagesData.length;
    const completedCount = stagesData.filter(
      (stage) => stageProgress[stage.id]?.completed
    ).length;

    return totalStages > 0 && completedCount >= totalStages;
  }, [completedAt, stagesData, stageProgress]);

  const handleGameComplete = (gameId: BonusGameId) => {
    markBonusGameAsComplete(gameId);
    setCurrentView("hub");
  };

  // 🔁 Voltar para a jornada
  const goBackToJourneyNextStage = () => {
    // 👉 se a jornada JÁ FOI CONCLUÍDA, não volta mais pra etapa 6
    if (isJourneyCompleted) {
      navigateTo(Screen.Final);
      return;
    }

    // 👉 se ainda não concluiu tudo, mantém a lógica antiga
    if (!stagesData || stagesData.length === 0) {
      navigateTo(Screen.Study);
      return;
    }

    const sortedStages = [...stagesData].sort((a, b) => a.id - b.id);
    const currentIndex = sortedStages.findIndex(
      (s) => s.id === currentStageId
    );

    // 1. tenta achar próxima etapa não concluída depois da atual
    let nextStage = sortedStages.find(
      (stage, idx) =>
        idx > currentIndex && !stageProgress[stage.id]?.completed
    );

    // 2. se não tiver depois, tenta qualquer etapa não concluída
    if (!nextStage) {
      nextStage = sortedStages.find(
        (stage) => !stageProgress[stage.id]?.completed
      );
    }

    // 3. se ainda assim não tiver, significa que todas estão concluídas
    if (nextStage) {
      setCurrentStageId(nextStage.id);
    }

    navigateTo(Screen.Study);
  };

  // 👉 Ir direto para o Mural da Comunidade
  const goToCommunityWall = () => {
    playSelectSound();
    navigateTo(Screen.CommunityWall);
  };

  const handleShare = async (title: string, icon: string) => {
    setShareData({ title, icon });

    setTimeout(async () => {
      if (!shareableCardRef.current || !(window as any).html2canvas) return;
      const element = shareableCardRef.current;

      try {
        const canvas = await (window as any).html2canvas(element, {
          backgroundColor: "#111827",
          scale: 2,
        });

        canvas.toBlob(
          async (blob: Blob | null) => {
            if (blob && navigator.share) {
              const file = new File([blob], "conquista-jogo.png", {
                type: "image/png",
              });
              try {
                await navigator.share({
                  title: "Conquista de Jogo - Identidade em Cristo",
                  text: `Eu completei o jogo "${title}" na jornada Identidade em Cristo!`,
                  files: [file],
                });
              } catch (err) {
                console.error("Erro ao compartilhar:", err);
              }
            } else {
              const link = document.createElement("a");
              link.download = "conquista-jogo.png";
              link.href = canvas.toDataURL("image/png");
              link.click();
            }
          },
          "image/png"
        );
      } catch (error) {
        console.error("Error generating shareable image:", error);
      }
    }, 100);
  };

  const GratitudeView = () => (
    <div className="animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        Uma Mensagem Especial para Você
      </h1>
      <p className="text-lg text-gray-300 mb-6">
        Que alegria ver você chegar até aqui! Agradeço por dedicar seu tempo a
        esta jornada. Lembre-se, esta não é apenas informação; é uma
        transformação que ecoa na eternidade.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <ActionButton
          onClick={() => {
            playSelectSound();
            setCurrentView("hub");
          }}
        >
          Ir para o Salão de Jogos
        </ActionButton>
        <ActionButton
          onClick={goToCommunityWall}
          className="bg-gradient-to-r from-cyan-500 to-emerald-500 focus:ring-cyan-400"
        >
          Ir para o Mural da Comunidade
        </ActionButton>
      </div>
    </div>
  );

  const GameHub = () => {
    const allGamesCompleted =
      completedBonusGamesSet.size === GAMES_CONFIG.length;
    return (
      <div className="animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Salão de Jogos da Identidade
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Escolha um jogo para reforçar o que aprendeu!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAMES_CONFIG.map((game) => {
            const isCompleted = completedBonusGamesSet.has(game.id);
            const cardBorder = isCompleted
              ? "border-green-500"
              : game.colors.border;
            const iconColor = isCompleted ? "text-green-400" : game.colors.icon;

            return (
              <div
                key={game.id}
                className={`group p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${cardBorder} ${game.colors.bg}`}
              >
                <div className="flex items-center gap-3">
                  <i
                    data-lucide={game.icon}
                    className={`w-8 h-8 ${iconColor}`}
                  ></i>
                  <h2 className="text-xl font-bold">{game.title}</h2>
                  {isCompleted && (
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => handleShare(game.title, game.icon)}
                        aria-label={`Compartilhar conquista do jogo ${game.title}`}
                        className="p-1 rounded-full hover:bg-white/20"
                      >
                        <i
                          data-lucide="share-2"
                          className="w-5 h-5 text-cyan-300"
                        ></i>
                      </button>
                      <i
                        data-lucide="check-circle"
                        className="w-6 h-6 text-green-400"
                      ></i>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-300 my-3 h-10">
                  {game.description}
                </p>
                <button
                  onClick={() => {
                    playSelectSound();
                    setCurrentView(game.id);
                  }}
                  className={`w-full text-white font-bold py-2 rounded-lg transition-colors ${game.colors.button}`}
                >
                  {isCompleted ? "Jogar Novamente" : "Jogar"}
                </button>
              </div>
            );
          })}

          {/* 🎁 Card extra: “Gerar arquivos do Identity Builder” */}
          <div
            className="
              group p-4 rounded-xl border-2 border-violet-600
              bg-violet-900/40
              transition-all duration-300 transform hover:scale-105
            "
          >
            <div className="flex items-center gap-3">
              <i
                data-lucide="file-text"
                className="w-8 h-8 text-violet-300"
              ></i>
              <h2 className="text-xl font-bold">
                Contruindo Minha Identidade!
              </h2>
            </div>
            <p className="text-sm text-gray-300 my-3 h-10">
              Gere declarações da sua identidade em Cristo para ler,
              compartilhar e registrar no Diário Espiritual.
            </p>
            <button
              onClick={() => {
                playSelectSound();
                setCurrentView("identityFiles");
              }}
              className="w-full text-white font-bold py-2 rounded-lg transition-colors bg-violet-600 hover:bg-violet-500"
            >
              Gerar Declarações
            </button>
          </div>
        </div>
        {allGamesCompleted && (
          <div className="mt-8">
            <p className="text-xl font-bold text-yellow-300 mb-4">
              Todos os jogos concluídos! Você está pronto(a)!
            </p>
            <ActionButton
              onClick={() => {
                playSelectSound();
                setCurrentView("reward");
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
    const [choiceMade, setChoiceMade] = useState<"yes" | "no" | null>(
      physicalRewardChoice
    );
    const [showButtons, setShowButtons] = useState(!physicalRewardChoice);
    const [showConfirmation, setShowConfirmation] = useState(
      !!physicalRewardChoice
    );

    useEffect(() => {
      if (!physicalRewardChoice) {
        playConfettiSound();
        confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
      }
    }, [physicalRewardChoice]);

    const handleChoice = (choice: "yes" | "no") => {
      playSelectSound();
      setPhysicalRewardChoice(choice);
      setChoiceMade(choice);
      setShowButtons(false);
      setTimeout(() => setShowConfirmation(true), 500);
    };

    return (
      <div className="animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Recompensa Bônus Final!
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Deseja receber uma recompensa física especial (ex: adesivo) pelo
          correio?
        </p>
        {showButtons && (
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-10">
            <ActionButton
              onClick={() => handleChoice("yes")}
              tooltip="Concordo em compartilhar dados de contato para o envio."
            >
              Sim, eu quero!
            </ActionButton>
            <ActionButton onClick={() => handleChoice("no")}>
              Não, obrigado(a).
            </ActionButton>
          </div>
        )}
        {showConfirmation && (
          <div className="animate-fade-in-up mt-8">
            <p className="text-lg text-gray-200">
              {choiceMade === "yes"
                ? "Ótima escolha! Entraremos em contato para o envio."
                : "Entendido! Suas recompensas espirituais são eternas!"}
            </p>
            <ActionButton
              onClick={() => navigateTo(Screen.Final)}
              className="mt-8"
            >
              Continuar para o Final
            </ActionButton>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case "gratitude":
        return <GratitudeView />;
      case "hub":
        return <GameHub />;
      case "identityBuilder":
        return (
          <IdentityBuilderGame
            onComplete={() => handleGameComplete("identityBuilder")}
            onBack={() => setCurrentView("hub")}
          />
        );
      case "wordSearch":
        return (
          <WordSearchGame
            onComplete={() => handleGameComplete("wordSearch")}
            onBack={() => setCurrentView("hub")}
          />
        );
      case "memory":
        return (
          <MemoryGame
            onComplete={() => handleGameComplete("memory")}
            onBack={() => setCurrentView("hub")}
          />
        );
      case "victoryLeap":
        return (
          <VictoryLeapGame
            onComplete={() => handleGameComplete("victoryLeap")}
            onBack={() => setCurrentView("hub")}
          />
        );
      case "mindBattle":
        return (
          <MindBattleGame
            onComplete={() => handleGameComplete("mindBattle")}
            onBack={() => setCurrentView("hub")}
          />
        );
      case "identityFiles":
        return <IdentityFilesMiniGame onBack={() => setCurrentView("hub")} />;
      case "reward":
        return <RewardView />;
      default:
        return <GratitudeView />;
    }
  };

  return (
    <AnimatedScreen>
      <div className="w-full max-w-4xl mx-auto">
        {/* 🔙 voltar para a jornada  |  💬 ir para o mural */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goBackToJourneyNextStage}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-600 bg-slate-900/70 text-xs text-slate-100 hover:bg-slate-800 hover:border-sky-400 transition"
            >
              <i data-lucide="arrow-left" className="w-4 h-4" />
              <span>Voltar para a jornada</span>
            </button>

            <button
              type="button"
              onClick={goToCommunityWall}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-cyan-500 bg-slate-900/70 text-xs text-cyan-100 hover:bg-slate-800 hover:border-cyan-300 transition"
            >
              <i data-lucide="messages-square" className="w-4 h-4" />
              <span>Ir para o mural</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 hidden sm:block">
            Salão de jogos · reforçando a sua identidade em Cristo
          </p>
        </div>

        <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl w-full text-white text-center border border-blue-700 min-h-[500px]">
          {renderContent()}
        </div>
      </div>

      <div
        ref={shareableCardRef}
        className="fixed top-0 left-0 -z-10 p-8 bg-gray-900 text-white w-[400px]"
        style={{ visibility: "hidden" }}
      >
        <div className="border-4 border-cyan-400 p-6 rounded-lg text-center bg-gradient-to-br from-gray-900 to-blue-900">
          <i
            data-lucide={
              shareData.icon ? shareData.icon.toLowerCase() : ""
            }
            className="w-16 h-16 mx-auto mb-4 text-yellow-400"
          ></i>
          <h2 className="text-2xl font-bold mb-2">Jogo Concluído!</h2>
          <p className="text-lg mb-4 text-gray-300">
            {userName} venceu o desafio:
          </p>
          <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 mb-6">
            {shareData.title}
          </h3>
          <p className="text-sm font-semibold">
            JORNADA IDENTIDADE EM CRISTO
          </p>
        </div>
      </div>
    </AnimatedScreen>
  );
};

export default BonusScreen;
