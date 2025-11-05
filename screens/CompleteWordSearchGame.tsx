import React, { useMemo, useState, useEffect } from 'react';
import ActionButton from '../components/ActionButton';
import { useSound } from '../hooks/useSound';
import { SOUNDS } from '../constants';

interface CompleteWordSearchGameProps {
  onComplete: () => void;
  onBack: () => void;
}

const KEYWORD_GRID = [
  'IDENTIDADEABCD',
  'CRISTOPQRSUVWX',
  'SEMELHANÇAUVWX',
  'REDENÇÃOQRSTUV',
  'LIBERDADEMNOPQ',
  'PERDÃOABCDEFGH',
  'JUSTIFICADOKLM',
  'HERDEIROQRSTUV',
  'PROPÓSITOUVWXY',
  'SANTOABCDEFGHI',
  'AMADOIJKLMNOPQ',
  'ESPÍRITOQRSTUV',
  'NOVACRIAÇÃOXYZ',
  'VERDADEKLMNOPQ',
  'GRAÇAQRSTUVWXY',
  'FILHOABCDEFGHI',
  'FÉJKLMNOPQRSTU',
  'ALIANÇAUVWXYZA',
];

const KEYWORDS = [
  'IDENTIDADE',
  'CRISTO',
  'SEMELHANÇA',
  'REDENÇÃO',
  'LIBERDADE',
  'PERDÃO',
  'JUSTIFICADO',
  'HERDEIRO',
  'PROPÓSITO',
  'SANTO',
  'AMADO',
  'ESPÍRITO',
  'NOVA CRIAÇÃO',
  'VERDADE',
  'GRAÇA',
  'FILHO',
  'FÉ',
  'ALIANÇA',
];

const normalizeValue = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .toUpperCase();

const keywordMap = new Map(KEYWORDS.map((word) => [normalizeValue(word), word]));

const CompleteWordSearchGame: React.FC<CompleteWordSearchGameProps> = ({ onComplete, onBack }) => {
  const [guess, setGuess] = useState('');
  const [foundWords, setFoundWords] = useState<Set<string>>(() => new Set());
  const [feedback, setFeedback] = useState(
    'Observe a grade completa e digite cada palavra-chave da jornada Identidade em Cristo.'
  );

  const playCorrect = useSound(SOUNDS.CORRECT.id, 0.5);
  const playIncorrect = useSound(SOUNDS.INCORRECT.id, 0.5);
  const playClick = useSound(SOUNDS.CLICK.id, 0.5);

  const remainingWords = useMemo(() => KEYWORDS.filter((word) => !foundWords.has(normalizeValue(word))), [foundWords]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedGuess = normalizeValue(guess);
    if (!normalizedGuess) {
      return;
    }

    playClick();

    if (!keywordMap.has(normalizedGuess)) {
      setFeedback('Essa palavra não faz parte do estudo. Reveja as letras com atenção e tente novamente.');
      playIncorrect();
      setGuess('');
      return;
    }

    if (foundWords.has(normalizedGuess)) {
      setFeedback('Essa verdade já foi encontrada! Busque outra palavra que marcou a sua jornada.');
      playIncorrect();
      setGuess('');
      return;
    }

    setFoundWords((previous) => {
      const updated = new Set(previous);
      updated.add(normalizedGuess);
      return updated;
    });
    setGuess('');
    setFeedback('Excelente! Mais uma verdade da sua identidade foi lembrada. Continue!');
    playCorrect();
  };

  useEffect(() => {
    if (foundWords.size === KEYWORDS.length) {
      onComplete();
    }
  }, [foundWords, onComplete]);

  const columnCount = KEYWORD_GRID[0]?.length ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-left md:text-3xl">Caça-Palavras da Identidade Completa</h2>
        <ActionButton onClick={onBack}>Voltar ao Salão</ActionButton>
      </div>

      <p className="text-gray-300 text-sm md:text-base">
        Reencontre cada conceito-chave que estudamos. Todas as palavras estão escondidas nesta grade ampliada. Digite cada uma
        assim que identificá-la para registrar sua descoberta.
      </p>

      <div
        className="grid gap-2 max-w-3xl mx-auto"
        style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
      >
        {KEYWORD_GRID.map((row, rowIndex) =>
          row.split('').map((letter, columnIndex) => (
            <div
              key={`${rowIndex}-${columnIndex}`}
              className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-lg text-lg font-bold text-emerald-300 shadow-inner"
            >
              {letter}
            </div>
          ))
        )}
      </div>

      <div className="bg-gray-900/60 rounded-2xl p-4 border border-emerald-600">
        <h3 className="text-lg font-semibold text-emerald-200 mb-2">Palavras para encontrar</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {KEYWORDS.map((word) => {
            const normalized = normalizeValue(word);
            const isFound = foundWords.has(normalized);
            return (
              <span
                key={word}
                className={`px-3 py-1 rounded-full text-sm font-semibold border transition-colors duration-200 ${
                  isFound
                    ? 'bg-green-600/30 border-green-400 text-green-200'
                    : 'bg-gray-800 border-emerald-500 text-emerald-100'
                }`}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        <input
          type="text"
          value={guess}
          onChange={(event) => setGuess(event.target.value.toUpperCase())}
          placeholder="Digite uma palavra encontrada"
          className="w-full sm:w-72 bg-gray-800 border border-emerald-600 rounded-lg px-4 py-2 text-center text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <ActionButton type="submit">Confirmar</ActionButton>
      </form>

      <p className="text-center text-sm text-emerald-200">{feedback}</p>

      {remainingWords.length === 0 && (
        <p className="text-center text-green-300 font-semibold">
          Você relembrou todas as palavras-chave! Guarde cada uma delas no coração.
        </p>
      )}
    </div>
  );
};

export default CompleteWordSearchGame;
