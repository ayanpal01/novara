const express = require('express');
const router = express.Router();
const { getStats, getCustomers, getSalesReport } = require('../controllers/admin.controller');
const { protect, syncUser, admin } = require('../middleware/auth.middleware');

router.route('/stats')
  .get(protect, syncUser, admin, getStats);

router.route('/sales-report')
  .get(protect, syncUser, admin, getSalesReport);

router.route('/customers')
  .get(protect, syncUser, admin, getCustomers);

module.exports = router;
