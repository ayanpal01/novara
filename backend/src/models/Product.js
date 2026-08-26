const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategory: { type: String },
  brand: { type: String },
  gender: { type: String, enum: ['Men', 'Women', 'Unisex', 'Kids', ''] },
  
  price: { type: Number, required: true },
  compareAtPrice: { type: Number },
  costPrice: { type: Number },
  
  options: [{
    name: { type: String, required: true },
    values: [{
      label: { type: String, required: true },
      value: { type: String, required: true },
      hex: { type: String }
    }]
  }],
  
  variants: [{
    attributes: { type: Map, of: String }, // e.g., { "Size": "s", "Color": "red" }
    sku: { type: String, sparse: true },
    barcode: { type: String },
    price: { type: Number }, // Optional price override
    compareAtPrice: { type: Number },
    costPrice: { type: Number },
    inventory: {
      quantity: { type: Number, required: true, default: 0 },
      reserved: { type: Number, default: 0 },
      lowStockThreshold: { type: Number },
      trackInventory: { type: Boolean, default: true }
    },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true }
  }],
  
  images: [{ type: String }],
  
  // Virtual for total stock (computed dynamically or maintained manually for legacy)
  // We'll calculate it using virtual, but also keep a legacy stock field for now if needed, 
  // actually, let's keep stock as a field and sync it in pre-save.
  stock: { type: Number, required: true, default: 0 },
  
  // Legacy fields for backward compatibility mapping
  sizes: [{
    size: String,
    color: String,
    stock: Number
  }],
  colors: [String],
  
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
  
  status: { type: String, enum: ['draft', 'active', 'archived'], default: 'active' },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  
  tags: [{ type: String }],
  seoTitle: { type: String },
  seoDescription: { type: String }
}, { timestamps: true });

// Pre-save middleware to calculate total stock from variants and map to legacy sizes for storefront
productSchema.pre('save', function() {
  if (this.variants && this.variants.length > 0) {
    // Compute total stock
    this.stock = this.variants.reduce((total, variant) => {
      if (variant.isActive && variant.inventory) {
        return total + (variant.inventory.quantity || 0);
      }
      return total;
    }, 0);

    // Backward compat mapping for Storefront (which expects sizes array)
    const legacySizes = this.variants.map(v => {
      let size = '';
      let color = '';
      if (v.attributes) {
        // Map allows .get()
        size = v.attributes.get('Size') || v.attributes.get('size') || v.attributes.get('SIZE') || '';
        color = v.attributes.get('Color') || v.attributes.get('color') || v.attributes.get('COLOR') || '';
      }
      return {
        size,
        color,
        stock: v.inventory ? (v.inventory.quantity || 0) : 0
      };
    });
    this.sizes = legacySizes;
  }
});

module.exports = mongoose.model('Product', productSchema);
