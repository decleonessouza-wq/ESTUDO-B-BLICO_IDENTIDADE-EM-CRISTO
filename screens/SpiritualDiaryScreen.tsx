import React, { useEffect, useState } from "react";
import AnimatedScreen from "../components/AnimatedScreen";
import ActionButton from "../components/ActionButton";
import { useAppContext } from "../context/AppContext";
import { Screen } from "../types";

// 🔥 Firestore
import { addDoc, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import { journalCollection } from "../firebase/firebase";

type DiaryCategory =
  | "desabafo"
  | "oqueDeusFalou"
  | "metaPessoal"
  | "caminhada"
  | "pedidoOracao"
  | "agradecimento"
  | "respostaOracao";

interface DiaryEntry {
  id: string;
  category: DiaryCategory;
  text: string;
  createdAt: string;
}

const STORAGE_KEY = "identidade:spiritualDiary";

const SpiritualDiaryScreen: React.FC = () => {
  const { userName, userId, navigateTo } = useAppContext();

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [category, setCategory] = useState<DiaryCategory>("oqueDeusFalou");
  const [text, setText] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // 1) carrega do localStorage (offline primeiro)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as DiaryEntry[];
      setEntries(parsed);
    } catch (err) {
      console.error("Erro ao carregar diário espiritual:", err);
    }
  }, []);

  // 2) tenta sincronizar com Firestore (se tiver userId)
  useEffect(() => {
    const loadFromFirestore = async () => {
      if (!userId) return;

      setIsSyncing(true);
      try {
        const q = query(
          journalCollection,
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);
        const firebaseEntries: DiaryEntry[] = snap.docs.map((doc) => {
          const data = doc.data() as any;
          const created =
            data.createdAt?.toDate?.() instanceof Date
              ? data.createdAt.toDate()
              : new Date();

          return {
            id: doc.id,
            category: (data.category as DiaryCategory) ?? "oqueDeusFalou",
            text: data.text ?? "",
            createdAt: created.toISOString(),
          };
        });

        if (firebaseEntries.length > 0) {
          setEntries(firebaseEntries);
          // mantém o cache local alinhado com o que veio do Firestore
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(firebaseEntries));
          } catch (err) {
            console.error("Erro ao salvar cache local do diário:", err);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar diário no Firestore:", err);
      } finally {
        setIsSyncing(false);
      }
    };

    loadFromFirestore();
  }, [userId]);

  // 3) salva no localStorage sempre que entries mudar (cache/offline)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (err) {
      console.error("Erro ao salvar diário espiritual:", err);
    }
  }, [entries]);

  // 4) lucide icons
  useEffect(() => {
    const timerId = setTimeout(() => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 0);
    return () => clearTimeout(timerId);
  }, []);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newEntry: DiaryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      category,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    // atualiza UI + cache local imediatamente
    setEntries((prev) => [newEntry, ...prev]);
    setText("");

    // tenta enviar para Firestore (não bloqueia a UI)
    if (!userId) {
      // sem userId, mantemos só local, como já funcionava antes
      return;
    }

    try {
      await addDoc(journalCollection, {
        userId,
        userName: userName || "Anônimo",
        category: newEntry.category,
        text: newEntry.text,
        createdAt: Timestamp.now(),
      });
    } catch (err) {
      // em modo offline ou erro de rede, só loga: o dado já está salvo localmente
      console.error("Erro ao salvar entrada do diário no Firestore:", err);
    }
  };

  const labelForCategory = (c: DiaryCategory): string => {
    switch (c) {
      case "desabafo":
        return "Desabafo";
      case "oqueDeusFalou":
        return "O que Deus falou comigo";
      case "metaPessoal":
        return "Meta pessoal";
      case "caminhada":
        return "Caminhada com Cristo";
      case "pedidoOracao":
        return "Pedido de oração";
      case "agradecimento":
        return "Agradecimento";
      case "respostaOracao":
        return "Resposta de oração";
      default:
        return c;
    }
  };

  const displayName = userName || "Participante";

  return (
    <AnimatedScreen>
      <div className="w-full max-w-3xl mx-auto px-4 py-6 text-white">
        {/* cabeçalho */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-300">
              Diário Espiritual
            </p>
            <h1 className="text-2xl md:text-3xl font-bold">
              Eu e Deus: anotações da jornada
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Só você vê esse espaço. Use para desabafar, registrar o que Deus
              falou, metas e orações.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo(Screen.Final)}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-800 border border-slate-600 hover:bg-slate-700 transition"
          >
            Voltar ao Certificado
          </button>
        </div>

        {/* card principal */}
        <div className="bg-slate-900/80 border border-emerald-500/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-emerald-500/20">
          {/* info topo */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs text-slate-400">Diário de</p>
              <p className="text-lg font-semibold text-emerald-100">
                {displayName}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <i data-lucide="lock" className="w-4 h-4 text-emerald-300" />
              <span>
                Somente você tem acesso a esse conteúdo neste dispositivo
              </span>
            </div>
          </div>

          {/* hint de sincronização */}
          {isSyncing && (
            <p className="text-[11px] text-emerald-200 mb-2">
              Sincronizando com o servidor...
            </p>
          )}

          {/* formulário */}
          <form
            onSubmit={handleAddEntry}
            className="mb-5 grid grid-cols-1 gap-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-[180px,1fr] gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Tipo de anotação
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as DiaryCategory)
                  }
                  className="w-full rounded-lg bg-slate-800/80 border border-slate-600 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="desabafo">Desabafo</option>
                  <option value="oqueDeusFalou">
                    O que Deus falou comigo
                  </option>
                  <option value="metaPessoal">Meta pessoal</option>
                  <option value="caminhada">Caminhada com Cristo</option>
                  <option value="pedidoOracao">Pedido de oração</option>
                  <option value="agradecimento">Agradecimento</option>
                  <option value="respostaOracao">Resposta de oração</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Escreva aqui
                </label>
                <textarea
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Abra o coração diante de Deus..."
                  className="w-full rounded-lg bg-slate-800/80 border border-slate-600 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <ActionButton type="submit" disabled={!text.trim()}>
                Registrar no Diário
              </ActionButton>
            </div>
          </form>

          {/* lista de anotações */}
          {entries.length === 0 ? (
            <div className="border border-dashed border-slate-600 rounded-xl p-4 text-center text-sm text-slate-400">
              <p>
                Nenhuma anotação ainda. Comece escrevendo algo que Deus falou,
                um desabafo ou um pedido de oração.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {entries.map((entry) => {
                const date = new Date(entry.createdAt);
                const formatted = date.toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={entry.id}
                    className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-200 border border-emerald-400/40 text-[10px] font-semibold">
                        {labelForCategory(entry.category)}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {formatted}
                      </span>
                    </div>
                    <p className="text-slate-100 whitespace-pre-wrap">
                      {entry.text}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AnimatedScreen>
  );
};

export default SpiritualDiaryScreen;
