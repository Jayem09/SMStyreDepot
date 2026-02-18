import { create } from 'zustand';
import { requestNotificationToken, onForegroundMessage, isPushNotificationSupported } from '../config/firebase-config';
import { apiClient } from '../utils/apiClient';

interface NotificationState {
    permission: NotificationPermission;
    isSubscribed: boolean;
    token: string | null;
    isSupported: boolean;
    loading: boolean;
    error: string | null;

    
    checkSupport: () => Promise<void>;
    requestPermission: () => Promise<boolean>;
    subscribeToNotifications: (token: string) => Promise<void>;
    unsubscribeFromNotifications: () => Promise<void>;
    initializeForegroundListener: () => void;
}


export const useNotificationStore = create<NotificationState>((set, get) => ({
    permission: 'default',
    isSubscribed: false,
    token: null,
    isSupported: false,
    loading: false,
    error: null,

    
    checkSupport: async () => {
        const supported = await isPushNotificationSupported();
        set({ isSupported: supported });

        if (supported && 'Notification' in window) {
            set({ permission: Notification.permission });
        }
    },

    
    requestPermission: async () => {
        set({ loading: true, error: null });

        try {
            
            if (Notification.permission === 'granted') {
                const token = await requestNotificationToken();
                if (token) {
                    set({ permission: 'granted', token });
                    return true;
                }
            }

            
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

    
    subscribeToNotifications: async () => {
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

            await apiClient.post('/api/notifications/subscribe', {
                fcmToken: token,
                deviceInfo,
            });

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

    
    unsubscribeFromNotifications: async () => {
        set({ loading: true, error: null });

        try {
            await apiClient.post('/api/notifications/unsubscribe');

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

    
    initializeForegroundListener: () => {
        if (typeof window === 'undefined' || !('PushManager' in window)) return;
        
        onForegroundMessage((payload) => {
            console.log('📬 Foreground notification:', payload);

            
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
