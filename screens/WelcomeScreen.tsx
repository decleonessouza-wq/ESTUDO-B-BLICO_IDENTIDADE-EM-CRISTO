import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen } from '../types';
import ActionButton from '../components/ActionButton';
import AnimatedScreen from '../components/AnimatedScreen';
import { CHURCH_LOGO_URL, SOUNDS } from '../constants';
import { useSound } from '../hooks/useSound';

const WelcomeScreen: React.FC = () => {
  const { setUserName, navigateTo } = useAppContext();
  const [name, setName] = useState('');
  const playIntroSound = useSound(SOUNDS.INTRO.id, 0.5);

  const handleStart = () => {
    const trimmedName = name.trim();
    if (trimmedName) {
      setUserName(trimmedName);
      playIntroSound();
      navigateTo(Screen.Instructions);
    }
  };
  
  const canStart = name.trim() !== '';

  return (
    <AnimatedScreen>
      <div className="flex flex-col justify-between items-center text-center text-white min-h-[85vh] w-full max-w-sm mx-auto py-4">
        
        {/* Top Content Block */}
        <div>
          <img 
            src={CHURCH_LOGO_URL} 
            alt="Logo da Igreja" 
            className="w-48 h-48 object-contain mx-auto mb-1 animate-fade-in-down"
          />
          <p className="text-sm text-gray-400 mb-4 -mt-2 animate-fade-in-down" style={{ animationDelay: '0.15s' }}>
            Igreja Ev. Pentecostal - Jardim de Oração Independente P90
          </p>
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 mb-4 animate-fade-in-down" style={{ animationDelay: '0.3s' }}>
            Identidade em Cristo
          </h1>
          <p 
            className="text-xl md:text-2xl text-gray-300 animate-fade-in-down"
            style={{ animationDelay: '0.45s' }}
          >
            Quem sou eu aos olhos de Deus?
          </p>
        </div>

        {/* Bottom Action Block */}
        <div 
          className="w-full animate-fade-in-up"
          style={{ animationDelay: '0.6s' }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && canStart && handleStart()}
            placeholder="Digite seu nome completo"
            className="w-full px-6 py-4 text-center bg-gray-800 bg-opacity-50 border-2 border-blue-500 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-transparent transition duration-300 mb-8"
          />
          <ActionButton onClick={handleStart} disabled={!canStart}>
            Iniciar Jornada
          </ActionButton>
        </div>
      </div>
    </AnimatedScreen>
  );
};

export default WelcomeScreen;