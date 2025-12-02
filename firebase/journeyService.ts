import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { StageProgress, BonusGameId } from "../types";

export interface JourneyDocument {
  userId: string;
  userName: string;
  birthDate: string | null;
  stageProgress: Record<number, StageProgress>;
  currentStageId: number;
  totalScore: number;
  completedStages: number;
  journeyStartAt: string | null;
  completedAt: string | null;
  totalTimeMinutes: number | null;
  completedBonusGames: BonusGameId[];
  physicalRewardChoice: "yes" | "no" | null;
}

const COLLECTION = "journeys";

export async function loadJourney(userId: string): Promise<JourneyDocument | null> {
  const ref = doc(db, COLLECTION, userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;
  return snap.data() as JourneyDocument;
}

export async function saveJourney(data: JourneyDocument) {
  const ref = doc(db, COLLECTION, data.userId);
  await setDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
