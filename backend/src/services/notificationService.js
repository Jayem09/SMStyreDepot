import { Resend } from 'resend';
import axios from 'axios';
import dotenv from 'dotenv';
import supabase from '../config/database.js';

dotenv.config();

// Initialize Resend with API Key
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendAppointmentEmail = async (appointmentData) => {
  const { full_name, email, phone, branch, service_type, appointment_date, appointment_time, notes } = appointmentData;

  // 1. Send Email to Customer (Resend)
  const emailPromise = sendCustomerEmail(appointmentData);

  // 2. Send Telegram Alert to Owner
  const telegramPromise = sendOwnerTelegram(appointmentData);

  // Wait for both but don't let one failure block the other
  const [emailResult, telegramResult] = await Promise.all([
    emailPromise.catch(err => ({ success: false, error: err })),
    telegramPromise.catch(err => ({ success: false, error: err }))
  ]);

  return {
    success: emailResult.success || telegramResult.success,
    email: emailResult,
    telegram: telegramResult
  };
};

export const sendOrderEmail = async (orderId, type = 'CONFIRMATION') => {
  if (!resend) {
    console.warn('⚠️  RESEND_API_KEY missing. Skipping order email.');
    return { success: false, error: 'API Key missing' };
  }

  try {
    console.log(`📨 Fetching order details for email notification (Order #${orderId})...`);

    // Fetch order with user and items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, users:user_id(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) throw orderError || new Error('Order not found');

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*, products:product_id(name, brand, size)')
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    const customerEmail = order.users?.email;
    if (!customerEmail) throw new Error('Customer email not found');

    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const subject = type === 'CONFIRMATION'
      ? `Order Confirmed - Order #${orderId}`
      : `Order Status Update - Order #${orderId}`;

    const html = getOrderHTML(order, items, type);

    const { data, error } = await resend.emails.send({
      from: `SMS Tyre Depot <${fromEmail}>`,
      to: [customerEmail],
      subject: subject,
      html: html
    });

    if (error) {
      console.error('❌ Resend API Error (Order Email):', error);
      return { success: false, error };
    }

    console.log(`✅ Order email sent successfully! ID: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('❌ sendOrderEmail Error:', err);
    return { success: false, error: err.message };
  }
};

const sendCustomerEmail = async (d) => {
  if (!resend) {
    console.warn('⚠️  RESEND_API_KEY missing. Skipping email.');
    return { success: false, error: 'API Key missing' };
  }

  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  const ownerEmail = process.env.OWNER_EMAIL || 'johndinglasan12@gmail.com';

  try {
    console.log(`📨 Sending customer confirmation to: ${d.email}...`);

    const { data, error } = await resend.emails.send({
      from: `SMS Tyre Depot <${fromEmail}>`,
      to: [d.email],
      subject: 'Appointment Confirmed - SMS Tyre Depot',
      html: getCustomerHTML(d),
      bcc: [ownerEmail]
    });

    if (error) {
      if (error.name === 'validation_error' || error.message?.includes('verified')) {
        console.error('❌ Resend Sandbox Restriction: Emails can only be sent to the verified account owner in Sandbox mode.');

        await resend.emails.send({
          from: `SMS Tyre Depot <${fromEmail}>`,
          to: [ownerEmail],
          subject: '⚠️ Notification Failed for Customer',
          html: `<p>A booking was made by <strong>${d.full_name}</strong> (${d.email}), but the confirmation email could not be sent due to Resend Sandbox restrictions.</p>`
        });
      }
      console.error('❌ Resend API Error:', error);
      return { success: false, error };
    }

    console.log(`✅ Email sent! ID: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('❌ Resend Fatal Error:', err);
    return { success: false, error: err.message };
  }
};

const sendOwnerTelegram = async (d) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId || token === 'your_bot_token_here') {
    console.warn('⚠️  Telegram Bot Token or Chat ID missing. Skipping alert.');
    return { success: false, error: 'Config missing' };
  }

  const message = `🏎️ *New Booking Alert!* 🏎️\n\n` +
    `👤 *Customer:* ${d.full_name}\n` +
    `🛠️ *Service:* ${d.service_type}\n` +
    `📅 *Date:* ${d.appointment_date}\n` +
    `⏰ *Time:* ${d.appointment_time}\n` +
    `📍 *Branch:* ${d.branch}\n` +
    `📞 *Phone:* ${d.phone}\n` +
    `✉️ *Email:* ${d.email}\n` +
    `📝 *Notes:* ${d.notes || 'None'}`;

  try {
    console.log(`📱 Sending Telegram alert to owner...`);
    const response = await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });

    console.log(`✅ Telegram alert sent successfully!`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Telegram Error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

// HTML Templates
const getCustomerHTML = (d) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
    <h2 style="color: #1e293b;">Hello ${d.full_name},</h2>
    <p>Your appointment at <strong>SMS Tyre Depot</strong> has been successfully scheduled!</p>
    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #f1f5f9;">
      <p style="margin: 5px 0;"><strong>Service:</strong> ${d.service_type}</p>
      <p style="margin: 5px 0;"><strong>Branch:</strong> ${d.branch}</p>
      <p style="margin: 5px 0;"><strong>Date:</strong> ${d.appointment_date}</p>
      <p style="margin: 5px 0;"><strong>Time:</strong> ${d.appointment_time}</p>
    </div>
    <p>If you need to reschedule or have any questions, please contact us at ${process.env.OWNER_PHONE || 'our branch'}.</p>
    <p>See you soon!</p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
    <p style="font-size: 11px; color: #94a3b8;">Automated message from SMS Tyre Depot.</p>
  </div>
`;

const getOrderHTML = (order, items, type) => {
  const isConfirmation = type === 'CONFIRMATION';
  const statusColor = {
    'paid': '#10b981',
    'shipped': '#3b82f6',
    'delivered': '#10b981',
    'cancelled': '#ef4444',
    'processing': '#f59e0b'
  }[order.status] || '#1e293b';

  return `
  <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #1e293b; margin: 0;">SMS Tyre Depot</h1>
      <p style="color: #64748b; font-size: 14px;">Premium Tyre Services & Solutions</p>
    </div>
    
    <h2 style="color: #1e293b;">${isConfirmation ? 'Order Confirmation' : 'Order Update'}</h2>
    <p>Hello ${order.users?.name},</p>
    <p>${isConfirmation
      ? `Thank you for your order! We've received your request and are processing it now.`
      : `Your order status has been updated to <strong style="color: ${statusColor}; text-transform: uppercase;">${order.status}</strong>.`
    }</p>

    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #f1f5f9;">
      <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order.id}</p>
      <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold; text-transform: uppercase;">${order.status}</span></p>
      <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}</p>
    </div>

    <h3 style="color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Order Summary</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
      <thead>
        <tr style="text-align: left; background-color: #f8fafc;">
          <th style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Item</th>
          <th style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">Qty</th>
          <th style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">
              <strong>${item.products?.brand} ${item.products?.name}</strong><br/>
              <span style="font-size: 12px; color: #64748b;">${item.products?.size}</span>
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; text-align: right;">₱${parseFloat(item.price).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding: 12px 8px; text-align: right; font-weight: bold;">Total</td>
          <td style="padding: 12px 8px; text-align: right; font-weight: bold; font-size: 18px; color: #1e293b;">₱${parseFloat(order.total).toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>

    <div style="margin: 20px 0;">
      <h3 style="color: #1e293b; margin-bottom: 8px;">Delivery Details</h3>
      <p style="margin: 0; color: #475569; font-size: 14px;">
        ${order.shipping_address}<br/>
        ${order.shipping_city}, ${order.shipping_state} ${order.shipping_zip}<br/>
        Phone: ${order.shipping_phone}
      </p>
    </div>

    <p style="font-size: 14px; color: #475569;">If you have any questions, please reply to this email or call us.</p>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
    <p style="font-size: 11px; color: #94a3b8; text-align: center;">Automated message from SMS Tyre Depot.</p>
  </div>
`;
};
