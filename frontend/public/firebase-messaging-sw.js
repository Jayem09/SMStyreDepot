// Firebase Cloud Messaging Service Worker
// This file handles background notifications when the app is not in focus

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
// Initialize Firebase in the service worker
// The configuration is passed via query parameters during registration
const urlParams = new URLSearchParams(location.search);
const firebaseConfig = {
    apiKey: urlParams.get('apiKey'),
    authDomain: urlParams.get('authDomain'),
    projectId: urlParams.get('projectId'),
    storageBucket: urlParams.get('storageBucket'),
    messagingSenderId: urlParams.get('messagingSenderId'),
    appId: urlParams.get('appId'),
    measurementId: urlParams.get('measurementId')
};

if (firebaseConfig.apiKey) {
    firebase.initializeApp(firebaseConfig);
} else {
    // Fallback if no params (should not happen if registered correctly)
    console.warn('[firebase-messaging-sw.js] No config found in URL parameters');
}

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification?.title || 'SMS Tyre Depot';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: payload.notification?.icon || '/logo.png',
        badge: '/logo.png',
        data: payload.data,
        tag: payload.data?.link || 'default',
        requireInteraction: false,
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('🖱️ Notification clicked:', event.notification.tag);

    event.notification.close();

    // Get the notification data
    const notificationData = event.notification.data || {};
    let urlToOpen = notificationData.link || '/';

    // If this is an order notification, extract order ID and navigate to order details
    if (notificationData.orderId) {
        urlToOpen = `/orders/${notificationData.orderId}`;
    } else if (notificationData.link && notificationData.link.includes('/orders')) {
        // Link already points to orders page, use it
        urlToOpen = notificationData.link;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if there's already a window open
            for (const client of clientList) {
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    // Focus existing window and navigate to the URL
                    return client.focus().then(() => {
                        return client.navigate(urlToOpen);
                    });
                }
            }

            // No window open, open a new one
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
