import React, { useMemo, useState } from 'react';
import ActionButton from '../components/ActionButton';
import { useSound } from '../hooks/useSound';
import { SOUNDS } from '../constants';

interface WordSearchGameProps {
  onComplete: () => void;
  onBack: () => void;
}

const GRID = [
  'GRAÇAO',
  'EBCDFI',
  'NAFILH',
  'TRUMOE',
  'IEDADE',
  'SAGRAR',
];

const WORDS = ['GRAÇA', 'FÉ', 'FILHO', 'AMOR', 'IDENTIDADE', 'SANTO'];

const WordSearchGame: React.FC<WordSearchGameProps> = ({ onComplete, onBack }) => {
  const [guess, setGuess] = useState('');
  const [foundWords, setFoundWords] = useState<Set<string>>(() => new Set());
  const [feedback, setFeedback] = useState('Digite uma palavra que você encontrou no caça-palavras.');
  const playCorrect = useSound(SOUNDS.CORRECT.id, 0.5);
  const playIncorrect = useSound(SOUNDS.INCORRECT.id, 0.5);
  const playClick = useSound(SOUNDS.CLICK.id, 0.5);

  const remainingWords = useMemo(
    () => WORDS.filter((word) => !foundWords.has(word)),
    [foundWords],
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedGuess = guess.trim().toUpperCase();
    if (!normalizedGuess) {
      return;
    }

    playClick();

    if (!WORDS.includes(normalizedGuess)) {
      setFeedback('Essa palavra não faz parte desta busca. Continue tentando!');
      playIncorrect();
      setGuess('');
      return;
    }

    if (foundWords.has(normalizedGuess)) {
      setFeedback('Você já encontrou essa palavra. Procure outra!');
      playIncorrect();
      setGuess('');
      return;
    }

    setFoundWords((prev) => new Set(prev).add(normalizedGuess));
    setGuess('');
    setFeedback('Excelente! Continue encontrando as verdades escondidas.');
    playCorrect();
  };

  React.useEffect(() => {
    if (foundWords.size === WORDS.length) {
      onComplete();
    }
  }, [foundWords, onComplete]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Encontrando a Verdade</h2>
        <ActionButton onClick={onBack}>Voltar ao Salão</ActionButton>
      </div>

      <p className="text-gray-300 text-sm md:text-base">
        Observe a grade de letras e digite palavras ligadas à sua identidade em Cristo. Cada palavra correta reforça o que Deus diz sobre você.
      </p>

      <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
        {GRID.map((row, rowIndex) =>
          row.split('').map((letter, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="w-12 h-12 flex items-center justify-center bg-gray-800 rounded-lg text-xl font-bold text-cyan-300 shadow-inner"
            >
              {letter}
            </div>
          )),
        )}
      </div>

      <div className="bg-gray-900/60 rounded-2xl p-4 border border-cyan-700">
        <h3 className="text-lg font-semibold text-cyan-200 mb-2">Palavras para encontrar</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {WORDS.map((word) => (
            <span
              key={word}
              className={`px-3 py-1 rounded-full text-sm font-semibold border ${foundWords.has(word) ? 'bg-green-600/30 border-green-400 text-green-200' : 'bg-gray-800 border-cyan-500 text-cyan-100'}`}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        <input
          type="text"
          value={guess}
          onChange={(event) => setGuess(event.target.value.toUpperCase())}
          placeholder="Digite uma palavra"
          className="w-full sm:w-64 bg-gray-800 border border-cyan-600 rounded-lg px-4 py-2 text-center text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        <ActionButton type="submit">Confirmar</ActionButton>
      </form>

      <p className="text-center text-sm text-cyan-200">{feedback}</p>

      {remainingWords.length === 0 && (
        <p className="text-center text-green-300 font-semibold">
          Você encontrou todas as palavras! Deixe que a verdade continue preenchendo sua mente.
        </p>
      )}
    </div>
  );
};

export default WordSearchGame;
