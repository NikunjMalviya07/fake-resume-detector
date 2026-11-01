import crypto from 'crypto';
import Company from '../model/Company.js';
import { sendExperienceVerificationEmail } from './emailService.js';

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function matchCompany(companyNameFromResume) {
  if (!companyNameFromResume) return null;
  const companies = await Company.find({});
  const input = normalize(companyNameFromResume);

  for (const company of companies) {
    const names = [company.name, ...(company.aliases || [])].map(normalize);
    if (names.some(n => n === input || input.includes(n) || n.includes(input))) {
      return company;
    }
  }
  return null;
}

// Builds pending verification entries (no email sent yet, no DB writes yet)
// for each work-experience item on the resume. Call this BEFORE creating the
// Resume document, so the tokens get saved as part of the initial document.
export async function buildExperienceEntries(experienceList = []) {
  const entries = [];

  for (const exp of experienceList) {
    const matchedCompany = await matchCompany(exp.company);

    if (!matchedCompany) {
      entries.push({
        company: exp.company,
        role: exp.role,
        duration: exp.duration,
        status: 'not_recognized',
        reason: `"${exp.company}" was not found in our mock company verification database`
      });
      continue;
    }

    entries.push({
      company: exp.company,
      matchedCompanyName: matchedCompany.name,
      role: exp.role,
      duration: exp.duration,
      status: 'pending',
      token: crypto.randomUUID(),
      companyEmail: matchedCompany.verificationEmail
    });
  }

  return entries;
}

// Sends the actual verification emails for every 'pending' entry. Call this
// AFTER the Resume document is saved — lookups later only need the token,
// not the resumeId, so this can safely run in the background.
export async function sendExperienceVerificationEmails(candidateName, experienceEntries) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

  for (const entry of experienceEntries) {
    if (entry.status !== 'pending') continue;

    const confirmUrl = `${baseUrl}/api/resume/experience/${entry.token}/confirm`;
    const denyUrl = `${baseUrl}/api/resume/experience/${entry.token}/deny`;

    try {
      await sendExperienceVerificationEmail({
        to: entry.companyEmail,
        candidateName,
        company: entry.matchedCompanyName,
        role: entry.role,
        duration: entry.duration,
        confirmUrl,
        denyUrl
      });
    } catch (error) {
      console.error(`Failed to send verification email for ${entry.matchedCompanyName}:`, error.message);
    }
  }
}