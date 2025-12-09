import React, { useMemo, useState } from 'react';
import ActionButton from '../components/ActionButton';
import { useSound } from '../hooks/useSound';
import { SOUNDS } from '../constants';

interface WordSearchGameProps {
  onComplete: () => void;
  onBack: () => void;
}

const GRID = [
  'GRAÇASANTH',   // GRAÇA  -> linha 0, colunas 0–4
  'JAKPODERDR',
  'IDENTIDADE',   // IDENTIDADE -> linha 2, colunas 0–9
  'XAAMORJUST',   // AMOR  -> linha 3, colunas 0–3
  'LIBERTOLUV',   // LIBERTO -> linha 4, colunas 0–6
  'FIJESUSKMD',
  'ESCOLHIDOA',   // ESCOLHIDO -> linha 6, colunas 0–8
  'PÉBNSALVAD',   // É (da palavra FÉ) cruza diagonal com o F
  'FILHOMOTPK',   // FILHO -> linha 8, colunas 0–4  (F também usado em FÉ)
  'ZSANTOÉOSE',   // SANTO -> linha 9, colunas 0–4
];

const WORDS = ['GRAÇA', 'FÉ', 'FILHO', 'AMOR', 'IDENTIDADE', 'SANTO', 'LIBERTO',
  'ESCOLHIDO'];

type Coord = { row: number; col: number };

