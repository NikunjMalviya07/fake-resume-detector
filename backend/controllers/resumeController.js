import Resume from '../model/Resume.js';
import { extractTextFromResume } from '../services/ocrService.js';
import { extractResumeData } from '../services/extractService.js';
import { verifyEducation, verifyStudentRecord } from '../services/educationService.js';
import { verifyGithub } from '../services/githubService.js';
import { calculateScore } from '../services/scoringService.js';
import { buildExperienceEntries, sendExperienceVerificationEmails } from '../services/experienceVerificationService.js';

export async function uploadResume(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const rawText = await extractTextFromResume(req.file.buffer, req.file.originalname);
  const structuredData = await extractResumeData(rawText);

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
    score
  });

  // Fire-and-forget: emails go out in the background so the response returns
  // immediately with education/GitHub results while experience stays "pending".
  sendExperienceVerificationEmails(structuredData.name, experienceEntries).catch(err =>
    console.error('Error sending experience verification emails:', err.message)
  );

  res.status(201).json(resume);
}

export async function getResume(req, res) {
  const resume = await Resume.findById(req.params.id);
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found' });
  }
  res.json(resume);
}