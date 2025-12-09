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
  // 🔹 Conteúdo original
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

  // 🔹 Novos pensamentos (ampliando o jogo)
  {
    id: 't5',
    statement: 'Sou criação maravilhosa de Deus.',
    type: 'truth',
    verse: 'Salmos 139:14',
  },
  {
    id: 't6',
    statement: 'Estou sozinho(a) e Deus se esqueceu de mim.',
    type: 'lie',
    verse: 'Isaías 41:10',
  },
  {
    id: 't7',
    statement: 'Em Cristo, tenho um propósito e uma missão.',
    type: 'truth',
    verse: 'Efésios 2:10',
  },
  {
    id: 't8',
    statement: 'Minha oração não faz diferença nenhuma.',
    type: 'lie',
    verse: 'Tiago 5:16',
  },
];

const MindBattleGame: React.FC<MindBattleGameProps> = ({ onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(
    'Discernir pensamentos mantém sua mente protegida. Verdade ou mentira?',
  );

  const playCorrect = useSound(SOUNDS.CORRECT.id, 0.6);
  const playIncorrect = useSound(SOUNDS.INCORRECT.id, 0.6);

  // Progresso visual (0–100%)
  const progress = useMemo(() => {
    if (THOUGHTS.length <= 1) return 100;
    const value = (currentIndex / (THOUGHTS.length - 1)) * 100;
    return Math.max(0, Math.min(100, value));
  }, [currentIndex]);

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
        setFeedback('Você venceu a batalha da mente! Continue se enchendo da verdade de Deus.');
        onComplete();
      } else {
        setFeedback(
          `Correto! ${thought.verse} mostra o que Deus diz sobre isso. Avance para o próximo pensamento.`,
        );
        setCurrentIndex(nextIndex);
      }
    } else {
      playIncorrect();
      setFeedback(
        'Essa é uma mentira. Traga à memória o que Deus diz na Palavra e tente novamente.',
      );
    }
  };

  const currentThought = THOUGHTS[currentIndex];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Batalha da Mente</h2>
          <p className="text-xs text-rose-200/80 mt-1">
            Treine seu discernimento entre pensamentos de Deus e mentiras.
          </p>
        </div>
        <ActionButton onClick={onBack}>Voltar ao Salão</ActionButton>
      </div>

      {/* Card principal */}
      <div className="bg-gradient-to-br from-rose-900/60 via-fuchsia-900/50 to-purple-900/60 border border-rose-500/80 rounded-3xl p-6 shadow-xl space-y-5">
        {/* Topo: progresso + info */}
        <div className="flex items-center justify-between gap-3 text-xs text-rose-100/90">
          <span className="px-3 py-1 rounded-full bg-rose-900/70 border border-rose-400/60 uppercase tracking-wide">
            Pensamento {currentIndex + 1} de {THOUGHTS.length}
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-900/70 border border-purple-400/60">
            Pontuação: <span className="font-semibold">{score}</span> / {THOUGHTS.length}
          </span>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-rose-950/60 rounded-full h-3 overflow-hidden mt-1">
          <div
            className="h-full bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Pensamento atual */}
        <div className="mt-4">
          <p className="text-sm text-rose-100/80 mb-1 text-center uppercase tracking-wide">
            Analise este pensamento:
          </p>
          <p className="text-lg md:text-xl text-center font-semibold text-rose-50 bg-rose-950/50 px-4 py-3 rounded-2xl border border-rose-400/60 shadow-inner">
            “{currentThought?.statement}”
          </p>
        </div>

        {/* Botões Verdade / Mentira */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
          <ActionButton
            onClick={() => handleAnswer('truth')}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 focus:ring-emerald-300"
          >
            ✅ Verdade
          </ActionButton>
          <ActionButton
            onClick={() => handleAnswer('lie')}
            className="flex-1 bg-rose-500 hover:bg-rose-400 focus:ring-rose-300"
          >
            ❌ Mentira
          </ActionButton>
        </div>
      </div>

      {/* Feedback */}
      <p className="text-center text-rose-100 text-sm bg-rose-950/40 border border-rose-700/70 rounded-2xl px-4 py-3">
        {feedback}
      </p>
    </div>
  );
};

export default MindBattleGame;
