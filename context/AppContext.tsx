import { addCommunityPost, listenToPosts } from "../firebase/postsService";

// Fix: Implement the AppContext to manage global state
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { GoogleGenAI, Type } from "@google/genai";
// Fix: Import StageProgress from types.ts to make it available in this context
import {
  Screen,
  StageData,
  Post,
  StageProgress,
  Comment,
  ParticipantSummary,
  StageSnapshot,
  BonusGameId,
} from "../types";
import { getStagesData } from "../constants";

// 🔥 Novo: integração com Firestore para salvar jornada
import { saveJourney, JourneyDocument } from "../firebase/journeyService";

// ⚠️ Mantendo a constante da API, mas não vamos mais usar nas funções de login/register
const API_URL = "http://localhost:4001/api";

const LOCAL_STORAGE_KEY = "identidadeCristoProgress";
const USER_STORAGE_KEY = "identidadeCristoUser";
const ADMIN_PARTICIPANTS_KEY = "identidadeCristoParticipants";

interface UserData {
  userId: string | null;
  token: string | null;
  isAdmin: boolean;
}

interface AppState {
  userName: string;
  birthDate: string | null;
  photo: string | null;
  stageProgress: Record<number, StageProgress>;
  currentStageId: number;
  posts: Post[];
  userId: string | null;
  token: string | null;
  isAdmin: boolean;
  isLoaded: boolean;
  completedAt: string | null;
  journeyStartAt: string | null;
  totalTimeMinutes: number | null;
  completedBonusGames: BonusGameId[];
  physicalRewardChoice: "yes" | "no" | null;
}

interface AppContextType extends AppState {
  currentScreen: Screen;
  navigateTo: (screen: Screen) => void;
  setUserName: (name: string) => void;
  setBirthDate: (date: string | null) => void;
  setPhoto: (photo: string | null) => void;
  stagesData: StageData[];
  updateStageProgress: (
    stageId: number,
    score: number,
    reflection: string
  ) => void;
  setCurrentStageId: (id: number) => void;
  totalScore: number;
  resetJourney: () => void;
  addPost: (message: string) => void;
  toggleLike: (id: number) => void;
  addComment: (postId: number, message: string) => void;
  loadingPosts: boolean;
  isAudioUnlocked: boolean;
  unlockAudio: () => void;
  bgmUrls: string[];
  setBgmUrls: (urls: string[]) => void;

