import express from 'express';
import upload from '../middleware/upload.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadResume, getResume } from '../controllers/resumeController.js';

const router = express.Router();

router.post('/upload', upload.single('file'), asyncHandler(uploadResume));
router.get('/:id', asyncHandler(getResume));

export default router;