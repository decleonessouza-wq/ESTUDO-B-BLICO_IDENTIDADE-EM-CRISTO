// firebase/prayerService.ts
import { addDoc, Timestamp } from "firebase/firestore";
import { journalCollection } from "./firebase";

// Mesmas categorias usadas no app
export type PrayerCategoryFirestore =
  | "pedidoOracao"
  | "agradecimento"
  | "respostaOracao";

export interface PrayerEntryFirestore {
  userId: string;
  userName: string;
  category: PrayerCategoryFirestore;
  text: string;
  createdAt: Date;
  source: "prayerScreen";
}

/**
 * Salva uma cópia da oração no Firestore (coleção journalEntries),
 * sem mexer no funcionamento local do app.
 */
export async function savePrayerEntryToFirestore(
  data: Omit<PrayerEntryFirestore, "createdAt">
) {
  await addDoc(journalCollection, {
    userId: data.userId,
    userName: data.userName,
    category: data.category,
    text: data.text,
    source: data.source,
    createdAt: Timestamp.now(),
  });
}
