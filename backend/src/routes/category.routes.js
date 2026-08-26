const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/category.controller');
const { protect, syncUser, admin } = require('../middleware/auth.middleware');

router.get('/', getCategories);
router.post('/', protect, syncUser, admin, createCategory);

module.exports = router;
