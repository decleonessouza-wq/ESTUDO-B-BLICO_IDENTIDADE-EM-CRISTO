import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen } from '../types';
import ActionButton from '../components/ActionButton';
import AnimatedScreen from '../components/AnimatedScreen';

const WelcomeScreen: React.FC = () => {
  const { setUserName, navigateTo } = useAppContext();
  const [name, setName] = useState('');

  const handleStart = () => {
    if (name.trim()) {
      setUserName(name.trim());
      navigateTo(Screen.Instructions);
    }
  };

  return (
    <AnimatedScreen>
      <div className="text-center text-white">
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 mb-4 animate-fade-in-down">
          Identidade em Cristo
        </h1>
        <p 
          className="text-xl md:text-2xl text-gray-300 mb-12 animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          Quem sou eu aos olhos de Deus?
        </p>
        <div 
          className="w-full max-w-sm mx-auto animate-fade-in-up"
          style={{ animationDelay: '0.6s' }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleStart()}
            placeholder="Digite seu nome"
            className="w-full px-6 py-4 text-center bg-gray-800 bg-opacity-50 border-2 border-blue-500 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-transparent transition duration-300 mb-8"
          />
          <ActionButton onClick={handleStart} disabled={!name.trim()}>
            Iniciar Jornada
          </ActionButton>
        </div>
      </div>
    </AnimatedScreen>
  );
};

export default WelcomeScreen;
