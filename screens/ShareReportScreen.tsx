import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Screen, StageProgress } from '../types';
import ActionButton from '../components/ActionButton';
import AnimatedScreen from '../components/AnimatedScreen';
import { useSound } from '../hooks/useSound';
import { SOUNDS } from '../constants';

const ShareReportScreen: React.FC = () => {
  const {
    userName,
    birthDate,
    totalScore,
    stageProgress,
    stagesData,
    posts,
    navigateTo,
  } = useAppContext();
  const [reportText, setReportText] = useState('');
  const [copyStatus, setCopyStatus] = useState('Copiar Relatório');

  const playCopySuccessSound = useSound(SOUNDS.COPY_SUCCESS.id, 0.5);
  const playCopyFailSound = useSound(SOUNDS.COPY_FAIL.id, 0.5);

  useEffect(() => {
    const userPosts = posts
      .filter(p => p.isUserPost)
      .map(p => `- ${p.message}`)
      .join('\n');

    const progressDetails = stagesData
      .map(stage => {
        const progress = stageProgress[stage.id] as StageProgress | undefined;
        if (!progress || !progress.completed) return null;
        return `
${stage.title}
- Pontuação: ${progress.score}
- Reflexão Pessoal: ${progress.reflection || 'Nenhuma reflexão registrada.'}
          `;
      })
      .filter(Boolean)
      .join('');

    const formattedBirthDate = birthDate 
      ? new Date(birthDate + 'T00:00:00').toLocaleDateString('pt-BR') 
      : 'Não informada';

    const report = `
RELATÓRIO DE PROGRESSO - IDENTIDADE EM CRISTO
================================================

INFORMAÇÕES DO PARTICIPANTE
---------------------------
Nome: ${userName}
Data de Nascimento: ${formattedBirthDate}

DESEMPENHO GERAL
----------------
Pontuação Total: ${totalScore}

PROGRESSO NAS ETAPAS
----------------------
${progressDetails.trim() || 'Nenhuma etapa concluída.'}

PUBLICAÇÕES NO MURAL DA COMUNIDATE
---------------------------------------
${userPosts || 'Nenhuma publicação feita.'}

================================================
Fim do Relatório.
`;

    setReportText(report.trim().replace(/^\s+/gm, ''));
  }, [userName, birthDate, totalScore, stageProgress, stagesData, posts]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 0);
    return () => clearTimeout(timerId);
  }, [copyStatus]);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText).then(
      () => {
        playCopySuccessSound();
        setCopyStatus('Copiado com Sucesso!');
        setTimeout(() => setCopyStatus('Copiar Relatório'), 3000);
      },
      () => {
        playCopyFailSound();
        setCopyStatus('Falha ao copiar!');
        setTimeout(() => setCopyStatus('Copiar Relatório'), 3000);
      },
    );
  };

  return (
    <AnimatedScreen>
      <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-3xl w-full text-white text-center border border-blue-700">
        <h1 className="text-3xl font-bold mb-3">Compartilhar Progresso</h1>
        <p className="text-gray-300 mb-6">
          Copie o relatório abaixo e envie para o administrador do estudo (Decleones Andrade) via WhatsApp ou outro meio de sua preferência.
        </p>

        <textarea
          readOnly
          value={reportText}
          className="w-full h-64 p-4 bg-gray-900 border-2 border-gray-700 rounded-lg text-sm font-mono text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <ActionButton
            onClick={handleCopy}
            className="bg-gradient-to-r from-green-500 to-teal-500 focus:ring-green-300"
          >
            <i
              data-lucide={copyStatus.startsWith('Copiado') ? 'check' : 'copy'}
              className="inline-block mr-2 w-5 h-5"
            ></i>
            {copyStatus}
          </ActionButton>
          <ActionButton
            onClick={() => navigateTo(Screen.Final)}
            className="bg-gradient-to-r from-gray-600 to-gray-800 focus:ring-gray-400"
          >
            Voltar
          </ActionButton>
        </div>
      </div>
    </AnimatedScreen>
  );
};

export default ShareReportScreen;