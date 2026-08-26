const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  seoTitle: { type: String },
  seoDescription: { type: String }
}, { timestamps: true });

// Add index on parentCategory for efficient querying of nested structures
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ slug: 1 });

module.exports = mongoose.model('Category', categorySchema);
