import React, { useMemo, useState } from 'react';
import ActionButton from '../components/ActionButton';
import { useSound } from '../hooks/useSound';
import { SOUNDS } from '../constants';

type StatementType = 'truth' | 'lie';

type Statement = {
  id: string;
  text: string;
  type: StatementType;
};

interface IdentityBuilderGameProps {
  onComplete: () => void;
  onBack: () => void;
}

const INITIAL_STATEMENTS: Statement[] = [
  { id: '1', text: 'Eu sou nova criação em Cristo Jesus.', type: 'truth' },
  { id: '2', text: 'Deus me rejeita quando falho.', type: 'lie' },
  { id: '3', text: 'Sou perdoado(a) e amado(a) por Deus.', type: 'truth' },
  { id: '4', text: 'Minha identidade depende do que o mundo diz.', type: 'lie' },
  { id: '5', text: 'Fui adotado(a) como filho(a) do Rei.', type: 'truth' },
  { id: '6', text: 'Nada pode me separar do amor de Cristo.', type: 'truth' },
];

type Zone = 'pool' | StatementType;

const IdentityBuilderGame: React.FC<IdentityBuilderGameProps> = ({ onComplete, onBack }) => {
  const [locations, setLocations] = useState<Record<string, Zone>>(() => {
    const initial: Record<string, Zone> = {};
    INITIAL_STATEMENTS.forEach((statement) => {
      initial[statement.id] = 'pool';
    });
    return initial;
  });
  const [feedback, setFeedback] = useState<string>('Arraste cada frase para VERDADE ou MENTIRA.');
  const playCorrect = useSound(SOUNDS.CORRECT.id, 0.6);
  const playIncorrect = useSound(SOUNDS.INCORRECT.id, 0.6);
  const playClick = useSound(SOUNDS.CLICK.id, 0.5);

  const statementsByZone = useMemo(() => {
    const zones: Record<Zone, Statement[]> = { pool: [], truth: [], lie: [] };
    INITIAL_STATEMENTS.forEach((statement) => {
      zones[locations[statement.id]].push(statement);
    });
    return zones;
  }, [locations]);

  const handleDrop = (zone: Zone, statementId: string) => {
    setLocations((prev) => ({ ...prev, [statementId]: zone }));
  };

  const handleCheck = () => {
    const allPlaced = INITIAL_STATEMENTS.every((statement) => locations[statement.id] !== 'pool');

    if (!allPlaced) {
      setFeedback('Coloque todas as frases em uma coluna.');
      playIncorrect();
      return;
    }

    const hasMistake = INITIAL_STATEMENTS.some(
      (statement) => statement.type !== locations[statement.id],
    );

    if (hasMistake) {
      setFeedback('Ainda há algumas frases no lugar errado. Tente novamente!');
      playIncorrect();
      return;
    }

    setFeedback('Incrível! Você firmou a verdade de Deus sobre sua vida.');
    playCorrect();
    onComplete();
  };

  const renderStatement = (statement: Statement) => (
    <div
      key={statement.id}
      draggable
      onDragStart={(event) => event.dataTransfer?.setData('text/plain', statement.id)}
      className="bg-gray-800 border border-cyan-600 text-left p-3 rounded-lg mb-2 cursor-move shadow-md hover:shadow-lg transition-shadow"
    >
      {statement.text}
    </div>
  );

  const renderDropZone = (zone: Zone, title: string, accent: string) => (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const statementId = event.dataTransfer?.getData('text/plain');
        if (statementId) {
          playClick();
          handleDrop(zone, statementId);
        }
      }}
      className={`flex-1 min-h-[200px] border-2 border-dashed ${accent} rounded-xl p-4 transition-colors bg-gray-900/60`}
    >
      <h3 className="text-lg font-bold mb-3 text-center">{title}</h3>
      {statementsByZone[zone].map(renderStatement)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Firmando a Verdade</h2>
        <ActionButton onClick={onBack}>Voltar ao Salão</ActionButton>
      </div>

      <p className="text-gray-300 text-sm md:text-base">
        Arraste cada frase para a coluna correta. Peça ao Espírito Santo que te lembre daquilo que é verdade!
      </p>

      <div className="flex flex-col md:flex-row gap-4">
        {renderDropZone('pool', 'Frases para Organizar', 'border-cyan-500')}
        {renderDropZone('truth', 'Verdades', 'border-green-500')}
        {renderDropZone('lie', 'Mentiras', 'border-rose-500')}
      </div>

      <div className="text-center space-y-4">
        <p className="text-sm text-cyan-200">{feedback}</p>
        <ActionButton onClick={handleCheck}>Verificar Respostas</ActionButton>
      </div>
    </div>
  );
};

export default IdentityBuilderGame;
