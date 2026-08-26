const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment, webhookVerification } = require('../controllers/payment.controller');
const { protect, syncUser } = require('../middleware/auth.middleware');

router.route('/create-order')
  .post(protect, syncUser, createRazorpayOrder);

router.route('/verify')
  .post(protect, syncUser, verifyPayment);

router.route('/webhook')
  .post(webhookVerification); // Webhooks from Razorpay do not have user tokens

module.exports = router;
