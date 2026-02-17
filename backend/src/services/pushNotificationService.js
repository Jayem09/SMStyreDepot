import { getMessaging, isFirebaseConfigured } from '../config/firebase-config.js';
import supabase from '../config/database.js';

/**
 * Subscribe a user to push notifications
 * @param {number} userId - User ID
 * @param {string} fcmToken - Firebase Cloud Messaging token
 * @param {object} deviceInfo - Device/browser information
 * @returns {Promise<object>} Subscription record
 */
export async function subscribeToPushNotifications(userId, fcmToken, deviceInfo = {}) {
    try {
        // Check if token already exists for this user
        const { data: existing, error: selectError } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('fcm_token', fcmToken);

        if (selectError) throw selectError;

        if (existing && existing.length > 0) {
            // Update existing subscription
            const { data, error } = await supabase
                .from('push_subscriptions')
                .update({
                    device_info: deviceInfo,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing[0].id)
                .select()
                .single();

            if (error) throw error;
            return data;
        }

        // Insert new subscription
        const { data, error } = await supabase
            .from('push_subscriptions')
            .insert({
                user_id: userId,
                fcm_token: fcmToken,
                device_info: deviceInfo
            })
            .select()
            .single();

        if (error) throw error;

        console.log(`✅ User ${userId} subscribed to push notifications`);
        return data;
    } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        throw error;
    }
}

/**
 * Unsubscribe a user from push notifications
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export async function unsubscribeFromPushNotifications(userId) {
    try {
        const { error } = await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;

        console.log(`✅ User ${userId} unsubscribed from push notifications`);
        return true;
    } catch (error) {
        console.error('Error unsubscribing from push notifications:', error);
        throw error;
    }
}

/**
 * Get all FCM tokens for a specific user
 * @param {number} userId - User ID
 * @returns {Promise<string[]>} Array of FCM tokens
 */
export async function getUserTokens(userId) {
    try {
        const { data, error } = await supabase
            .from('push_subscriptions')
            .select('fcm_token')
            .eq('user_id', userId);

        if (error) throw error;

        return data ? data.map(row => row.fcm_token) : [];
    } catch (error) {
        console.error('Error getting user tokens:', error);
        return [];
    }
}

/**
 * Get all FCM tokens (for broadcast)
 * @returns {Promise<string[]>} Array of all FCM tokens
 */
export async function getAllTokens() {
    try {
        const { data, error } = await supabase
            .from('push_subscriptions')
            .select('fcm_token');

        if (error) throw error;

        return data ? data.map(row => row.fcm_token) : [];
    } catch (error) {
        console.error('Error getting all tokens:', error);
        return [];
    }
}

/**
 * Send push notification to specific user
 * @param {number} userId - User ID
 * @param {object} notification - Notification payload {title, body, link}
 * @returns {Promise<object>} Send result
 */
export async function sendNotificationToUser(userId, notification) {
    if (!isFirebaseConfigured()) {
        console.warn('⚠️  Firebase not configured. Skipping notification.');
        return { success: false, error: 'Firebase not configured' };
    }

    try {
        const tokens = await getUserTokens(userId);

        if (tokens.length === 0) {
            console.log(`ℹ️  User ${userId} has no push subscriptions`);
            return { success: false, error: 'No subscriptions' };
        }

        return await sendBulkNotification(tokens, notification);
    } catch (error) {
        console.error('Error sending notification to user:', error);
        throw error;
    }
}

/**
 * Send push notification to multiple tokens
 * @param {string[]} tokens - Array of FCM tokens
 * @param {object} notification - Notification payload {title, body, link, icon, badge}
 * @returns {Promise<object>} Send result
 */
