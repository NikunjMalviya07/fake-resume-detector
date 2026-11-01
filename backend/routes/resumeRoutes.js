import express from 'express';
import upload from '../middleware/upload.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadResume, getResume, getHistory, deleteResume } from '../controllers/resumeController.js';
import { handleExperienceDecision } from '../controllers/experienceVerificationController.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.post('/upload', protect, upload.single('file'), asyncHandler(uploadResume));
router.get('/history', protect, asyncHandler(getHistory));
router.get('/:id', protect, asyncHandler(getResume));
router.delete('/:id', protect, asyncHandler(deleteResume));

// Public — a company clicking a link in an email is never logged in.
router.get('/experience/:token/:decision', asyncHandler(handleExperienceDecision));

export default router;