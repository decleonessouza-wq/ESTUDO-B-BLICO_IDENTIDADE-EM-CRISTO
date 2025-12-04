import React, { useEffect, useMemo, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import AnimatedScreen from "../components/AnimatedScreen";
import ActionButton from "../components/ActionButton";
import { Screen, StageProgress } from "../types";
import AchievementsPanel from "../components/AchievementsPanel";
import PlayerStatusBar from "../components/PlayerStatusBar";
import { useSound } from "../hooks/useSound";
import { SOUNDS } from "../constants";

const FinalScreen: React.FC = () => {
  const {
    userName,
    resetJourney,
    navigateTo,
    markJourneyCompleted,
    totalScore,
    stageProgress,
    stagesData,
    completedBonusGames,
  } = useAppContext();

  // 🔊 sons
  const playClickSound = useSound(SOUNDS.CLICK.id, 0.3);
  const playFinalSound = useSound(SOUNDS.STAGE_COMPLETE.id, 0.5);

  // 🔹 Referência para "fotografar" o certificado
  const certificateRef = useRef<HTMLDivElement | null>(null);

  const completedStagesCount = useMemo(
    () =>
      Object.values(stageProgress || {}).filter(
        (p) => (p as StageProgress).completed
      ).length,
    [stageProgress]
  );

  const totalStages = stagesData?.length ?? 0;
  const progressPercent =
    totalStages > 0
      ? Math.round((completedStagesCount / totalStages) * 100)
      : 0;

  const bonusCount = completedBonusGames?.length ?? 0;

  const today = new Date();
  const formattedDate = today.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const firstName = userName ? userName.split(" ")[0] : "Participante";

  // 🔹 Marca jornada concluída e inicializa ícones
  useEffect(() => {
    markJourneyCompleted();

    const timerId = setTimeout(() => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 0);

    return () => clearTimeout(timerId);
  }, [markJourneyCompleted]);

  // 🔊 Toca o som de conclusão uma vez quando essa tela entra
  useEffect(() => {
    try {
      playFinalSound();
    } catch (e) {
      console.warn("Falha ao tocar som final:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔹 Baixar o certificado como imagem PNG
  const handleDownloadCertificate = async () => {
    playClickSound();

    try {
      const html2canvas = (window as any).html2canvas;
      if (!html2canvas) {
        console.error(
          "html2canvas não encontrado em window. Verifique se o script está sendo carregado."
        );
        alert(
          "Não foi possível gerar a imagem do certificado. Tente atualizar a página ou falar com o administrador."
        );
        return;
      }

      if (!certificateRef.current) return;

      const canvas = await html2canvas(certificateRef.current, {
        backgroundColor: "#020617",
        scale: 2,
      });

      canvas.toBlob((blob: Blob | null) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "certificado-identidade-em-cristo.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (error) {
      console.error("Erro ao gerar certificado:", error);
      alert(
        "Ocorreu um erro ao gerar o certificado. Tente novamente ou fale com o administrador."
      );
    }
  };

  const handleResetJourney = () => {
    playClickSound();
    resetJourney();
  };

  const handleGoToCommunityWall = () => {
    playClickSound();
    navigateTo(Screen.CommunityWall);
  };

  const handleGoToShareReport = () => {
    playClickSound();
    navigateTo(Screen.ShareReport);
  };

  const handleGoToSpiritualDiary = () => {
    playClickSound();
    navigateTo(Screen.SpiritualDiary);
  };

  const handleGoToPrayerCenter = () => {
    playClickSound();
    navigateTo(Screen.PrayerCenter);
  };

  return (
    <AnimatedScreen>
      <div className="w-full flex justify-center px-4">
        {/* 🔹 Tudo dentro desse card será "fotografado" */}
        <div
          ref={certificateRef}
          className="bg-gradient-to-br from-slate-900 via-slate-950 to-sky-950 bg-opacity-90 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-[0_0_80px_rgba(59,130,246,0.45)] max-w-3xl w-full text-white border border-sky-500/60 relative overflow-hidden"
        >
          {/* brilho de fundo */}
          <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-screen">
            <div className="absolute -top-32 -left-10 w-64 h-64 bg-sky-500 blur-3xl" />
            <div className="absolute -bottom-40 right-0 w-72 h-72 bg-emerald-500 blur-3xl" />
          </div>

          {/* topo / selo */}
          <div className="relative flex flex-col items-center mb-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-16 w-16 rounded-full bg-emerald-500/15 border border-emerald-400/70 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <i
                  data-lucide="shield-check"
                  className="w-9 h-9 text-emerald-300"
                />
              </div>
              <div className="text-left">
                <p className="text-[11px] uppercase tracking-[0.25em] text-sky-300/80">
                  Certificado de Jornada
                </p>
                <h1 className="text-2xl md:text-3xl font-extrabold">
                  Identidade em Cristo
                </h1>
              </div>
            </div>

            <p className="text-sm text-slate-300 max-w-xl text-center">
              Este certificado reconhece que{" "}
              <span className="font-semibold text-sky-200">
                {userName || "este participante"}
              </span>{" "}
              concluiu a jornada bíblica de descoberta da sua identidade em
              Cristo, respondendo às reflexões, estudos e desafios propostos.
            </p>
          </div>

          {/* bloco central */}
          <div className="relative mt-6 mb-6 rounded-2xl border border-slate-600/60 bg-slate-900/60 px-4 py-5 md:px-6 md:py-6">
            {/* nome central */}
            <div className="mb-4 text-center">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-1">
                Concedido a
              </p>
              <p className="text-2xl md:text-3xl font-semibold text-sky-200">
                {userName || "Nome do Participante"}
              </p>
            </div>

            {/* frase de identidade */}
            <div className="mb-5 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-300 mb-2">
                Minha identidade em Cristo
              </p>
              <p className="text-lg md:text-xl font-semibold text-slate-50">
                “Em Cristo, eu sou escolhido(a), amado(a), perdoado(a) e
                enviado(a) para viver o propósito de Deus.”
              </p>
            </div>

            {/* versículo chave */}
            <div className="bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-center mb-5">
              <p className="text-sm italic text-slate-200">
                “Assim que, se alguém está em Cristo, nova criatura é; as coisas
                velhas já passaram; eis que tudo se fez novo.”
              </p>
              <p className="text-[11px] mt-1 text-slate-400 font-semibold tracking-wide">
                2 Coríntios 5:17
              </p>
            </div>

            {/* métricas da jornada */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mt-2">
              <div className="bg-slate-900/80 border border-sky-500/50 rounded-xl px-3 py-3 text-center">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Progresso geral
                </p>
                <p className="text-xl font-bold text-sky-300">
                  {progressPercent}%
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {completedStagesCount}/{totalStages || "?"} etapas concluídas
                </p>
              </div>

              <div className="bg-slate-900/80 border border-emerald-500/50 rounded-xl px-3 py-3 text-center">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Pontuação total
                </p>
                <p className="text-xl font-bold text-emerald-300">
                  {totalScore ?? 0}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Resultado dos quizzes e desafios bíblicos
                </p>
              </div>

              <div className="bg-slate-900/80 border border-amber-500/50 rounded-xl px-3 py-3 text-center">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Desafios bônus
                </p>
                <p className="text-xl font-bold text-amber-300">
                  {bonusCount}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Jogos e experiências extras concluídas
                </p>
              </div>
            </div>
          </div>

          {/* rodapé do certificado */}
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 border-t border-slate-700 pt-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                Data de conclusão
              </p>
              <p className="text-sm text-slate-200">{formattedDate}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                “Quem te chamou é fiel para completar a boa obra em você.”
              </p>
            </div>

            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">
                Assinatura espiritual
              </p>
              <p className="text-sm text-slate-200 font-semibold">
                {firstName} — Filho(a) de Deus
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Certificado gerado pelo Estudo Bíblico Digital &quot;Identidade
                em Cristo&quot;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Ações finais (fora do ref, mas na mesma tela) */}
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-center md:gap-4 px-4">
        <ActionButton onClick={handleDownloadCertificate}>
          Baixar Certificado como Imagem
        </ActionButton>
        <ActionButton onClick={handleResetJourney}>
          Refazer o Estudo
        </ActionButton>
        <ActionButton
          onClick={handleGoToCommunityWall}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 focus:ring-teal-300"
        >
          Visitar Mural da Comunidade
        </ActionButton>
        <ActionButton
          onClick={handleGoToShareReport}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 focus:ring-purple-300"
        >
          <i
            data-lucide="share-2"
            className="inline-block mr-2 w-5 h-5"
          />
          Compartilhar Relatório
        </ActionButton>
      </div>

      {/* 🔹 Blocos extra: Diário, Desafios, Oração */}
      <div className="mt-6 w-full max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-emerald-500/60 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-emerald-500/20">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <i data-lucide="book-open" className="w-5 h-5 text-emerald-300" />
              <h3 className="text-sm font-semibold text-emerald-200">
                Diário Espiritual
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Registre o que Deus falou com você, desabafos, metas e passos na fé.
              Só você vê esse diário. 💚
            </p>
          </div>
          <ActionButton
            onClick={handleGoToSpiritualDiary}
            className="mt-3 bg-gradient-to-r from-emerald-500 to-teal-500 focus:ring-emerald-300 text-xs"
          >
            Abrir Diário
          </ActionButton>
        </div>

        <div className="bg-slate-900/80 border border-amber-500/60 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-amber-500/20">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <i data-lucide="target" className="w-5 h-5 text-amber-300" />
              <h3 className="text-sm font-semibold text-amber-200">
                Desafios Semanais
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Pratique sua fé com desafios simples: escrever para Deus, agradecer
              alguém, compartilhar um versículo no mural. 🎯
            </p>
          </div>
          <ActionButton
            onClick={handleGoToSpiritualDiary}
            className="mt-3 bg-gradient-to-r from-amber-500 to-orange-500 focus:ring-amber-300 text-xs"
          >
            Ver Desafios
          </ActionButton>
        </div>

        <div className="bg-slate-900/80 border border-sky-500/60 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-sky-500/20">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <i data-lucide="hands" className="w-5 h-5 text-sky-300" />
              <h3 className="text-sm font-semibold text-sky-200">
                Botão de Oração
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Peça oração, agradeça ou registre respostas de oração. Tudo fica
              guardado no seu diário espiritual. 🙏
            </p>
          </div>
          <ActionButton
            onClick={handleGoToPrayerCenter}
            className="mt-3 bg-gradient-to-r from-sky-500 to-indigo-500 focus:ring-sky-300 text-xs"
          >
            Abrir Central de Oração
          </ActionButton>
        </div>
      </div>

      {/* 🔹 Rodapé gamificado: conquistas + HUD do jogador (inline, não fixo) */}
      <div className="mt-6 w-full max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <AchievementsPanel />
        <PlayerStatusBar fixed={false} />
      </div>
    </AnimatedScreen>
  );
};

export default FinalScreen;
