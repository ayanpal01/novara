const express = require('express');
const router = express.Router();
const { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const { protect, syncUser, admin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.route('/')
  .get(getProducts)
  .post(protect, syncUser, admin, upload.array('images', 5), createProduct);

router.route('/:id')
  .put(protect, syncUser, admin, upload.array('images', 5), updateProduct)
  .delete(protect, syncUser, admin, deleteProduct);

// Note: Ensure this is below /:id if you add a GET /:id, but since we only have GET /:slug we can just map it here.
// However, since MongoDB ObjectIDs and slugs are both strings, Express route matching might get confused.
// Let's use /slug/:slug to be safe, or just rely on the fact we only have a GET for slug.
router.get('/slug/:slug', getProductBySlug);

// If we strictly follow `GET /api/products/:slug` from the prompt without /slug/ prefix:
// We can define it as `router.get('/:slug', getProductBySlug);`
// I will export it as `/:slug` but keep in mind there is no `GET /:id` in the requirements.
router.get('/:slug', getProductBySlug);

module.exports = router;
