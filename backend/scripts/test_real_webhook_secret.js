import crypto from 'crypto';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const orderId = process.argv[2];

if (!orderId) {
    console.error('Please provide an order ID as an argument.');
    console.error('Usage: node scripts/test_real_webhook_secret.js <order_id>');
    process.exit(1);
}

const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
const port = process.env.PORT || 3001;
const url = `http://localhost:${port}/api/payments/webhook`;

console.log(`🔹 Simulating PayMongo Webhook (Real Secret) for Order #${orderId}...`);
console.log(`🔹 Target URL: ${url}`);
console.log(`🔹 Secret Used: ${webhookSecret}`);

const payload = {
    data: {
        id: "evt_test_" + Date.now(),
        type: "event",
        attributes: {
            type: "payment.paid",
            livemode: true, 
            created_at: Math.floor(Date.now() / 1000),
            updated_at: Math.floor(Date.now() / 1000),
            resource: {
                type: "payment",
                id: "pay_test_" + Date.now(),
                attributes: {
                    amount: 10000, 
                    currency: "PHP",
                    description: `SMS Tyre Depot Order #${orderId}`,
                    status: "paid"
                }
            }
        }
    }
};

const payloadString = JSON.stringify(payload);
const timestamp = Math.floor(Date.now() / 1000);
const signatureString = `${timestamp}.${payloadString}`;
const signature = crypto.createHmac('sha256', webhookSecret).update(signatureString).digest('hex');
const header = `t=${timestamp},te=${signature},li=${signature}`; 

try {
    axios.post(url, payload, {
        headers: {
            'Content-Type': 'application/json',
            'paymongo-signature': header
        }
    }).then(response => {
        console.log('✅ Webhook sent successfully!');
        console.log('Response:', response.data);
    }).catch(error => {
        console.error('❌ Error sending webhook:', error.response ? error.response.data : error.message);
    });
} catch (error) {
    console.error('❌ script error:', error);
}
