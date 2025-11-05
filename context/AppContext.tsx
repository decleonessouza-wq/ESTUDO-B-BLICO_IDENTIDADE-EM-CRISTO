// Fix: Implement the AppContext to manage global state
import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
// Fix: Import StageProgress from types.ts to make it available in this context
import { Screen, StageData, Post, StageProgress, Comment, ParticipantSummary, StageSnapshot } from '../types';
import { getStagesData } from '../constants';

// 🚨 CORREÇÃO ESSENCIAL 1: Definição da URL da API (Backend na porta 4001)
const API_URL = 'http://localhost:4001/api';
const LOCAL_STORAGE_KEY = 'identidadeCristoProgress';
// 🚨 Novo local storage key para o token e userId, se aplicável
const USER_STORAGE_KEY = 'identidadeCristoUser';
const ADMIN_PARTICIPANTS_KEY = 'identidadeCristoParticipants';

interface UserData {
    userId: string | null;
    token: string | null;
    isAdmin: boolean;
}

interface AppState {
    userName: string;
    birthDate: string | null; // Alterado para aceitar null
    photo: string | null;
    stageProgress: Record<number, StageProgress>;
    currentStageId: number;
    posts: Post[];
    // 🚨 Novos estados para autenticação
    userId: string | null;
    token: string | null;
    isAdmin: boolean;
    isLoaded: boolean;
    completedAt: string | null;
    journeyStartAt: string | null;
    totalTimeMinutes: number | null;
}

interface AppContextType extends AppState {
    currentScreen: Screen;
    navigateTo: (screen: Screen) => void;
    setUserName: (name: string) => void;
    setBirthDate: (date: string | null) => void;
    setPhoto: (photo: string | null) => void;
    stagesData: StageData[];
    updateStageProgress: (stageId: number, score: number, reflection: string) => void;
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

