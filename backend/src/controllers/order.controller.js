const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const inventoryService = require('../services/inventory.service');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Settings = require('../models/Settings');
const { calculateDistance } = require('../utils/geoDistance');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Generate unique order number
const generateOrderNumber = () => {
  const prefix = 'NOV';
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${date}-${random}`;
};

// POST /api/orders/create-payment-order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod = 'Razorpay' } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // STRICT GEO-LOCATION VALIDATION
    if (!shippingAddress.latitude || !shippingAddress.longitude) {
      return res.status(400).json({ message: 'Delivery coordinates are missing. Please reselect your address.' });
    }

    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});

    const distance = calculateDistance(
      settings.shopLatitude,
      settings.shopLongitude,
      Number(shippingAddress.latitude),
      Number(shippingAddress.longitude)
    );

    if (distance > settings.maxDeliveryDistance) {
      return res.status(400).json({ 
        message: `Delivery is not available to this location. We only deliver within ${settings.maxDeliveryDistance} km of our store.` 
      });
    }

    let subtotal = 0;
    let totalDiscount = 0;
    const verifiedOrderItems = [];

    // Recalculate totals directly from DB
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }

      let price = product.price;
      let compareAtPrice = product.compareAtPrice || product.price;
      let sku = product.sku;
      let attributes = null;

      if (item.variantId) {
        const variant = product.variants.id(item.variantId);
        if (!variant) throw new Error(`Variant not found for product ${product.name}`);
        if (!variant.isActive) throw new Error(`Variant is inactive for ${product.name}`);
        
        // Stock Check (don't deduct yet)
        if (variant.inventory.trackInventory && variant.inventory.quantity < item.qty) {
          throw new Error(`Only ${variant.inventory.quantity} items available for ${product.name}`);
        }
        
        if (variant.price) price = variant.price;
        if (variant.compareAtPrice) compareAtPrice = variant.compareAtPrice;
        if (variant.sku) sku = variant.sku;
        attributes = variant.attributes;
      } else {
        // Fallback for non-variant products
        if (product.stock < item.qty) {
          throw new Error(`Only ${product.stock} items available for ${product.name}`);
        }
      }

      if (compareAtPrice > price) {
        totalDiscount += (compareAtPrice - price) * item.qty;
      }

      const itemSubtotal = price * item.qty;
      subtotal += itemSubtotal;
      
      verifiedOrderItems.push({
        name: product.name, // Keep for legacy
        productName: product.name,
        qty: item.qty,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        price,
        subtotal: itemSubtotal,
        product: product._id,
        variantId: item.variantId,
        sku,
        attributes,
        size: item.size,
        color: item.color
      });
    }

    const shipping = subtotal > 1000 ? 0 : 50;
    const tax = Number((0.15 * subtotal).toFixed(2));
    const total = subtotal + shipping + tax;

    const orderNumber = generateOrderNumber();

    // Create a pending MongoDB order (status: 'created', isPaid: false, NO inventory reduction)
    const order = new Order({
      orderNumber,
      orderItems: verifiedOrderItems,
      user: req.user._id,
      shippingAddress: {
        fullName: shippingAddress.name || shippingAddress.fullName,
        phone: shippingAddress.phone,
        addressLine1: shippingAddress.address || shippingAddress.addressLine1,
        address: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state,
        country: shippingAddress.country || 'India',
        pincode: shippingAddress.pincode,
        latitude: shippingAddress.latitude,
        longitude: shippingAddress.longitude
      },
      deliveryDistance: Number(distance.toFixed(2)),
      estimatedDeliveryDate: new Date(Date.now() + settings.maxDeliveryDays * 24 * 60 * 60 * 1000),
      paymentMethod,
      pricing: { subtotal, discount: totalDiscount, shipping, tax, total },
      itemsPrice: subtotal, // legacy
      shippingPrice: shipping, // legacy
      taxPrice: tax, // legacy
      discountPrice: totalDiscount, // legacy
      totalPrice: total, // legacy
      orderStatus: paymentMethod === 'COD' ? 'confirmed' : 'pending',
      paymentStatus: 'pending',
      isPaid: false,
      orderStatusHistory: [{
        status: paymentMethod === 'COD' ? 'confirmed' : 'pending',
        note: 'Order created automatically.'
      }]
    });

    if (paymentMethod === 'COD') {
      try {
        await inventoryService.deductInventory(order.orderItems);
        await order.save();
      } catch (err) {
        throw err;
      }

      return res.status(201).json({
        dbOrderId: order._id,
        paymentMethod: 'COD'
      });
    }

    await order.save();

    // Create Razorpay Order
    const amountInPaise = Math.round(total * 100);
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_order_${order._id}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    order.paymentResult = {
      razorpay_order_id: razorpayOrder.id,
      status: 'created',
    };
    await order.save();

    res.status(201).json({
      dbOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      paymentMethod: 'Razorpay'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /api/orders/verify-payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      throw new Error('Invalid payment signature');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Idempotency check: Don't deduct inventory twice
    if (order.isPaid) {
      return res.json({ success: true, message: 'Payment already verified', orderId });
    }

    // Deduct inventory
    await inventoryService.deductInventory(order.orderItems);

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentStatus = 'paid';
    order.orderStatus = 'confirmed';
    order.paymentResult = {
      ...order.paymentResult,
      razorpay_payment_id,
      razorpay_signature,
      status: 'success',
      email_address: req.user?.email || ''
    };

    await order.save();
    
    res.json({ success: true, message: 'Payment verified successfully', orderId });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/orders (Admin)
exports.getOrders = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    
    let query = {};
    if (req.query.status) query.orderStatus = req.query.status;
    if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;
    if (req.query.user) query.user = req.query.user;
    if (req.query.search) {
      query.orderNumber = { $regex: req.query.search, $options: 'i' };
    }

    const count = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/orders/:id/status (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = req.body.status || order.orderStatus;
    order.paymentStatus = req.body.paymentStatus || order.paymentStatus;
    order.tracking = {
      trackingId: req.body.trackingId || order.tracking?.trackingId,
      trackingUrl: req.body.trackingUrl || order.tracking?.trackingUrl,
      courier: req.body.courier || order.tracking?.courier
    };
    order.trackingId = req.body.trackingId || order.trackingId; // legacy
    order.trackingUrl = req.body.trackingUrl || order.trackingUrl; // legacy
    order.notes = req.body.notes || order.notes;

    if (req.body.status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    
    // If order is cancelled/returned and it wasn't before, restore inventory
    if ((order.orderStatus === 'cancelled' || order.orderStatus === 'returned') && 
        (oldStatus !== 'cancelled' && oldStatus !== 'returned')) {
      try {
        await inventoryService.restoreInventory(order.orderItems);
        await order.save();
      } catch (err) {
        throw err;
      }
    } else {
      await order.save();
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
