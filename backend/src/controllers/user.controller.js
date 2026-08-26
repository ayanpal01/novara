const User = require('../models/User');

// Helper to normalize Indian phone numbers to 10 digits
const normalizePhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('91')) return cleaned.slice(2);
  if (cleaned.length === 10) return cleaned;
  return cleaned; // Fallback, though validation should catch invalid lengths
};

exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newAddress = { ...req.body };
    
    // Normalize phones
    if (newAddress.phone) newAddress.phone = normalizePhone(newAddress.phone);
    if (newAddress.alternatePhone) newAddress.alternatePhone = normalizePhone(newAddress.alternatePhone);
    
    // Legacy mapping
    newAddress.fullName = newAddress.name;
    newAddress.addressLine1 = newAddress.address;

    newAddress.isDefault = req.body.isDefault || false;
    
    // Default logic
    if (newAddress.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    } else if (user.addresses.length === 0) {
      newAddress.isDefault = true; // Auto-default first address
    }
    
    user.addresses.push(newAddress);
    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    
    const updateData = { ...req.body };
    
    // Normalize phones
    if (updateData.phone) updateData.phone = normalizePhone(updateData.phone);
    if (updateData.alternatePhone) updateData.alternatePhone = normalizePhone(updateData.alternatePhone);
    
    // Legacy mapping
    if (updateData.name) updateData.fullName = updateData.name;
    if (updateData.address) updateData.addressLine1 = updateData.address;

    if (updateData.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    
    Object.assign(address, updateData);
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);
    
    if (!address) return res.status(404).json({ message: 'Address not found' });
    
    // In Mongoose 6+, pull() is used to remove an item from a document array
    user.addresses.pull({ _id: req.params.id });
    
    // If we deleted the default address, set another one as default
    if (address.isDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
    
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    
    user.addresses.forEach(addr => addr.isDefault = false);
    address.isDefault = true;
    
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
