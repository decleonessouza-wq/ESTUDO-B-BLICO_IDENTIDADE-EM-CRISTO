import { addCommunityPost, listenToPosts } from "../firebase/postsService";

import React,
{
  createContext,
  useState,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
  useCallback,
} from "react";

import {
  Screen,
  StageData,
  Post,
  StageProgress,
  Comment,
  ParticipantSummary,
  StageSnapshot,
  BonusGameId,
  Medal,
  LevelDefinition,
  UserProfile,
} from "../types";
import { getStagesData } from "../constants";

// Integração com Firestore para salvar jornada
import { saveJourney, JourneyDocument } from "../firebase/journeyService";

const LOCAL_STORAGE_KEY = "identidadeCristoProgress";
const USER_STORAGE_KEY = "identidadeCristoUser";
const ADMIN_PARTICIPANTS_KEY = "identidadeCristoParticipants";

// 🔹 Fila offline de posts
const OFFLINE_QUEUE_KEY = "identidadeCristoOfflineQueue";

interface OfflineQueuedPost {
  tempId: number;
  message: string;
  createdAt: string;
}

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

  // Gamificação
  xp: number;
  level: number;
  levelTitle: string;
  medals: Medal[];
  userProfile: UserProfile | null;

  // Offline
  isOnline: boolean;
  offlineQueuedPostsCount: number;
  syncOfflineQueuedPosts: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --------- GAMIFICAÇÃO BÁSICA (somente cálculo em memória) ---------

const LEVELS: LevelDefinition[] = [
  { level: 1, minXp: 0, title: "Filho Amado" },
  { level: 2, minXp: 100, title: "Discípulo em Crescimento" },
  { level: 3, minXp: 250, title: "Reformador da Mente" },
  { level: 4, minXp: 450, title: "Influenciador de Geração" },
  { level: 5, minXp: 700, title: "Embaixador de Cristo" },
];

const MEDALS_BASE: Medal[] = [
  {
    id: "first_stage",
    name: "Primeiro Passo",
    description: "Concluiu a primeira etapa da jornada.",
    icon: "🥇",
  },
  {
    id: "journey_completed",
    name: "Jornada Concluída",
    description: "Concluiu todas as etapas do estudo.",
    icon: "🏁",
  },
  {
    id: "high_score",
    name: "Fogo no Quiz",
    description: "Alcançou 80% ou mais da pontuação máxima.",
    icon: "🔥",
  },
  {
    id: "bonus_master",
    name: "Caçador de Bônus",
    description: "Completou pelo menos 3 jogos bônus.",
    icon: "🎮",
  },
];

const calculateXpFromJourney = (
  stageProgress: Record<number, StageProgress>,
  completedBonusGames: Set<BonusGameId>
): number => {
  const baseScore = Object.values(stageProgress).reduce<number>(
    (acc, s) => acc + (s as StageProgress).score,
    0
  );

  const completedStages = Object.values(stageProgress).filter(
    (s) => (s as StageProgress).completed
  ).length;

  const bonusXp = completedBonusGames.size * 20;

  // Fórmula simples: pontos do quiz + bônus por etapa concluída + bônus por jogos
  return baseScore + completedStages * 10 + bonusXp;
};

const getLevelForXp = (xp: number): LevelDefinition => {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXp) {
      current = lvl;
    } else {
      break;
    }
  }
  return current;
};

const getEarnedMedals = (
  stageProgress: Record<number, StageProgress>,
  totalScore: number,
  completedBonusGames: Set<BonusGameId>,
  totalStagesAvailable: number
): Medal[] => {
  const medals: Medal[] = [];

  const completedStages = Object.values(stageProgress).filter(
    (s) => (s as StageProgress).completed
  ).length;

  const maxPossibleScore = totalStagesAvailable * 100; // suposição: 100 pts por etapa

  const hasStage1Completed = (stageProgress[1] as StageProgress | undefined)
    ?.completed;

  if (hasStage1Completed) {
    const m = MEDALS_BASE.find((m) => m.id === "first_stage");
    if (m) medals.push(m);
  }

  if (completedStages === totalStagesAvailable && totalStagesAvailable > 0) {
    const m = MEDALS_BASE.find((m) => m.id === "journey_completed");
    if (m) medals.push(m);
  }

  if (maxPossibleScore > 0 && totalScore / maxPossibleScore >= 0.8) {
    const m = MEDALS_BASE.find((m) => m.id === "high_score");
    if (m) medals.push(m);
  }

  if (completedBonusGames.size >= 3) {
    const m = MEDALS_BASE.find((m) => m.id === "bonus_master");
    if (m) medals.push(m);
  }

  return medals;
};

// -------------------------------------------------------- //

