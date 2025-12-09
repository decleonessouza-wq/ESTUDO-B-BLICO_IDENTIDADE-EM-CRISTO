import React, { useEffect, useMemo, useState } from 'react';
import ActionButton from '../components/ActionButton';
import { useSound } from '../hooks/useSound';
import { SOUNDS } from '../constants';

interface MemoryGameProps {
  onComplete: () => void;
  onBack: () => void;
}

type CardData = {
  id: string;
  content: string;
  pairKey: string;
};

type CardState = CardData & {
  isFlipped: boolean;
  isMatched: boolean;
};

/**
 * ⚠️ IMPORTANTE:
 * Mantive os 3 pares ORIGINAIS e apenas ACRESCENTEI novos pares
 * para deixar o jogo maior, como você pediu.
 */
const BASE_PAIRS: Array<{ pairKey: string; verse: string; truth: string }> = [
  // ORIGINAIS
  {
    pairKey: 'filhos',
    verse: 'João 1:12',
    truth: 'Sou filho(a) de Deus',
  },
  {
    pairKey: 'nova',
    verse: '2 Coríntios 5:17',
    truth: 'Sou nova criação',
  },
  {
    pairKey: 'vitoria',
    verse: 'Romanos 8:37',
    truth: 'Sou mais que vencedor(a)',
  },

  // NOVOS PARES (apenas acrescentando)
  {
    pairKey: 'perdoado',
    verse: 'Colossenses 1:14',
    truth: 'Sou perdoado(a) pelo sangue de Jesus',
  },
  {
    pairKey: 'herdeiro',
    verse: 'Romanos 8:17',
    truth: 'Sou herdeiro(a) de Deus',
  },
  {
    pairKey: 'templo',
    verse: '1 Coríntios 6:19',
    truth: 'Sou templo do Espírito Santo',
  },
  {
    pairKey: 'livre',
    verse: 'Gálatas 5:1',
    truth: 'Fui chamado(a) para a liberdade',
  },
  {
    pairKey: 'amado',
    verse: 'Efésios 1:6',
    truth: 'Sou amado(a) em Cristo',
  },
];

