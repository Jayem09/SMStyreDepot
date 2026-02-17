import { create } from 'zustand';
import { requestNotificationToken, onForegroundMessage, isPushNotificationSupported } from '../config/firebase-config';

interface NotificationState {
    permission: NotificationPermission;
    isSubscribed: boolean;
    token: string | null;
    isSupported: boolean;
    loading: boolean;
    error: string | null;

    // Actions
    checkSupport: () => Promise<void>;
    requestPermission: () => Promise<boolean>;
    subscribeToNotifications: (token: string) => Promise<void>;
    unsubscribeFromNotifications: () => Promise<void>;
    initializeForegroundListener: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useNotificationStore = create<NotificationState>((set, get) => ({
    permission: 'default',
    isSubscribed: false,
    token: null,
    isSupported: false,
    loading: false,
    error: null,

    /**
     * Check if push notifications are supported in this browser
     */
    checkSupport: async () => {
        const supported = await isPushNotificationSupported();
        set({ isSupported: supported });

        if (supported && 'Notification' in window) {
            set({ permission: Notification.permission });
        }
    },

    /**
     * Request notification permission and get FCM token
     */
    requestPermission: async () => {
        set({ loading: true, error: null });

        try {
            // Check if already granted
            if (Notification.permission === 'granted') {
                const token = await requestNotificationToken();
                if (token) {
                    set({ permission: 'granted', token });
                    return true;
                }
            }

            // Request permission
            const token = await requestNotificationToken();

            if (token) {
                set({
                    permission: 'granted',
                    token,
                    loading: false
                });
                return true;
            } else {
                set({
                    permission: Notification.permission,
                    loading: false,
                    error: 'Failed to get notification token'
                });
                return false;
            }
        } catch (error: any) {
            console.error('Error requesting notification permission:', error);
            set({
                loading: false,
                error: error.message || 'Failed to request permission'
            });
            return false;
        }
    },

    /**
     * Subscribe to push notifications (save token to backend)
     */
    subscribeToNotifications: async (authToken: string) => {
        set({ loading: true, error: null });

        try {
            const { token } = get();

            if (!token) {
                throw new Error('No FCM token available. Request permission first.');
            }

            const deviceInfo = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
            };

            const response = await fetch(`${API_URL}/api/notifications/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    fcmToken: token,
                    deviceInfo,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to subscribe');
            }

            set({ isSubscribed: true, loading: false });
            console.log('✅ Subscribed to push notifications');
        } catch (error: any) {
            console.error('Error subscribing to notifications:', error);
            set({
                loading: false,
                error: error.message || 'Failed to subscribe'
            });
            throw error;
        }
    },

    /**
     * Unsubscribe from push notifications
     */
    unsubscribeFromNotifications: async () => {
        set({ loading: true, error: null });

        try {
            const authToken = localStorage.getItem('token');
            if (!authToken) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(`${API_URL}/api/notifications/unsubscribe`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to unsubscribe');
            }

            set({
                isSubscribed: false,
                token: null,
                loading: false
            });
            console.log('✅ Unsubscribed from push notifications');
        } catch (error: any) {
            console.error('Error unsubscribing from notifications:', error);
            set({
                loading: false,
                error: error.message || 'Failed to unsubscribe'
            });
            throw error;
        }
    },

    /**
     * Initialize foreground message listener
     * Shows notifications when app is open
     */
    initializeForegroundListener: () => {
        onForegroundMessage((payload) => {
            console.log('📬 Foreground notification:', payload);

            // Show browser notification
            if (Notification.permission === 'granted' && payload.notification) {
                new Notification(payload.notification.title || 'New Notification', {
                    body: payload.notification.body,
                    icon: payload.notification.icon || '/logo.png',
                    badge: '/logo.png',
                    data: payload.data,
                });
            }
        });
    },
}));
