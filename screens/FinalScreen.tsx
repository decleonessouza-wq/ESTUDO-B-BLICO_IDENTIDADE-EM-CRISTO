import React from 'react';
import { useAppContext } from '../context/AppContext';
import AnimatedScreen from '../components/AnimatedScreen';
import ActionButton from '../components/ActionButton';
import { Screen } from '../types';

const FinalScreen: React.FC = () => {
  const { userName, resetJourney, navigateTo } = useAppContext();

  return (
    <AnimatedScreen>
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-2xl max-w-2xl w-full text-white text-center border border-blue-700">
        <i data-lucide="shield-check" className="w-20 h-20 mx-auto mb-4 text-green-400"></i>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Jornada Concluída!</h1>
        <p className="text-xl text-gray-300 mb-8">
          Parabéns, {userName}! Continue vivendo na liberdade e no propósito da sua nova identidade em Cristo. Que a paz de Deus te guie sempre!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ActionButton onClick={resetJourney}>
                Refazer Jornada
            </ActionButton>
            <ActionButton onClick={() => navigateTo(Screen.CommunityWall)} className="bg-gradient-to-r from-teal-500 to-cyan-500 focus:ring-teal-300">
                Visitar Mural da Comunidade
            </ActionButton>
        </div>
      </div>
    </AnimatedScreen>
  );
};

export default FinalScreen;