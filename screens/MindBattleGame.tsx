import React, { useMemo, useState } from 'react';
import ActionButton from '../components/ActionButton';
import { useSound } from '../hooks/useSound';
import { SOUNDS } from '../constants';

interface MindBattleGameProps {
  onComplete: () => void;
  onBack: () => void;
}

type ThoughtType = 'truth' | 'lie';

type Thought = {
  id: string;
  statement: string;
  type: ThoughtType;
  verse: string;
};

const THOUGHTS: Thought[] = [
  {
    id: 't1',
    statement: 'Em Cristo, sou completamente perdoado(a).',
    type: 'truth',
    verse: 'Efésios 1:7',
  },
  {
    id: 't2',
    statement: 'Deus se afasta de mim quando falho.',
    type: 'lie',
    verse: 'Romanos 8:1',
  },
  {
    id: 't3',
    statement: 'O Espírito Santo habita em mim.',
    type: 'truth',
    verse: '1 Coríntios 3:16',
  },
  {
    id: 't4',
    statement: 'Meu passado define meu futuro.',
    type: 'lie',
    verse: '2 Coríntios 5:17',
  },
];

const MindBattleGame: React.FC<MindBattleGameProps> = ({ onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('Discernir pensamentos mantém sua mente protegida. Verdade ou mentira?');
  const playCorrect = useSound(SOUNDS.CORRECT.id, 0.6);
  const playIncorrect = useSound(SOUNDS.INCORRECT.id, 0.6);

  const progress = useMemo(() => ((currentIndex) / THOUGHTS.length) * 100, [currentIndex]);

  const handleAnswer = (answer: ThoughtType) => {
    const thought = THOUGHTS[currentIndex];
    if (!thought) {
      return;
    }

    if (thought.type === answer) {
      playCorrect();
      setScore((prev) => prev + 1);
      const nextIndex = currentIndex + 1;
      if (nextIndex >= THOUGHTS.length) {
        setFeedback('Você venceu a batalha da mente! Continue alimentando-se da Palavra.');
        onComplete();
      } else {
        setFeedback(`Correto! ${thought.verse} confirma essa verdade. Avance!`);
        setCurrentIndex(nextIndex);
      }
    } else {
      playIncorrect();
      setFeedback('Essa é uma mentira. Substitua-a pela verdade da Palavra e tente novamente.');
    }
  };

  const currentThought = THOUGHTS[currentIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Batalha da Mente</h2>
        <ActionButton onClick={onBack}>Voltar ao Salão</ActionButton>
      </div>

      <div className="bg-gradient-to-br from-rose-900/40 to-purple-900/40 border border-rose-600 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="w-full bg-rose-900/40 rounded-full h-3 overflow-hidden">
          <div className="h-full bg-rose-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-lg text-rose-100 font-semibold text-center">{currentThought?.statement}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <ActionButton onClick={() => handleAnswer('truth')} className="flex-1">
            Verdade
          </ActionButton>
          <ActionButton onClick={() => handleAnswer('lie')} className="flex-1">
            Mentira
          </ActionButton>
        </div>
      </div>

      <p className="text-center text-rose-200 text-sm">{feedback}</p>
      <p className="text-center text-rose-100 text-sm">Pontuação: {score} / {THOUGHTS.length}</p>
    </div>
  );
};

export default MindBattleGame;
