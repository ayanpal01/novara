const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;

    const existingReview = await Review.findOne({ user: req.user._id, product });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Check if verified purchase
    const hasBought = await Order.findOne({
      user: req.user._id,
      'orderItems.product': product,
      orderStatus: { $in: ['shipped', 'delivered'] }
    });

    const review = await Review.create({
      user: req.user._id,
      product,
      rating: Number(rating),
      comment,
      isVerifiedPurchase: !!hasBought,
      status: 'pending' // Admin must approve
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/reviews/:productId
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, status: 'approved' })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: GET /api/reviews
exports.getReviews = async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    
    const reviews = await Review.find(query)
      .populate('user', 'name email')
      .populate('product', 'name images')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: PUT /api/reviews/:id/status
exports.updateReviewStatus = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.status = req.body.status;
    await review.save(); // triggers pre/post save hooks for aggregate calculation

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    // Ensure user owns the review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await review.remove(); // triggers post remove hook for aggregate calculation
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
