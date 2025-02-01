importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCJQ-SjGv69jqL49149JLIATcN1fuHyCHc",
    authDomain: "agrilink-bd5d9.firebaseapp.com",
    projectId: "agrilink-bd5d9",
    storageBucket: "agrilink-bd5d9.firebasestorage.app",
    messagingSenderId: "522333959252",
    appId: "1:522333959252:web:159391699e9444b04629c1",
    measurementId: "G-GG6P760XV5"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      // icon: payload.notification.image,
    };
  
    return self.registration.showNotification(notificationTitle, notificationOptions);
  });