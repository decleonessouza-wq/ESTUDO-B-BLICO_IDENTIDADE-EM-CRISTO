// Fix: Create type definitions for the application
export enum Screen {
  Welcome,
  Instructions,
  Study,
  Declaration,
  Congratulations,
  Rewards,
  Final,
  CommunityWall,
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

export interface Post {
  id: number;
  author: string;
  message: string;
  likes: number;
  isLiked: boolean;
  isUserPost: boolean;
}

export interface StageProgress {
  score: number;
  reflection: string;
  completed: boolean;
}
