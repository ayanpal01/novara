const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get current user's cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'name images price compareAtPrice variants slug'
    });
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, variantId, qty } = req.body;
    
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(p => 
      p.product.toString() === productId && 
      (!p.variant || p.variant.toString() === (variantId || undefined))
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].qty += Number(qty || 1);
    } else {
      cart.items.push({ product: productId, variant: variantId, qty: Number(qty || 1) });
    }

    await cart.save();
    
    // Repopulate before returning
    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name images price compareAtPrice variants slug'
    });
    
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { qty } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    item.qty = Number(qty);
    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name images price compareAtPrice variants slug'
    });
    
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items.pull({ _id: itemId });
    await cart.save();

    await cart.populate({
      path: 'items.product',
      select: 'name images price compareAtPrice variants slug'
    });
    
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
