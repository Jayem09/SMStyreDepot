import supabase from '../config/database.js';
import crypto from 'crypto';
import { sendOrderUpdateNotification } from '../services/pushNotificationService.js';

export const handlePayMongoWebhook = async (req, res) => {
    const signature = req.headers['paymongo-signature'];
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
        return res.status(400).json({ error: 'Missing signature or secret' });
    }

    try {
        // 1. Verify webhook signature (Basic security check)
        // In a real implementation, you'd parse PayMongo's complex signature format
        // For now, we'll log and process the event types for 'checkout_session.paid'

        const { data } = req.body;
        const eventType = data.attributes.type; // e.g., 'payment.paid'
        const resource = data.attributes.resource;
        const attributes = resource.attributes;

        console.log(`🔔 PayMongo Webhook Received: ${eventType}`);

        // Handle various payment success events
        const successEvents = [
            'payment.paid',
            'checkout_session.payment.paid',
            'source.chargeable',
            'link.payment.paid'
        ];

        if (successEvents.includes(eventType)) {
            const description = attributes.description; // e.g. "SMS Tyre Depot Order #123"

            if (description) {
                // Extract Order ID from description (looks for # followed by digits)
                const orderIdMatch = description.match(/#(\d+)/);
                if (orderIdMatch) {
                    const orderId = orderIdMatch[1];

                    // Update Order status in Database
                    const { error } = await supabase
                        .from('orders')
                        .update({
                            status: 'paid',
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', orderId);

                    if (error) {
                        console.error(`❌ Failed to update order #${orderId} to paid:`, error);
                        return res.status(500).json({ error: 'Database update failed' });
                    }

                    console.log(`✅ Order #${orderId} marked as PAID via PayMongo webhook (${eventType}).`);

                    // Get user_id for the order to send notification
                    const { data: orderData } = await supabase
                        .from('orders')
                        .select('user_id')
                        .eq('id', orderId)
                        .single();

                    // Send push notification for payment confirmation
                    if (orderData?.user_id) {
                        try {
                            await sendOrderUpdateNotification(orderData.user_id, orderId, 'paid');
                        } catch (notifError) {
                            console.error('Push notification error:', notifError);
                        }
                    }

                    // Trigger order confirmation email
                    import('../services/notificationService.js').then(({ sendOrderEmail }) => {
                        sendOrderEmail(orderId, 'CONFIRMATION').catch(err => console.error('Email trigger error:', err));
                    });
                }
            }
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};
