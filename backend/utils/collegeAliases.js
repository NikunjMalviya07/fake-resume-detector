// Maps each canonical college name (exactly as stored in the Student/Institution
// collections) to every short-form/long-form variant a resume might realistically use.
export const COLLEGE_ALIASES = {
  'LNCT Bhopal': [
    'lnct', 'lnct bhopal',
    'lakshmi narain college of technology',
    'lakshmi narain college of technology bhopal'
  ],
  'OIST Bhopal': [
    'oist', 'oist bhopal',
    'oriental institute of science and technology',
    'oriental institute of science & technology',
    'oriental institute of science and technology bhopal'
  ],
  'MANIT Bhopal': [
    'manit', 'manit bhopal', 'nit bhopal',
    'maulana azad national institute of technology',
    'maulana azad national institute of technology bhopal',
    'national institute of technology bhopal'
  ],
  'IIIT Bhopal': [
    'iiit', 'iiit bhopal',
    'indian institute of information technology',
    'indian institute of information technology bhopal'
  ],
  'TIT Bhopal': [
    'tit', 'tit bhopal',
    'technocrats institute of technology',
    'technocrats institute of technology bhopal'
  ]
};

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Resolves any short-form, long-form, or close variant of a known college name
// to its canonical form (the exact string stored in the database). Returns
// null if the input doesn't match any known college, so callers can fall
// back to their own fuzzy logic for colleges outside this known set.
export function resolveCollegeName(input) {
  if (!input) return null;
  const normalizedInput = normalize(input);

  for (const [canonical, aliases] of Object.entries(COLLEGE_ALIASES)) {
    const isMatch = aliases.some(alias =>
      normalizedInput === alias ||
      normalizedInput.includes(alias) ||
      alias.includes(normalizedInput)
    );
    if (isMatch) return canonical;
  }
  return null;
}