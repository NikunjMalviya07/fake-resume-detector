import Resume from '../model/Resume.js';
import { calculateScore } from '../services/scoringService.js';

export async function handleExperienceDecision(req, res) {
  const { token, decision } = req.params;

  if (!['confirm', 'deny'].includes(decision)) {
    return res.status(400).send('<h2>Invalid request</h2>');
  }

  const resume = await Resume.findOne({ 'verification.experience.token': token });

  if (!resume) {
    return res.status(404).send('<h2>This verification link is invalid or has expired.</h2>');
  }

  const entry = resume.verification.experience.find(e => e.token === token);

  if (entry.status !== 'pending') {
    return res.send(`<h2>This has already been responded to (${entry.status}). No further action needed.</h2>`);
  }

  entry.status = decision === 'confirm' ? 'pass' : 'fail';
  entry.respondedAt = new Date();

  resume.score = calculateScore(resume.verification);
  resume.markModified('verification');
  await resume.save();

  res.send(`
    <div style="font-family: Arial, sans-serif; text-align:center; margin-top: 80px;">
      <h2>Thank you — your response has been recorded.</h2>
      <p>Verification status for <strong>${entry.matchedCompanyName}</strong>: <strong>${entry.status === 'pass' ? 'Verified' : 'Not Verified'}</strong></p>
      <p>You may close this tab.</p>
    </div>
  `);
}