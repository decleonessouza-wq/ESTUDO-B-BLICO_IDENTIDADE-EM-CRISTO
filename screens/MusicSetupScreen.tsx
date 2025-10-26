import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen } from '../types';
import ActionButton from '../components/ActionButton';
import AnimatedScreen from '../components/AnimatedScreen';
import { useSound } from '../hooks/useSound';
import { SOUNDS } from '../constants';

const MusicSetupScreen: React.FC = () => {
  const { navigateTo, setBgmUrls, userName, stagesData } = useAppContext();
  const [selectedFiles, setSelectedFiles] = useState<(File | null)[]>(Array(6).fill(null));
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const playFileSelectSound = useSound(SOUNDS.COPY_SUCCESS.id, 0.5);

  useEffect(() => {
    // Re-render icons when state changes
    const timerId = setTimeout(() => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 0);
    return () => clearTimeout(timerId);
  }, [selectedFiles]);

  const handleFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      playFileSelectSound();
      const newFiles = [...selectedFiles];
      newFiles[index] = file;
      setSelectedFiles(newFiles);
    }
  };

  const handleContinue = () => {
    const urls = selectedFiles.map(file => file ? URL.createObjectURL(file) : '');
    setBgmUrls(urls);
    navigateTo(Screen.Instructions);
  };

  const handleSkip = () => {
    setBgmUrls([]); // Clear any previously selected URLs
    navigateTo(Screen.Instructions);
  };

  const allFilesSelected = selectedFiles.every(file => file !== null);

  return (
    <AnimatedScreen>
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-4xl w-full text-white text-center border border-blue-700">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-down bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
          Personalize a Trilha Sonora
        </h1>
        <p className="text-lg text-gray-300 mb-10 animate-fade-in-down" style={{ animationDelay: '150ms' }}>
          Olá, {userName}! Selecione 6 músicas do seu dispositivo para serem o fundo de cada etapa do quiz.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {selectedFiles.map((file, index) => (
            <div 
              key={index} 
              className="bg-gray-700/50 p-4 rounded-xl flex flex-col items-center justify-center text-center animate-fade-in-up border border-white/10 transition-transform duration-300 hover:scale-105"
              style={{ animationDelay: `${200 + index * 100}ms` }}
            >
              <input 
                type="file"
                accept="audio/*"
                // FIX: The ref callback function must not return a value. Wrap the assignment in curly braces to create a block body, which implicitly returns undefined.
                ref={el => { fileInputRefs.current[index] = el; }}
                onChange={(e) => handleFileChange(index, e)}
                className="hidden"
              />
              <h3 className="text-lg font-bold mb-2 text-blue-300 h-16 flex items-center justify-center">{stagesData[index]?.title}</h3>
              {file ? (
                <div className="flex flex-col items-center justify-center min-h-[80px]">
                  <i data-lucide="check-circle" className="w-8 h-8 text-green-400 mb-2"></i>
                  <p className="text-sm text-gray-300 break-all px-2">{file.name}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[80px]">
                  <i data-lucide="music-4" className="w-8 h-8 text-gray-400 mb-2"></i>
                  <p className="text-sm text-gray-400">Nenhuma música</p>
                </div>
              )}
              <button
                onClick={() => fileInputRefs.current[index]?.click()}
                className={`mt-3 w-full text-sm font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                  file ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {file ? 'Alterar Música' : 'Selecionar Música'}
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
            <ActionButton onClick={handleSkip} className="bg-gradient-to-r from-gray-600 to-gray-800 focus:ring-gray-400">
                Pular por agora
            </ActionButton>
            <ActionButton onClick={handleContinue} disabled={!allFilesSelected}>
                Continuar
            </ActionButton>
        </div>
      </div>
    </AnimatedScreen>
  );
};

export default MusicSetupScreen;