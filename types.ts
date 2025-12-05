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
  UserProfile, // ⬅️ ADICIONADO
  SpiritualDiary,      // Diário Espiritual
  WeeklyChallenges,    // Desafios Semanais
  PrayerCenter,          // ⬅️ NOVO
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

// --- Interface para Cores Dinâmicas (ThemeProps) ---
export interface ThemeProps {
  cardBorder: string;
  accentText: string;
  accentBg: string;
  accentIcon: string;
  progressFrom: string; // Para o gradiente em StudyScreen
  progressTo: string;   // Para o gradiente em StudyScreen
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
  id: string;           // ex: "first_stage"
  name: string;         // ex: "Primeira Etapa Concluída"
  description: string;  // ex: "Concluiu a primeira etapa do estudo"
  icon: string;         // emoji ou ícone, ex: "🥇"
}

// Definição de um nível (para mapa de níveis)
export interface LevelDefinition {
  level: number;        // ex: 1, 2, 3...
  minXp: number;        // XP mínimo para alcançar esse nível
  title: string;        // ex: "Filho Amado"
  description?: string; // opcional
}

// Estilos musicais possíveis (pode ajustar os nomes depois)
export type FavoriteMusicStyle =
  "worship" |
  "lofi-gospel" |
  "rap-gospel" |
  "pop-gospel" |
  "instrumental" |
  "outro";

// Perfil completo do usuário (identidade + gamificação)
export interface UserProfile {
  // Identidade visual / pessoal
  avatarDataUrl: string | null; // imagem em base64 ou URL local
  favoriteVerse: string;
  favoriteMusicStyle: string;   // se quiser, pode trocar para FavoriteMusicStyle
  churchOrGroup: string;
  spiritualTitle: string;
  createdAt: string;            // ISO string

  // Gamificação ligada ao perfil
  totalScore: number;           // pontuação total atual
  level: number;                // nível atual
  nextLevelScore: number;       // pontuação necessária para próximo nível
  medals: Medal[];              // medalhas conquistadas
  streakDays: number;           // dias seguidos de jornada
}

// =========================
// DIÁRIO ESPIRITUAL / ORAÇÃO
// =========================

// Tipo de entrada no diário
export type DiaryEntryType =
  | "journal"           // Desabafos / reflexões gerais
  | "hearingGod"        // O que Deus falou
  | "goal"              // Metas pessoais
  | "walkWithChrist"    // Caminho com Cristo
  | "prayer_request"    // Pedido de oração
  | "prayer_thanks"     // Agradecimento
  | "prayer_answer"     // Resposta de oração
  | "weekly_challenge"; // Entrada associada a um desafio semanal

export interface DiaryEntry {
  id: string;
  type: DiaryEntryType;
  title: string;
  content: string;
  createdAt: string;      // ISO string
  updatedAt?: string;     // ISO string
  tags?: string[];        // ex: ["insegurança", "família"]
  challengeId?: string | null; // se veio de um desafio semanal
}

// =========================
// DESAFIOS SEMANAIS
// =========================

export type WeeklyChallengeKind =
  | "writing"  // escrever algo
  | "audio"    // gravar áudio
  | "action"   // fazer alguma ação concreta
  | "social";  // postar no mural, compartilhar, etc.

export interface WeeklyChallenge {
  id: string;              // ex: "write_letter_to_God"
  title: string;           // ex: "Carta para Deus"
  description: string;     // texto explicando o desafio
  kind: WeeklyChallengeKind;
  points: number;          // pontuação sugerida
  suggestedEntryType: DiaryEntryType;
  medalId?: string;        // opcional: id de medalha quando integrar
}

// =========================
// PREFERÊNCIAS DE NOTIFICAÇÃO (base p/ FCM)
// =========================

export interface NotificationPreferences {
  allowPush: boolean;
  devotionalReminders: boolean;
  challengeReminders: boolean;
  prayerReminders: boolean;
  quietHoursStart?: string | null; // opcional (ex: "22:00")
  quietHoursEnd?: string | null;   // opcional
}
