const express = require('express');
const router = express.Router();
const { getMe, syncFirebaseUser } = require('../controllers/auth.controller');
const { protect, syncUser } = require('../middleware/auth.middleware');

// GET /api/auth/me
router.get('/me', protect, syncUser, getMe);

// POST /api/auth/sync (Replacement for register/login when using Firebase)
router.post('/sync', syncFirebaseUser);

module.exports = router;
