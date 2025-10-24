// Fix: Implement the AppContext to manage global state
import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
// Fix: Import StageProgress from types.ts to make it available in this context
import { Screen, StageData, Post, StageProgress } from '../types';
import { getStagesData, COMMUNITY_POSTS } from '../constants';

const LOCAL_STORAGE_KEY = 'identidadeCristoProgress';

interface AppState {
    userName: string;
    stageProgress: Record<number, StageProgress>;
    currentStageId: number;
}

interface AppContextType extends AppState {
  currentScreen: Screen;
  navigateTo: (screen: Screen) => void;
  setUserName: (name: string) => void;
  stagesData: StageData[];
  updateStageProgress: (stageId: number, score: number, reflection: string) => void;
  setCurrentStageId: (id: number) => void;
  totalScore: number;
  resetJourney: () => void;
  posts: Post[];
  addPost: (message: string) => void;
  toggleLike: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const loadInitialState = (): AppState => {
  try {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error("Failed to parse saved data from localStorage", error);
    // If parsing fails, clear the corrupted data
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
  return {
    userName: '',
    stageProgress: {},
    currentStageId: 1,
  };
};


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [initialState] = useState(loadInitialState);
  
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => 
    initialState.userName ? Screen.Study : Screen.Welcome
  );
  
  const [userName, setUserName] = useState(initialState.userName);
  const [stageProgress, setStageProgress] = useState<Record<number, StageProgress>>(initialState.stageProgress);
  const [currentStageId, setCurrentStageId] = useState(initialState.currentStageId);
  
  const initialPosts: Post[] = COMMUNITY_POSTS.map(p => ({ ...p, isLiked: false, isUserPost: false }));
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const stagesData = useMemo(() => getStagesData(), []);

  useEffect(() => {
    const dataToSave: AppState = {
      userName,
      stageProgress,
      currentStageId,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [userName, stageProgress, currentStageId]);


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

  const totalScore = useMemo(() => {
    // Fix: Cast stage to StageProgress because Object.values returns unknown type for this object structure.
    return Object.values(stageProgress).reduce((acc, stage) => acc + (stage as StageProgress).score, 0);
  }, [stageProgress]);

  const addPost = (message: string) => {
    const newPost: Post = {
        id: Date.now(),
        author: userName,
        message,
        likes: 0,
        isLiked: false,
        isUserPost: true,
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

  const resetJourney = () => {
    setUserName('');
    setStageProgress({});
    setCurrentStageId(1);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    navigateTo(Screen.Welcome);
  };

  const value = {
    currentScreen,
    navigateTo,
    userName,
    setUserName,
    stagesData,
    stageProgress,
    updateStageProgress,
    currentStageId,
    setCurrentStageId,
    totalScore,
    resetJourney,
    posts,
    addPost,
    toggleLike
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