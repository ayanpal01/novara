const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { protect, syncUser, admin } = require('../middleware/auth.middleware');

router.route('/')
  .get(getCategories)
  .post(protect, syncUser, admin, createCategory);

router.route('/:id')
  .put(protect, syncUser, admin, updateCategory)
  .delete(protect, syncUser, admin, deleteCategory);

module.exports = router;
