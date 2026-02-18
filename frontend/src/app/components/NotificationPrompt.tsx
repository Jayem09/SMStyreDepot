import { useEffect, useState } from 'react';
import { X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotificationStore } from '../stores/notificationStore';
import { useAuthStore } from '../stores/authStore';

export function NotificationPrompt() {
    const [isVisible, setIsVisible] = useState(false);
    const { isAuthenticated, token } = useAuthStore();
    const {
        isSupported,
        permission,
        isSubscribed,
        loading,
        checkSupport,
        requestPermission,
        subscribeToNotifications,
        initializeForegroundListener,
    } = useNotificationStore();

    useEffect(() => {
        
        checkSupport();

        
        initializeForegroundListener();
    }, [checkSupport, initializeForegroundListener]);

    useEffect(() => {
        
        
        
        
        
        
        const dismissed = sessionStorage.getItem('notification-prompt-dismissed');

        if (
            isAuthenticated &&
            isSupported &&
            permission === 'default' &&
            !isSubscribed &&
            !dismissed
        ) {
            
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, isSupported, permission, isSubscribed]);

    const handleEnable = async () => {
        try {
            const granted = await requestPermission();

            if (granted && token) {
                await subscribeToNotifications(token);
                setIsVisible(false);
            }
        } catch (error) {
            console.error('Failed to enable notifications:', error);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('notification-prompt-dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-6 right-6 z-50 max-w-sm"
            >
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 relative">
                    {}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {}
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Bell className="w-6 h-6 text-blue-600" />
                    </div>

                    {}
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                        Stay Updated!
                    </h3>
                    <p className="text-sm text-slate-600 mb-6">
                        Get instant notifications about your orders, exclusive deals, and new arrivals.
                    </p>

                    {}
                    <div className="flex gap-3">
                        <button
                            onClick={handleEnable}
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Enabling...' : 'Enable Notifications'}
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
