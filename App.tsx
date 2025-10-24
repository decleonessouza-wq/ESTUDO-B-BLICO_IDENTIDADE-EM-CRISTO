import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Screen } from './types';
import WelcomeScreen from './screens/WelcomeScreen';
import InstructionsScreen from './screens/InstructionsScreen';
import StudyScreen from './screens/StudyScreen';
import DeclarationScreen from './screens/DeclarationScreen';
import CongratulationsScreen from './screens/CongratulationsScreen';
import RewardsScreen from './screens/RewardsScreen';
import FinalScreen from './screens/FinalScreen';
import CommunityWallScreen from './screens/CommunityWallScreen';

// ScreenRenderer agora é um componente puro que recebe a tela a ser renderizada como prop.
const ScreenRenderer: React.FC<{ screen: Screen }> = ({ screen }) => {
  switch (screen) {
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
    case Screen.Final:
      return <FinalScreen />;
    case Screen.CommunityWall:
        return <CommunityWallScreen />;
    default:
      return <WelcomeScreen />;
  }
};

const App: React.FC = () => {
  const { currentScreen } = useAppContext();

  // Usar a prop `key` no container força o React a remontar a árvore de componentes
  // quando `currentScreen` muda. Esta é uma maneira simples e robusta de acionar
  // uma animação de entrada em cada mudança de tela, corrigindo o bug da tela em branco.
  return (
    <div key={currentScreen} className="w-full min-h-full flex items-center justify-center animate-fade-in">
        <ScreenRenderer screen={currentScreen} />
    </div>
  )
}

const AppWrapper: React.FC = () => {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col bg-gray-900">
        <main className="flex-grow w-full overflow-auto bg-gradient-to-br from-gray-900 via-black to-blue-900">
          <App />
        </main>
        <footer className="w-full text-center py-4 text-xs text-gray-500">
          ©2025 - ESTUDO BÍBLICO: IDENTIDADE EM CRISTO - PRODUCED BY DECLEONE ANDRADE.
        </footer>
      </div>
    </AppProvider>
  );
};

export default AppWrapper;