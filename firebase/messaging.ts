// src/firebase/messaging.ts
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
  Messaging,
  MessagePayload,
} from "firebase/messaging";

// Reaproveita o app se já estiver inicializado em outro lugar
function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }

  // ⚠️ Usa as mesmas envs do seu projeto Firebase atual
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  return initializeApp(firebaseConfig);
}

let messagingPromise: Promise<Messaging | null> | null = null;

function getMessagingInstance(): Promise<Messaging | null> {
  if (!messagingPromise) {
    messagingPromise = isSupported().then((supported) => {
      if (!supported) {
        console.warn("[FCM] Este navegador não suporta notificações push.");
        return null;
      }
      const app = getFirebaseApp();
      return getMessaging(app);
    });
  }
  return messagingPromise;
}

/**
 * Pede permissão ao usuário e retorna o FCM token (se der certo).
 * Salve esse token depois no Firestore para poder enviar notificações do servidor.
 */
export async function requestNotificationPermissionAndToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  if (!("Notification" in window)) {
    console.warn("[FCM] Navegador não suporta Notification API.");
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.log("[FCM] Permissão de notificação negada ou ignorada.");
    return null;
  }

  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  // ⚠️ Configure a sua VAPID KEY em .env: VITE_FIREBASE_VAPID_KEY
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

  const token = await getToken(messaging, vapidKey ? { vapidKey } : undefined);
  if (!token) {
    console.warn("[FCM] Não foi possível obter o token FCM.");
    return null;
  }

  console.log("[FCM] Token do dispositivo:", token);
  return token;
}

/**
 * Listener para mensagens recebidas com o app aberto (foreground).
 * Use se quiser mostrar toasts dentro do app quando chegar push.
 */
export function subscribeToForegroundMessages(
  callback: (payload: MessagePayload) => void
) {
  getMessagingInstance().then((messaging) => {
    if (!messaging) return;
    onMessage(messaging, callback);
  });
}
