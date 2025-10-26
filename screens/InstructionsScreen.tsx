
import React, { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen } from '../types';
import ActionButton from '../components/ActionButton';
import AnimatedScreen from '../components/AnimatedScreen';

const InstructionsScreen: React.FC = () => {
  const { userName, navigateTo } = useAppContext();

  useEffect(() => {
    // Use a timeout to ensure React has finished its render cycle before Lucide modifies the DOM.
    const timerId = setTimeout(() => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 0);
    return () => clearTimeout(timerId);
  }, []);

  const instructions = [
    {
      icon: 'film',
      title: 'Assista aos Vídeos',
      text: 'Mergulhe em um vídeo de estudo em cada uma das 6 etapas da jornada.',
      color: 'from-blue-500/80 to-blue-800/80',
      iconColor: 'text-blue-300'
    },
    {
      icon: 'help-circle',
      title: 'Teste seu Conhecimento',
      text: 'Responda a um quiz de 10 perguntas para fixar o que você aprendeu.',
      color: 'from-teal-500/80 to-teal-800/80',
      iconColor: 'text-teal-300'
    },
    {
      icon: 'cross',
      title: 'Medite na Palavra',
      text: 'Aprofunde-se em uma reflexão bíblica cuidadosamente selecionada para cada tema.',
      color: 'from-purple-500/80 to-purple-800/80',
      iconColor: 'text-purple-300'
    },
    {
      icon: 'notebook-text',
      title: 'Diário Pessoal',
      text: 'Anote seus pensamentos e o que Deus falou com você em um diário de reflexão.',
      color: 'from-indigo-500/80 to-indigo-800/80',
      iconColor: 'text-indigo-300'
    },
    {
      icon: 'trophy',
      title: 'Receba Recompensas',
      text: 'Ao concluir a jornada, você receberá recompensas espirituais incríveis e personalizadas.',
      color: 'from-yellow-500/80 to-yellow-800/80',
      iconColor: 'text-yellow-300'
    },
    {
      icon: 'messages-square',
      title: 'Mural da Comunidade',
      text: 'Participe do nosso Mural, compartilhe suas reflexões e abençoe outros jovens.',
      color: 'from-pink-500/80 to-pink-800/80',
      iconColor: 'text-pink-300'
    },
    {
      icon: 'infinity',
      title: 'Refaça a Jornada',
      text: 'A cada nova jornada, um quiz com perguntas diferentes testará seus conhecimentos.',
      color: 'from-green-500/80 to-green-800/80',
      iconColor: 'text-green-300'
    },
  ];

  return (
    <AnimatedScreen>
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-5xl w-full text-white text-center border border-blue-700">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in-down bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">Olá, {userName}!</h1>
        <p className="text-lg text-gray-300 mb-10 animate-fade-in-down" style={{ animationDelay: '150ms' }}>
          Bem-vindo(a) à sua jornada para descobrir sua verdadeira identidade. Veja como funciona:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructions.map((item, index) => (
            <div 
              key={index} 
              className={`group bg-gradient-to-br ${item.color} p-6 rounded-xl flex flex-col items-center text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up border border-white/10`}
              style={{ animationDelay: `${200 + index * 100}ms` }}
            >
              <i data-lucide={item.icon} className={`w-12 h-12 mb-4 ${item.iconColor} transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}></i>
              <h3 className="text-lg font-bold mb-2 text-white">{item.title}</h3>
              <p className="text-sm text-gray-300 flex-grow">{item.text}</p>
            </div>
          ))}
        </div>
        <ActionButton onClick={() => navigateTo(Screen.Study)} className="mt-12 animate-fade-in-up" style={{ animationDelay: `${300 + instructions.length * 100}ms` }}>
          Estou Pronto!
        </ActionButton>
      </div>
    </AnimatedScreen>
  );
};

export default InstructionsScreen;
