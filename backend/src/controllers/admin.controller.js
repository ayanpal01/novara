const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Review = require('../models/Review');
const Settings = require('../models/Settings');
const inventoryService = require('../services/inventory.service');
const mongoose = require('mongoose');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'user' });
    
    // Revenue from paid or cod delivered
    const orders = await Order.find({ 
      $or: [
        { isPaid: true },
        { paymentMethod: 'COD', orderStatus: 'delivered' }
      ]
    });
    const totalRevenue = orders.reduce((acc, order) => acc + (order.pricing ? order.pricing.total : order.totalPrice), 0);

    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'processing' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

    // Low stock
    const products = await Product.find({});
    let lowStockCount = 0;
    products.forEach(p => {
      let isLow = false;
      if (p.variants && p.variants.length > 0) {
        isLow = p.variants.some(v => v.stock < 10);
      } else {
        isLow = p.countInStock < 10;
      }
      if (isLow) lowStockCount++;
    });

    res.json({
      revenue: totalRevenue,
      orders: totalOrders,
      products: totalProducts,
      customers: totalCustomers,
      statusDistribution: {
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders
      },
      lowStockProducts: lowStockCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.orderStatus = req.query.status;
    if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;
    if (req.query.search) {
      query.$or = [
        { orderNumber: { $regex: req.query.search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const sort = req.query.sort === 'oldest' ? { createdAt: 1 } : 
                 req.query.sort === 'highest' ? { 'pricing.total': -1 } : 
                 { createdAt: -1 };

    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email phone');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingId, courier, adminNotes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Validate state transition (basic)
    if (order.orderStatus === 'cancelled' || order.orderStatus === 'delivered') {
      return res.status(400).json({ message: `Cannot change status of a ${order.orderStatus} order.` });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = status;

    if (trackingId) order.tracking.trackingId = trackingId;
    if (courier) order.tracking.courier = courier;
    if (adminNotes) order.adminNotes = adminNotes;

    if (status === 'shipped') {
      order.shippedAt = Date.now();
    } else if (status === 'out_for_delivery') {
      order.outForDeliveryAt = Date.now();
    } else if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      if (order.paymentMethod === 'COD') {
        order.isPaid = true;
        order.paymentStatus = 'paid';
        order.paidAt = Date.now();
      }
    } else if (status === 'cancelled') {
      // Restock inventory
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        await inventoryService.restockInventory(order.orderItems, session);
        await order.save({ session });
        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    }

    // Add to history
    if (!order.orderStatusHistory) order.orderStatusHistory = [];
    order.orderStatusHistory.push({
      status,
      changedBy: req.user._id,
      note: `Status changed from ${previousStatus} to ${status}`
    });

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { role: 'user' };
    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const customers = await User.find(query).select('-password').skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await User.countDocuments(query);

    res.json({
      customers,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    
    const orders = await Order.find({ user: customer._id }).sort({ createdAt: -1 });
    const totalSpent = orders.reduce((acc, order) => acc + (order.pricing ? order.pricing.total : order.totalPrice), 0);

    res.json({
      ...customer.toObject(),
      totalSpent,
      orderCount: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;

    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName')
      .populate('product', 'name images')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.status = status;
    await review.save(); // This triggers the post-save calcAverageRatings hook

    res.json({ message: 'Review status updated', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    Object.keys(req.body).forEach(key => {
      settings[key] = req.body[key];
    });

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
