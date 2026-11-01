export function calculateScore(verification) {
  const breakdown = [];

  // Education check (institution-level)
  if (verification.education) {
    const edu = verification.education;

    if (edu.status === 'pass') {
      breakdown.push({
        check: 'Education match',
        status: 'pass',
        weight: 8,
        note: `Matched: ${edu.matchedInstitution || 'Institution verified'}`
      });
    } else if (edu.status === 'partial') {
      breakdown.push({
        check: 'Education match',
        status: 'partial',
        weight: 8,
        note: 'Institution matched but degree mismatch'
      });
    } else if (edu.status === 'not_recognized') {
      breakdown.push({
        check: 'Education match',
        status: 'uncertain',
        weight: 8,
        note: edu.reason || 'Institution not recognized'
      });
    } else {
      breakdown.push({
        check: 'Education match',
        status: 'uncertain',
        weight: 8,
        note: edu.reason || 'Education could not be verified'
      });
    }
  }

  // Candidate record check (name + CGPA + graduation year + schooling history)
  if (verification.studentRecord) {
    const rec = verification.studentRecord;

    if (rec.status === 'pass') {
      breakdown.push({
        check: 'Candidate record match',
        status: 'pass',
        weight: 10,
        note: rec.note || `Matched record for ${rec.matchedRecord?.name || 'candidate'}`
      });
    } else if (rec.status === 'partial') {
      breakdown.push({
        check: 'Candidate record match',
        status: 'partial',
        weight: 10,
        note: rec.note || 'Candidate record partially matched'
      });
    } else if (rec.status === 'not_recognized') {
      breakdown.push({
        check: 'Candidate record match',
        status: 'uncertain',
        weight: 10,
        note: rec.reason || 'No matching candidate record found'
      });
    } else {
      breakdown.push({
        check: 'Candidate record match',
        status: 'uncertain',
        weight: 10,
        note: rec.reason || 'Candidate record could not be verified'
      });
    }
  }

  // Work experience checks (company-verified via email, may be pending)
  if (Array.isArray(verification.experience) && verification.experience.length > 0) {
    for (const exp of verification.experience) {
      let expStatus = 'uncertain';
      if (exp.status === 'pass') expStatus = 'pass';
      else if (exp.status === 'fail') expStatus = 'fail';
      // 'pending' and 'not_recognized' both fall through to 'uncertain' (0.4 weight)
      // until the company actually responds — recalculated automatically then.

      breakdown.push({
        check: `Work experience: ${exp.matchedCompanyName || exp.company || 'Unknown company'}`,
        status: expStatus,
        weight: 6,
        note:
          exp.status === 'pending'
            ? 'Waiting for response from company — not yet counted as pass or fail'
            : exp.status === 'not_recognized'
            ? (exp.reason || 'Company not found in our mock verification database')
            : `Company response: ${exp.status === 'pass' ? 'Verified' : 'Not Verified'}`
      });
    }
  }

  // GitHub profile check
  if (verification.github) {
    const gh = verification.github;

    if (gh.status === 'pass') {
      breakdown.push({
        check: 'GitHub profile exists',
        status: 'pass',
        weight: 6,
        note: `${gh.profile?.publicRepos ?? 'Unknown'} public repositories`
      });
    } else if (gh.status === 'fail') {
      breakdown.push({
        check: 'GitHub profile exists',
        status: 'fail',
        weight: 6,
        note: gh.reason || 'GitHub profile could not be verified'
      });
    } else {
      breakdown.push({
        check: 'GitHub profile exists',
        status: 'uncertain',
        weight: 6,
        note: gh.reason || 'GitHub verification inconclusive'
      });
    }

    // Project repository verification
    if (Array.isArray(gh.projectChecks) && gh.projectChecks.length > 0) {
      for (const project of gh.projectChecks) {
        let projectStatus = 'uncertain';

        if (project.status === 'pass') {
          projectStatus = 'pass';
        } else if (project.status === 'fail') {
          projectStatus = 'fail';
        }

        breakdown.push({
          check: `GitHub project: ${project.projectTitle || project.title || 'Resume project'}`,
          status: projectStatus,
          weight: 7,
          note:
            project.reason ||
            project.message ||
            project.note ||
            'Project verification result'
        });
      }
    } else if (gh.skillMatch && gh.skillMatch.ratio != null) {
      // Backward compatibility with the older GitHub service response
      const ratio = gh.skillMatch.ratio;
      const ratioStatus = ratio >= 0.3 ? 'pass' : 'fail';

      breakdown.push({
        check: 'Skills match GitHub activity',
        status: ratioStatus,
        weight: 7,
        note: `${Math.round(ratio * 100)}% of claimed skills found in repository languages`
      });
    }
  }

  // Weighted score: pass=1, partial=0.5, uncertain=0.4, fail=0
  const outcomeValue = {
    pass: 1,
    partial: 0.5,
    uncertain: 0.4,
    fail: 0
  };

  let totalWeight = 0;
  let earnedWeight = 0;

  for (const item of breakdown) {
    totalWeight += item.weight;
    earnedWeight += item.weight * outcomeValue[item.status];
  }

  // A rule-based system checking a fixed set of signals can never prove a
  // resume is 100% genuine — only that every available check came back
  // clean. The score is capped below 100 to reflect that this is an
  // evidence-based credibility estimate, not a certainty guarantee.
  const MAX_POSSIBLE_SCORE = 97;

  const rawScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : null;
  const finalScore = rawScore === null ? null : Math.min(MAX_POSSIBLE_SCORE, Math.round(rawScore));

  let bucket;

  if (finalScore === null) {
    bucket = 'Not assessed';
  } else if (finalScore >= 80) {
    bucket = 'High credibility';
  } else if (finalScore >= 50) {
    bucket = 'Needs review';
  } else {
    bucket = 'High risk';
  }

  return {
    finalScore,
    bucket,
    breakdown,
    disclaimer:
      'This score reflects evidence gathered from available checks (institution records, candidate data, GitHub activity, work experience) and represents estimated credibility, not absolute certainty. No automated system can verify a resume with 100% confidence.'
  };
}