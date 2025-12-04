// hooks/useUserProfile.ts
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { UserProfile } from "../types";

const STORAGE_KEY = "identidade:userProfile";

const BASE_XP_PER_LEVEL = 200;

// Função para criar um perfil padrão
const createDefaultProfile = (userName: string | null, totalScore: number): UserProfile => {
  return {
    avatarDataUrl: null,
    favoriteVerse: "",
    favoriteMusicStyle: "",
    churchOrGroup: "",
    spiritualTitle: "Filho(a) Amado(a)",
    createdAt: new Date().toISOString(),

    totalScore,
    level: 1,
    nextLevelScore: BASE_XP_PER_LEVEL,
    medals: [],
    streakDays: 0,
  };
};

export const useUserProfile = () => {
  const { userName, totalScore } = useAppContext();
  const [profile, setProfile] = useState<UserProfile>(() =>
    createDefaultProfile(userName, totalScore)
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Carrega do localStorage ao iniciar / quando nome ou score mudam
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<UserProfile>;
        setProfile(prev => ({
          ...createDefaultProfile(userName, totalScore),
          ...parsed,
          totalScore: totalScore ?? parsed.totalScore ?? 0,
        }));
      } else {
        setProfile(createDefaultProfile(userName, totalScore));
      }
    } catch (error) {
      console.error("Erro ao carregar perfil do usuário:", error);
      setProfile(createDefaultProfile(userName, totalScore));
    } finally {
      setIsLoaded(true);
    }
  }, [userName, totalScore]);

  // Salva sempre que o perfil mudar
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error("Erro ao salvar perfil do usuário:", error);
    }
  }, [profile, isLoaded]);

  const updateProfile = (patch: Partial<UserProfile>) => {
    setProfile(prev => ({
      ...prev,
      ...patch,
    }));
  };

  return {
    profile,
    updateProfile,
    isLoaded,
  };
};
