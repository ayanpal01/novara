const express = require('express');
const router = express.Router();
const { 
  getDashboardStats, 
  getCustomers,
  getCustomerById,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateReviewStatus,
  getSettings,
  updateSettings,
  getReviews
} = require('../controllers/admin.controller');
const { protect, syncUser, admin } = require('../middleware/auth.middleware');

router.use(protect, syncUser, admin); // Apply to all admin routes

router.get('/dashboard', getDashboardStats);

router.route('/settings')
  .get(getSettings)
  .put(updateSettings);

router.route('/customers')
  .get(getCustomers);
router.route('/customers/:id')
  .get(getCustomerById);

router.route('/orders')
  .get(getOrders);
router.route('/orders/:id')
  .get(getOrderById);
router.route('/orders/:id/status')
  .put(updateOrderStatus);

router.route('/reviews')
  .get(getReviews);
router.route('/reviews/:id/status')
  .put(updateReviewStatus);

module.exports = router;
