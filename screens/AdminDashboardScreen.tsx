import React, { useEffect, useMemo, useState } from 'react';
import AnimatedScreen from '../components/AnimatedScreen';
import ActionButton from '../components/ActionButton';
import { useAppContext } from '../context/AppContext';
import { ParticipantSummary } from '../types';

const formatDate = (isoDate: string | null, includeTime = true) => {
  if (!isoDate) {
    return 'Não registrado';
  }

  const date = new Date(isoDate);
  return date.toLocaleString('pt-BR', includeTime ? { dateStyle: 'short', timeStyle: 'short' } : { dateStyle: 'short' });
};

const formatBirthDate = (birthDate: string | null) => {
  if (!birthDate) {
    return 'Não informada';
  }

  const date = new Date(`${birthDate}T00:00:00`);
  return date.toLocaleDateString('pt-BR');
};

const formatDuration = (minutes: number | null) => {
  if (minutes === null) {
    return 'Não calculado';
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  return `${hours}h ${remainingMinutes}min`;
};

const AdminDashboardScreen: React.FC = () => {
  const { getAdminParticipants, exitAdmin } = useAppContext();
  const [participants, setParticipants] = useState<ParticipantSummary[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  useEffect(() => {
    setParticipants(getAdminParticipants().sort((a, b) => {
      const dateA = new Date(a.lastUpdated).getTime();
      const dateB = new Date(b.lastUpdated).getTime();
      return dateB - dateA;
    }));
  }, [getAdminParticipants]);

  const selectedParticipant = useMemo(() => {
    if (!participants.length) {
      return undefined;
    }

    if (selectedParticipantId) {
      return participants.find(participant => participant.id === selectedParticipantId) ?? participants[0];
    }

    return participants[0];
  }, [participants, selectedParticipantId]);

  const totals = useMemo(() => {
    if (!participants.length) {
      return {
        totalParticipants: 0,
        averageScore: 0,
        completedJourneys: 0,
      };
    }

    const totalParticipants = participants.length;
    const totalScore = participants.reduce((acc, participant) => acc + participant.totalScore, 0);
    const completedJourneys = participants.filter(participant => Boolean(participant.completedAt)).length;

    return {
      totalParticipants,
      averageScore: Math.round(totalScore / totalParticipants),
      completedJourneys,
    };
  }, [participants]);

  const handleRefresh = () => {
    setParticipants(getAdminParticipants().sort((a, b) => {
      const dateA = new Date(a.lastUpdated).getTime();
      const dateB = new Date(b.lastUpdated).getTime();
      return dateB - dateA;
    }));
  };

  return (
    <AnimatedScreen>
      <div className="w-full max-w-6xl mx-auto text-white space-y-8 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-gray-300">Acompanhe o progresso completo dos participantes do estudo bíblico.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <ActionButton onClick={handleRefresh} className="bg-gradient-to-r from-cyan-500 to-blue-500">
              Atualizar Dados
            </ActionButton>
            <ActionButton onClick={exitAdmin} className="bg-gradient-to-r from-gray-600 to-gray-800">
              Sair do Painel
            </ActionButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 bg-opacity-70 border border-blue-700 rounded-xl p-4 text-center">
            <p className="text-sm uppercase tracking-widest text-gray-400">Participantes</p>
            <p className="text-3xl font-bold mt-2">{totals.totalParticipants}</p>
          </div>
          <div className="bg-gray-900 bg-opacity-70 border border-green-700 rounded-xl p-4 text-center">
            <p className="text-sm uppercase tracking-widest text-gray-400">Média de Pontuação</p>
            <p className="text-3xl font-bold mt-2">{totals.averageScore}</p>
          </div>
          <div className="bg-gray-900 bg-opacity-70 border border-purple-700 rounded-xl p-4 text-center">
            <p className="text-sm uppercase tracking-widest text-gray-400">Jornadas Concluídas</p>
            <p className="text-3xl font-bold mt-2">{totals.completedJourneys}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gray-900 bg-opacity-60 border border-gray-800 rounded-2xl p-4">
            <h2 className="text-lg font-semibold mb-4">Participantes Registrados</h2>
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
              {participants.length === 0 && (
                <p className="text-sm text-gray-400">
                  Nenhum participante registrado ainda. Assim que um participante iniciar sua jornada, ele aparecerá aqui.
                </p>
              )}

              {participants.map(participant => (
                <button
                  key={participant.id}
                  type="button"
                  onClick={() => setSelectedParticipantId(participant.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    selectedParticipant?.id === participant.id
                      ? 'bg-blue-600/30 border-blue-500'
                      : 'bg-gray-800/60 border-gray-700 hover:border-blue-500'
                  }`}
                >
                  <p className="font-semibold text-sm">{participant.name}</p>
                  <p className="text-xs text-gray-400">Atualizado em {formatDate(participant.lastUpdated)}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-gray-900 bg-opacity-60 border border-gray-800 rounded-2xl p-6 space-y-6">
            {!selectedParticipant ? (
              <div className="text-center text-gray-400">
                <p>Selecione um participante ao lado para ver os detalhes completos.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedParticipant.name}</h2>
                    <p className="text-sm text-gray-400">Data de Nascimento: {formatBirthDate(selectedParticipant.birthDate)}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full md:w-auto">
                    <div className="bg-gray-800/60 border border-blue-700 rounded-lg p-3 text-center">
                      <p className="text-xs uppercase text-gray-400">Pontuação Total</p>
                      <p className="text-xl font-bold">{selectedParticipant.totalScore}</p>
                    </div>
                    <div className="bg-gray-800/60 border border-green-700 rounded-lg p-3 text-center">
                      <p className="text-xs uppercase text-gray-400">Etapas Concluídas</p>
                      <p className="text-xl font-bold">
                        {selectedParticipant.completedStages}/{selectedParticipant.totalStages}
                      </p>
                    </div>
                    <div className="bg-gray-800/60 border border-purple-700 rounded-lg p-3 text-center">
                      <p className="text-xs uppercase text-gray-400">Tempo Total</p>
                      <p className="text-xl font-bold">{formatDuration(selectedParticipant.totalTimeMinutes)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-2">
                    <h3 className="text-lg font-semibold">Linhas do Tempo</h3>
                    <p className="text-sm text-gray-300">Início da Jornada: {formatDate(selectedParticipant.startedAt)}</p>
                    <p className="text-sm text-gray-300">Conclusão: {formatDate(selectedParticipant.completedAt)}</p>
                    <p className="text-xs text-gray-400">
                      O tempo total é calculado automaticamente quando o participante conclui a jornada.
                    </p>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-2">
                    <h3 className="text-lg font-semibold">Resumo Geral</h3>
                    <p className="text-sm text-gray-300">
                      Progresso Atual: {selectedParticipant.completedStages} de {selectedParticipant.totalStages} etapas concluídas.
                    </p>
                    <p className="text-sm text-gray-300">
                      Última atualização registrada em {formatDate(selectedParticipant.lastUpdated)}.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-800/40 border border-blue-900 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-3">Detalhes das Etapas</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                    {selectedParticipant.stages.map(stage => (
                      <div
                        key={stage.id}
                        className={`p-3 rounded-lg border ${stage.completed ? 'border-green-600 bg-green-600/10' : 'border-gray-700 bg-gray-800/60'}`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm">{stage.title}</p>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-900/60 border border-gray-700">
                            Pontos: {stage.score}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-300">
                          {stage.completed ? 'Reflexão Pessoal:' : 'Reflexão ainda não registrada.'}
                        </p>
                        {stage.completed && (
                          <p className="text-xs text-gray-400 whitespace-pre-wrap">
                            {stage.reflection || 'Nenhuma reflexão registrada.'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800/40 border border-purple-900 rounded-xl p-4">
                  <h3 className="text-lg font-semibold mb-3">Publicações e Diário Pessoal</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                    {selectedParticipant.posts.length === 0 ? (
                      <p className="text-sm text-gray-400">
                        Nenhuma publicação ou registro pessoal foi encontrado para este participante.
                      </p>
                    ) : (
                      selectedParticipant.posts.map(post => (
                        <div key={post.id} className="p-3 rounded-lg border border-purple-700 bg-purple-700/10">
                          <p className="text-sm text-gray-100 whitespace-pre-wrap">{post.message}</p>
                          <p className="mt-2 text-xs text-gray-400">Curtidas: {post.likes} · Comentários: {post.comments.length}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AnimatedScreen>
  );
};

export default AdminDashboardScreen;
