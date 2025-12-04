import React, { useEffect, useMemo, useRef } from "react";
import AnimatedScreen from "../components/AnimatedScreen";
import ActionButton from "../components/ActionButton";
import { useAppContext } from "../context/AppContext";
import { Screen, StageProgress } from "../types";

const ShareReportScreen: React.FC = () => {
  const {
    userName,
    totalScore,
    stageProgress,
    stagesData,
    completedBonusGames,
    posts,
    navigateTo,
  } = useAppContext();

  const reportRef = useRef<HTMLDivElement | null>(null);

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

  const myPosts = useMemo(
    () => (posts || []).filter((p) => p.isUserPost),
    [posts]
  );
  const myPostsCount = myPosts.length;
  const bestPostLikes =
    myPosts.length > 0
      ? myPosts.reduce((max, p) => Math.max(max, p.likes), 0)
      : 0;

  const today = new Date();
  const formattedDate = today.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const displayName = userName || "Participante";

  const summaryText = `RELATÓRIO DA JORNADA - IDENTIDADE EM CRISTO

Nome: ${displayName}
Progresso: ${progressPercent}% (${completedStagesCount}/${totalStages || "?"} etapas)
Pontuação total: ${totalScore ?? 0} pontos
Jogos bônus concluídos: ${bonusCount}
Posts no mural: ${myPostsCount}${
    bestPostLikes ? ` (post mais curtido: ${bestPostLikes} curtidas)` : ""
  }

Data: ${formattedDate}

"Aquele que começou boa obra em vós há de completá-la até o Dia de Cristo Jesus." (Filipenses 1:6)
`;

  useEffect(() => {
    const timerId = setTimeout(() => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 0);
    return () => clearTimeout(timerId);
  }, []);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      alert("Relatório copiado! Agora é só colar no WhatsApp ou onde quiser.");
    } catch (err) {
      console.error("Erro ao copiar texto:", err);
      alert("Não foi possível copiar o texto. Tente novamente.");
    }
  };

  const handleShareText = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Relatório da Jornada - Identidade em Cristo",
          text: summaryText,
        });
      } else {
        // fallback: abrir WhatsApp com o texto
        const url = `https://wa.me/?text=${encodeURIComponent(summaryText)}`;
        window.open(url, "_blank");
      }
    } catch (err) {
      console.error("Erro ao compartilhar:", err);
    }
  };

  const handleDownloadImage = async () => {
    try {
      const html2canvas = (window as any).html2canvas;
      if (!html2canvas) {
        alert(
          "Não foi possível gerar a imagem do relatório. Tente atualizar a página."
        );
        return;
      }

      if (!reportRef.current) return;

      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#020617",
        scale: 2,
      });

      canvas.toBlob((blob: Blob | null) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "relatorio-identidade-em-cristo.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (error) {
      console.error("Erro ao gerar imagem do relatório:", error);
      alert("Ocorreu um erro ao gerar a imagem. Tente novamente.");
    }
  };

  return (
    <AnimatedScreen>
      <div className="w-full max-w-3xl mx-auto px-4 flex flex-col items-center text-white">
        {/* CARD QUE VIROU IMAGEM */}
        <div
          ref={reportRef}
          className="w-full rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-sky-950 border border-sky-500/60 shadow-[0_0_60px_rgba(56,189,248,0.3)] px-6 py-7 md:px-8 md:py-9 relative overflow-hidden"
        >
          {/* glow de fundo */}
          <div className="pointer-events-none absolute inset-0 opacity-25 mix-blend-screen">
            <div className="absolute -top-24 -left-10 w-52 h-52 bg-sky-500 blur-3xl" />
            <div className="absolute -bottom-32 right-0 w-64 h-64 bg-emerald-500 blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-sky-300/80">
                  Relatório da Jornada
                </p>
                <h1 className="text-2xl md:text-3xl font-extrabold">
                  Identidade em Cristo
                </h1>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-400/60 flex items-center justify-center">
                <i
                  data-lucide="file-text"
                  className="w-6 h-6 text-emerald-300"
                />
              </div>
            </div>

            <p className="text-sm text-slate-200 mb-5">
              Este é o resumo da jornada de{" "}
              <span className="font-semibold text-sky-200">{displayName}</span>{" "}
              no estudo bíblico digital{" "}
              <span className="font-semibold">“Identidade em Cristo”</span>.
            </p>

            {/* métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs mb-5">
              <div className="bg-slate-900/80 border border-sky-500/60 rounded-xl px-3 py-3 text-center">
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

              <div className="bg-slate-900/80 border border-emerald-500/60 rounded-xl px-3 py-3 text-center">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Pontuação total
                </p>
                <p className="text-xl font-bold text-emerald-300">
                  {totalScore ?? 0}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Resultado dos quizzes e desafios
                </p>
              </div>

              <div className="bg-slate-900/80 border border-amber-500/60 rounded-xl px-3 py-3 text-center">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Jogos bônus
                </p>
                <p className="text-xl font-bold text-amber-300">
                  {bonusCount}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Desafios extras concluídos
                </p>
              </div>
            </div>

            {/* mural */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-5">
              <div className="bg-slate-900/80 border border-fuchsia-500/60 rounded-xl px-3 py-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Participação no mural
                </p>
                <p className="text-lg font-bold text-fuchsia-300">
                  {myPostsCount} publicações
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {myPostsCount > 0
                    ? "Compartilhou reflexões e bênçãos com a comunidade."
                    : "Ainda não publicou no mural (há tempo de começar!)."}
                </p>
              </div>

              <div className="bg-slate-900/80 border border-pink-500/60 rounded-xl px-3 py-3">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Alcance dos posts
                </p>
                <p className="text-lg font-bold text-pink-300">
                  {bestPostLikes} curtidas
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {bestPostLikes > 0
                    ? "Um dos posts recebeu várias curtidas e abençoou outras pessoas."
                    : "Quando publicar, outros poderão reagir e ser edificados."}
                </p>
              </div>
            </div>

            {/* rodapé do cartão */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-700 pt-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Data do relatório
                </p>
                <p className="text-sm text-slate-200">{formattedDate}</p>
              </div>
              <div className="text-sm text-slate-400 sm:text-right">
                <p>
                  “Aquele que começou boa obra em você é fiel para completá-la.”
                </p>
                <p className="text-[11px] mt-1">
                  Estudo Bíblico Digital &quot;Identidade em Cristo&quot;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AÇÕES */}
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:flex-wrap md:justify-center">
          <ActionButton onClick={handleCopyText}>
            <i
              data-lucide="clipboard-copy"
              className="inline-block mr-2 w-5 h-5"
            />
            Copiar texto do relatório
          </ActionButton>

          <ActionButton
            onClick={handleShareText}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 focus:ring-emerald-300"
          >
            <i
              data-lucide="share-2"
              className="inline-block mr-2 w-5 h-5"
            />
            Compartilhar com o líder
          </ActionButton>

          <ActionButton onClick={handleDownloadImage}>
            <i
              data-lucide="image-down"
              className="inline-block mr-2 w-5 h-5"
            />
            Baixar imagem do relatório
          </ActionButton>

          <ActionButton
            onClick={() => navigateTo(Screen.Final)}
            className="bg-gradient-to-r from-slate-600 to-slate-800 focus:ring-slate-400"
          >
            <i
              data-lucide="arrow-left"
              className="inline-block mr-2 w-5 h-5"
            />
            Voltar para a tela final
          </ActionButton>
        </div>
      </div>
    </AnimatedScreen>
  );
};

export default ShareReportScreen;
