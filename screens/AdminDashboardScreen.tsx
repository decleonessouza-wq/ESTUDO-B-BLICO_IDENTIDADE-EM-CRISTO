import React, { useEffect, useMemo, useState } from "react";
import AnimatedScreen from "../components/AnimatedScreen";
import ActionButton from "../components/ActionButton";
import { useAppContext } from "../context/AppContext";
import { getAllJourneys, getAllPosts } from "../firebase/adminService";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

type PhysicalRewardChoice = "yes" | "no" | null;
type AdminTab = "dashboard" | "posts" | "stages";
type DateFilter = "all" | "7" | "30" | "custom";

interface StageProgressSnapshot {
  score: number;
  reflection?: string;
  completed?: boolean;
}

interface JourneyDoc {
  id: string;
  userId: string;
  userName: string;
  birthDate?: string | null;
  stageProgress?: Record<string, StageProgressSnapshot>;
  currentStageId?: number;
  totalScore?: number;
  completedStages?: number;
  journeyStartAt?: any;
  completedAt?: any;
  totalTimeMinutes?: number | null;
  completedBonusGames?: string[];
  physicalRewardChoice?: PhysicalRewardChoice;
  updatedAt?: any;
}

interface AdminPost {
  id: string;
  userId: string;
  userName: string;
  message: string;
  createdAt?: any;
}

/* ========= HELPERS ========= */

const toDateSafe = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if ((value as any).toDate) {
    try {
      return (value as any).toDate();
    } catch {
      return null;
    }
  }
  return null;
};

const formatDate = (value: any, includeTime = true): string => {
  const d = toDateSafe(value);
  if (!d) return "—";
  return d.toLocaleString(
    "pt-BR",
    includeTime
      ? { dateStyle: "short", timeStyle: "short" }
      : { dateStyle: "short" }
  );
};

