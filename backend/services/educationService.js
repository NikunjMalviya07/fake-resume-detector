import Fuse from 'fuse.js';
import Institution from '../model/Institution.js';
import Student from '../model/Student.js';
import { resolveCollegeName } from '../utils/collegeAliases.js';

// --- Institution-level verification (does this college exist in our DB?) ---

export async function verifyEducation(structuredData) {
  const { college, degree } = structuredData;

  if (!college) {
    return { status: 'uncertain', reason: 'No college name found on resume' };
  }

  const resolved = resolveCollegeName(college);
  if (resolved) {
    const institution = await Institution.findOne({ name: { $regex: resolved.split(' ')[0], $options: 'i' } });
    if (institution) {
      let degreeMatch = null;
      if (degree) {
        degreeMatch = institution.recognizedDegrees.some(d => degree.toLowerCase().includes(d.toLowerCase()));
      }
      return {
        status: 'pass',
        matchedInstitution: institution.name,
        confidence: 1,
        resolvedFrom: college,
        degreeMatch
      };
    }
  }

  const institutions = await Institution.find({});
  const fuse = new Fuse(institutions, {
    keys: ['name', 'aliases'],
    threshold: 0.4,
    includeScore: true
  });

  const collegePrimary = college.split(',')[0].trim();
  let result = fuse.search(collegePrimary);
  if (result.length === 0) {
    result = fuse.search(college);
  }

  if (result.length === 0) {
    return {
      status: 'not_recognized',
      reason: `"${college}" was not found in our mock institution database — this does not necessarily mean it's fake, only that it isn't in our limited test dataset`
    };
  }

  const institution = result[0].item;
  const confidence = 1 - (result[0].score ?? 0);

  let degreeMatch = null;
  if (degree) {
    degreeMatch = institution.recognizedDegrees.some(d => degree.toLowerCase().includes(d.toLowerCase()));
  }

  return {
    status: confidence >= 0.6 ? 'pass' : 'partial',
    matchedInstitution: institution.name,
    confidence: Number(confidence.toFixed(2)),
    degreeMatch
  };
}

// --- Candidate-record-level verification (does THIS student's data match our DB?) ---

function compareField(resumeValue, recordValue, tolerance, label) {
  if (resumeValue === undefined || resumeValue === null || resumeValue === '') {
    return { status: 'not_mentioned', reason: `${label} is not mentioned on the resume, so it could not be checked against our records` };
  }
  const pass = Math.abs(Number(resumeValue) - Number(recordValue)) <= tolerance;
  return { status: pass ? 'pass' : 'fail', resumeValue, recordValue };
}

export async function verifyStudentRecord(structuredData) {
  const { name, college, cgpa, passingYear, tenthPassingYear, twelfthPassingYear } = structuredData;

  if (!name || !college) {
    return { status: 'uncertain', reason: 'Missing name or college on resume, cannot check candidate record' };
  }

  const resolvedCollege = resolveCollegeName(college);
  const collegePrimary = resolvedCollege || college.split(',')[0].trim();

  const candidates = await Student.find({
    college: { $regex: resolvedCollege || collegePrimary, $options: 'i' }
  });

  if (candidates.length === 0) {
    return { status: 'not_recognized', reason: `No student records found for college "${collegePrimary}" in our mock database` };
  }

  const fuse = new Fuse(candidates, { keys: ['name'], threshold: 0.35, includeScore: true });
  const result = fuse.search(name);

  if (result.length === 0) {
    return { status: 'not_recognized', reason: `No matching student record found for "${name}" at "${collegePrimary}"`, matchedCollege: collegePrimary };
  }

  const record = result[0].item;
  const nameConfidence = 1 - (result[0].score ?? 0);

  const checks = {
    nameMatch: { status: 'pass', confidence: Number(nameConfidence.toFixed(2)) },
    collegeMatch: { status: 'pass', recordedCollege: record.college, resumeStated: college, resolvedAs: resolvedCollege },
    cgpaMatch: compareField(cgpa, record.cgpa, 0.3, 'CGPA'),
    graduationYearMatch: compareField(passingYear, record.graduationYear, 1, 'Graduation year'),
    tenthYearMatch: compareField(tenthPassingYear, record.tenthPassingYear, 1, '10th passing year'),
    twelfthYearMatch: compareField(twelfthPassingYear, record.twelfthPassingYear, 1, '12th passing year')
  };

  const comparedChecks = [checks.cgpaMatch, checks.graduationYearMatch, checks.tenthYearMatch, checks.twelfthYearMatch]
    .filter(c => c.status !== 'not_mentioned');
  const anyHardFail = comparedChecks.some(c => c.status === 'fail');
  const missingFields = Object.entries(checks).filter(([, c]) => c.status === 'not_mentioned').map(([k]) => k);

  let status;
  if (nameConfidence >= 0.85 && !anyHardFail) status = 'pass';
  else if (nameConfidence >= 0.6 && !anyHardFail) status = 'partial';
  else status = anyHardFail ? 'uncertain' : 'partial';

  return {
    status,
    matchedRecord: { name: record.name, college: record.college },
    checks,
    missingFieldsCount: missingFields.length,
    note: status === 'pass'
      ? (missingFields.length > 0
          ? `Candidate record matched; ${missingFields.join(', ')} not mentioned on resume and could not be cross-checked`
          : 'Candidate record matched with consistent CGPA, graduation year, and schooling history')
      : 'Candidate record found but one or more fields do not align closely with our records — review manually'
  };
}