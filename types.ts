// Fix: Create type definitions for the application

// Telas principais do app
export enum Screen {
  SplashScreen,
  Welcome,
  Instructions,
  Study,
  Declaration,
  Congratulations,
  Rewards,
  Bonus,
  Final,
  CommunityWall,
  ShareReport,
  AdminDashboard,
}

// IDs dos minigames bônus
export type BonusGameId =
  | "identityBuilder"
  | "wordSearch"
  | "memory"
  | "victoryLeap"
  | "mindBattle";

// Perguntas dos quizzes
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

// Dados de cada etapa da jornada
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

// Comentários em posts
export interface Comment {
  id: number;
  author: string;
  message: string;
}

// Post no mural da comunidade
export interface Post {
  id: number;
  author: string;
  message: string;
  likes: number;
  isLiked: boolean;
  isUserPost: boolean;
  comments: Comment[];
}

// Progresso de uma única etapa
export interface StageProgress {
  score: number;
  reflection: string;
  completed: boolean;
}

// Snapshot de uma etapa para relatórios/admin
export interface StageSnapshot {
  id: number;
  title: string;
  score: number;
  reflection: string;
  completed: boolean;
}

// Resumo de um participante para painel admin
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

/* =========================
   GAMIFICAÇÃO / PERFIL HUD
   ========================= */

// Medalha que o usuário pode ganhar (objeto, não enum)
export interface Medal {
  id: string;          // ex: "first_stage"
  name: string;        // ex: "Primeira Etapa Concluída"
  description: string; // ex: "Concluiu a primeira etapa do estudo"
  icon: string;        // emoji ou ícone, ex: "🥇"
}

// Definição de um nível (para mapa de níveis)
// OBS: AppContext usa "minXp", então usamos minXp aqui.
// Deixamos "description" OPCIONAL para bater com o código atual.
export interface LevelDefinition {
  level: number;          // ex: 1, 2, 3...
  minXp: number;          // XP mínimo para alcançar esse nível
  title: string;          // ex: "Filho Amado"
  description?: string;   // opcional, texto curto explicando o nível
}

// Perfil gamificado do usuário (para HUD, badges, etc.)
export interface UserProfile {
  totalScore: number;     // pontuação total atual
  level: number;          // nível atual
  nextLevelScore: number; // pontuação necessária para próximo nível
  medals: Medal[];        // medalhas conquistadas
  streakDays: number;     // dias consecutivos de estudo
}
