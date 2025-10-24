
import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen } from '../types';
import ActionButton from '../components/ActionButton';
import AnimatedScreen from '../components/AnimatedScreen';
import { useSound } from '../hooks/useSound';

const CongratulationsScreen: React.FC = () => {
  const { userName, totalScore, navigateTo } = useAppContext();
  const playSuccessSound = useSound('https://www.soundjay.com/human/sounds/applause-01.mp3', 0.3);

  useEffect(() => {
    playSuccessSound();
    // Use a timeout to ensure React has finished its render cycle before Lucide modifies the DOM.
    const timerId = setTimeout(() => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 0);
    return () => clearTimeout(timerId);
  }, [playSuccessSound]);

  return (
    <AnimatedScreen>
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl max-w-2xl w-full text-white text-center border border-blue-700">
        <i data-lucide="party-popper" className="w-20 h-20 mx-auto mb-4 text-yellow-400"></i>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Parabéns, {userName}!</h1>
        <p className="text-xl text-gray-300 mb-8">
          Você completou a jornada "Identidade em Cristo"!
        </p>
        <div className="bg-gray-900 py-6 px-4 rounded-xl mb-10">
          <p className="text-lg text-blue-400 font-semibold mb-2">Sua Pontuação Final</p>
          <p className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
            {totalScore}
          </p>
        </div>
        <ActionButton onClick={() => navigateTo(Screen.Rewards)}>
          Receber Recompensas
        </ActionButton>
      </div>
    </AnimatedScreen>
  );
};

export default CongratulationsScreen;