import express from 'express';
import Order from '../models/orderModel.js';

const router = express.Router();

// Basic GET for quick verification (optional)
router.get('/', async (req, res) => {
  try {
    const recent = await Order.find().sort({ createdAt: -1 }).limit(10);
    res.json({ count: recent.length, recent });
  } catch (err) {
    console.error('GET /api/orders error:', err);
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
});

// POST /api/orders - Create a new order
router.post('/', async (req, res) => {
  try {
    // Log incoming body for debugging
    console.log('POST /api/orders body:', JSON.stringify(req.body, null, 2));

    // Normalize input
    const {
      orderItems = req.body.items || [],
      totalPrice: rawTotal = req.body.total || req.body.totalPrice,
      shippingInfo = req.body.shippingInfo || req.body.shipping,
      paymentMethod = req.body.paymentMethod || req.body.payment,
    } = req.body || {};

    const totalPrice = Number(rawTotal);

    // Log normalized values
    console.log('Normalized totalPrice:', totalPrice, 'shippingInfo:', shippingInfo);
    console.log('Raw orderItems count:', Array.isArray(orderItems) ? orderItems.length : typeof orderItems);

    // Basic validation (return 400 for bad client payload)
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'orderItems must be a non-empty array' });
    }
    if (!shippingInfo || !shippingInfo.name || !shippingInfo.address) {
      return res.status(400).json({ message: 'Incomplete shippingInfo' });
    }
    if (!Number.isFinite(totalPrice)) {
      return res.status(400).json({ message: 'totalPrice must be a number' });
    }

    // Map items to the schema fields and ensure required fields exist
    const mappedItems = orderItems.map((it) => ({
      id: String(it.id || it._id || it.productId || ''),
      name: it.name || it.title || 'Unknown',
      price: Number((typeof it.price === 'number' ? it.price : it.price) || 0),
      imageUrl: it.imageUrl || it.image || it.thumbnail || 'https://via.placeholder.com/150',
      quantity: Number(it.quantity || it.qty || 1),
    }));

    console.log('Mapped items preview:', mappedItems.slice(0, 5));

    // Check mappedItems for required values (return 400 on missing fields)
    for (const mi of mappedItems) {
      if (!mi.id || !mi.name || !mi.imageUrl || !Number.isFinite(mi.price) || !Number.isFinite(mi.quantity)) {
        return res.status(400).json({ message: 'Each order item must include id, name, imageUrl, price and quantity' });
      }
    }

    const order = new Order({
      orderItems: mappedItems,
      totalPrice,
      shippingInfo,
      paymentMethod: paymentMethod || 'Unknown',
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    // More verbose logging
    console.error('Failed to save order:', err);
    console.error(err.stack);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    res.status(500).json({ message: 'Failed to save order', error: err.message });
  }
});

export default router;