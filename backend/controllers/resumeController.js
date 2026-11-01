import Resume from '../model/Resume.js';
import { extractTextFromResume } from '../services/ocrService.js';
import { extractResumeData } from '../services/extractService.js';
import { verifyEducation, verifyStudentRecord } from '../services/educationService.js';
import { verifyGithub } from '../services/githubService.js';
import { calculateScore } from '../services/scoringService.js';
import { buildExperienceEntries, sendExperienceVerificationEmails } from '../services/experienceVerificationService.js';
import { getCachedExtraction, setCachedExtraction } from '../utils/extractionCache.js';

export async function uploadResume(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Real content check, not just the declared mimetype (which a client can fake).
  const header = req.file.buffer.slice(0, 4).toString();
  if (header !== '%PDF') {
    return res.status(400).json({ error: 'Uploaded file is not a valid PDF' });
  }

  const rawText = await extractTextFromResume(req.file.buffer, req.file.originalname);

  let structuredData = getCachedExtraction(rawText);
  if (!structuredData) {
    structuredData = await extractResumeData(rawText);
    setCachedExtraction(rawText, structuredData);
  }

  const educationCheck = await verifyEducation(structuredData);
  const studentRecordCheck = await verifyStudentRecord(structuredData);
  const githubResult = await verifyGithub(structuredData);
  const experienceEntries = await buildExperienceEntries(structuredData.experience);

  const verification = {
    education: educationCheck,
    studentRecord: studentRecordCheck,
    github: githubResult,
    experience: experienceEntries
  };

  const score = calculateScore(verification);

  const resume = await Resume.create({
    filename: req.file.originalname,
    rawText,
    structuredData,
    verification,
    score,
    hrId: req.user.id
  });

  // Personalized sender: emails go out "from" the central account but display
  // this HR's name and Reply-To their real address (option 2 design).
  sendExperienceVerificationEmails(structuredData.name, experienceEntries, {
    hrName: req.user.name,
    hrEmail: req.user.email
  }).catch(err => console.error('Error sending experience verification emails:', err.message));

  res.status(201).json(resume);
}

export async function getResume(req, res) {
  // Scoped to the logged-in HR — prevents one HR from fetching another's data
  // by guessing or incrementing an id.
  const resume = await Resume.findOne({ _id: req.params.id, hrId: req.user.id });
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found' });
  }
  res.json(resume);
}

export async function getHistory(req, res) {
  const resumes = await Resume.find({ hrId: req.user.id })
    .sort({ createdAt: -1 })
    .select('filename structuredData.name score.finalScore score.bucket createdAt');
  res.json(resumes);
}

export async function deleteResume(req, res) {
  const resume = await Resume.findOneAndDelete({ _id: req.params.id, hrId: req.user.id });
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found' });
  }
  res.json({ message: 'Resume deleted' });
}