    // 🚨 Novas funções de API e autenticação
    login: (name: string, birthDate: string) => Promise<boolean>;
    register: (name: string, birthDate: string) => Promise<boolean>;
    loginAdmin: (user: string, pass: string) => Promise<boolean>;
    logout: () => void;
    markJourneyStart: () => void;
    markJourneyCompleted: () => void;
    getAdminParticipants: () => ParticipantSummary[];
    exitAdmin: () => void;
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
        userName: progressData.userName || (userData.isAdmin ? 'Admin' : ''),
        birthDate: progressData.birthDate || null,
        photo: progressData.photo || null,
        stageProgress: progressData.stageProgress || {},
        currentStageId: progressData.currentStageId || 1,
        posts: progressData.posts || [],
        userId: userData.userId,
        token: userData.token,
        isAdmin: userData.isAdmin,
        isLoaded: true, // Começa como true, pois o estado inicial foi carregado
        completedAt: progressData.completedAt || null,
        journeyStartAt: progressData.journeyStartAt || null,
        totalTimeMinutes: progressData.totalTimeMinutes ?? null,
    };
};


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [initialState] = useState(loadInitialState);
    
    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.SplashScreen);
    
    const [userName, setUserName] = useState(initialState.userName);
    const [birthDate, setBirthDate] = useState<string | null>(initialState.birthDate); // Novo estado
    const [photo, setPhoto] = useState<string | null>(initialState.photo);
    const [stageProgress, setStageProgress] = useState<Record<number, StageProgress>>(initialState.stageProgress);
    const [currentStageId, setCurrentStageId] = useState(initialState.currentStageId);
    const [posts, setPosts] = useState<Post[]>(initialState.posts);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
    const [bgmUrls, setBgmUrls] = useState<string[]>([]);

    // 🚨 Novos estados de autenticação
    const [userId, setUserId] = useState<string | null>(initialState.userId);
    const [token, setToken] = useState<string | null>(initialState.token);
    const [isAdmin, setIsAdmin] = useState<boolean>(initialState.isAdmin);
    const [isLoaded, setIsLoaded] = useState<boolean>(initialState.isLoaded);
    const [completedAt, setCompletedAt] = useState<string | null>(initialState.completedAt);
    const [journeyStartAt, setJourneyStartAt] = useState<string | null>(initialState.journeyStartAt || null);
    const [totalTimeMinutes, setTotalTimeMinutes] = useState<number | null>(initialState.totalTimeMinutes ?? null);


    const stagesData = useMemo(() => getStagesData(), []);

    // Efeito para salvar o progresso da jornada
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
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    }, [userName, birthDate, photo, stageProgress, currentStageId, posts, completedAt, journeyStartAt, totalTimeMinutes]);

    // Efeito para salvar os dados de autenticação
    useEffect(() => {
        const userData: UserData = { userId, token, isAdmin };
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    }, [userId, token, isAdmin]);

    // 🚨 FUNÇÕES DE BACKEND (API)
    const login = useCallback(async (name: string, date: string): Promise<boolean> => {
        setUserName(name);
        setBirthDate(date);
        
        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, birthDate: date }),
            });

            if (!response.ok) {
                // Se a resposta não for OK, algo como 404 ou 500
                console.error("Login failed on server side:", response.status);
                return false;
            }

            const data = await response.json();
            
            // Sucesso no login
            setUserId(data.userId);
            setToken(data.token);
            setIsAdmin(false);
            // navigateTo(Screen.Instructions); // Você fará o navigate na tela de login

            return true;
        } catch (error) {
            console.error('Error during user login:', error);
            // Tratar o erro de CORS/rede que estava ocorrendo
            return false;
        }
    }, []);

    const register = useCallback(async (name: string, date: string): Promise<boolean> => {
        setUserName(name);
        setBirthDate(date);
        
        try {
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, birthDate: date }),
            });

            if (!response.ok) {
                console.error("Registration failed on server side:", response.status);
                return false;
            }

            const data = await response.json();
            
            // Sucesso no registro
            setUserId(data.userId);
            setToken(data.token);
            setIsAdmin(false);

            return true;
        } catch (error) {
            console.error('Error during user registration:', error);
            return false;
        }
    }, []);

    const loginAdmin = async (user: string, pass: string): Promise<boolean> => {
        if (user === 'Decleones Andrade de Souza' && pass === 'Emil1608*') {
            setUserName('Decleones Andrade de Souza');
            setIsAdmin(true);
            setUserId('admin');
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

    // ... O seu useEffect de `generateInitialPosts` original aqui ...
    useEffect(() => {
        const generateInitialPosts = async () => {
            if (Object.keys(stageProgress).length === 0 && posts.length === 0) {
                setLoadingPosts(true);
                try {
                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    const response = await ai.models.generateContent({
                        model: "gemini-2.5-flash",
                        contents: "Você é um assistente criativo. Gere 5 posts para um mural de comunidade de um aplicativo de estudo bíblico chamado 'Identidade em Cristo'. Os posts devem ser curtos (máximo 280 caracteres), inspiradores e parecer escritos por jovens que completaram a jornada de estudo e estão compartilhando suas reflexões ou testemunhos sobre descobrir sua verdadeira identidade em Deus. Varie os nomes dos autores, usando nomes comuns no Brasil.",
                        config: {
                            responseMimeType: "application/json",
                            responseSchema: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        author: {
                                            type: Type.STRING,
                                            description: 'Nome fictício da pessoa que está postando (nomes brasileiros).',
                                        },
                                        message: {
                                            type: Type.STRING,
                                            description: 'A mensagem de reflexão ou testemunho da pessoa, com no máximo 280 caracteres.',
                                        },
                                    },
                                    required: ["author", "message"],
                                },
                            },
                        },
                    });

                    const jsonStr = response.text.trim();
                    const generatedPosts: {author: string, message: string}[] = JSON.parse(jsonStr);

                    const newPosts: Post[] = generatedPosts.map((p, index) => ({
                        id: Date.now() + index,
                        author: p.author,
                        message: p.message,
                        likes: Math.floor(Math.random() * 30) + 5,
                        isLiked: false,
                        isUserPost: false,
                        comments: [],
                    }));
                    setPosts(newPosts);
                } catch (error) {
                    console.error("Failed to generate initial posts:", error);
                    setPosts([]); 
                } finally {
                    setLoadingPosts(false);
                }
            }
        };

        generateInitialPosts();
    }, []);


    const navigateTo = (screen: Screen) => {
        setCurrentScreen(screen);
        window.scrollTo(0, 0);
    };

    const markJourneyStart = useCallback(() => {
        setJourneyStartAt(prev => prev ?? new Date().toISOString());
    }, []);

    const markJourneyCompleted = useCallback(() => {
        const completionTime = new Date().toISOString();
        setCompletedAt(completionTime);
        if (journeyStartAt) {
            const diffMs = new Date(completionTime).getTime() - new Date(journeyStartAt).getTime();
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
            console.error('Failed to load admin participants:', error);
            return [];
        }
    }, []);

    const exitAdmin = useCallback(() => {
        setIsAdmin(false);
        setUserName('');
        setUserId(null);
        setToken(null);
        localStorage.removeItem(USER_STORAGE_KEY);
        navigateTo(Screen.Welcome);
    }, [navigateTo]);

    const updateStageProgress = (stageId: number, score: number, reflection: string) => {
        setStageProgress(prev => ({
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
        // Fix: Cast stage to StageProgress because Object.values returns unknown type for this object structure.
        // FIX: Explicitly type the accumulator `acc` as a number to prevent type inference issues.
        return Object.values(stageProgress).reduce((acc: number, stage) => acc + (stage as StageProgress).score, 0);
    }, [stageProgress]);

    const addPost = (message: string) => {
        const newPost: Post = {
            id: Date.now(),
            author: userName,
            message,
            likes: 0,
            isLiked: false,
            isUserPost: true,
            comments: [],
        };
        setPosts(prev => [newPost, ...prev]);
    };

    const toggleLike = (id: number) => {
        setPosts(prev => prev.map(post => {
            if (post.id === id && !post.isUserPost) {
                return { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked };
            }
            return post;
        }));
    };
    
    const addComment = (postId: number, message: string) => {
        const newComment: Comment = {
            id: Date.now(),
            author: userName,
            message,
        };
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.id === postId
                ? { ...post, comments: [...post.comments, newComment] }
                : post
            )
        );
    };

    const resetJourney = () => {
        // Redefine apenas os estados locais da jornada
        setUserName('');
        setBirthDate(null); // Corrigido para null
        setPhoto(null);
        setStageProgress({});
        setCurrentStageId(1);
        setPosts([]);
        setJourneyStartAt(null);
        setCompletedAt(null);
        setTotalTimeMinutes(null);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        navigateTo(Screen.Welcome);
    };

    useEffect(() => {
        if (!userName || isAdmin) {
            return;
        }

        const participantId = userId ?? `${userName.toLowerCase()}_${birthDate ?? 'desconhecido'}`;
        const stages: StageSnapshot[] = stagesData.map(stage => {
            const progress = stageProgress[stage.id] as StageProgress | undefined;
            return {
                id: stage.id,
                title: stage.title,
                score: progress?.score ?? 0,
                reflection: progress?.reflection ?? '',
                completed: Boolean(progress?.completed),
            };
        });

        const completedStages = stages.filter(stage => stage.completed).length;
        const snapshot: ParticipantSummary = {
            id: participantId,
            name: userName,
            birthDate,
            totalScore,
            completedStages,
            totalStages: stagesData.length,
            stages,
            posts: posts.filter(post => post.isUserPost),
            startedAt: journeyStartAt,
            completedAt,
            totalTimeMinutes,
            lastUpdated: new Date().toISOString(),
        };

        try {
            const stored = localStorage.getItem(ADMIN_PARTICIPANTS_KEY);
            const participants: ParticipantSummary[] = stored ? JSON.parse(stored) : [];
            const existingIndex = participants.findIndex(item => item.id === snapshot.id);

            if (existingIndex >= 0) {
                participants[existingIndex] = { ...participants[existingIndex], ...snapshot };
            } else {
                participants.push(snapshot);
            }

            localStorage.setItem(ADMIN_PARTICIPANTS_KEY, JSON.stringify(participants));
        } catch (error) {
            console.error('Failed to persist participant snapshot:', error);
        }
    }, [userName, birthDate, posts, stageProgress, totalScore, isAdmin, userId, stagesData, journeyStartAt, completedAt, totalTimeMinutes]);

    const value = {
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
        // 🚨 Exportando estados e funções de API
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
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};