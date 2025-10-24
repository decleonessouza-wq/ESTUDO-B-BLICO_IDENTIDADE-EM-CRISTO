
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen } from '../types';
import ActionButton from '../components/ActionButton';
import AnimatedScreen from '../components/AnimatedScreen';

const InstructionsScreen: React.FC = () => {
  const { userName, navigateTo } = useAppContext();

  const instructions = [
    { icon: 'Video', text: 'Assista a um vídeo de estudo em cada uma das 6 etapas.' },
    { icon: 'FileQuestion', text: 'Responda a um quiz de 10 perguntas para fixar o aprendizado.' },
    { icon: 'BookOpen', text: 'Medite em uma reflexão bíblica sobre o tema.' },
    { icon: 'PenSquare', text: 'Escreva seus pensamentos em um diário de reflexão pessoal.' },
    { icon: 'Award', text: 'Conclua a jornada para receber recompensas espirituais incríveis!' },
  ];

  return (
    <AnimatedScreen>
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-2xl w-full text-white text-center border border-blue-700">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Olá, {userName}!</h1>
        <p className="text-lg text-gray-300 mb-8">
          Bem-vindo(a) à sua jornada para descobrir sua verdadeira identidade em Cristo. Siga os passos abaixo:
        </p>
        <div className="space-y-4 text-left mx-auto max-w-md">
          {instructions.map((item, index) => (
            <div key={index} className="flex items-center bg-gray-900 p-3 rounded-lg">
              <i data-lucide={item.icon.toLowerCase()} className="w-6 h-6 mr-4 text-blue-400"></i>
              <span className="text-gray-200">{item.text}</span>
            </div>
          ))}
        </div>
        <ActionButton onClick={() => navigateTo(Screen.Study)} className="mt-10">
          Estou Pronto!
        </ActionButton>
      </div>
    </AnimatedScreen>
  );
};

export default InstructionsScreen;