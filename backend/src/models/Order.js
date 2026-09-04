const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  orderNumber: { type: String, required: true, unique: true, index: true },
  
  orderItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId },
    // Snapshot of the product at purchase time
    name: { type: String, required: true },
    productName: { type: String },
    image: { type: String },
    sku: { type: String },
    attributes: { type: Map, of: String },
    size: { type: String }, // Legacy compatibility
    color: { type: String }, // Legacy compatibility
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  }],
  
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String, default: '' },
    addressLine1: { type: String, required: true }, // Legacy compatibility
    addressLine2: { type: String },
    address: { type: String }, // New structure
    landmark: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    pincode: { type: String, required: true },
    label: { type: String, default: 'Home' },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  
  deliveryDistance: { type: Number },
  
  paymentMethod: { type: String, enum: ['Razorpay', 'COD', 'razorpay', 'cod'], default: 'Razorpay' },
  
  paymentResult: {
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
    status: { type: String, enum: ['created', 'pending', 'paid', 'failed', 'refunded', 'success'], default: 'pending' },
    id: String, // legacy mapping
    email_address: String
  },
  
  // Legacy pricing fields for backward compatibility
  itemsPrice: { type: Number, default: 0.0 },
  shippingPrice: { type: Number, default: 0.0 },
  taxPrice: { type: Number, default: 0.0 },
  discountPrice: { type: Number, default: 0.0 },
  totalPrice: { type: Number, default: 0.0 },
  
  // New structured pricing
  pricing: {
    subtotal: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true, default: 0 }
  },
  
  orderStatus: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'], 
    default: 'pending' 
  },
  
  orderStatusHistory: [{
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: { type: String }
  }],
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },
  
  estimatedDeliveryDate: { type: Date },
  shippedAt: { type: Date },
  outForDeliveryAt: { type: Date },
  
  tracking: {
    trackingId: String,
    courier: String,
    trackingUrl: String
  },
  // Legacy tracking fields
  trackingId: String,
  trackingUrl: String,
  
  notes: String,
  adminNotes: String
}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
