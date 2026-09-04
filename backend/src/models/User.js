const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
  name: { type: String, required: true, trim: true },
  fullName: { type: String, trim: true }, // Legacy compatibility
  phone: { type: String, required: true, trim: true },
  alternatePhone: { type: String, default: '', trim: true },
  address: { type: String, required: true, trim: true },
  addressLine1: { type: String, trim: true }, // Legacy compatibility
  addressLine2: { type: String, default: '', trim: true }, 
  landmark: { type: String, default: '', trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  country: { type: String, required: true, default: 'India', trim: true },
  pincode: { type: String, required: true, trim: true },
  latitude: { type: Number },
  longitude: { type: Number },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false }, // Hidden by default, optional if using Clerk/OAuth
  firebaseUid: { type: String, unique: true, sparse: true }, // Firebase UID
  avatar: { type: String },
  phone: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  addresses: [addressSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  if(!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
