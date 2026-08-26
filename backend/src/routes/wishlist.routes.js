const express = require('express');
const router = express.Router();
const { getWishlist, toggleWishlistItem } = require('../controllers/wishlist.controller');
const { protect, syncUser } = require('../middleware/auth.middleware');

router.use(protect, syncUser);

router.route('/')
  .get(getWishlist)
  .post(toggleWishlistItem);

module.exports = router;
