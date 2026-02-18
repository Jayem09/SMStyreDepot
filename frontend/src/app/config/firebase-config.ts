import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};


const app = initializeApp(firebaseConfig);


let messaging: ReturnType<typeof getMessaging> | null = null;


export async function initializeMessaging() {
    try {
        const supported = await isSupported();
        if (!supported) {
            console.warn('⚠️  Firebase Messaging is not supported in this browser');
            return null;
        }

        if (!messaging) {
            messaging = getMessaging(app);
            console.log('✅ Firebase Messaging initialized');
        }

        return messaging;
    } catch (error) {
        console.error('Failed to initialize Firebase Messaging:', error);
        return null;
    }
}


export async function requestNotificationToken(): Promise<string | null> {
    try {
        const messagingInstance = await initializeMessaging();
        if (!messagingInstance) {
            return null;
        }

        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (!vapidKey || vapidKey === 'your-vapid-key-here') {
            console.error('❌ VAPID key not configured. Please set VITE_FIREBASE_VAPID_KEY in .env');
            return null;
        }

        
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('ℹ️  Notification permission denied');
            return null;
        }

        
        const swConfigParams = new URLSearchParams({
            apiKey: firebaseConfig.apiKey || '',
            authDomain: firebaseConfig.authDomain || '',
            projectId: firebaseConfig.projectId || '',
            storageBucket: firebaseConfig.storageBucket || '',
            messagingSenderId: firebaseConfig.messagingSenderId || '',
            appId: firebaseConfig.appId || '',
            measurementId: firebaseConfig.measurementId || ''
        }).toString();
        await navigator.serviceWorker.register(
            `/firebase-messaging-sw.js?${swConfigParams}`
        );
        const registration = await navigator.serviceWorker.ready;

        if (!registration.pushManager) {
            console.error('❌ Push Manager not available on registration. Browser might not support Push API in this context.');
            return null;
        }
        const token = await getToken(messagingInstance, {
            vapidKey,
            serviceWorkerRegistration: registration
        });

        console.log('✅ FCM token obtained with custom registration');
        return token;
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
}


export function onForegroundMessage(callback: (payload: any) => void) {
    initializeMessaging().then((messagingInstance) => {
        if (!messagingInstance) return;

        onMessage(messagingInstance, (payload) => {
            console.log('📬 Foreground message received:', payload);
            callback(payload);
        });
    });
}


export async function isPushNotificationSupported(): Promise<boolean> {
    try {
        return await isSupported() && 'Notification' in window && 'serviceWorker' in navigator;
    } catch {
        return false;
    }
}

export { app, messaging };
