
import React, { useState } from 'react';
import ActionButton from '../../components/ActionButton';

interface ReflectionProps {
  biblicalReflection: string;
  motivationalPhrase: string;
  onReflectionComplete: (reflectionText: string) => void;
}

const Reflection: React.FC<ReflectionProps> = ({ biblicalReflection, motivationalPhrase, onReflectionComplete }) => {
  const [text, setText] = useState('');

  return (
    <div className="w-full max-w-3xl p-6 bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-700 text-white text-center">
      <h2 className="text-2xl font-bold mb-4 text-blue-400">Momento de Reflexão</h2>
      
      <div className="bg-gray-900 p-4 rounded-lg mb-6">
        <i data-lucide="book-marked" className="w-8 h-8 mx-auto mb-2 text-cyan-400"></i>
        <p className="text-lg italic text-gray-300">"{biblicalReflection}"</p>
      </div>

      <p className="text-xl font-semibold text-gray-200 mb-6">{motivationalPhrase}</p>
      
      <h3 className="text-xl font-bold mb-3">Sua Reflexão Pessoal</h3>
      <p className="text-sm text-gray-400 mb-4">O que Deus falou com você? Anote seus pensamentos.</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escreva aqui..."
        className="w-full h-40 p-4 bg-gray-700 bg-opacity-50 border-2 border-blue-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-transparent transition duration-300 mb-6"
      />

      <ActionButton onClick={() => onReflectionComplete(text)} disabled={!text.trim()}>
        Concluir Etapa
      </ActionButton>
    </div>
  );
};

export default Reflection;