const WordSearchGame: React.FC<WordSearchGameProps> = ({ onComplete, onBack }) => {
  const [guess, setGuess] = useState('');
  const [foundWords, setFoundWords] = useState<Set<string>>(() => new Set());
  const [feedback, setFeedback] = useState(
    'Clique (ou toque) em uma letra e arraste para formar palavras ligadas à sua identidade em Cristo.'
  );

  const [isDragging, setIsDragging] = useState(false);
  const [selectedCells, setSelectedCells] = useState<Coord[]>([]);
  const [foundCells, setFoundCells] = useState<Set<string>>(() => new Set());

  const playCorrect = useSound(SOUNDS.CORRECT.id, 0.5);
  const playIncorrect = useSound(SOUNDS.INCORRECT.id, 0.5);
  const playClick = useSound(SOUNDS.CLICK.id, 0.5);

  const remainingWords = useMemo(
    () => WORDS.filter((word) => !foundWords.has(word)),
    [foundWords]
  );

  /** Utilitário para montar a string da palavra a partir de uma lista de células */
  const buildWordFromPath = (path: Coord[]): string => {
    if (!path.length) return '';
    return path
      .map(({ row, col }) => GRID[row]?.[col] ?? '')
      .join('');
  };

  /** Lógica de validação da palavra (tanto digitada quanto selecionada na grade) */
  const handleGuess = (rawGuess: string, path?: Coord[]) => {
    const normalizedGuess = rawGuess.trim().toUpperCase();
    if (!normalizedGuess) return;

    playClick();

    if (!WORDS.includes(normalizedGuess)) {
      setFeedback('Essa palavra não faz parte desta busca. Continue tentando!');
      playIncorrect();
      return;
    }

    if (foundWords.has(normalizedGuess)) {
      setFeedback('Você já encontrou essa palavra. Procure outra!');
      playIncorrect();
      return;
    }

    // Marca a palavra como encontrada
    setFoundWords((prev) => {
      const next = new Set(prev);
      next.add(normalizedGuess);
      return next;
    });

    // Se veio da grade, pinta também as letras usadas
    if (path && path.length) {
      setFoundCells((prev) => {
        const next = new Set(prev);
        path.forEach(({ row, col }) => {
          next.add(`${row}-${col}`);
        });
        return next;
      });
    }

    setFeedback('Excelente! Continue encontrando as verdades escondidas.');
    playCorrect();
  };

  /** Submit do campo de texto (permanece como alternativa) */
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!guess.trim()) return;

    handleGuess(guess);
    setGuess('');
  };

  /** Começa uma seleção por clique/toque */
  const startSelection = (row: number, col: number) => {
    setIsDragging(true);
    setSelectedCells([{ row, col }]);
  };

  /** Adiciona uma célula ao caminho se ainda não estiver nela */
  const extendSelection = (row: number, col: number) => {
    if (!isDragging) return;
    setSelectedCells((prev) => {
      const already = prev.some((c) => c.row === row && c.col === col);
      if (already) return prev;
      return [...prev, { row, col }];
    });
  };

  /** Finaliza a seleção (mouse up / touch end) e tenta a palavra */
  const endSelection = () => {
    if (!isDragging || selectedCells.length === 0) {
      setIsDragging(false);
      setSelectedCells([]);
      return;
    }

    const path = [...selectedCells];
    const wordFromGrid = buildWordFromPath(path);

    setIsDragging(false);
    setSelectedCells([]);

    if (wordFromGrid) {
      handleGuess(wordFromGrid, path);
    }
  };

  /** Touch move na grade – descobre qual célula o dedo está passando */
  const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = (event) => {
    if (!isDragging) return;
    const touch = event.touches[0];
    if (!touch) return;

    const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
    if (!el) return;

    const rowAttr = el.getAttribute('data-row');
    const colAttr = el.getAttribute('data-col');
    if (rowAttr == null || colAttr == null) return;

    const row = parseInt(rowAttr, 10);
    const col = parseInt(colAttr, 10);

    extendSelection(row, col);
    event.preventDefault(); // evita scroll enquanto arrasta na grade
  };

  React.useEffect(() => {
    if (foundWords.size === WORDS.length) {
      onComplete();
    }
  }, [foundWords, onComplete]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-2xl font-bold text-cyan-100">Encontrando a Verdade</h2>
        <ActionButton onClick={onBack}>Voltar ao Salão</ActionButton>
      </div>

      <p className="text-gray-300 text-sm md:text-base">
        Arraste pelas letras (no celular) ou clique e arraste com o mouse (no computador) para formar
        palavras ligadas à sua identidade em Cristo. Cada palavra correta reforça o que Deus diz sobre você.
      </p>

    {/* GRADE DE LETRAS */}
    <div
      className="grid grid-cols-10 gap-2 max-w-2xl mx-auto select-none rounded-3xl p-4 bg-gray-900/70 border border-cyan-700/70 shadow-inner"
      onMouseLeave={endSelection}
      onTouchMove={handleTouchMove}
      onTouchEnd={endSelection}
    >
      {GRID.map((row, rowIndex) =>
        row.split("").map((letter, colIndex) => {
          const key = `${rowIndex}-${colIndex}`;
          const isSelected = selectedCells.some(
            (c) => c.row === rowIndex && c.col === colIndex
          );
          const isFound = foundCells.has(key);

          const baseClasses =
            "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl text-lg md:text-xl font-bold transition-all duration-150 shadow-inner cursor-pointer";

          const stateClasses = isFound
            ? "bg-emerald-500 text-white shadow-emerald-500/40"
            : isSelected
            ? "bg-cyan-500 text-slate-950 shadow-cyan-500/50 scale-105"
            : "bg-slate-900 text-cyan-300";

          return (
            <div
              key={key}
              className={`${baseClasses} ${stateClasses}`}
              onMouseDown={(e) => {
                e.preventDefault();
                startSelection(rowIndex, colIndex);
              }}
              onMouseEnter={(e) => {
                if (isDragging) {
                  e.preventDefault();
                  extendSelection(rowIndex, colIndex);
                }
              }}
              onMouseUp={endSelection}
              onTouchStart={(e) => {
                e.preventDefault();
                startSelection(rowIndex, colIndex);
              }}
            >
              {letter}
            </div>
          );
        })
      )}
    </div>

      {/* PALAVRAS PARA ENCONTRAR */}
      <div className="bg-gray-900/60 rounded-2xl p-4 border border-cyan-700">
        <h3 className="text-lg font-semibold text-cyan-200 mb-2">
          Palavras para encontrar
        </h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {WORDS.map((word) => (
            <span
              key={word}
              className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                foundWords.has(word)
                  ? 'bg-green-600/30 border-green-400 text-green-200 line-through'
                  : 'bg-gray-800 border-cyan-500 text-cyan-100'
              }`}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* AINDA PERMITE DIGITAR, SE QUISER */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 items-center justify-center"
      >
        <input
          type="text"
          value={guess}
          onChange={(event) => setGuess(event.target.value.toUpperCase())}
          placeholder="Digite uma palavra (opcional)"
          className="w-full sm:w-64 bg-gray-800 border border-cyan-600 rounded-lg px-4 py-2 text-center text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          aria-label="Digite uma palavra que encontrou no caça-palavras"
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
