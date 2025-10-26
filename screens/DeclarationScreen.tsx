
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen } from '../types';
import { DECLARATIONS, SOUNDS } from '../constants';
import ActionButton from '../components/ActionButton';
import AnimatedScreen from '../components/AnimatedScreen';
import { useSound } from '../hooks/useSound';

const DeclarationScreen: React.FC = () => {
  const { navigateTo } = useAppContext();
  const [declared, setDeclared] = useState<Set<number>>(new Set());
  const playDeclareSound = useSound(SOUNDS.DECLARE.id, 0.5);

  useEffect(() => {
    // Use a timeout to ensure React has finished its render cycle before Lucide modifies the DOM.
    const timerId = setTimeout(() => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 0);
    return () => clearTimeout(timerId);
  }, [declared]);

  const handleDeclare = (index: number) => {
    playDeclareSound();
    setDeclared(prev => new Set(prev.add(index)));
  };

  const allDeclared = declared.size === DECLARATIONS.length;

  return (
    <AnimatedScreen>
      <div className="w-full max-w-4xl text-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Declare as Verdades!</h1>
        <p className="text-lg text-gray-300 mb-8">
          Clique em cada botão para declarar em voz alta a sua nova identidade em Cristo.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {DECLARATIONS.map((declaration, index) => {
            const isDeclared = declared.has(index);
            return (
              <button
                key={index}
                onClick={() => handleDeclare(index)}
                className={`px-5 py-3 rounded-lg font-semibold transform transition-all duration-300 shadow-md ${
                  isDeclared
                    ? 'bg-green-500 text-white scale-105 shadow-lg'
                    : 'bg-gray-700 hover:bg-blue-700'
                }`}
              >
                {isDeclared && <i data-lucide="check-circle" className="inline-block mr-2 w-5 h-5"></i>}
                {declaration}
              </button>
            );
          })}
        </div>
        <ActionButton onClick={() => navigateTo(Screen.Congratulations)} disabled={!allDeclared}>
            Ver minha pontuação
        </ActionButton>
      </div>
    </AnimatedScreen>
  );
};

export default DeclarationScreen;