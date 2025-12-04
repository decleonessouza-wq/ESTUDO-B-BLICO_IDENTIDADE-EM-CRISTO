import React, { useEffect, useState } from "react";
import AnimatedScreen from "../components/AnimatedScreen";
import ActionButton from "../components/ActionButton";
import { useAppContext } from "../context/AppContext";
import { Screen } from "../types";
import {
  savePrayerEntryToFirestore,
  PrayerCategoryFirestore,
} from "../firebase/prayerService";

type PrayerType = "pedido" | "agradecimento" | "resposta";

type DiaryCategory =
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

const PrayerScreen: React.FC = () => {
  // 🔹 agora também pegamos userId para salvar no Firebase
  const { userName, userId, navigateTo } = useAppContext();

  const [prayerType, setPrayerType] = useState<PrayerType>("pedido");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if ((window as any).lucide) {
        (window as any).lucide.createIcons();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const mapPrayerTypeToCategory = (t: PrayerType): DiaryCategory => {
    switch (t) {
      case "pedido":
        return "pedidoOracao";
      case "agradecimento":
        return "agradecimento";
      case "resposta":
        return "respostaOracao";
      default:
        return "pedidoOracao";
    }
  };

  const handleSavePrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSaving(true);
    setFeedback(null);

    const trimmed = text.trim();
    const category = mapPrayerTypeToCategory(prayerType);
    const createdAtIso = new Date().toISOString();

    try {
      // 🔹 1) Atualiza DIÁRIO LOCAL (mesmo comportamento de antes)
      let current: DiaryEntry[] = [];
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        current = JSON.parse(raw) as DiaryEntry[];
      }

      const newEntry: DiaryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        category,
        text: trimmed,
        createdAt: createdAtIso,
      };

      const updated = [newEntry, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // 🔹 2) Se tiver userId, manda uma CÓPIA para o Firebase
      if (userId) {
        try {
          await savePrayerEntryToFirestore({
            userId,
            userName: userName || "Participante",
            category: category as PrayerCategoryFirestore,
            text: trimmed,
            source: "prayerScreen",
          });
        } catch (err) {
          console.error("Erro ao salvar oração no Firestore:", err);
          // Não quebramos a experiência do usuário se o Firebase falhar
        }
      }

      setText("");
      setFeedback(
        "Sua oração foi registrada no Diário Espiritual deste dispositivo."
      );
    } catch (err) {
      console.error("Erro ao registrar oração:", err);
      setFeedback(
        "Ocorreu um erro ao registrar sua oração. Tente novamente mais tarde."
      );
    } finally {
      setSaving(false);
    }
  };

  const displayName = userName || "Participante";

  return (
    <AnimatedScreen>
      <div className="w-full max-w-3xl mx-auto px-4 py-6 text-white">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-sky-300">
              Momento de Oração
            </p>
            <h1 className="text-2xl md:text-3xl font-bold">
              Fale com Deus e registre
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Aqui você pode anotar pedidos, agradecimentos e respostas de
              oração. Tudo vai para o seu Diário Espiritual neste dispositivo e,
              se você estiver logado, também é registrado no painel do líder.
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

        <div className="bg-slate-900/80 border border-sky-500/40 rounded-2xl p-4 md:p-6 shadow-xl shadow-sky-500/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-300">
                Deus está ouvindo, {displayName}. Use esse espaço para registrar
                o que está no seu coração.
              </p>
            </div>
            <ActionButton onClick={() => navigateTo(Screen.SpiritualDiary)}>
              Ver Diário Espiritual
            </ActionButton>
          </div>

          <form onSubmit={handleSavePrayer} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Tipo de oração
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPrayerType("pedido")}
                  className={`rounded-full px-2 py-1 border transition ${
                    prayerType === "pedido"
                      ? "bg-sky-600 border-sky-300 text-white"
                      : "bg-slate-800 border-slate-600 text-slate-200"
                  }`}
                >
                  Pedir oração
                </button>
                <button
                  type="button"
                  onClick={() => setPrayerType("agradecimento")}
                  className={`rounded-full px-2 py-1 border transition ${
                    prayerType === "agradecimento"
                      ? "bg-emerald-600 border-emerald-300 text-white"
                      : "bg-slate-800 border-slate-600 text-slate-200"
                  }`}
                >
                  Agradecer
                </button>
                <button
                  type="button"
                  onClick={() => setPrayerType("resposta")}
                  className={`rounded-full px-2 py-1 border transition ${
                    prayerType === "resposta"
                      ? "bg-amber-600 border-amber-300 text-white"
                      : "bg-slate-800 border-slate-600 text-slate-200"
                  }`}
                >
                  Resposta de oração
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Escreva sua oração
              </label>
              <textarea
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Coloque diante de Deus o que está no seu coração..."
                className="w-full rounded-lg bg-slate-800/80 border border-slate-600 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-slate-400">
                As orações são salvas neste dispositivo e, se você estiver
                logado, também registradas no banco de dados seguro do projeto.
              </p>
              <ActionButton type="submit" disabled={!text.trim() || saving}>
                {saving ? "Salvando..." : "Registrar Oração"}
              </ActionButton>
            </div>

            {feedback && (
              <p className="text-xs mt-2 text-sky-200">{feedback}</p>
            )}
          </form>
        </div>
      </div>
    </AnimatedScreen>
  );
};

export default PrayerScreen;
