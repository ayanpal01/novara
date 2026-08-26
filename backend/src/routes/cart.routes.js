const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cart.controller');
const { protect, syncUser } = require('../middleware/auth.middleware');

router.use(protect, syncUser);

router.route('/')
  .get(getCart)
  .delete(clearCart);

router.route('/items')
  .post(addToCart);

router.route('/items/:itemId')
  .put(updateCartItem)
  .delete(removeFromCart);

module.exports = router;
