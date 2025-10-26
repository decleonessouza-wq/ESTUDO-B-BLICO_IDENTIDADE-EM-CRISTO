import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import AnimatedScreen from '../components/AnimatedScreen';
import ActionButton from '../components/ActionButton';
import { Screen } from '../types';

const FinalScreen: React.FC = () => {
  const { userName, resetJourney, navigateTo } = useAppContext();

  useEffect(() => {
    // Use a timeout to ensure React has finished its render cycle before Lucide modifies the DOM.
    const timerId = setTimeout(() => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 0);
    return () => clearTimeout(timerId);
  }, []);

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
                Refazer o Estudo
            </ActionButton>
            <ActionButton onClick={() => navigateTo(Screen.CommunityWall)} className="bg-gradient-to-r from-teal-500 to-cyan-500 focus:ring-teal-300">
                Visitar Mural da Comunidade
            </ActionButton>
        </div>
        <div className="mt-6 border-t border-gray-700 pt-6">
            <p className="text-sm text-gray-400 mb-3">Compartilhe seu progresso com o administrador do estudo:</p>
            <ActionButton onClick={() => navigateTo(Screen.ShareReport)} className="bg-gradient-to-r from-purple-500 to-indigo-500 focus:ring-purple-300">
                <i data-lucide="share-2" className="inline-block mr-2 w-5 h-5"></i>
                Compartilhar Relatório
            </ActionButton>
        </div>
      </div>
    </AnimatedScreen>
  );
};

export default FinalScreen;