  // API / autenticação
  login: (name: string, birthDate: string) => Promise<boolean>;
  register: (name: string, birthDate: string) => Promise<boolean>;
  loginAdmin: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
  markJourneyStart: () => void;
  markJourneyCompleted: () => void;
  getAdminParticipants: () => ParticipantSummary[];
  exitAdmin: () => void;
  markBonusGameAsComplete: (gameId: BonusGameId) => void;
  setPhysicalRewardChoice: (choice: "yes" | "no" | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const loadInitialState = (): AppState => {
  // Carrega o progresso da jornada (posts, stages)
  const savedProgress = localStorage.getItem(LOCAL_STORAGE_KEY);
  // Carrega o estado do usuário (auth)
  const savedUser = localStorage.getItem(USER_STORAGE_KEY);

  let progressData: Partial<AppState> = {};
  let userData: UserData = { userId: null, token: null, isAdmin: false };

  try {
    if (savedProgress) {
      progressData = JSON.parse(savedProgress);
    }
  } catch (error) {
    console.error("Failed to parse progress data from localStorage", error);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  try {
    if (savedUser) {
      userData = JSON.parse(savedUser);
    }
  } catch (error) {
    console.error("Failed to parse user data from localStorage", error);
    localStorage.removeItem(USER_STORAGE_KEY);
  }

  return {
    userName: progressData.userName || (userData.isAdmin ? "Admin" : ""),
    birthDate: progressData.birthDate || null,
    photo: progressData.photo || null,
    stageProgress: progressData.stageProgress || {},
    currentStageId: progressData.currentStageId || 1,
    posts: progressData.posts || [],
    userId: userData.userId,
    token: userData.token,
    isAdmin: userData.isAdmin,
    isLoaded: true,
    completedAt: progressData.completedAt || null,
    journeyStartAt: progressData.journeyStartAt || null,
    totalTimeMinutes: progressData.totalTimeMinutes ?? null,
    completedBonusGames: progressData.completedBonusGames || [],
    physicalRewardChoice: progressData.physicalRewardChoice ?? null,
  };
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [initialState] = useState(loadInitialState);

  const [currentScreen, setCurrentScreen] = useState<Screen>(
    Screen.SplashScreen
  );

  const [userName, setUserName] = useState(initialState.userName);
  const [birthDate, setBirthDate] = useState<string | null>(
    initialState.birthDate
  );
  const [photo, setPhoto] = useState<string | null>(initialState.photo);
  const [stageProgress, setStageProgress] = useState<
    Record<number, StageProgress>
  >(initialState.stageProgress);
  const [currentStageId, setCurrentStageId] = useState(
    initialState.currentStageId
  );
  const [posts, setPosts] = useState<Post[]>(initialState.posts);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [bgmUrls, setBgmUrls] = useState<string[]>([]);
  const [completedBonusGames, setCompletedBonusGames] = useState<
    Set<BonusGameId>
  >(() => new Set(initialState.completedBonusGames));
  const [physicalRewardChoice, setPhysicalRewardChoiceState] = useState<
    "yes" | "no" | null
  >(initialState.physicalRewardChoice ?? null);

  const [userId, setUserId] = useState<string | null>(initialState.userId);
  const [token, setToken] = useState<string | null>(initialState.token);
  const [isAdmin, setIsAdmin] = useState<boolean>(initialState.isAdmin);
  const [isLoaded, setIsLoaded] = useState<boolean>(initialState.isLoaded);
  const [completedAt, setCompletedAt] = useState<string | null>(
    initialState.completedAt
  );
  const [journeyStartAt, setJourneyStartAt] = useState<string | null>(
    initialState.journeyStartAt || null
  );
  const [totalTimeMinutes, setTotalTimeMinutes] = useState<number | null>(
    initialState.totalTimeMinutes ?? null
  );

  const stagesData = useMemo(() => getStagesData(), []);

  // 🔥 Função auxiliar: gerar userId local se não existir
  const ensureUserId = useCallback(
    (name: string, date: string | null): string => {
      if (userId) return userId;
      const base = `${name || "user"}_${date || "no-date"}`.toLowerCase();
      const clean = base.replace(/\s+/g, "_");
      setUserId(clean);
      return clean;
    },
    [userId]
  );

  // 🔥 Sincronizar jornada com Firestore sempre que algo importante mudar
  useEffect(() => {
    const syncToFirestore = async () => {
      if (!userId || !userName) return;

      try {
        const completedStagesCount = Object.values(stageProgress).filter(
          (sp) => (sp as StageProgress).completed
        ).length;

        const doc: JourneyDocument = {
          userId,
          userName,
          birthDate,
          stageProgress,
          currentStageId,
          totalScore: Object.values(stageProgress).reduce(
            (acc: number, s) => acc + (s as StageProgress).score,
            0
          ),
          completedStages: completedStagesCount,
          journeyStartAt,
          completedAt,
          totalTimeMinutes,
          completedBonusGames: Array.from(completedBonusGames),
          physicalRewardChoice,
        };

        await saveJourney(doc);
      } catch (error) {
        console.error("Erro ao sincronizar jornada com Firestore:", error);
      }
    };

    // Não bloquear a UI se der erro
    syncToFirestore();
  }, [
    userId,
    userName,
    birthDate,
    stageProgress,
    currentStageId,
    journeyStartAt,
    completedAt,
    totalTimeMinutes,
    completedBonusGames,
    physicalRewardChoice,
  ]);

  // Salvar progresso da jornada no localStorage
  useEffect(() => {
    const dataToSave: Partial<AppState> = {
      userName,
      birthDate,
      photo,
      stageProgress,
      currentStageId,
      posts,
      completedAt,
      journeyStartAt,
      totalTimeMinutes,
      completedBonusGames: Array.from(completedBonusGames),
      physicalRewardChoice,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [
    userName,
    birthDate,
    photo,
    stageProgress,
    currentStageId,
    posts,
    completedAt,
    journeyStartAt,
    totalTimeMinutes,
    completedBonusGames,
    physicalRewardChoice,
  ]);

  // Salvar dados de autenticação
  useEffect(() => {
    const userData: UserData = { userId, token, isAdmin };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  }, [userId, token, isAdmin]);

  // 🚨 FUNÇÕES DE BACKEND (AGORA LOCAL, SEM FETCH)
  const login = useCallback(
    async (name: string, date: string): Promise<boolean> => {
      setUserName(name);
      setBirthDate(date);
      const id = ensureUserId(name, date);
      setToken(null);
      setIsAdmin(false);
      setIsLoaded(true);
      return true;
    },
    [ensureUserId]
  );

  const register = useCallback(
    async (name: string, date: string): Promise<boolean> => {
      setUserName(name);
      setBirthDate(date);
      const id = ensureUserId(name, date);
      setToken(null);
      setIsAdmin(false);
      setIsLoaded(true);
      return true;
    },
    [ensureUserId]
  );

  // 🔐 Admin: usar senha do .env, com fallback pra antiga
  const ADMIN_USER = "Decleones Andrade de Souza";
  const ADMIN_PASS =
    import.meta.env.VITE_ADMIN_ACCESS_CODE || "Emil1608*";

  const loginAdmin = async (
    user: string,
    pass: string
  ): Promise<boolean> => {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      setUserName(ADMIN_USER);
      setIsAdmin(true);
      setUserId("admin");
      setToken(null);
      navigateTo(Screen.AdminDashboard);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUserId(null);
    setToken(null);
    setIsAdmin(false);
    localStorage.removeItem(USER_STORAGE_KEY);
    resetJourney();
  };

  const markBonusGameAsComplete = useCallback((gameId: BonusGameId) => {
    setCompletedBonusGames((prev) => {
      const updated = new Set(prev);
      updated.add(gameId);
      return updated;
    });
  }, []);

  const setPhysicalRewardChoice = useCallback(
    (choice: "yes" | "no" | null) => {
      setPhysicalRewardChoiceState(choice);
    },
    []
  );

// 🔥 Ouvir posts em tempo real do Firestore
useEffect(() => {
  setLoadingPosts(true);

  const unsubscribe = listenToPosts((firebasePosts) => {
    // Converte Firestore → formato do seu app
    const mapped: Post[] = firebasePosts.map((p) => ({
      id: p.id || Date.now(),
      author: p.userName,
      message: p.message,
      likes: 0,
      isLiked: false,
      isUserPost: false,
      comments: [],
    }));

    // Atualiza o mural
    setPosts(mapped);
    setLoadingPosts(false);
  });

  // Remove listener ao sair
  return () => unsubscribe();
}, []);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  const markJourneyStart = useCallback(() => {
    setJourneyStartAt((prev) => prev ?? new Date().toISOString());
  }, []);

  const markJourneyCompleted = useCallback(() => {
    const completionTime = new Date().toISOString();
    setCompletedAt(completionTime);
    if (journeyStartAt) {
      const diffMs =
        new Date(completionTime).getTime() -
        new Date(journeyStartAt).getTime();
      const minutes = Math.max(1, Math.round(diffMs / 60000));
      setTotalTimeMinutes(minutes);
    } else {
      setTotalTimeMinutes(null);
    }
  }, [journeyStartAt]);

  const getAdminParticipants = useCallback((): ParticipantSummary[] => {
    try {
      const stored = localStorage.getItem(ADMIN_PARTICIPANTS_KEY);
      if (!stored) {
        return [];
      }
      const parsed = JSON.parse(stored) as ParticipantSummary[];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to load admin participants:", error);
      return [];
    }
  }, []);

  const exitAdmin = useCallback(() => {
    setIsAdmin(false);
    setUserName("");
    setUserId(null);
    setToken(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    navigateTo(Screen.Welcome);
  }, [navigateTo]);

  const updateStageProgress = (
    stageId: number,
    score: number,
    reflection: string
  ) => {
    setStageProgress((prev) => ({
      ...prev,
      [stageId]: { score, reflection, completed: true },
    }));
  };

  const unlockAudio = useCallback(() => {
    if (!isAudioUnlocked) {
      setIsAudioUnlocked(true);
    }
  }, [isAudioUnlocked]);

  const totalScore = useMemo(() => {
    return Object.values(stageProgress).reduce(
      (acc: number, stage) => acc + (stage as StageProgress).score,
      0
    );
  }, [stageProgress]);

const addPost = (message: string) => {
  if (!userName) return;

  // Garante userId mesmo que não exista ainda
  const effectiveUserId = userId ?? ensureUserId(userName, birthDate);

  console.log("📨 Enviando post para Firestore:", {
    effectiveUserId,
    userName,
    message,
  });

  // Post local – aparece imediatamente
  const newPost: Post = {
    id: Date.now(),
    author: userName,
    message,
    likes: 0,
    isLiked: false,
    isUserPost: true,
    comments: [],
  };

  setPosts((prev) => [newPost, ...prev]);

  // Salvar no Firestore (não bloqueia a UI)
  addCommunityPost(effectiveUserId, userName, message)
    .then(() => {
      console.log("✅ Post salvo no Firestore com sucesso!");
    })
    .catch((error) => {
      console.error("❌ Erro ao salvar post no Firestore:", error);
    });
};

  const toggleLike = (id: number) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === id && !post.isUserPost) {
          return {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked,
          };
        }
        return post;
      })
    );
  };

  const addComment = (postId: number, message: string) => {
    const newComment: Comment = {
      id: Date.now(),
      author: userName,
      message,
    };
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );
  };

