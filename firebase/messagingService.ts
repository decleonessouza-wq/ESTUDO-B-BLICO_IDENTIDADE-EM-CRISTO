// firebase/messagingService.ts
import { db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const TOKENS_COLLECTION = "notificationTokens";

export async function saveFcmToken(userId: string, token: string) {
  if (!userId || !token) return;
  const ref = doc(db, TOKENS_COLLECTION, userId);
  await setDoc(
    ref,
    {
      userId,
      token,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
