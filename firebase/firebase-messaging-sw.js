// public/firebase-messaging-sw.js

// Usa SDK compat de FCM só dentro do service worker
importScripts("https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js");

// ⚠️ MESMA CONFIG DO SEU PROJETO FIREBASE
firebase.initializeApp({
  apiKey: "SEU_API_KEY_AQUI",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID",
});

const messaging = firebase.messaging();

// Mensagens recebidas com o app FECHADO / em background
messaging.onBackgroundMessage(function (payload) {
  console.log("[FCM SW] Mensagem em background:", payload);

  const notificationTitle =
    (payload.notification && payload.notification.title) ||
    "Nova mensagem da jornada";

  const notificationOptions = {
    body:
      (payload.notification && payload.notification.body) ||
      "Deus quer lembrar você de quem você é Nele. 💙",
    icon: "/icons/icon-192x192.png", // ajuste o caminho se necessário
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
