import supabase from '../config/database.js';
import { body, validationResult } from 'express-validator';
import { sendOrderUpdateNotification } from '../services/pushNotificationService.js';

export const validateOrder = [
  body('shipping_address').trim().notEmpty().withMessage('Shipping address is required'),
  body('shipping_city').trim().notEmpty().withMessage('City is required'),
  body('shipping_state').trim().notEmpty().withMessage('State is required'),
  body('shipping_zip').trim().notEmpty().withMessage('ZIP code is required'),
  body('shipping_phone').trim().notEmpty().withMessage('Phone is required')
];

export const createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items: bodyItems } = req.body;
    let finalItems = [];

    if (bodyItems && Array.isArray(bodyItems) && bodyItems.length > 0) {
      
      
      const productIds = bodyItems.map(item => item.product_id || item.id);
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, price, stock, name')
        .in('id', productIds);

      if (productsError) throw productsError;

      finalItems = bodyItems.map(item => {
        const product = products.find(p => p.id === (item.product_id || item.id));
        if (!product) {
          throw new Error(`Product ${item.product_id || item.id} not found`);
        }
        return {
          product_id: product.id,
          quantity: item.quantity,
          products: product 
        };
      });
    } else {
      
      const { data: cartItems, error: cartError } = await supabase
        .from('cart')
        .select(`
          *,
          products:product_id (
            id,
            price,
            stock
          )
        `)
        .eq('user_id', req.user.id);

      if (cartError) throw cartError;
      finalItems = cartItems || [];
    }

    if (!finalItems || finalItems.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    
    let total = 0;
    for (const item of finalItems) {
      if (!item.products || item.products.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product: ${item.products?.name || item.product_id}` });
      }
      total += parseFloat(item.products.price) * item.quantity;
    }

    
    const isPayInStore = req.body.paymentMethod === 'store';
    const initialStatus = isPayInStore ? 'reserved' : 'pending_payment';

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: req.user.id,
        total,
        shipping_address: req.body.shipping_address,
        shipping_city: req.body.shipping_city,
        shipping_state: req.body.shipping_state,
        shipping_zip: req.body.shipping_zip,
        shipping_phone: req.body.shipping_phone,
        status: initialStatus,
        payment_method: req.body.paymentMethod || 'gcash'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderId = order.id;

    
    await Promise.all(finalItems.map(async (item) => {
      const productPrice = parseFloat(item.products.price);

      
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
          price: productPrice
        });

      if (itemError) throw itemError;

      
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: item.products.stock - item.quantity })
        .eq('id', item.product_id);

      if (stockError) throw stockError;
    }));

    
    await supabase
      .from('cart')
      .delete()
      .eq('user_id', req.user.id);

    
    
    
    if (!isPayInStore) {
      try {
        const paymongoSecret = process.env.PAYMONGO_SECRET_KEY;
        const methodMap = {
          'gcash': 'gcash',
          'maya': 'paymaya',
          'card': 'card',
        };
        const pmType = methodMap[req.body.paymentMethod] || 'gcash';

        const options = {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            authorization: `Basic ${Buffer.from(paymongoSecret + ':').toString('base64')}`
          },
          body: JSON.stringify({
            data: {
              attributes: {
                send_email_receipt: true,
                show_description: true,
                show_line_items: true,
                description: `SMS Tyre Depot Order #${orderId}`,
                line_items: finalItems.map(item => ({
                  currency: 'PHP',
                  amount: Math.round(parseFloat(item.products.price) * 100), 
                  name: item.products.name || `Product #${item.product_id}`,
                  quantity: item.quantity
                })),
                payment_method_types: ['qrph', 'card', 'gcash', 'paymaya'],
                success_url: `${process.env.FRONTEND_URL}/dashboard?order=success&id=${orderId}`,
                cancel_url: `${process.env.FRONTEND_URL}/checkout?order=cancelled&id=${orderId}`
              }
            }
          })
        };

        const paymongoRes = await fetch('https://api.paymongo.com/v1/checkout_sessions', options);
        const paymongoData = await paymongoRes.json();

        if (paymongoData.data?.attributes?.checkout_url) {
          return res.status(201).json({
            message: 'Payment session created',
            checkout_url: paymongoData.data.attributes.checkout_url,
            order: { id: orderId, total, status: 'pending_payment' }
          });
        } else {
          const apiError = paymongoData.errors?.[0]?.detail || 'Unknown PayMongo error';
          console.error('PayMongo Session Error:', JSON.stringify(paymongoData, null, 2));

          return res.status(201).json({
            message: `Order created, but payment failed: ${apiError}. Falling back to Pay in Store.`,
            error_detail: apiError,
            order: { id: orderId, total, status: 'reserved' }
          });
        }
      } catch (payError) {
        console.error('PayMongo Request Error:', payError);
      }
    }

    
    if (isPayInStore) {
      
      import('../services/notificationService.js').then(({ sendOrderEmail }) => {
        sendOrderEmail(orderId, 'CONFIRMATION').catch(err => console.error('Email trigger error:', err));
      });
    }

    
    try {
      await sendOrderUpdateNotification(req.user.id, orderId, initialStatus);
    } catch (notifError) {
      console.error('Push notification error:', notifError);
    }

    res.status(201).json({
      message: isPayInStore ? 'Order reserved successfully' : 'Order created successfully',
      order: {
        id: orderId,
        total,
        status: initialStatus
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message || 'Error processing order' });
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        total,
        status,
        created_at,
        order_items (id)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    
    const ordersWithCount = (orders || []).map(order => ({
      id: order.id,
      total: parseFloat(order.total),
      status: order.status,
      created_at: order.created_at,
      item_count: order.order_items?.length || 0
    }));

    res.json({ orders: ordersWithCount });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        quantity,
        price,
        products:product_id (
          id,
          name,
          brand,
          size,
          image_url
        )
      `)
      .eq('order_id', id);

    if (itemsError) {
      throw itemsError;
    }

    
    const items = (orderItems || []).map(item => ({
      quantity: item.quantity,
      price: parseFloat(item.price),
      product_id: item.products.id,
      name: item.products.name,
      brand: item.products.brand,
      size: item.products.size,
      image: item.products.image_url
    }));

    res.json({
      order: {
        ...order,
        total: parseFloat(order.total),
        items
      }
    });
  } catch (error) {
    next(error);
  }
};
