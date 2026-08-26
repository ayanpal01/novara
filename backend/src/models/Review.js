const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  isVerifiedPurchase: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

// Prevent multiple reviews from the same user on the same product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Statics method to calculate average rating
reviewSchema.statics.calcAverageRatings = async function(productId) {
  const stats = await this.aggregate([
    { $match: { product: productId, status: 'approved' } },
    { $group: { _id: '$product', numReviews: { $sum: 1 }, rating: { $avg: '$rating' } } }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      rating: stats[0].rating,
      numReviews: stats[0].numReviews
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      rating: 0,
      numReviews: 0
    });
  }
};

// Call calcAverageRatings after save and remove
reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.product);
});

reviewSchema.post('remove', function() {
  this.constructor.calcAverageRatings(this.product);
});

// For update operations like findOneAndUpdate
reviewSchema.post(/^findOneAnd/, async function(doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.product);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