const formatDuration = (minutes: number | null | undefined): string => {
  if (!minutes || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return `${h}h ${m}m`;
};

const applyDateFilter = <T,>(
  items: T[],
  filter: DateFilter,
  start: string,
  end: string,
  getDate: (item: T) => Date | null
): T[] => {
  if (filter === "all") return items;

  let startDate: Date | null = null;
  let endDate: Date | null = null;
  const now = new Date();

  if (filter === "7") {
    startDate = new Date();
    startDate.setDate(now.getDate() - 7);
  } else if (filter === "30") {
    startDate = new Date();
    startDate.setDate(now.getDate() - 30);
  } else if (filter === "custom") {
    if (start) {
      const s = new Date(start);
      if (!isNaN(s.getTime())) startDate = s;
    }
    if (end) {
      const e = new Date(end);
      if (!isNaN(e.getTime())) {
        e.setHours(23, 59, 59, 999);
        endDate = e;
      }
    }
  }

  return items.filter((item) => {
    const d = getDate(item);
    if (!d) return false;
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  });
};

/* ========= COMPONENTE PRINCIPAL ========= */

const AdminDashboardScreen: React.FC = () => {
  const { exitAdmin } = useAppContext();

  const [loading, setLoading] = useState<boolean>(true);
  const [journeys, setJourneys] = useState<JourneyDoc[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [currentTab, setCurrentTab] = useState<AdminTab>("dashboard");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  const [postSearch, setPostSearch] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [journeysRaw, postsRaw] = await Promise.all([
        getAllJourneys(),
        getAllPosts(),
      ]);

      // Ordenar jornadas por updatedAt ou completedAt
      const normalizedJourneys: JourneyDoc[] = (journeysRaw as any[])
        .map((j: any) => ({
          ...j,
          id: j.userId || j.id,
        }))
        .sort((a: JourneyDoc, b: JourneyDoc) => {
          const da =
            toDateSafe(a.updatedAt || a.completedAt || a.journeyStartAt) ??
            new Date(0);
          const db =
            toDateSafe(b.updatedAt || b.completedAt || b.journeyStartAt) ??
            new Date(0);
          return db.getTime() - da.getTime();
        });

      const normalizedPosts: AdminPost[] = (postsRaw as any[]).map(
        (p: any) => ({
          ...p,
          id: p.id,
        })
      );

      setJourneys(normalizedJourneys);
      setPosts(normalizedPosts);

      if (normalizedJourneys.length > 0) {
        setSelectedUserId(normalizedJourneys[0].userId);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do painel admin:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ========= DERIVADOS / FILTROS ========= */

  const filteredJourneys = useMemo(() => {
    return applyDateFilter<JourneyDoc>(
      journeys,
      dateFilter,
      customStart,
      customEnd,
      (j) =>
        toDateSafe(j.updatedAt || j.completedAt || j.journeyStartAt) ?? null
    );
  }, [journeys, dateFilter, customStart, customEnd]);

  const filteredPosts = useMemo(() => {
    const byDate = applyDateFilter<AdminPost>(
      posts,
      dateFilter,
      customStart,
      customEnd,
      (p) => toDateSafe(p.createdAt)
    );

    if (!postSearch.trim()) return byDate;

    const search = postSearch.toLowerCase();
    return byDate.filter(
      (p) =>
        p.userName?.toLowerCase().includes(search) ||
        p.message?.toLowerCase().includes(search)
    );
  }, [posts, dateFilter, customStart, customEnd, postSearch]);

  const selectedJourney = useMemo(() => {
    if (!filteredJourneys.length) return null;
    if (selectedUserId) {
      const found = filteredJourneys.find(
        (j) => j.userId === selectedUserId
      );
      if (found) return found;
    }
    return filteredJourneys[0];
  }, [filteredJourneys, selectedUserId]);

  /* ========= MÉTRICAS ========= */

  const metrics = useMemo(() => {
    if (!filteredJourneys.length) {
      return {
        totalUsers: 0,
        avgScore: 0,
        completedCount: 0,
        avgTime: 0,
      };
    }

    const totalUsers = filteredJourneys.length;
    const totalScore = filteredJourneys.reduce(
      (sum, j) => sum + (j.totalScore ?? 0),
      0
    );
    const completed = filteredJourneys.filter((j) => j.completedAt).length;
    const totalTime = filteredJourneys.reduce(
      (sum, j) => sum + (j.totalTimeMinutes ?? 0),
      0
    );

    return {
      totalUsers,
      avgScore: Math.round(totalScore / totalUsers),
      completedCount: completed,
      avgTime: totalUsers ? Math.round(totalTime / totalUsers) : 0,
    };
  }, [filteredJourneys]);

  const ranking = useMemo(() => {
    return [...filteredJourneys]
      .sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0))
      .slice(0, 10);
  }, [filteredJourneys]);

  const stageAnalytics = useMemo(() => {
    const stats: {
      [stageId: string]: {
        stageId: number;
        totalScore: number;
        count: number;
        completedCount: number;
      };
    } = {};

    filteredJourneys.forEach((j) => {
      const sp = j.stageProgress || {};
      Object.entries(sp).forEach(([id, value]) => {
        const v = value as StageProgressSnapshot;
        if (!stats[id]) {
          stats[id] = {
            stageId: Number(id),
            totalScore: 0,
            count: 0,
            completedCount: 0,
          };
        }
        stats[id].totalScore += v.score ?? 0;
        stats[id].count += 1;
        if (v.completed) stats[id].completedCount += 1;
      });
    });

    const arr = Object.values(stats).sort(
      (a, b) => a.stageId - b.stageId
    );

    return arr.map((s) => ({
      ...s,
      avgScore: s.count ? Math.round(s.totalScore / s.count) : 0,
      completionRate: filteredJourneys.length
        ? Math.round((s.completedCount / filteredJourneys.length) * 100)
        : 0,
    }));
  }, [filteredJourneys]);

  /* ========= DADOS DOS GRÁFICOS ========= */

  const scoreBarData = useMemo(() => {
    const labels = filteredJourneys.map((j) => j.userName ?? "Sem nome");
    const values = filteredJourneys.map((j) => j.totalScore ?? 0);
    return {
      labels,
      datasets: [
        {
          label: "Pontuação total",
          data: values,
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 1,
        },
      ],
    };
  }, [filteredJourneys]);

  const completionPieData = useMemo(() => {
    const completed = filteredJourneys.filter(
      (j) => j.completedAt
    ).length;
    const inProgress = filteredJourneys.length - completed;
    return {
      labels: ["Concluída", "Em Andamento"],
      datasets: [
        {
          data: [completed, inProgress],
          backgroundColor: ["#22c55e", "#f97316"],
        },
      ],
    };
  }, [filteredJourneys]);

  const journeyLineData = useMemo(() => {
    const counts: Record<string, number> = {};

    filteredJourneys.forEach((j) => {
      const d = toDateSafe(
        j.journeyStartAt || j.updatedAt || j.completedAt
      );
      if (!d) return;
      const key = d.toISOString().slice(0, 10);
      counts[key] = (counts[key] ?? 0) + 1;
    });

    const labels = Object.keys(counts).sort();
    const values = labels.map((l) => counts[l]);

    return {
      labels,
      datasets: [
        {
          label: "Novas jornadas por dia",
          data: values,
          borderColor: "rgb(56, 189, 248)",
          tension: 0.4,
        },
      ],
    };
  }, [filteredJourneys]);

  /* ========= EXPORTAÇÕES ========= */

  const exportJourneysCsv = () => {
    const csv = Papa.unparse(
      filteredJourneys.map((j) => ({
        Nome: j.userName,
        Pontuacao: j.totalScore ?? 0,
        EtapasConcluidas: j.completedStages ?? 0,
        Inicio: formatDate(j.journeyStartAt, false),
        Conclusao: formatDate(j.completedAt, false),
        TempoTotalMinutos: j.totalTimeMinutes ?? 0,
      }))
    );
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blob, "relatorio_usuarios.csv");
  };

  const exportJourneysExcel = () => {
    const data = filteredJourneys.map((j) => ({
      Nome: j.userName,
      Pontuacao: j.totalScore ?? 0,
      EtapasConcluidas: j.completedStages ?? 0,
      Inicio: formatDate(j.journeyStartAt, false),
      Conclusao: formatDate(j.completedAt, false),
      TempoTotalMinutos: j.totalTimeMinutes ?? 0,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jornadas");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "relatorio_usuarios.xlsx");
  };

  const exportJourneysPdf = () => {
    const doc = new jsPDF();
    doc.text("Relatório Geral de Usuários", 14, 16);

    const rows = filteredJourneys.map((j) => [
      j.userName,
      j.totalScore ?? 0,
      j.completedStages ?? 0,
      formatDate(j.journeyStartAt, false),
      formatDate(j.completedAt, false),
      j.totalTimeMinutes ?? 0,
    ]);

    autoTable(doc, {
      head: [["Nome", "Pontuação", "Etapas", "Início", "Conclusão", "Tempo"]],
      body: rows,
      startY: 22,
    });

    doc.save("relatorio_usuarios.pdf");
  };

  const exportPostsCsv = () => {
    const csv = Papa.unparse(
      filteredPosts.map((p) => ({
        Usuario: p.userName,
        Mensagem: p.message,
        Data: formatDate(p.createdAt),
      }))
    );
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blob, "relatorio_posts.csv");
  };

  const exportPostsExcel = () => {
    const data = filteredPosts.map((p) => ({
      Usuario: p.userName,
      Mensagem: p.message,
      Data: formatDate(p.createdAt),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Posts");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "relatorio_posts.xlsx");
  };

  const exportPostsPdf = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Posts da Comunidade", 14, 16);

    const rows = filteredPosts.map((p) => [
      p.userName,
      p.message,
      formatDate(p.createdAt),
    ]);

    autoTable(doc, {
      head: [["Usuário", "Mensagem", "Data"]],
      body: rows,
      startY: 22,
    });

    doc.save("relatorio_posts.pdf");
  };

  /* ========= RENDER ========= */

  return (
    <AnimatedScreen>
      <div className="w-full max-w-7xl mx-auto text-white p-6 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">
              Painel Administrativo
            </h1>
            <p className="text-gray-300">
              Acompanhe o desempenho dos participantes e da jornada Identidade
              em Cristo.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ActionButton
              onClick={loadData}
              className="bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              Atualizar
            </ActionButton>
            <ActionButton
              onClick={exportJourneysCsv}
              className="bg-gradient-to-r from-amber-500 to-yellow-500"
            >
              CSV Usuários
            </ActionButton>
            <ActionButton
              onClick={exportJourneysExcel}
              className="bg-gradient-to-r from-emerald-500 to-green-600"
            >
              Excel Usuários
            </ActionButton>
            <ActionButton
              onClick={exportJourneysPdf}
              className="bg-gradient-to-r from-rose-500 to-red-600"
            >
              PDF Usuários
            </ActionButton>
            <ActionButton
              onClick={exitAdmin}
              className="bg-gradient-to-r from-gray-600 to-gray-800"
            >
              Sair
            </ActionButton>
          </div>
        </div>

        {/* FILTROS DE DATA */}
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setDateFilter("all")}
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                dateFilter === "all"
                  ? "bg-blue-600 border-blue-400"
                  : "border-gray-600 hover:border-blue-400"
              }`}
            >
              Tudo
            </button>
            <button
              onClick={() => setDateFilter("7")}
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                dateFilter === "7"
                  ? "bg-blue-600 border-blue-400"
                  : "border-gray-600 hover:border-blue-400"
              }`}
            >
              Últimos 7 dias
            </button>
            <button
              onClick={() => setDateFilter("30")}
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                dateFilter === "30"
                  ? "bg-blue-600 border-blue-400"
                  : "border-gray-600 hover:border-blue-400"
              }`}
            >
              Últimos 30 dias
            </button>
            <button
              onClick={() => setDateFilter("custom")}
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                dateFilter === "custom"
                  ? "bg-blue-600 border-blue-400"
                  : "border-gray-600 hover:border-blue-400"
              }`}
            >
              Personalizado
            </button>
          </div>

          {dateFilter === "custom" && (
            <div className="flex flex-wrap gap-2">
              <div className="flex flex-col">
                <label className="text-xs text-gray-400">Início</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-400">Fim</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
                />
              </div>
            </div>
          )}

          <div className="flex-1 flex justify-end">
            <p className="text-xs text-gray-400">
              Total filtrado: {filteredJourneys.length} participantes |{" "}
              {filteredPosts.length} posts
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 border-b border-gray-800 pb-2">
          <button
            onClick={() => setCurrentTab("dashboard")}
            className={`px-4 py-2 text-sm font-semibold rounded-t-xl border-b-2 ${
              currentTab === "dashboard"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setCurrentTab("posts")}
            className={`px-4 py-2 text-sm font-semibold rounded-t-xl border-b-2 ${
              currentTab === "posts"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Posts da Comunidade
          </button>
          <button
            onClick={() => setCurrentTab("stages")}
            className={`px-4 py-2 text-sm font-semibold rounded-t-xl border-b-2 ${
              currentTab === "stages"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Analytics das Etapas
          </button>
        </div>

        {loading && (
          <p className="text-center text-gray-400 mt-4">
            Carregando dados...
          </p>
        )}

        {!loading && currentTab === "dashboard" && (
          <div className="space-y-6">
            {/* CARDS RESUMO */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/70 border border-blue-700 rounded-xl p-4 text-center">
                <p className="text-xs uppercase tracking-widest text-gray-400">
                  Participantes
                </p>
                <p className="text-3xl font-bold mt-2">
                  {metrics.totalUsers}
                </p>
              </div>
              <div className="bg-gray-900/70 border border-green-700 rounded-xl p-4 text-center">
                <p className="text-xs uppercase tracking-widest text-gray-400">
                  Média de Pontuação
                </p>
                <p className="text-3xl font-bold mt-2">
                  {metrics.avgScore}
                </p>
              </div>
              <div className="bg-gray-900/70 border border-purple-700 rounded-xl p-4 text-center">
                <p className="text-xs uppercase tracking-widest text-gray-400">
                  Jornadas Concluídas
                </p>
                <p className="text-3xl font-bold mt-2">
                  {metrics.completedCount}
                </p>
              </div>
              <div className="bg-gray-900/70 border border-amber-700 rounded-xl p-4 text-center">
                <p className="text-xs uppercase tracking-widest text-gray-400">
                  Tempo Médio
                </p>
                <p className="text-3xl font-bold mt-2">
                  {formatDuration(metrics.avgTime)}
                </p>
              </div>
            </div>

            {/* GRID PRINCIPAL: LISTA + DETALHES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LISTA PARTICIPANTES */}
              <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-4 max-h-[520px] overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">
                  Participantes
                </h2>
                {filteredJourneys.length === 0 && (
                  <p className="text-sm text-gray-400">
                    Nenhum participante encontrado com o filtro atual.
                  </p>
                )}
                <div className="space-y-3">
                  {filteredJourneys.map((j) => (
                    <button
                      key={j.userId}
                      onClick={() => setSelectedUserId(j.userId)}
                      className={`w-full text-left p-3 rounded-xl border transition ${
                        selectedJourney?.userId === j.userId
                          ? "bg-blue-600/30 border-blue-400"
                          : "bg-gray-800/60 border-gray-700 hover:border-blue-400"
                      }`}
                    >
                      <p className="font-semibold">{j.userName}</p>
                      <p className="text-xs text-gray-400">
                        Início: {formatDate(j.journeyStartAt, false)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Pontos: {j.totalScore ?? 0} • Etapas concl.:{" "}
                        {j.completedStages ?? 0}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* DETALHES DO PARTICIPANTE + GRÁFICOS */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-4">
                  {!selectedJourney ? (
                    <p className="text-gray-400">
                      Selecione um participante à esquerda.
                    </p>
                  ) : (
                    <>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                        <div>
                          <h2 className="text-2xl font-bold">
                            {selectedJourney.userName}
                          </h2>
                          <p className="text-sm text-gray-400">
                            Jornada iniciada em{" "}
                            {formatDate(
                              selectedJourney.journeyStartAt,
                              false
                            )}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <div className="bg-gray-800/70 border border-blue-700 rounded-lg px-3 py-2 text-center">
                            <p className="text-xs text-gray-400">
                              Pontos
                            </p>
                            <p className="text-xl font-bold">
                              {selectedJourney.totalScore ?? 0}
                            </p>
                          </div>
                          <div className="bg-gray-800/70 border border-green-700 rounded-lg px-3 py-2 text-center">
                            <p className="text-xs text-gray-400">
                              Etapas
                            </p>
                            <p className="text-xl font-bold">
                              {selectedJourney.completedStages ?? 0}
                            </p>
                          </div>
                          <div className="bg-gray-800/70 border border-purple-700 rounded-lg px-3 py-2 text-center">
                            <p className="text-xs text-gray-400">
                              Tempo Total
                            </p>
                            <p className="text-xl font-bold">
                              {formatDuration(
                                selectedJourney.totalTimeMinutes
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-sm">
                          <h3 className="font-semibold mb-2">
                            Linha do Tempo
                          </h3>
                          <p>
                            Início:{" "}
                            {formatDate(
                              selectedJourney.journeyStartAt
                            )}
                          </p>
                          <p>
                            Conclusão:{" "}
                            {formatDate(selectedJourney.completedAt)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            O tempo total é calculado quando a jornada é
                            concluída.
                          </p>
                        </div>
                        <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-3 text-sm">
                          <h3 className="font-semibold mb-2">
                            Resumo Geral
                          </h3>
                          <p>
                            Etapas concluídas:{" "}
                            {selectedJourney.completedStages ?? 0}
                          </p>
                          <p>
                            Recompensa física:{" "}
                            {selectedJourney.physicalRewardChoice ===
                            "yes"
                              ? "Optou por receber"
                              : selectedJourney.physicalRewardChoice ===
                                "no"
                              ? "Não quis receber"
                              : "Não informado"}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* GRÁFICOS GERAIS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-3">
                    <h3 className="text-sm font-semibold mb-2">
                      Pontuação por usuário
                    </h3>
                    <div className="h-48">
                      <Bar
                        data={scoreBarData}
                        options={{
                          responsive: true,
                          plugins: { legend: { display: false } },
                          scales: {
                            x: { ticks: { color: "#9ca3af" } },
                            y: { ticks: { color: "#9ca3af" } },
                          },
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-3">
                    <h3 className="text-sm font-semibold mb-2">
                      Jornadas concluídas x em andamento
                    </h3>
                    <div className="h-48">
                      <Pie data={completionPieData} />
                    </div>
                  </div>
                  <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-3">
                    <h3 className="text-sm font-semibold mb-2">
                      Novas jornadas por dia
                    </h3>
                    <div className="h-48">
                      <Line
                        data={journeyLineData}
                        options={{
                          responsive: true,
                          plugins: { legend: { display: false } },
                          scales: {
                            x: { ticks: { color: "#9ca3af" } },
                            y: { ticks: { color: "#9ca3af" } },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* RANKING */}
                <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-4">
                  <h3 className="text-lg font-semibold mb-3">
                    Ranking de participantes (Top 10)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-400 text-left border-b border-gray-700">
                          <th className="py-2">#</th>
                          <th>Nome</th>
                          <th>Pontos</th>
                          <th>Etapas</th>
                          <th>Tempo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ranking.map((j, idx) => (
                          <tr
                            key={j.userId}
                            className="border-b border-gray-800 hover:bg-gray-800/60"
                          >
                            <td className="py-2 pr-2">
                              {idx === 0
                                ? "🥇"
                                : idx === 1
                                ? "🥈"
                                : idx === 2
                                ? "🥉"
                                : idx + 1}
                            </td>
                            <td>{j.userName}</td>
                            <td>{j.totalScore ?? 0}</td>
                            <td>{j.completedStages ?? 0}</td>
                            <td>{formatDuration(j.totalTimeMinutes)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA POSTS */}
        {!loading && currentTab === "posts" && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">
                  Visão geral dos posts
                </h2>
                <p className="text-gray-400 text-sm">
                  Todos os posts publicados no mural da comunidade, com
                  filtros e exportação.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  type="text"
                  placeholder="Buscar por usuário ou texto..."
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm"
                />
                <ActionButton
                  onClick={exportPostsCsv}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500"
                >
                  CSV Posts
                </ActionButton>
                <ActionButton
                  onClick={exportPostsExcel}
                  className="bg-gradient-to-r from-emerald-500 to-green-600"
                >
                  Excel Posts
                </ActionButton>
                <ActionButton
                  onClick={exportPostsPdf}
                  className="bg-gradient-to-r from-rose-500 to-red-600"
                >
                  PDF Posts
                </ActionButton>
              </div>
            </div>

            <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-4 max-h-[580px] overflow-y-auto space-y-3">
              {filteredPosts.length === 0 && (
                <p className="text-gray-400 text-sm">
                  Nenhum post encontrado com os filtros atuais.
                </p>
              )}

              {filteredPosts.map((p) => (
                <div
                  key={p.id}
                  className="border border-gray-700 rounded-xl p-3 bg-gray-800/60"
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold text-sm">
                      {p.userName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(p.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-100 whitespace-pre-wrap">
                    {p.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA ANALYTICS DAS ETAPAS */}
        {!loading && currentTab === "stages" && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">
                  Analytics das Etapas
                </h2>
                <p className="text-gray-400 text-sm">
                  Desempenho médio dos participantes em cada etapa da
                  jornada.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* TABELA ETAPAS */}
              <div className="lg:col-span-2 bg-gray-900/70 border border-gray-800 rounded-2xl p-4">
                <h3 className="text-lg font-semibold mb-3">
                  Resumo por etapa
                </h3>
                {stageAnalytics.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    Ainda não há dados suficientes para montar estatísticas
                    das etapas com o filtro atual.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-400 text-left border-b border-gray-700">
                          <th className="py-2">Etapa</th>
                          <th>Média de Pontos</th>
                          <th>Qtd. Usuários</th>
                          <th>Concluíram</th>
                          <th>Taxa de Conclusão</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stageAnalytics.map((s) => (
                          <tr
                            key={s.stageId}
                            className="border-b border-gray-800 hover:bg-gray-800/60"
                          >
                            <td className="py-2">{s.stageId}</td>
                            <td>{s.avgScore}</td>
                            <td>{s.count}</td>
                            <td>{s.completedCount}</td>
                            <td>{s.completionRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* GRÁFICOS DE ETAPAS */}
              <div className="space-y-4">
                <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-3">
                  <h3 className="text-sm font-semibold mb-2">
                    Média de pontos por etapa
                  </h3>
                  <div className="h-48">
                    <Bar
                      data={{
                        labels: stageAnalytics.map((s) => `Etapa ${s.stageId}`),
                        datasets: [
                          {
                            label: "Média de pontos",
                            data: stageAnalytics.map((s) => s.avgScore),
                            backgroundColor: "rgba(59, 130, 246, 0.5)",
                            borderColor: "rgb(59, 130, 246)",
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { ticks: { color: "#9ca3af" } },
                          y: { ticks: { color: "#9ca3af" } },
                        },
                      }}
                    />
                  </div>
                </div>

                <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-3">
                  <h3 className="text-sm font-semibold mb-2">
                    Conclusão por etapa
                  </h3>
                  <div className="h-48">
                    <Line
                      data={{
                        labels: stageAnalytics.map((s) => `Etapa ${s.stageId}`),
                        datasets: [
                          {
                            label: "% de conclusão",
                            data: stageAnalytics.map(
                              (s) => s.completionRate
                            ),
                            borderColor: "rgb(34, 197, 94)",
                            tension: 0.4,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { ticks: { color: "#9ca3af" } },
                          y: { ticks: { color: "#9ca3af" } },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatedScreen>
  );
};

export default AdminDashboardScreen;
