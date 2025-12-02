import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

import { db } from "./firebase";

export interface CommunityPost {
  id?: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: Date;
}

const COLLECTION = "posts";

export async function addCommunityPost(
  userId: string,
  userName: string,
  message: string
) {
  await addDoc(collection(db, COLLECTION), {
    userId,
    userName,
    message,
    createdAt: Timestamp.now(),
  });
}

export function listenToPosts(callback: (posts: CommunityPost[]) => void) {
  const q = query(
    collection(db, COLLECTION),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((doc) => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        message: data.message,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
      };
    });

    callback(posts);
  });
}
