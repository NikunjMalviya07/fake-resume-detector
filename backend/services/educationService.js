import Fuse from 'fuse.js';
import Institution from '../model/Institution.js';

export async function verifyEducation(structuredData) {
  const { college, degree, email } = structuredData;

  if (!college) {
    return { status: 'uncertain', reason: 'No college name extracted from resume' };
  }

  const institutions = await Institution.find({});

  const fuse = new Fuse(institutions, {
    keys: ['name', 'aliases'],
    threshold: 0.4,
    includeScore: true
  });

  const results = fuse.search(college);

  if (results.length === 0) {
    return {
      status: 'fail',
      reason: `No recognized institution matched "${college}"`
    };
  }

  const bestMatch = results[0].item;
  const matchConfidence = 1 - results[0].score;

  const checks = {
    collegeMatch: {
      matched: true,
      matchedName: bestMatch.name,
      confidence: matchConfidence
    },
    degreeMatch: degree
      ? bestMatch.recognizedDegrees.some(d => d.toLowerCase() === degree.toLowerCase())
      : null,
    emailDomainMatch: email && bestMatch.emailDomain
      ? email.toLowerCase().endsWith(bestMatch.emailDomain.toLowerCase())
      : null
  };

  const allPass = checks.collegeMatch.matched && (checks.degreeMatch !== false);

  return {
    status: allPass ? 'pass' : 'partial',
    matchedInstitution: bestMatch.name,
    confidence: matchConfidence,
    checks
  };
}