// hooks/useDiary.ts
import { useEffect, useState } from "react";
import { DiaryEntry, DiaryEntryType } from "../types";

const STORAGE_KEY = "identidade:diaryEntries";

const createId = () => {
  // id simples: timestamp + random
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

export const useDiary = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar do localStorage ao iniciar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DiaryEntry[];
        setEntries(parsed);
      }
    } catch (error) {
      console.error("Erro ao carregar diário espiritual:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Salvar sempre que mudar
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error("Erro ao salvar diário espiritual:", error);
    }
  }, [entries, isLoaded]);

  const addEntry = (params: {
    type: DiaryEntryType;
    title: string;
    content: string;
    tags?: string[];
    challengeId?: string | null;
  }) => {
    const now = new Date().toISOString();
    const newEntry: DiaryEntry = {
      id: createId(),
      type: params.type,
      title: params.title,
      content: params.content,
      createdAt: now,
      updatedAt: now,
      tags: params.tags ?? [],
      challengeId: params.challengeId ?? null,
    };

    setEntries((prev) => [newEntry, ...prev]);
    return newEntry;
  };

  const updateEntry = (id: string, patch: Partial<DiaryEntry>) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e
      )
    );
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return {
    entries,
    addEntry,
    updateEntry,
    removeEntry,
    isLoaded,
  };
};
