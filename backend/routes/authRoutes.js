import express from 'express';
import { signup, login, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.post('/signup', authLimiter, asyncHandler(signup));
router.post('/login', authLimiter, asyncHandler(login));
router.post('/logout', logout);
router.get('/me', protect, asyncHandler(getMe));

export default router;