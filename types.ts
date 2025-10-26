// Fix: Create type definitions for the application
export enum Screen {
  SplashScreen,
  Welcome,
  Instructions,
  Study,
  Declaration,
  Congratulations,
  Rewards,
  Final,
  CommunityWall,
  ShareReport,
}

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