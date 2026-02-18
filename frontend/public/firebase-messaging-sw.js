


importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');




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
    
    console.warn('[firebase-messaging-sw.js] No config found in URL parameters');
}


const messaging = firebase.messaging();


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


self.addEventListener('notificationclick', (event) => {
    console.log('🖱️ Notification clicked:', event.notification.tag);

    event.notification.close();

    
    const notificationData = event.notification.data || {};
    let urlToOpen = notificationData.link || '/';

    
    if (notificationData.orderId) {
        urlToOpen = `/orders/${notificationData.orderId}`;
    } else if (notificationData.link && notificationData.link.includes('/orders')) {
        
        urlToOpen = notificationData.link;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            
            for (const client of clientList) {
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    
                    return client.focus().then(() => {
                        return client.navigate(urlToOpen);
                    });
                }
            }

            
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
