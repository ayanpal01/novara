const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variant: { type: mongoose.Schema.Types.ObjectId }, // Can be null if product has no variants
    qty: { type: Number, required: true, min: 1, default: 1 }
  }]
}, { timestamps: true });

cartSchema.index({ user: 1 });

module.exports = mongoose.model('Cart', cartSchema);
