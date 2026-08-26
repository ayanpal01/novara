const Wishlist = require('../models/Wishlist');

exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'name images price compareAtPrice slug'
    });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    
    res.json(wishlist.products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.toggleWishlistItem = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [productId] });
      return res.json(wishlist.products);
    }
    
    const index = wishlist.products.indexOf(productId);
    if (index > -1) {
      wishlist.products.splice(index, 1); // Remove
    } else {
      wishlist.products.push(productId); // Add
    }
    
    await wishlist.save();
    await wishlist.populate('products', 'name images price compareAtPrice slug');
    
    res.json(wishlist.products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
