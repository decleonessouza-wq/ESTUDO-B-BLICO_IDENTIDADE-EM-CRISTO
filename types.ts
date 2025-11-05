// Fix: Create type definitions for the application
export enum Screen {
  SplashScreen,
  Welcome,
  Instructions,
  Study,
  Declaration,
  Congratulations,
  Rewards,
  Bonus,
  /**
   * Legacy aliases kept for compatibility with earlier branches that
   * referenced dedicated bonus screen routes. All map to the main bonus hub.
   */
  BonusGame = Bonus,
  BonusReward = Bonus,
  /**
   * Standalone entry so the comprehensive word search keeps its own route
   * while reusing the shared bonus hub infrastructure.
   */
  BonusWordSearch,
  Final,
  CommunityWall,
  ShareReport,
  AdminDashboard,
}

export type BonusGameId =
  | 'identityBuilder'
  | 'wordSearch'
  | 'completeWordSearch'
  | 'memory'
  | 'victoryLeap'
  | 'mindBattle';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface StageData {
  id: number;
  title: string;
  videoUrl: string;
  biblicalReflection: string;
  motivationalPhrase: string;
  questions: QuizQuestion[];
}

// --- NOVO: Interface para Cores Dinâmicas (ThemeProps) ---
export interface ThemeProps {
  cardBorder: string; 
  accentText: string;
  accentBg: string;
  accentIcon: string;
  progressFrom: string; // Para o gradiente em StudyScreen
  progressTo: string; // Para o gradiente em StudyScreen
}

export interface Comment {
  id: number;
  author: string;
  message: string;
}

export interface Post {
  id: number;
  author: string;
  message: string;
  likes: number;
  isLiked: boolean;
  isUserPost: boolean;
  comments: Comment[];
}

export interface StageProgress {
  score: number;
  reflection: string;
  completed: boolean;
}

export interface StageSnapshot {
  id: number;
  title: string;
  score: number;
  reflection: string;
  completed: boolean;
}

export interface ParticipantSummary {
  id: string;
  name: string;
  birthDate: string | null;
  totalScore: number;
  completedStages: number;
  totalStages: number;
  stages: StageSnapshot[];
  posts: Post[];
  startedAt: string | null;
  completedAt: string | null;
  totalTimeMinutes: number | null;
  lastUpdated: string;
}
