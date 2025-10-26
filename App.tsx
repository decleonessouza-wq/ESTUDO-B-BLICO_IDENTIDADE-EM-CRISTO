import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Screen } from './types';
import SplashScreen from './screens/SplashScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import InstructionsScreen from './screens/InstructionsScreen';
import StudyScreen from './screens/StudyScreen';
import DeclarationScreen from './screens/DeclarationScreen';
import CongratulationsScreen from './screens/CongratulationsScreen';
import RewardsScreen from './screens/RewardsScreen';
import FinalScreen from './screens/FinalScreen';
import CommunityWallScreen from './screens/CommunityWallScreen';
import ShareReportScreen from './screens/ShareReportScreen';

// ScreenRenderer agora é um componente puro que recebe a tela a ser renderizada como prop.
const ScreenRenderer: React.FC<{ screen: Screen }> = ({ screen }) => {
  switch (screen) {
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
    case Screen.Final:
      return <FinalScreen />;
    case Screen.CommunityWall:
        return <CommunityWallScreen />;
    case Screen.ShareReport:
        return <ShareReportScreen />;
    default:
      return <WelcomeScreen />;
  }
};

const AppLayout: React.FC = () => {
  const { currentScreen, unlockAudio } = useAppContext();

  // Usar a prop `key` no container força o React a remontar a árvore de componentes
  // quando `currentScreen` muda. Esta é uma maneira simples e robusta de acionar
  // uma animação de entrada em cada mudança de tela, corrigindo o bug da tela em branco.
  const appContent = (
    <div key={currentScreen} className="w-full min-h-full flex items-center justify-center">
        <ScreenRenderer screen={currentScreen} />
    </div>
  );
  
  return (
    <div 
      className="min-h-screen flex flex-col bg-gray-900"
      onClick={unlockAudio}
      onKeyDown={unlockAudio}
      role="application"
    >
      <main className="flex-grow w-full overflow-auto bg-gradient-to-br from-gray-900 via-black to-blue-900">
        {appContent}
      </main>
      <footer className="w-full text-center py-4 text-xs text-gray-500">
        ©2025 - ESTUDO BÍBLICO: IDENTIDADE EM CRISTO - PRODUCED BY DECLEONES ANDRADE.
      </footer>
    </div>
  );
}

const AppWrapper: React.FC = () => {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
};

export default AppWrapper;