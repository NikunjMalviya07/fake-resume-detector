import axios from 'axios';

const GITHUB_API = 'https://api.github.com';

const github = axios.create({
  baseURL: GITHUB_API,
  timeout: 15000,
  headers: {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {})
  }
});

function isNotFound(error) {
  return error.response?.status === 404;
}
function getErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Unknown GitHub API error';
}

async function getProfile(username) {
  const { data } = await github.get(`/users/${username}`);
  return {
    username: data.login,
    name: data.name,
    profileUrl: data.html_url,
    publicRepos: data.public_repos,
    accountCreated: data.created_at
  };
}

async function getOwnedRepos(username) {
  const repos = [];
  for (let page = 1; page <= 5; page++) {
    const { data } = await github.get(`/users/${username}/repos`, {
      params: { type: 'all', sort: 'updated', per_page: 100, page }
    });
    repos.push(...data);
    if (data.length < 100) break;
  }

  const hydrated = [];
  for (const repo of repos) {
    if (repo.fork) {
      try {
        const { data: full } = await github.get(`/repos/${repo.owner.login}/${repo.name}`);
        hydrated.push(full);
      } catch {
        hydrated.push(repo);
      }
    } else {
      hydrated.push(repo);
    }
  }
  return hydrated;
}

// --- Contribution verification: commit authorship (strong) + contributor list (secondary) ---

async function getCommitCountByAuthor(owner, repo, username) {
  try {
    let count = 0;
    for (let page = 1; page <= 3; page++) {
      const { data } = await github.get(`/repos/${owner}/${repo}/commits`, {
        params: { author: username, per_page: 100, page }
      });
      count += data.length;
      if (data.length < 100) break;
    }
    return count;
  } catch (error) {
    if (error.response?.status === 409 || isNotFound(error)) return 0; // empty or inaccessible repo
    throw error;
  }
}

async function getContributorInfo(owner, repo, username) {
  try {
    const { data } = await github.get(`/repos/${owner}/${repo}/contributors`, { params: { per_page: 100 } });
    const found = data.find(c => c.login?.toLowerCase() === username.toLowerCase());
    return { listed: Boolean(found), contributions: found?.contributions || 0 };
  } catch (error) {
    if (error.response?.status === 204 || isNotFound(error)) return { listed: false, contributions: 0 };
    throw error;
  }
}

// Combines both signals: direct commit authorship is the strongest evidence
// (90-100% confidence — the candidate's own commits exist in this exact repo).
// Contributor-list membership is kept as a secondary, weaker signal, since
// that endpoint can be cached/delayed or miss squashed commits.
async function checkContribution(owner, repo, username) {
  let commitCount = 0;
  let commitError = null;
  try {
    commitCount = await getCommitCountByAuthor(owner, repo, username);
  } catch (error) {
    commitError = getErrorMessage(error);
  }

  let contributorInfo = { listed: false, contributions: 0 };
  let contributorError = null;
  try {
    contributorInfo = await getContributorInfo(owner, repo, username);
  } catch (error) {
    contributorError = getErrorMessage(error);
  }

  let status, confidence, note;

  if (commitCount > 0) {
    status = 'pass';
    confidence = 'high';
    note = `Candidate authored ${commitCount} commit(s) directly in this repository`;
  } else if (contributorInfo.listed) {
    status = 'pass';
    confidence = 'medium';
    note = `Candidate is listed as a contributor (${contributorInfo.contributions} contribution(s)) though no commits matched the direct author query`;
  } else {
    status = 'not_verified';
    confidence = 'low';
    note = 'No commits or contributor listing found for this candidate in this repository';
  }

  return {
    status,
    confidence,
    note,
    evidence: { commitCount, isListedContributor: contributorInfo.listed, contributorContributions: contributorInfo.contributions },
    errors: [commitError, contributorError].filter(Boolean)
  };
}

async function verifyRepoContribution(repo, username) {
  const isFork = Boolean(repo.fork && repo.parent);

  if (!isFork) {
    return { isFork: false, status: 'pass', confidence: 'high', note: 'Original (non-forked) repository owned by candidate' };
  }

  const contribution = await checkContribution(repo.parent.owner.login, repo.parent.name, username);
  return {
    isFork: true,
    originalRepository: repo.parent.full_name,
    status: contribution.status,
    confidence: contribution.confidence,
    note: contribution.note,
    evidence: contribution.evidence
  };
}

// --- Matching a resume project to a repo ---

