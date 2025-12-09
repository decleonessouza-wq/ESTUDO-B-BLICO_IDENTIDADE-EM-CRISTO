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
    prompt: 'Último salto desta fase! Qual verdade mantém você firme?',
    options: [
      { id: 's5', text: 'Nada pode me separar do amor de Cristo.', isTruth: true },
      { id: 's6', text: 'As mentiras do passado ainda me prendem.', isTruth: false },
    ],
  },
  // 👇 NOVAS ETAPAS (ampliando o jogo)
  {
    prompt: 'No caminho da identidade, qual verdade te levanta após um tropeço?',
    options: [
      {
        id: 's7',
        text: 'Quando eu falho, Deus me abandona até eu melhorar.',
        isTruth: false,
      },
      {
        id: 's8',
        text: 'Quando eu caio, posso me arrepender e levantar porque Deus continua comigo.',
        isTruth: true,
      },
    ],
  },
  {
    prompt: 'Sobre o seu futuro, qual pensamento é um salto de fé?',
    options: [
      {
        id: 's9',
        text: 'Meu futuro é incerto e totalmente dependente do acaso.',
        isTruth: false,
      },
      {
        id: 's10',
        text: 'Deus já preparou boas obras para eu viver em Cristo Jesus.',
        isTruth: true,
      },
    ],
  },
  {
    prompt: 'Para continuar firme todos os dias, qual verdade você guarda no coração?',
    options: [
      {
        id: 's11',
        text: 'Se eu falhar hoje, Deus desiste de mim e da minha história.',
        isTruth: false,
      },
      {
        id: 's12',
        text: 'Sou amado(a) todos os dias, mesmo quando não sinto, porque o amor de Deus é constante.',
        isTruth: true,
      },
    ],
  },
];

const VictoryLeapGame: React.FC<VictoryLeapGameProps> = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [feedback, setFeedback] = useState(
    'Escolha a verdade para saltar para o próximo nível.'
  );
  const playCorrect = useSound(SOUNDS.CORRECT.id, 0.5);
  const playIncorrect = useSound(SOUNDS.INCORRECT.id, 0.5);

  const totalSteps = STEPS.length;
  const progress = (currentStep / totalSteps) * 100;

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

  const step = STEPS[currentStep];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold">Pulo da Vitória</h2>
        <ActionButton onClick={onBack}>Voltar ao Salão</ActionButton>
      </div>

      <div className="bg-gradient-to-br from-amber-900/50 via-orange-900/40 to-yellow-900/40 border border-amber-500/80 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5 relative overflow-hidden">
        {/* brilho de fundo */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />

        {/* topo: progresso + etapa */}
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="text-xs uppercase tracking-wide text-amber-200/90">
            Salto {currentStep + 1} de {totalSteps}
          </div>
          <div className="w-40 h-2 bg-amber-950/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* enunciado */}
        <p className="text-lg md:text-xl text-amber-50 font-semibold text-center leading-relaxed relative z-10">
          {step?.prompt}
        </p>

        {/* opções */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 mt-4">
          {step?.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOption(option.isTruth)}
              className="
                p-4 md:p-5 rounded-2xl border border-amber-300/70
                bg-amber-800/40 hover:bg-amber-500/70
                hover:border-yellow-300
                transition-all duration-200
                shadow-md hover:shadow-xl
                text-white font-semibold text-sm md:text-base
                text-left
                flex items-center gap-3
                focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-slate-900
              "
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/80 text-slate-900 font-bold text-sm shadow-md">
                ✓
              </span>
              <span>{option.text}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-amber-200 text-sm md:text-base">{feedback}</p>
    </div>
  );
};

export default VictoryLeapGame;
