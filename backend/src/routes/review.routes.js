const express = require('express');
const router = express.Router();
const { createReview, getProductReviews, getReviews, updateReviewStatus, deleteReview } = require('../controllers/review.controller');
const { protect, syncUser, admin } = require('../middleware/auth.middleware');

router.route('/')
  .post(protect, syncUser, createReview)
  .get(protect, syncUser, admin, getReviews); // Admin route to get all reviews

router.route('/:productId')
  .get(getProductReviews); // Public route

router.route('/:id/status')
  .put(protect, syncUser, admin, updateReviewStatus); // Admin route

router.route('/:id')
  .delete(protect, syncUser, deleteReview); // User or Admin

module.exports = router;
