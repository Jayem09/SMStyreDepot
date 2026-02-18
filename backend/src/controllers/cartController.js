import supabase from '../config/database.js';
import { body, validationResult } from 'express-validator';

export const validateCartItem = [
  body('product_id').isInt().withMessage('Product ID must be a number'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

export const getCart = async (req, res, next) => {
  try {
    const { data: cartItems, error } = await supabase
      .from('cart')
      .select(`
        id,
        quantity,
        products:product_id (
          id,
          name,
          brand,
          size,
          type,
          price,
          image_url
        )
      `)
      .eq('user_id', req.user.id);

    if (error) {
      throw error;
    }

    
    const items = (cartItems || []).map(item => ({
      id: item.id,
      quantity: item.quantity,
      product_id: item.products.id,
      name: item.products.name,
      brand: item.products.brand,
      size: item.products.size,
      type: item.products.type,
      price: parseFloat(item.products.price),
      image: item.products.image_url
    }));

    res.json({ items });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product_id, quantity } = req.body;

    
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, stock')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    
    const { data: existingItem } = await supabase
      .from('cart')
      .select('id, quantity')
      .eq('user_id', req.user.id)
      .eq('product_id', product_id)
      .single();

    if (existingItem) {
      
      const newQuantity = existingItem.quantity + quantity;
      const { error: updateError } = await supabase
        .from('cart')
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id);

      if (updateError) {
        throw updateError;
      }
    } else {
      
      const { error: insertError } = await supabase
        .from('cart')
        .insert({
          user_id: req.user.id,
          product_id,
          quantity
        });

      if (insertError) {
        throw insertError;
      }
    }

    res.json({ message: 'Item added to cart' });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    
    const { data: item, error: itemError } = await supabase
      .from('cart')
      .select('*, products:product_id (stock)')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (itemError || !item) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    
    const productStock = item.products?.stock || 0;
    if (productStock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const { error: updateError } = await supabase
      .from('cart')
      .update({
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    res.json({ message: 'Cart item updated' });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('cart')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select();

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', req.user.id);

    if (error) {
      throw error;
    }

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};