const buildDeck = (): CardState[] => {
  const deck: CardState[] = [];

  BASE_PAIRS.forEach(({ pairKey, verse, truth }) => {
    deck.push({
      id: `${pairKey}-verse`,
      content: verse,
      pairKey,
      isFlipped: false,
      isMatched: false,
    });
    deck.push({
      id: `${pairKey}-truth`,
      content: truth,
      pairKey,
      isFlipped: false,
      isMatched: false,
    });
  });

  // embaralhar
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

const MemoryGame: React.FC<MemoryGameProps> = ({ onComplete, onBack }) => {
  const [cards, setCards] = useState<CardState[]>(() => buildDeck());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);

  const playFlip = useSound(SOUNDS.CLICK.id, 0.4);
  const playCorrect = useSound(SOUNDS.CORRECT.id, 0.6);
  const playIncorrect = useSound(SOUNDS.INCORRECT.id, 0.6);

  const matchedCount = useMemo(
    () => cards.filter((card) => card.isMatched).length,
    [cards]
  );

  const totalPairs = BASE_PAIRS.length;
  const matchedPairs = matchedCount / 2;

  useEffect(() => {
    if (matchedCount === cards.length && cards.length > 0) {
      onComplete();
    }
  }, [matchedCount, cards.length, onComplete]);

  const resetGame = () => {
    setCards(buildDeck());
    setSelectedIds([]);
    setMoves(0);
  };

  const handleSelectCard = (card: CardState) => {
    if (card.isMatched || selectedIds.includes(card.id)) return;
    if (selectedIds.length === 2) return;

    playFlip();

    setCards((prev) =>
      prev.map((item) =>
        item.id === card.id ? { ...item, isFlipped: true } : item
      )
    );
    setSelectedIds((prev) => [...prev, card.id]);
  };

  useEffect(() => {
    if (selectedIds.length < 2) return;

    const [firstId, secondId] = selectedIds;
    const firstCard = cards.find((card) => card.id === firstId);
    const secondCard = cards.find((card) => card.id === secondId);
    if (!firstCard || !secondCard) return;

    const isMatch =
      firstCard.pairKey === secondCard.pairKey &&
      firstCard.id !== secondCard.id;

    setMoves((prev) => prev + 1);

    if (isMatch) {
      setCards((prev) =>
        prev.map((card) =>
          card.pairKey === firstCard.pairKey
            ? { ...card, isMatched: true, isFlipped: true }
            : card
        )
      );
      playCorrect();
      setSelectedIds([]);
    } else {
      playIncorrect();
      setTimeout(() => {
        setCards((prev) =>
          prev.map((card) =>
            card.id === firstCard.id || card.id === secondCard.id
              ? { ...card, isFlipped: false }
              : card
          )
        );
        setSelectedIds([]);
      }, 900);
    }
  }, [selectedIds, cards, playCorrect, playIncorrect]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho do jogo */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <i
              data-lucide="brain"
              className="w-6 h-6 text-indigo-400"
            ></i>
            <h2 className="text-2xl font-bold">Memória da Verdade</h2>
          </div>
          <p className="text-gray-300 text-xs md:text-sm mt-1 max-w-xl">
            Combine cada versículo com a verdade correspondente. Memorizar a
            Palavra fortalece sua identidade em Cristo.
          </p>
        </div>

        <ActionButton onClick={onBack}>Voltar ao Salão</ActionButton>
      </div>

      {/* Barra de status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div className="bg-slate-900/70 border border-indigo-600 rounded-xl p-3 flex flex-col items-center">
          <span className="text-xs text-slate-400">Movimentos</span>
          <span className="text-xl font-bold text-indigo-300">{moves}</span>
        </div>
        <div className="bg-slate-900/70 border border-emerald-600 rounded-xl p-3 flex flex-col items-center">
          <span className="text-xs text-slate-400">Pares encontrados</span>
          <span className="text-xl font-bold text-emerald-300">
            {matchedPairs} / {totalPairs}
          </span>
        </div>
        <div className="bg-slate-900/70 border border-cyan-600 rounded-xl p-3 flex flex-col items-center">
          <span className="text-xs text-slate-400">Cartas na mesa</span>
          <span className="text-xl font-bold text-cyan-300">
            {cards.length}
          </span>
        </div>
      </div>

      {/* GRADE DE CARTAS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
        {cards.map((card) => {
          const isVerse = card.id.endsWith('-verse');
          const isFaceUp = card.isFlipped || card.isMatched;

          const baseClasses =
            'relative h-28 sm:h-32 p-3 rounded-xl border-2 transition-all flex items-center justify-center text-center font-semibold text-sm md:text-base overflow-hidden';

          const stateClasses = card.isMatched
            ? 'bg-emerald-600/40 border-emerald-400 text-emerald-50 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-[1.02]'
            : isFaceUp
            ? 'bg-cyan-700/40 border-cyan-400 text-white shadow-[0_0_16px_rgba(34,211,238,0.35)]'
            : 'bg-slate-900 border-cyan-600 text-cyan-100 hover:scale-105 hover:border-cyan-400';

          return (
            <button
              key={card.id}
              onClick={() => handleSelectCard(card)}
              className={`${baseClasses} ${stateClasses}`}
            >
              {/* Badge no canto superior quando virado */}
              {isFaceUp && (
                <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-950/60 border border-slate-500 text-slate-100">
                  {isVerse ? 'Versículo' : 'Verdade'}
                </span>
              )}

              {/* Conteúdo */}
              <span className="px-2">
                {isFaceUp ? card.content : 'Revelar'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Rodapé / ações */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-900/70 rounded-xl p-4 border border-indigo-600/80 mt-2">
        <p className="text-xs md:text-sm text-cyan-200 text-center sm:text-left">
          Cada par que você acerta reforça uma verdade de Deus no seu coração.
        </p>
        <ActionButton onClick={resetGame}>Reiniciar Cartas</ActionButton>
      </div>
    </div>
  );
};

export default MemoryGame;
