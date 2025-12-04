// firebase/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";

// --- CONFIG DO FIREBASE (igual estava antes) ---
const firebaseConfig = {
  apiKey: "AIzaSyCep0LqwjJd-zWHHmK_KITaddMnaSi8k7s",
  authDomain: "estudo-digital.firebaseapp.com",
  projectId: "estudo-digital",
  storageBucket: "estudo-digital.firebasestorage.app",
  messagingSenderId: "639599477248",
  appId: "1:639599477248:web:32f33d893d00b514220ee5"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar Firestore
export const db = getFirestore(app);

/* ============================================================
   🔥 NOVAS COLEÇÕES PADRONIZADAS PARA NOVAS FUNCIONALIDADES
   (Sem alterar nada das coleções antigas)
   ============================================================ */

// Perfis completos dos usuários (foto, nível, medalhas…)
export const userProfilesCollection = collection(db, "userProfiles");

// Medalhas pré-definidas
export const medalsCollection = collection(db, "medals");

// Devocionais diários
export const devotionalsCollection = collection(db, "devotionals");

// Progresso do usuário nos devocionais
export const devotionalProgressCollection = collection(
  db,
  "devotionalProgress"
);

// Diário espiritual
export const journalCollection = collection(db, "journalEntries");

// Desafios semanais ou por etapa
export const challengesCollection = collection(db, "challenges");

// Progresso do usuário nos desafios
export const challengeProgressCollection = collection(
  db,
  "challengeProgress"
);

// Chat de mentoria (admin ↔ jovens)
export const mentoringMessagesCollection = collection(db, "mentoringMessages");

// Coleções já existentes — aqui não alteramos nada
export const journeysCollection = collection(db, "journeys");
export const postsCollection = collection(db, "posts");