export async function sendBulkNotification(tokens, notification) {
    if (!isFirebaseConfigured()) {
        console.warn('⚠️  Firebase not configured. Skipping notification.');
        return { success: false, error: 'Firebase not configured' };
    }

    if (!tokens || tokens.length === 0) {
        return { success: false, error: 'No tokens provided' };
    }

    try {
        const messaging = getMessaging();
        if (!messaging) {
            return { success: false, error: 'Firebase messaging not available' };
        }

        const message = {
            notification: {
                title: notification.title,
                body: notification.body,
                ...(notification.icon && { imageUrl: notification.icon }),
            },
            data: {
                ...(notification.link && { link: notification.link }),
                timestamp: Date.now().toString(),
            },
            tokens: tokens.slice(0, 500), // FCM limit: 500 tokens per request
        };

        const response = await messaging.sendEachForMulticast(message);

        console.log(`✅ Sent ${response.successCount} notifications, ${response.failureCount} failed`);

        // Remove invalid tokens
        if (response.failureCount > 0) {
            const invalidTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    invalidTokens.push(tokens[idx]);
                    console.warn(`Failed to send to token: ${resp.error?.message}`);
                }
            });

            // Clean up invalid tokens from database
            if (invalidTokens.length > 0) {
                await cleanupInvalidTokens(invalidTokens);
            }
        }

        return {
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount,
        };
    } catch (error) {
        console.error('Error sending bulk notification:', error);
        throw error;
    }
}

/**
 * Send order update notification
 * @param {number} userId - User ID
 * @param {number} orderId - Order ID
 * @param {string} status - Order status
 * @returns {Promise<object>} Send result
 */
export async function sendOrderUpdateNotification(userId, orderId, status) {
    const statusMessages = {
        confirmed: {
            title: '✅ Order Confirmed',
            body: `Your order #${orderId} has been confirmed and is being processed.`,
        },
        processing: {
            title: '⚙️ Order Processing',
            body: `Your order #${orderId} is being prepared for shipment.`,
        },
        shipped: {
            title: '🚚 Order Shipped',
            body: `Your order #${orderId} is on the way! Track your delivery.`,
        },
        delivered: {
            title: '📦 Order Delivered',
            body: `Your order #${orderId} has been delivered. Enjoy your new tyres!`,
        },
        cancelled: {
            title: '❌ Order Cancelled',
            body: `Your order #${orderId} has been cancelled.`,
        },
    };

    const notification = statusMessages[status] || {
        title: 'Order Update',
        body: `Your order #${orderId} status: ${status}`,
    };

    notification.link = `/orders`;

    return await sendNotificationToUser(userId, notification);
}

/**
 * Send promotional notification to all users
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {string} link - Optional link
 * @returns {Promise<object>} Send result
 */
export async function sendPromotionalNotification(title, body, link = null) {
    const tokens = await getAllTokens();

    if (tokens.length === 0) {
        console.log('ℹ️  No subscribers for promotional notification');
        return { success: false, error: 'No subscribers' };
    }

    const notification = {
        title,
        body,
        link: link || '/products',
    };

    // Send in batches of 500 (FCM limit)
    const results = [];
    for (let i = 0; i < tokens.length; i += 500) {
        const batch = tokens.slice(i, i + 500);
        const result = await sendBulkNotification(batch, notification);
        results.push(result);
    }

    const totalSuccess = results.reduce((sum, r) => sum + (r.successCount || 0), 0);
    const totalFailure = results.reduce((sum, r) => sum + (r.failureCount || 0), 0);

    console.log(`📢 Promotional notification sent to ${totalSuccess} users`);

    return {
        success: true,
        successCount: totalSuccess,
        failureCount: totalFailure,
    };
}

/**
 * Send inventory alert notification
 * @param {number} userId - User ID
 * @param {string} productName - Product name
 * @returns {Promise<object>} Send result
 */
export async function sendInventoryAlertNotification(userId, productName) {
    const notification = {
        title: '🎉 Back in Stock!',
        body: `Good news! ${productName} is now available.`,
        link: '/products',
    };

    return await sendNotificationToUser(userId, notification);
}

/**
 * Clean up invalid FCM tokens from database
 * @param {string[]} invalidTokens - Array of invalid tokens
 */
async function cleanupInvalidTokens(invalidTokens) {
    try {
        if (invalidTokens.length === 0) return;

        const { error } = await supabase
            .from('push_subscriptions')
            .delete()
            .in('fcm_token', invalidTokens);

        if (error) throw error;

        console.log(`🧹 Cleaned up ${invalidTokens.length} invalid tokens`);
    } catch (error) {
        console.error('Error cleaning up invalid tokens:', error);
    }
}
