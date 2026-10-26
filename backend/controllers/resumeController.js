import Resume from '../model/Resume.js';
import { extractTextFromResume } from '../services/ocrService.js';
import { extractResumeData } from '../services/extractService.js';
import { verifyEducation } from '../services/educationService.js';

export async function uploadResume(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const rawText = await extractTextFromResume(req.file.buffer, req.file.originalname);
  const structuredData = await extractResumeData(rawText);
  const educationResult = await verifyEducation(structuredData);

  const resume = await Resume.create({
    filename: req.file.originalname,
    rawText,
    structuredData,
    verification: {
      education: educationResult,
      github: null,
      email: null
    }
  });

  res.status(201).json(resume);
}

export async function getResume(req, res) {
  const resume = await Resume.findById(req.params.id);
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found' });
  }
  res.json(resume);
}