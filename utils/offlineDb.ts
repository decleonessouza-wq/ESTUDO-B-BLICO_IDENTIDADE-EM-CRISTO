// src/utils/offlineDb.ts
// Helper simples para trabalhar com IndexedDB

const DB_NAME = "identidade_offline_db";
const DB_VERSION = 1;
const STORE_JOURNEY = "journey";
const STORE_POSTS = "posts";
const STORE_PENDING_POSTS = "pending_posts";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_JOURNEY)) {
        db.createObjectStore(STORE_JOURNEY, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_POSTS)) {
        db.createObjectStore(STORE_POSTS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_PENDING_POSTS)) {
        db.createObjectStore(STORE_PENDING_POSTS, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function put(storeName: string, value: any) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function get(storeName: string, key: IDBValidKey) {
  const db = await openDb();
  return new Promise<any>((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAll(storeName: string) {
  const db = await openDb();
  return new Promise<any[]>((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function clearStore(storeName: string) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// APIs específicas do app:

// 1) Salvar snapshot da jornada (progresso, stages, score...)
export async function saveJourneySnapshot(snapshot: any) {
  await put(STORE_JOURNEY, { id: "journey", ...snapshot });
}

export async function loadJourneySnapshot(): Promise<any | null> {
  const data = await get(STORE_JOURNEY, "journey");
  return data || null;
}

// 2) Posts do mural (estado local para abrir offline)
export async function savePosts(posts: any[]) {
  await put(STORE_POSTS, { id: "posts", items: posts });
}

export async function loadPosts(): Promise<any[]> {
  const data = await get(STORE_POSTS, "posts");
  return data?.items || [];
}

// 3) Fila de posts pendentes (quando offline)
export async function queuePendingPost(post: any) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING_POSTS, "readwrite");
    const store = tx.objectStore(STORE_PENDING_POSTS);
    store.add(post);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingPosts(): Promise<any[]> {
  return getAll(STORE_PENDING_POSTS);
}

export async function clearPendingPosts() {
  await clearStore(STORE_PENDING_POSTS);
}
