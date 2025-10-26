// Fix: Implement the AppContext to manage global state
import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
// Fix: Import StageProgress from types.ts to make it available in this context
import { Screen, StageData, Post, StageProgress, Comment } from '../types';
import { getStagesData } from '../constants';

const LOCAL_STORAGE_KEY = 'identidadeCristoProgress';

interface AppState {
    userName: string;
    birthDate: string;
    photo: string | null;
    stageProgress: Record<number, StageProgress>;
    currentStageId: number;
    posts: Post[];
}

interface AppContextType extends AppState {
  currentScreen: Screen;
  navigateTo: (screen: Screen) => void;
  setUserName: (name: string) => void;
  setBirthDate: (date: string) => void;
  setPhoto: (photo: string) => void;
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
  // Fix: Add bgmUrls and setBgmUrls to the context type to support custom music.
  bgmUrls: string[];
  setBgmUrls: (urls: string[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const loadInitialState = (): AppState => {
  try {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return {
          userName: parsedData.userName || '',
          birthDate: parsedData.birthDate || '',
          photo: parsedData.photo || null,
          stageProgress: parsedData.stageProgress || {},
          currentStageId: parsedData.currentStageId || 1,
          posts: parsedData.posts || [],
      };
    }
  } catch (error) {
    console.error("Failed to parse saved data from localStorage", error);
    // If parsing fails, clear the corrupted data
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
  return {
    userName: '',
    birthDate: '',
    photo: null,
    stageProgress: {},
    currentStageId: 1,
    posts: [],
  };
};


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [initialState] = useState(loadInitialState);
  
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.SplashScreen);
  
  const [userName, setUserName] = useState(initialState.userName);
  const [birthDate, setBirthDate] = useState(initialState.birthDate);
  const [photo, setPhoto] = useState<string | null>(initialState.photo);
  const [stageProgress, setStageProgress] = useState<Record<number, StageProgress>>(initialState.stageProgress);
  const [currentStageId, setCurrentStageId] = useState(initialState.currentStageId);
  const [posts, setPosts] = useState<Post[]>(initialState.posts);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  // Fix: Add state for custom BGM URLs.
  const [bgmUrls, setBgmUrls] = useState<string[]>([]);

  const stagesData = useMemo(() => getStagesData(), []);

  useEffect(() => {
    const dataToSave: AppState = {
      userName,
      birthDate,
      photo,
      stageProgress,
      currentStageId,
      posts,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [userName, birthDate, photo, stageProgress, currentStageId, posts]);

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
    setUserName('');
    setBirthDate('');
    setPhoto(null);
    setStageProgress({});
    setCurrentStageId(1);
    setPosts([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    navigateTo(Screen.Welcome);
  };

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
    // Fix: Expose BGM URLs and setter through the context.
    bgmUrls,
    setBgmUrls,
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