function normalizeText(value = '') {
  return String(value).toLowerCase().replace(/https?:\/\//g, '').replace(/www\./g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

const STOPWORDS = new Set(['the', 'and', 'for', 'with', 'using', 'app', 'application', 'system', 'project', 'assistant', 'platform', 'web', 'based', 'live', 'an', 'a', 'to', 'of', 'is', 'in']);

function getWords(value = '') {
  return normalizeText(value).split(' ').filter(w => w.length > 2 && !STOPWORDS.has(w));
}

function tokenOverlapRatio(text, otherText) {
  const textTokens = new Set(text.split(' ').filter(Boolean));
  const otherTokens = otherText.split(' ').filter(Boolean);
  if (otherTokens.length === 0) return 0;
  const matched = otherTokens.filter(t => textTokens.has(t));
  return matched.length / otherTokens.length;
}

function scoreRepoMatch(project, repo) {
  const title = project.title || '';
  const description = project.description || '';
  const combinedProjectText = normalizeText(`${title} ${description}`);

  const repoName = normalizeText(repo.name);
  const repoDesc = normalizeText(repo.description || '');
  const repoHomepage = normalizeText(repo.homepage || '');

  let score = 0;
  const reasons = [];

  if (repoHomepage) {
    const ratio = tokenOverlapRatio(combinedProjectText, repoHomepage);
    if (ratio >= 0.6) { score += 60; reasons.push('Repository homepage strongly referenced in project description'); }
    else if (ratio >= 0.3) { score += 30; reasons.push('Repository homepage partially referenced in project description'); }
  }

  const normTitle = normalizeText(title);
  if (normTitle && repoName === normTitle) { score += 50; reasons.push('Repository name exactly matches project title'); }
  else if (normTitle && repoName.length > 3 && (repoName.includes(normTitle) || normTitle.includes(repoName))) { score += 30; reasons.push('Repository name closely matches project title'); }

  const titleWords = getWords(title);
  const repoTokens = new Set(`${repoName} ${repoDesc}`.split(' '));
  const matchedTitleWords = titleWords.filter(w => repoTokens.has(w));
  if (titleWords.length > 0 && matchedTitleWords.length > 0) {
    score += Math.round((matchedTitleWords.length / titleWords.length) * 25);
    reasons.push(`Matched ${matchedTitleWords.length}/${titleWords.length} title keywords`);
  }

  const descWords = getWords(description).slice(0, 15);
  const matchedDescWords = descWords.filter(w => repoTokens.has(w));
  if (descWords.length > 0 && matchedDescWords.length >= 3) { score += 20; reasons.push('Project description closely matches repository description'); }

  return { score: Math.min(score, 100), reasons };
}

function findBestRepoMatch(project, repos) {
  let best = null;
  for (const repo of repos) {
    const { score, reasons } = scoreRepoMatch(project, repo);
    if (!best || score > best.score) best = { repo, score, reasons };
  }
  if (!best || best.score < 25) return null;
  return { repo: best.repo, confidence: best.score / 100, reasons: best.reasons };
}

async function verifyProject(project, username, repos) {
  if (project.githubUrl) {
    const match = project.githubUrl.match(/github\.com\/([^/]+)\/([^/?#]+)/i);
    if (match) {
      try {
        const { data } = await github.get(`/repos/${match[1]}/${match[2].replace(/\.git$/i, '')}`);
        const contribution = await verifyRepoContribution(data, username);
        return { projectTitle: project.title, repositoryFound: true, discoveryMethod: 'explicit_url', repository: data.full_name, ...contribution };
      } catch (error) {
        return { projectTitle: project.title, repositoryFound: false, status: 'uncertain', reason: `Linked repository could not be checked: ${getErrorMessage(error)}` };
      }
    }
  }

  const best = findBestRepoMatch(project, repos);
  if (!best) {
    return {
      projectTitle: project.title,
      repositoryFound: false,
      status: 'not_verified',
      reason: "No GitHub repository was linked on the resume, and no close match was found among this profile's public repositories. This does not prove the project does not exist — only that it could not be automatically located."
    };
  }

  const contribution = await verifyRepoContribution(best.repo, username);
  return {
    projectTitle: project.title,
    repositoryFound: true,
    discoveryMethod: 'matched_automatically',
    repository: best.repo.full_name,
    matchConfidence: best.confidence,
    matchReasons: best.reasons,
    ...contribution
  };
}

export async function verifyGithub(structuredData) {
  const username = structuredData?.githubUsername;
  const skills = structuredData?.skills || [];

  if (!username) {
    return { status: 'uncertain', reason: 'No GitHub username found on resume', projectChecks: [] };
  }

  try {
    const profile = await getProfile(username);
    const repos = await getOwnedRepos(username);
    const ownRepos = repos.filter(r => !r.fork);
    const forkedRepos = repos.filter(r => r.fork);

    const languageSet = new Set();
    for (const repo of ownRepos.slice(0, 10)) {
      try {
        const { data } = await github.get(`/repos/${repo.full_name}/languages`);
        Object.keys(data).forEach(l => languageSet.add(l.toLowerCase()));
      } catch { continue; }
    }
    const languages = [...languageSet];
    const normalizedSkills = skills.map(s => s.toLowerCase());
    const matchedSkills = normalizedSkills.filter(s => languages.some(l => l.includes(s) || s.includes(l)));
    const skillMatchRatio = normalizedSkills.length > 0 ? matchedSkills.length / normalizedSkills.length : null;

    const projectChecks = [];
    for (const project of structuredData.projects || []) {
      try {
        projectChecks.push(await verifyProject(project, username, repos));
      } catch (error) {
        projectChecks.push({ projectTitle: project.title, status: 'uncertain', reason: getErrorMessage(error) });
      }
    }

    const passed = projectChecks.filter(p => p.status === 'pass').length;
    const overallStatus = projectChecks.length === 0 ? 'pass'
      : passed === projectChecks.length ? 'pass'
      : passed > 0 ? 'partial' : 'uncertain';

    return {
      status: overallStatus,
      profile,
      repoSummary: { ownRepoCount: ownRepos.length, forkedRepoCount: forkedRepos.length },
      languagesFound: languages,
      skillMatch: { matchedSkills, ratio: skillMatchRatio },
      projectChecks
    };
  } catch (error) {
    if (isNotFound(error)) return { status: 'fail', reason: `GitHub user "${username}" does not exist`, projectChecks: [] };
    return { status: 'uncertain', reason: getErrorMessage(error), projectChecks: [] };
  }
}