const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: 'NOVARA' },
  storeEmail: { type: String, default: 'support@novara.com' },
  storePhone: { type: String, default: '+919876543210' },
  storeAddress: { type: String, default: '123 Fashion Street, Kolkata' },
  
  // Geographical location for distance calculation
  shopLatitude: { type: Number, default: 23.955057763205772 },
  shopLongitude: { type: Number, default: 88.62437018785059 },
  
  // Delivery config
  maxDeliveryDistance: { type: Number, default: 200 }, // in km
  maxDeliveryDays: { type: Number, default: 7 }, // max days to deliver
  
  currency: { type: String, default: 'INR' },
  shippingFee: { type: Number, default: 50 },
  freeShippingThreshold: { type: Number, default: 1000 },
  taxRate: { type: Number, default: 0.15 } // 15%
}, { timestamps: true });

// We only ever need one document for settings.
module.exports = mongoose.model('Settings', settingsSchema);
