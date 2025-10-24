import React, { useState, useEffect } from 'react';
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
  useEffect(() => {
    // Garante que os ícones sejam renderizados quando os componentes mudam
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }); // Re-executa em cada renderização para capturar novos ícones

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
  // Estado para gerenciar qual tela está visível e sua animação
  const [displayedScreen, setDisplayedScreen] = useState(currentScreen);
  const [animationClass, setAnimationClass] = useState('animate-fade-in-up');

  useEffect(() => {
    // Quando a tela no contexto muda, aciona a sequência de fade-out/fade-in
    if (currentScreen !== displayedScreen) {
      setAnimationClass('animate-fade-out-up'); // Inicia o fade-out
      
      const timer = setTimeout(() => {
        setDisplayedScreen(currentScreen); // Troca o conteúdo após o fade-out
        setAnimationClass('animate-fade-in-up'); // Inicia o fade-in
      }, 500); // Deve corresponder à duração da animação CSS

      return () => clearTimeout(timer);
    }
  }, [currentScreen, displayedScreen]);

  return (
    // O div wrapper agora tem sua classe controlada pelo estado
    <div className={`w-full min-h-full flex items-center justify-center ${animationClass}`}>
        <ScreenRenderer screen={displayedScreen} />
    </div>
  )
}

const AppWrapper: React.FC = () => {
  return (
    <AppProvider>
      <main className="w-screen h-screen bg-gray-900 overflow-auto bg-gradient-to-br from-gray-900 via-black to-blue-900">
        <App />
      </main>
    </AppProvider>
  );
};

export default AppWrapper;