const express = require('express');
const router = express.Router();
const { getMe, syncClerkUser } = require('../controllers/auth.controller');
const { protect, syncUser } = require('../middleware/auth.middleware');

// GET /api/auth/me
router.get('/me', protect, syncUser, getMe);

// POST /api/auth/sync (Replacement for register/login when using Clerk)
router.post('/sync', syncClerkUser);

module.exports = router;