const loadInitialState = (): AppState => {
  const savedProgress = localStorage.getItem(LOCAL_STORAGE_KEY);
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

  // 🔹 Estado offline
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [offlineQueuedPosts, setOfflineQueuedPosts] = useState<
    OfflineQueuedPost[]
  >(() => {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const stagesData = useMemo(() => getStagesData(), []);

  // totalScore tipado corretamente
  const totalScore = useMemo(() => {
    return Object.values(stageProgress).reduce<number>(
      (acc, stage) => acc + (stage as StageProgress).score,
      0
    );
  }, [stageProgress]);

  // --------- Gamificação derivada ---------

  const xp = useMemo(
    () => calculateXpFromJourney(stageProgress, completedBonusGames),
    [stageProgress, completedBonusGames]
  );

  const currentLevelDef = useMemo(() => getLevelForXp(xp), [xp]);

  const medals = useMemo(
    () =>
      getEarnedMedals(
        stageProgress,
        totalScore,
        completedBonusGames,
        stagesData.length
      ),
    [stageProgress, totalScore, completedBonusGames, stagesData.length]
  );

  const userProfile: UserProfile | null = useMemo(() => {
    if (!userId && !userName) return null;

    const completedStagesCount = Object.values(stageProgress).filter(
      (s) => (s as StageProgress).completed
    ).length;

    return {
      userId: userId ?? "guest",
      name: userName || "Convidado",
      birthDate,
      level: currentLevelDef.level,
      xp,
      medals: medals.map((m) => m.id),
      totalScore,
      completedStages: completedStagesCount,
      totalStages: stagesData.length,
      journeyStartAt,
      completedAt,
      totalTimeMinutes,
    } as unknown as UserProfile; // garante compat em caso de tipos diferentes
  }, [
    userId,
    userName,
    birthDate,
    currentLevelDef.level,
    xp,
    medals,
    totalScore,
    stageProgress,
    stagesData.length,
    journeyStartAt,
    completedAt,
    totalTimeMinutes,
  ]);

  // Gera userId local se não existir
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

  // 🔹 Sincronizar fila offline -> Firestore
  const syncOfflineQueuedPosts = useCallback(async () => {
    if (!userId || !userName || offlineQueuedPosts.length === 0) return;

    const toSync = [...offlineQueuedPosts];

    for (const item of toSync) {
      try {
        await addCommunityPost(userId, userName, item.message);
      } catch (error) {
        console.error("Erro ao sincronizar post offline:", error);
        // se falhar, mantém o restante na fila
        return;
      }
    }

    // se tudo deu certo, limpa fila
    setOfflineQueuedPosts([]);
  }, [offlineQueuedPosts, userId, userName]);

  // 🔹 Listener de online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineQueuedPosts();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncOfflineQueuedPosts]);

  // 🔹 Persistir fila offline no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        OFFLINE_QUEUE_KEY,
        JSON.stringify(offlineQueuedPosts)
      );
    } catch (error) {
      console.error("Erro ao salvar fila offline:", error);
    }
  }, [offlineQueuedPosts]);

  // Sincronizar jornada com Firestore
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
          totalScore,
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

    syncToFirestore();
  }, [
    userId,
    userName,
    birthDate,
    stageProgress,
    currentStageId,
    totalScore,
    journeyStartAt,
    completedAt,
    totalTimeMinutes,
    completedBonusGames,
    physicalRewardChoice,
  ]);

  // Salvar progresso no localStorage
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

  // Salvar dados de "auth" local
  useEffect(() => {
    const userData: UserData = { userId, token, isAdmin };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  }, [userId, token, isAdmin]);

  // Login simples (sem backend)
  const login = useCallback(
    async (name: string, date: string): Promise<boolean> => {
      setUserName(name);
      setBirthDate(date);
      ensureUserId(name, date);
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
      ensureUserId(name, date);
      setToken(null);
      setIsAdmin(false);
      setIsLoaded(true);
      return true;
    },
    [ensureUserId]
  );

  // Admin: senha via env com fallback
  const ADMIN_USER = "Decleones Andrade de Souza";
  const ADMIN_PASS =
    (import.meta as any).env?.VITE_ADMIN_ACCESS_CODE || "Emil1608*";

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

  // Ouvir posts em tempo real do Firestore
  useEffect(() => {
    setLoadingPosts(true);

    const unsubscribe = listenToPosts((firebasePosts) => {
      const mapped: Post[] = firebasePosts.map((p, index) => ({
        id:
          typeof p.id === "number"
            ? p.id
            : Date.now() + index, // garante number
        author: p.userName,
        message: p.message,
        likes: 0,
        isLiked: false,
        isUserPost: false,
        comments: [],
      }));

      setPosts(mapped);
      setLoadingPosts(false);
    });

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
  }, []);

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

  const addPost = (message: string) => {
    if (!userId || !userName) return;

    const newPost: Post = {
      id: Date.now(),
      author: userName,
      message,
      likes: 0,
      isLiked: false,
      isUserPost: true,
      comments: [],
    };

    // já aparece no mural, mesmo offline
    setPosts((prev) => [newPost, ...prev]);

    // se estiver offline, entra na fila para sincronizar depois
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setOfflineQueuedPosts((prev) => [
        ...prev,
        {
          tempId: newPost.id,
          message,
          createdAt: new Date().toISOString(),
        },
      ]);
      return;
    }

    // se estiver online, tenta mandar pro Firestore
    addCommunityPost(userId, userName, message).catch((error) => {
      console.error("Erro ao salvar post no Firestore:", error);
      // se falhar mesmo online, joga para fila offline
      setOfflineQueuedPosts((prev) => [
        ...prev,
        {
          tempId: newPost.id,
          message,
          createdAt: new Date().toISOString(),
        },
      ]);
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

  // Snapshot para painel do admin (localStorage)
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

    // Gamificação exposta
    xp,
    level: currentLevelDef.level,
    levelTitle: currentLevelDef.title,
    medals,
    userProfile,

    // Offline exposto para o app
    isOnline,
    offlineQueuedPostsCount: offlineQueuedPosts.length,
    syncOfflineQueuedPosts,
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
