const mongoose = require('mongoose');
const Product = require('../models/Product');

/**
 * Validates stock and reduces inventory for the given items.
 * Should be used inside a transaction session.
 */
exports.deductInventory = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new Error(`Product ${item.product} not found`);
    }

    if (item.variant) {
      const variant = product.variants.id(item.variant);
      if (!variant) throw new Error(`Variant not found for product ${product.name}`);
      
      if (!variant.isActive) throw new Error(`Variant for ${product.name} is no longer active`);
      
      if (variant.inventory.trackInventory && variant.inventory.quantity < item.qty) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${variant.inventory.quantity}`);
      }
      
      if (variant.inventory.trackInventory) {
        variant.inventory.quantity -= item.qty;
      }
    } else {
      if (product.stock < item.qty) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      product.stock -= item.qty;
    }
    
    await product.save();
  }
};

/**
 * Restores inventory for cancelled or failed orders.
 */
exports.restoreInventory = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) continue; // If product was deleted, we can't restore

    if (item.variant) {
      const variant = product.variants.id(item.variant);
      if (variant && variant.inventory.trackInventory) {
        variant.inventory.quantity += item.qty;
      }
    } else {
      product.stock += item.qty;
    }
    
    await product.save();
  }
};
