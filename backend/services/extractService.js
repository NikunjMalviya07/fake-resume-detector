import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function extractResumeData(rawText) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });

  const prompt = `
Extract structured data from this resume text and return ONLY valid JSON matching this exact schema:

{
  "name": string,
  "email": string,
  "phone": string,
  "college": string,
  "degree": string,
  "passingYear": string,
  "skills": [string],
  "projects": [{ "title": string, "description": string, "githubUrl": string | null, "techStack": [string] }],
  "experience": [{ "company": string, "role": string, "duration": string }],
  "githubUsername": string | null,
  "linkedinUrl": string | null
}

If a field isn't present in the resume, use null or an empty array. Do not invent information.

Resume text:
"""
${rawText}
"""
`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}