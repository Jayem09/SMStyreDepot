import {
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    sendNotificationToUser,
    sendPromotionalNotification,
} from '../services/pushNotificationService.js';
import { isFirebaseConfigured } from '../config/firebase-config.js';


export async function subscribe(req, res) {
    try {
        const { fcmToken, deviceInfo } = req.body;
        const userId = req.user.id;

        if (!fcmToken) {
            return res.status(400).json({ error: 'FCM token is required' });
        }

        if (!isFirebaseConfigured()) {
            return res.status(503).json({
                error: 'Push notifications are not configured on the server'
            });
        }

        const subscription = await subscribeToPushNotifications(userId, fcmToken, deviceInfo);

        res.json({
            message: 'Successfully subscribed to push notifications',
            subscription: {
                id: subscription.id,
                created_at: subscription.created_at,
            },
        });
    } catch (error) {
        console.error('Error in subscribe controller:', error);
        res.status(500).json({ error: 'Failed to subscribe to push notifications' });
    }
}


export async function unsubscribe(req, res) {
    try {
        const userId = req.user.id;

        await unsubscribeFromPushNotifications(userId);

        res.json({ message: 'Successfully unsubscribed from push notifications' });
    } catch (error) {
        console.error('Error in unsubscribe controller:', error);
        res.status(500).json({ error: 'Failed to unsubscribe from push notifications' });
    }
}


export async function sendTest(req, res) {
    try {
        const userId = req.user.id;

        if (!isFirebaseConfigured()) {
            return res.status(503).json({
                error: 'Push notifications are not configured on the server'
            });
        }

        const result = await sendNotificationToUser(userId, {
            title: '🧪 Test Notification',
            body: 'This is a test notification from SMS Tyre Depot!',
            link: '/',
        });

        if (!result.success) {
            return res.status(400).json({
                error: result.error || 'Failed to send test notification'
            });
        }

        res.json({
            message: 'Test notification sent successfully',
            result,
        });
    } catch (error) {
        console.error('Error in sendTest controller:', error);
        res.status(500).json({ error: 'Failed to send test notification' });
    }
}


export async function broadcast(req, res) {
    try {
        const { title, body, link } = req.body;

        if (!title || !body) {
            return res.status(400).json({ error: 'Title and body are required' });
        }

        if (!isFirebaseConfigured()) {
            return res.status(503).json({
                error: 'Push notifications are not configured on the server'
            });
        }

        const result = await sendPromotionalNotification(title, body, link);

        if (!result.success) {
            return res.status(400).json({
                error: result.error || 'Failed to send broadcast notification'
            });
        }

        res.json({
            message: 'Broadcast notification sent successfully',
            successCount: result.successCount,
            failureCount: result.failureCount,
        });
    } catch (error) {
        console.error('Error in broadcast controller:', error);
        res.status(500).json({ error: 'Failed to send broadcast notification' });
    }
}


export function getStatus(req, res) {
    res.json({
        configured: isFirebaseConfigured(),
        message: isFirebaseConfigured()
            ? 'Push notifications are enabled'
            : 'Push notifications are not configured',
    });
}
