import React, { useState } from 'react';
import ActionButton from '../components/ActionButton';
import { useSound } from '../hooks/useSound';
import { SOUNDS } from '../constants';

interface VictoryLeapGameProps {
  onComplete: () => void;
  onBack: () => void;
}

type Step = {
  prompt: string;
  options: Array<{ id: string; text: string; isTruth: boolean }>;
};

const STEPS: Step[] = [
  {
    prompt: 'Para dar o primeiro salto, escolha a verdade que abre o caminho.',
    options: [
      { id: 's1', text: 'Sou amado(a) incondicionalmente por Deus.', isTruth: true },
      { id: 's2', text: 'Deus só me aceita se eu for perfeito(a).', isTruth: false },
    ],
  },
  {
    prompt: 'Qual afirmação mantém você avançando rumo à vitória?',
    options: [
      { id: 's3', text: 'Meu valor é definido pelo meu desempenho.', isTruth: false },
      { id: 's4', text: 'Minha identidade está segura em Cristo.', isTruth: true },
    ],
  },
  {
    prompt: 'Último salto! Qual verdade mantém você firme?',
    options: [
      { id: 's5', text: 'Nada pode me separar do amor de Cristo.', isTruth: true },
      { id: 's6', text: 'As mentiras do passado ainda me prendem.', isTruth: false },
    ],
  },
];

const VictoryLeapGame: React.FC<VictoryLeapGameProps> = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [feedback, setFeedback] = useState('Escolha a verdade para saltar para o próximo nível.');
  const playCorrect = useSound(SOUNDS.CORRECT.id, 0.5);
  const playIncorrect = useSound(SOUNDS.INCORRECT.id, 0.5);

  const handleOption = (isTruth: boolean) => {
    if (isTruth) {
      playCorrect();
      const nextStep = currentStep + 1;
      if (nextStep >= STEPS.length) {
        setFeedback('Você alcançou a vitória! Continue firme nas verdades de Deus.');
        onComplete();
      } else {
        setFeedback('Excelente salto! Continue avançando.');
        setCurrentStep(nextStep);
      }
    } else {
      playIncorrect();
      setFeedback('Ops! Essa não é a verdade que liberta. Tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pulo da Vitória</h2>
        <ActionButton onClick={onBack}>Voltar ao Salão</ActionButton>
      </div>

      <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 border border-amber-500 rounded-2xl p-6 shadow-lg space-y-4">
        <p className="text-lg text-amber-100 font-semibold text-center">{STEPS[currentStep]?.prompt}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STEPS[currentStep]?.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOption(option.isTruth)}
              className="p-4 rounded-xl border-2 border-amber-400 bg-amber-700/30 hover:bg-amber-600/40 transition-all shadow-md text-white font-semibold"
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-amber-200 text-sm">{feedback}</p>
    </div>
  );
};

export default VictoryLeapGame;
