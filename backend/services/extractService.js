import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });

const EXTRACTION_PROMPT = `
You are a resume parser. Extract structured data from the resume text below and return ONLY valid JSON matching this exact schema, with no markdown formatting, no code fences, and no extra commentary:

{
  "name": null,
  "email": null,
  "phone": null,
  "college": null,
  "degree": null,
  "cgpa": null,
  "passingYear": null,
  "tenthPassingYear": null,
  "twelfthPassingYear": null,
  "skills": [],
  "projects": [
    { "title": null, "description": null, "githubUrl": null, "techStack": [] }
  ],
  "experience": [
    { "company": null, "role": null, "duration": null }
  ],
  "githubUsername": null,
  "linkedinUrl": null
}

Rules:
- If a field is not present on the resume, set it to null (or an empty array for list fields). Do not invent or guess values.
- tenthPassingYear and twelfthPassingYear should only be filled if the resume explicitly states a 10th or 12th passing year. Do NOT infer them from the college graduation year.
- githubUsername should be extracted from a GitHub profile/project URL if present (just the username, not the full URL).
- The source text may contain OCR/font-encoding artifacts where certain characters are visually substituted (e.g. "l" for "1", "O" for "0", "!l" for "I"). Use context to correct obvious cases of this ONLY in emails, usernames, and URLs (e.g. "officialmalviyal4" -> "officialmalviya14", "NikunjMalviyaO7" -> "NikunjMalviya07", "FastAP!l" -> "FastAPI"). Do not alter normal prose/sentences this way.
-If the resume does not explicitly state a 10th or 12th passing year, set tenthPassingYear / twelfthPassingYear to null. Do not guess or infer these from the college graduation year — only extract them if they are literally written on the resume.

Resume text:
"""
{{RESUME_TEXT}}
"""
`;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanJsonResponse(text) {
  return text.replace(/```json/gi, '').replace(/```/g, '').trim();
}

export async function extractResumeData(rawText) {
  const prompt = EXTRACTION_PROMPT.replace('{{RESUME_TEXT}}', rawText);
const maxAttempts = 5;
const delays = [5000, 10000, 15000, 20000];

  let lastError;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = cleanJsonResponse(text);
      return JSON.parse(cleaned);
    } catch (error) {
      lastError = error;
      const isRetryable = error.status === 503 || error.status === 429 || /high demand|too many requests|quota exceeded/i.test(error.message || '');
      if (isRetryable && attempt < maxAttempts - 1) {
        await sleep(delays[attempt]);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}