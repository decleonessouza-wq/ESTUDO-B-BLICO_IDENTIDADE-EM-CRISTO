// App.tsx
import React, { useState } from "react";
import { AppProvider, useAppContext } from "./context/AppContext";
import { Screen } from "./types";

import SplashScreen from "./screens/SplashScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import InstructionsScreen from "./screens/InstructionsScreen";
import StudyScreen from "./screens/StudyScreen";
import DeclarationScreen from "./screens/DeclarationScreen";
import CongratulationsScreen from "./screens/CongratulationsScreen";
import RewardsScreen from "./screens/RewardsScreen";
import BonusScreen from "./screens/BonusScreen";
import FinalScreen from "./screens/FinalScreen";
import CommunityWallScreen from "./screens/CommunityWallScreen";
import ShareReportScreen from "./screens/ShareReportScreen";
import AdminDashboardScreen from "./screens/AdminDashboardScreen";

// 🔧 chave de flag no localStorage para modo dev
const DEV_TOOLS_FLAG_KEY = "identidadeDevTools";

interface DevTestsPanelProps {
  onClose: () => void;
  onRunTest: (testId: string) => void;
  currentScreen: Screen;
  userName: string;
  totalScore: number;
  completedBonusGamesCount: number;
  completedAt: string | null;
}

const DeveloperModeBadge: React.FC<{
  enabled: boolean;
  toggle: () => void;
}> = ({ enabled, toggle }) => {
  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed bottom-3 right-3 z-40 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide border border-cyan-400/60 bg-black/60 text-cyan-200 shadow-lg shadow-cyan-500/20 hover:bg-cyan-500/10 transition"
    >
      Dev tools: {enabled ? "ON" : "OFF"}
    </button>
  );
};

const DevTestsPanel: React.FC<DevTestsPanelProps> = ({
  onClose,
  onRunTest,
  currentScreen,
  userName,
  totalScore,
  completedBonusGamesCount,
  completedAt,
}) => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 max-h-[60vh] bg-slate-950/95 border-t border-cyan-500/40 text-xs text-cyan-50 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-500/30 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-400/40">
            DEV MODE
          </span>
          <p className="font-semibold text-[11px] text-cyan-50">
            Painel de Testes Rápidos
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600"
        >
          Fechar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 text-[11px]">
        {/* Bloco 1: estado atual */}
        <div className="border border-slate-700 rounded-lg p-2 bg-slate-900/70 space-y-1">
          <p className="font-semibold text-cyan-100 mb-1">
            Estado Atual do Usuário
          </p>
          <p>
            <span className="text-slate-400">Nome:</span> {userName || "—"}
          </p>
          <p>
            <span className="text-slate-400">Tela atual:</span> {Screen[currentScreen]}
          </p>
          <p>
            <span className="text-slate-400">Pontuação total:</span> {totalScore}
          </p>
          <p>
            <span className="text-slate-400">Jogos bônus concluídos:</span>{" "}
            {completedBonusGamesCount}
          </p>
          <p>
            <span className="text-slate-400">Concluído em:</span>{" "}
            {completedAt ? new Date(completedAt).toLocaleString("pt-BR") : "—"}
          </p>
        </div>

        {/* Bloco 2: quick actions */}
        <div className="border border-slate-700 rounded-lg p-2 bg-slate-900/70 space-y-2">
          <p className="font-semibold text-cyan-100 mb-1">
            Atalhos de Teste (não aparecem para o usuário final)
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onRunTest("goToStage1")}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600"
            >
              Ir para Etapa 1
            </button>
            <button
              type="button"
              onClick={() => onRunTest("goToStage6")}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600"
            >
              Ir para Etapa 6
            </button>
            <button
              type="button"
              onClick={() => onRunTest("finishJourney")}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-600"
            >
              Marcar Jornada Concluída
            </button>
          </div>
        </div>

        {/* Bloco 3: notas */}
        <div className="border border-slate-700 rounded-lg p-2 bg-slate-900/70">
          <p className="font-semibold text-cyan-100 mb-1">Notas</p>
          <p className="text-slate-300">
            Para desligar este painel em produção, basta limpar o{" "}
            <code className="bg-slate-800 px-1 rounded">localStorage</code> ou
            remover a flag <code>identidadeDevTools</code>. Esse painel não é
            exibido para os jovens/adolescentes.
          </p>
        </div>
      </div>
    </div>
  );
};

const AppOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentScreen,
    userName,
    totalScore,
    completedBonusGames,
    completedAt,
  } = useAppContext();

  const [isDevToolsEnabled, setIsDevToolsEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DEV_TOOLS_FLAG_KEY) === "1";
    } catch {
      return false;
    }
  });

  const toggleDevTools = () => {
    setIsDevToolsEnabled((prev) => {
      const next = !prev;
      try {
        if (next) {
          localStorage.setItem(DEV_TOOLS_FLAG_KEY, "1");
        } else {
          localStorage.removeItem(DEV_TOOLS_FLAG_KEY);
        }
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleRunTest = (testId: string) => {
    console.log("[DEV TEST]", testId);
    // Aqui no futuro dá para plugar ações reais de teste se você quiser
  };

  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-b from-[#020617] via-[#020617] to-[#020617] text-white">
        {/* Badge de Dev no cantinho (não interfere no layout) */}
        <DeveloperModeBadge
          enabled={isDevToolsEnabled}
          toggle={toggleDevTools}
        />

        {/* Conteúdo real do app */}
        <main className="min-h-screen flex flex-col">{children}</main>
      </div>

      {/* Painel flutuante de dev, só se a flag estiver ligada */}
      {isDevToolsEnabled && (
        <DevTestsPanel
          onClose={toggleDevTools}
          onRunTest={handleRunTest}
          currentScreen={currentScreen}
          userName={userName}
          totalScore={totalScore}
          completedBonusGamesCount={completedBonusGames.length}
          completedAt={completedAt}
        />
      )}
    </>
  );
};

const AppRoutes: React.FC = () => {
  const { currentScreen } = useAppContext();

  switch (currentScreen) {
    case Screen.SplashScreen:
      return <SplashScreen />;
    case Screen.Welcome:
      return <WelcomeScreen />;
    case Screen.Instructions:
      return <InstructionsScreen />;
    case Screen.Study:
      return <StudyScreen />;
    case Screen.Declaration:
      return <DeclarationScreen />;
    case Screen.Congratulations:
      return <CongratulationsScreen />;
    case Screen.Rewards:
      return <RewardsScreen />;
    case Screen.Bonus:
      return <BonusScreen />;
    case Screen.Final:
      return <FinalScreen />;
    case Screen.CommunityWall:
      return <CommunityWallScreen />;
    case Screen.ShareReport:
      return <ShareReportScreen />;
    case Screen.AdminDashboard:
      return <AdminDashboardScreen />;
    default:
      return <WelcomeScreen />;
  }
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppOverlay>
        <AppRoutes />
      </AppOverlay>
    </AppProvider>
  );
};

export default App;
