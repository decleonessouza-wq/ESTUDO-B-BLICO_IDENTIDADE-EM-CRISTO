import { db } from "./firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

/** LER TODAS AS JORNADAS */
export async function getAllJourneys() {
  const snapshot = await getDocs(collection(db, "journeys"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/** LER TODOS OS POSTS DO MURAL */
export async function getAllPosts() {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
