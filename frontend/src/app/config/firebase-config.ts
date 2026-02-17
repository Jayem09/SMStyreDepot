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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging: ReturnType<typeof getMessaging> | null = null;

/**
 * Initialize Firebase Messaging
 * Only works in browsers that support service workers
 */
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

/**
 * Request FCM token for push notifications
 * @returns {Promise<string|null>} FCM token or null if failed
 */
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

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('ℹ️  Notification permission denied');
            return null;
        }

        // Create config query string for the service worker
        const swConfigParams = new URLSearchParams({
            apiKey: firebaseConfig.apiKey || '',
            authDomain: firebaseConfig.authDomain || '',
            projectId: firebaseConfig.projectId || '',
            storageBucket: firebaseConfig.storageBucket || '',
            messagingSenderId: firebaseConfig.messagingSenderId || '',
            appId: firebaseConfig.appId || '',
            measurementId: firebaseConfig.measurementId || ''
        }).toString();

        // Register service worker manually with config params
        const registration = await navigator.serviceWorker.register(
            `/firebase-messaging-sw.js?${swConfigParams}`
        );

        // Get FCM token using the manual registration
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

/**
 * Listen for foreground messages
 * @param {Function} callback - Callback function to handle messages
 */
export function onForegroundMessage(callback: (payload: any) => void) {
    initializeMessaging().then((messagingInstance) => {
        if (!messagingInstance) return;

        onMessage(messagingInstance, (payload) => {
            console.log('📬 Foreground message received:', payload);
            callback(payload);
        });
    });
}

/**
 * Check if push notifications are supported
 * @returns {Promise<boolean>}
 */
export async function isPushNotificationSupported(): Promise<boolean> {
    try {
        return await isSupported() && 'Notification' in window && 'serviceWorker' in navigator;
    } catch {
        return false;
    }
}

export { app, messaging };
