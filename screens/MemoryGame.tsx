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

const BASE_PAIRS: Array<{ pairKey: string; verse: string; truth: string }> = [
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
];

const buildDeck = (): CardState[] => {
  const deck: CardState[] = [];
  BASE_PAIRS.forEach(({ pairKey, verse, truth }) => {
    deck.push({ id: `${pairKey}-verse`, content: verse, pairKey, isFlipped: false, isMatched: false });
    deck.push({ id: `${pairKey}-truth`, content: truth, pairKey, isFlipped: false, isMatched: false });
  });
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

  const matchedCount = useMemo(() => cards.filter((card) => card.isMatched).length, [cards]);

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
    if (card.isMatched || selectedIds.includes(card.id)) {
      return;
    }
    if (selectedIds.length === 2) {
      return;
    }

    playFlip();
    setCards((prev) =>
      prev.map((item) => (item.id === card.id ? { ...item, isFlipped: true } : item)),
    );
    setSelectedIds((prev) => [...prev, card.id]);
  };

  useEffect(() => {
    if (selectedIds.length < 2) {
      return;
    }

    const [firstId, secondId] = selectedIds;
    const firstCard = cards.find((card) => card.id === firstId);
    const secondCard = cards.find((card) => card.id === secondId);
    if (!firstCard || !secondCard) {
      return;
    }

    const isMatch = firstCard.pairKey === secondCard.pairKey && firstCard.id !== secondCard.id;
    setMoves((prev) => prev + 1);

    if (isMatch) {
      setCards((prev) =>
        prev.map((card) =>
          card.pairKey === firstCard.pairKey
            ? { ...card, isMatched: true, isFlipped: true }
            : card,
        ),
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
              : card,
          ),
        );
        setSelectedIds([]);
      }, 900);
    }
  }, [selectedIds, cards, playCorrect, playIncorrect]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Memória da Verdade</h2>
        <ActionButton onClick={onBack}>Voltar ao Salão</ActionButton>
      </div>

      <p className="text-gray-300 text-sm md:text-base">
        Combine cada versículo com a verdade correspondente. Memorizar a Palavra fortalece sua identidade.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleSelectCard(card)}
            className={`h-28 sm:h-32 p-3 rounded-xl border-2 transition-all flex items-center justify-center text-center font-semibold ${card.isMatched ? 'bg-green-700/40 border-green-400 text-green-200' : card.isFlipped ? 'bg-cyan-700/40 border-cyan-400 text-white' : 'bg-gray-800 border-cyan-600 text-cyan-100 hover:scale-105'}`}
          >
            {card.isFlipped || card.isMatched ? card.content : 'Revelar'}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-900/60 rounded-xl p-4 border border-indigo-600">
        <p className="text-sm text-cyan-200">Movimentos: {moves}</p>
        <ActionButton onClick={resetGame}>Reiniciar Cartas</ActionButton>
      </div>
    </div>
  );
};

export default MemoryGame;