  const resetJourney = () => {
    setUserName("");
    setBirthDate(null);
    setPhoto(null);
    setStageProgress({});
    setCurrentStageId(1);
    setPosts([]);
    setJourneyStartAt(null);
    setCompletedAt(null);
    setTotalTimeMinutes(null);
    setCompletedBonusGames(new Set());
    setPhysicalRewardChoiceState(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    navigateTo(Screen.Welcome);
  };

  // Snapshot para painel do admin (mantendo lógica original com localStorage)
  useEffect(() => {
    if (!userName || isAdmin) {
      return;
    }

    const participantId =
      userId ?? `${userName.toLowerCase()}_${birthDate ?? "desconhecido"}`;
    const stages: StageSnapshot[] = stagesData.map((stage) => {
      const progress = stageProgress[stage.id] as StageProgress | undefined;
      return {
        id: stage.id,
        title: stage.title,
        score: progress?.score ?? 0,
        reflection: progress?.reflection ?? "",
        completed: Boolean(progress?.completed),
      };
    });

    const completedStages = stages.filter((stage) => stage.completed).length;
    const snapshot: ParticipantSummary = {
      id: participantId,
      name: userName,
      birthDate,
      totalScore,
      completedStages,
      totalStages: stagesData.length,
      stages,
      posts: posts.filter((post) => post.isUserPost),
      startedAt: journeyStartAt,
      completedAt,
      totalTimeMinutes,
      lastUpdated: new Date().toISOString(),
    };

    try {
      const stored = localStorage.getItem(ADMIN_PARTICIPANTS_KEY);
      const participants: ParticipantSummary[] = stored
        ? JSON.parse(stored)
        : [];
      const existingIndex = participants.findIndex(
        (item) => item.id === snapshot.id
      );

      if (existingIndex >= 0) {
        participants[existingIndex] = {
          ...participants[existingIndex],
          ...snapshot,
        };
      } else {
        participants.push(snapshot);
      }

      localStorage.setItem(
        ADMIN_PARTICIPANTS_KEY,
        JSON.stringify(participants)
      );
    } catch (error) {
      console.error("Failed to persist participant snapshot:", error);
    }
  }, [
    userName,
    birthDate,
    posts,
    stageProgress,
    totalScore,
    isAdmin,
    userId,
    stagesData,
    journeyStartAt,
    completedAt,
    totalTimeMinutes,
  ]);

  const value: AppContextType = {
    currentScreen,
    navigateTo,
    userName,
    setUserName,
    birthDate,
    setBirthDate,
    photo,
    setPhoto,
    stagesData,
    stageProgress,
    updateStageProgress,
    currentStageId,
    setCurrentStageId,
    totalScore,
    resetJourney,
    posts,
    addPost,
    toggleLike,
    addComment,
    loadingPosts,
    isAudioUnlocked,
    unlockAudio,
    bgmUrls,
    setBgmUrls,
    userId,
    token,
    isAdmin,
    isLoaded,
    completedAt,
    journeyStartAt,
    totalTimeMinutes,
    login,
    register,
    loginAdmin,
    logout,
    markJourneyStart,
    markJourneyCompleted,
    getAdminParticipants,
    exitAdmin,
    completedBonusGames: Array.from(completedBonusGames),
    markBonusGameAsComplete,
    physicalRewardChoice,
    setPhysicalRewardChoice,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
