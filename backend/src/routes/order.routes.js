const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { 
  createPaymentOrder, 
  verifyPayment, 
  getMyOrders, 
  getOrderById, 
  getOrders, 
  updateOrderStatus 
} = require('../controllers/order.controller');
const { protect, syncUser, admin } = require('../middleware/auth.middleware');

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.route('/')
  .get(protect, syncUser, admin, getOrders);

router.route('/create-payment-order')
  .post(
    protect, 
    syncUser,
    [
      body('orderItems').isArray({ min: 1 }).withMessage('Order items cannot be empty'),
      body('shippingAddress.address').notEmpty().withMessage('Address is required'),
      body('shippingAddress.city').notEmpty().withMessage('City is required'),
    ],
    validate,
    createPaymentOrder
  );

router.route('/verify-payment')
  .post(protect, syncUser, verifyPayment);

router.route('/my')
  .get(protect, syncUser, getMyOrders);

router.route('/:id')
  .get(protect, syncUser, getOrderById);

router.route('/:id/status')
  .put(protect, syncUser, admin, updateOrderStatus);

module.exports = router;
