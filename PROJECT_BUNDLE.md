# FAKE RESUME DETECTOR - FULL PROJECT CONTEXT & CODEBASE

> **Instructions for the AI Model reading this file:**
> - This document compiles the entire source code, directory layout, architecture, and configuration templates for the **Fake Resume Detector** project.
> - All sensitive files (`.env`, `.gitignore`, secrets) and heavy dependency trees (`node_modules`, Python `venv`, binary objects) have been purposefully excluded.
> - An environment variable reference is provided below so you know all required variables.
> - Use this information to understand the codebase immediately, debug, build new features (such as the frontend UI or new verification rules), and continue development seamlessly.

---

## 1. Project Architecture & Overview

- **Project Title**: Fake Resume Detector (College Mini Project)
- **High-Level Goal**: Automated detection and verification of candidate credentials on resumes (authenticity of colleges/universities, GitHub activity, email validity, scoring).
- **Subsystems**:
  1. **Backend (`backend/`)**:
     - Runtime: Node.js (ES Modules) + Express.js
     - Database: MongoDB via Mongoose
     - AI Extraction: Google Gemini API (`@google/generative-ai`) parses unstructured OCR text into JSON schema.
     - Document Upload: Multer (memory/temp storage)
     - Fuzzy Matching: Fuse.js (used to cross-reference candidate university/college against accredited Indian/global institutions in `Institution` collection).
     - External Verification:
       - GitHub verification via GitHub REST API (evaluates repo count, activity, account age).
       - Email verification (checks domain syntax, disposable domains).
       - Scoring engine (`scoringService.js`) weights and outputs an overall credibility score and breakdown.
  2. **OCR Service (`ocr-service/`)**:
     - Framework: Python FastAPI + Uvicorn
     - Engine: `pytesseract` (Tesseract OCR) + `pdf2image`
     - Endpoint: `POST /ocr` accepts uploaded file and returns extracted plain text.
  3. **Frontend (`frontend/`)**:
     - Currently empty. Planned for UI allowing users to upload resumes, view extracted data, see verification flags, and review credibility scores.

---

## 2. Environment Variables Specification (`.env.example`)

Create a `.env` file inside the `backend/` directory with the following variables:

```env
# Server Configuration
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/fake-resume-detector

# AI Services
GEMINI_API_KEY=your_gemini_api_key_here

# External Verification
GITHUB_TOKEN=your_github_personal_access_token_here

# OCR Microservice URL
OCR_SERVICE_URL=http://localhost:8000/ocr
```

---

## 3. Directory Structure

```text
fake-resume-detector/
├── README.md
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── app.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── resumeController.js
│   ├── data/
│   │   └── seedInstitutions.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── model/
│   │   ├── Institution.js
│   │   └── Resume.js
│   ├── routes/
│   │   └── resumeRoutes.js
│   ├── services/
│   │   ├── educationService.js
│   │   ├── emailService.js
│   │   ├── extractService.js
│   │   ├── githubService.js
│   │   ├── ocrService.js
│   │   └── scoringService.js
│   └── utils/
│       └── asyncHandler.js
├── frontend/                     # Ready for frontend development
└── ocr-service/
    ├── requirements.txt
    ├── main.py
    └── test_ocr.py
```

---

## 4. Source Code Files

### File: `README.md`

```markdown
# fake-resume-detector
```

---

### File: `backend/package.json`

```json
{
  "name": "backend",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node server.js",
    "dev": "npx nodemon server.js",
    "seed": "node data/seedInstitutions.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module",
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "axios": "^1.20.0",
    "cors": "^2.8.6",
    "dotenv": "^18.0.8",
    "express": "^4.19.2",
    "form-data": "^4.0.6",
    "fuse.js": "^7.5.0",
    "mongoose": "^8.24.5",
    "multer": "^1.4.5-lts.1"
  }
}
```

---

### File: `backend/server.js`

```javascript
import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDB();
        
        app.listen(PORT , ()=> {
            console.log(`Backend Running on PORT ${PORT}`);
        });
    } catch (err) {
        console.log(`Failed to start Server` , err.message);
        process.exit(1);
    }
}

startServer();
```

---

### File: `backend/app.js`

```javascript
import express from 'express';
import cors from 'cors';
import resumeRoutes from './routes/resumeRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'Backend running' });
});

app.use('/api/resume', resumeRoutes);

app.use(errorHandler);

export default app;
```

---

### File: `backend/config/db.js`

```javascript
import mongoose from 'mongoose';

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    throw err;
  }
}

export default connectDB;
```

---

### File: `backend/controllers/resumeController.js`

```javascript
import Resume from '../model/Resume.js';
import { extractTextFromResume } from '../services/ocrService.js';
import { extractResumeData } from '../services/extractService.js';
import { verifyEducation } from '../services/educationService.js';
import { verifyGithub } from '../services/githubService.js';
import { calculateScore } from '../services/scoringService.js';

export async function uploadResume(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const rawText = await extractTextFromResume(req.file.buffer, req.file.originalname);
  const structuredData = await extractResumeData(rawText);
  const educationResult = await verifyEducation(structuredData);
  const githubResult = await verifyGithub(structuredData);

  const verification = {
    education: educationResult,
    github: githubResult,
    email: null
  };

  const score = calculateScore(verification);

  const resume = await Resume.create({
    filename: req.file.originalname,
    rawText,
    structuredData,
    verification,
    score
  });

  res.status(201).json(resume);
}

export async function getResume(req, res) {
  const resume = await Resume.findById(req.params.id);
  if (!resume) {
    return res.status(404).json({ error: 'Resume not found' });
  }
  res.json(resume);
}
```

---

### File: `backend/data/seedInstitutions.js`

```javascript
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Institution from '../model/Institution.js';

const institutions = [
  {
    name: 'Lakshmi Narain College of Technology, Bhopal',
    aliases: ['LNCT Bhopal', 'LNCT', 'Lakshmi Narain College of Technology'],
    state: 'Madhya Pradesh',
    type: 'College',
    recognizedDegrees: ['B.Tech', 'B.E.', 'MCA', 'BCA', 'M.Tech'],
    emailDomain: 'lnct.ac.in'
  },
  {
    name: 'Indian Institute of Technology Bombay',
    aliases: ['IIT Bombay', 'IIT Mumbai', 'IITB'],
    state: 'Maharashtra',
    type: 'Institute',
    recognizedDegrees: ['B.Tech', 'M.Tech', 'PhD', 'Dual Degree'],
    emailDomain: 'iitb.ac.in'
  },
  {
    name: 'Delhi Technological University',
    aliases: ['DTU', 'Delhi College of Engineering', 'DCE'],
    state: 'Delhi',
    type: 'University',
    recognizedDegrees: ['B.Tech', 'M.Tech'],
    emailDomain: 'dtu.ac.in'
  },

    {
    name: 'Birla Institute of Technology and Science, Pilani',
    aliases: ['BITS Pilani', 'BITS', 'BITSP'],
    state: 'Rajasthan',
    type: 'University',
    recognizedDegrees: ['B.E.', 'M.E.', 'M.Sc.', 'PhD'],
    emailDomain: 'pilani.bits-pilani.ac.in'
  },
  {
    name: 'Vellore Institute of Technology',
    aliases: ['VIT Vellore', 'VIT', 'VIT University'],
    state: 'Tamil Nadu',
    type: 'University',
    recognizedDegrees: ['B.Tech', 'M.Tech', 'MCA', 'BSc', 'PhD'],
    emailDomain: 'vit.ac.in'
  },
  {
    name: 'National Institute of Technology, Tiruchirappalli',
    aliases: ['NIT Trichy', 'NITT', 'NIT@T'],
    state: 'Tamil Nadu',
    type: 'Institute',
    recognizedDegrees: ['B.Tech', 'M.Tech', 'MCA', 'M.Sc.', 'PhD'],
    emailDomain: 'nitt.edu'
  },
  {
    name: 'Indian Institute of Science',
    aliases: ['IISc Bangalore', 'IISc', 'Tata Institute'],
    state: 'Karnataka',
    type: 'Institute',
    recognizedDegrees: ['B.Sc.', 'M.Tech', 'M.Des.', 'PhD'],
    emailDomain: 'iisc.ac.in'
  },
  {
    name: 'Jadavpur University',
    aliases: ['JU', 'Jadavpur'],
    state: 'West Bengal',
    type: 'University',
    recognizedDegrees: ['B.E.', 'B.Tech', 'M.E.', 'M.Tech', 'MCA', 'MA', 'M.Sc.'],
    emailDomain: 'jadavpuruniversity.in'
  },
  {
    name: 'College of Engineering, Pune',
    aliases: ['COEP Technological University', 'COEP', 'COEP Pune'],
    state: 'Maharashtra',
    type: 'University',
    recognizedDegrees: ['B.Tech', 'M.Tech', 'PhD'],
    emailDomain: 'coep.org.in'
  },
  {
    name: 'International Institute of Information Technology, Hyderabad',
    aliases: ['IIIT Hyderabad', 'IIITH', 'IIIT-H'],
    state: 'Telangana',
    type: 'Institute',
    recognizedDegrees: ['B.Tech', 'M.Tech', 'MS', 'PhD'],
    emailDomain: 'iiit.ac.in'
  },
  {
    name: 'Manipal Institute of Technology',
    aliases: ['MIT Manipal', 'MIT', 'Manipal'],
    state: 'Karnataka',
    type: 'College',
    recognizedDegrees: ['B.Tech', 'M.Tech', 'MCA'],
    emailDomain: 'manipal.edu'
  },
  {
    name: 'Thapar Institute of Engineering and Technology',
    aliases: ['Thapar University', 'TIET', 'Thapar Patiala'],
    state: 'Punjab',
    type: 'University',
    recognizedDegrees: ['B.Tech', 'M.Tech', 'MCA', 'PhD'],
    emailDomain: 'thapar.edu'
  },
  {
    name: 'RV College of Engineering',
    aliases: ['RVCE', 'RV College'],
    state: 'Karnataka',
    type: 'College',
    recognizedDegrees: ['B.E.', 'M.Tech', 'MCA'],
    emailDomain: 'rvce.edu.in'
  },
  {
    name: 'SRM Institute of Science and Technology',
    aliases: ['SRM University', 'SRM Chennai', 'SRMIST'],
    state: 'Tamil Nadu',
    type: 'University',
    recognizedDegrees: ['B.Tech', 'M.Tech', 'MCA', 'BBA', 'MBA'],
    emailDomain: 'srmist.edu.in'
  },
  {
    name: 'Amity University, Noida',
    aliases: ['Amity Noida', 'Amity'],
    state: 'Uttar Pradesh',
    type: 'University',
    recognizedDegrees: ['B.Tech', 'M.Tech', 'MBA', 'BBA', 'BCA', 'MCA'],
    emailDomain: 'amity.edu'
  },
  {
    name: 'PSG College of Technology',
    aliases: ['PSG Tech', 'PSG'],
    state: 'Tamil Nadu',
    type: 'College',
    recognizedDegrees: ['B.E.', 'B.Tech', 'M.E.', 'M.Tech', 'MCA', 'MS'],
    emailDomain: 'psgtech.ac.in'
  },
  {
    name: 'Maulana Azad National Institute of Technology',
    aliases: ['MANIT Bhopal', 'MANIT', 'NIT Bhopal'],
    state: 'Madhya Pradesh',
    type: 'Institute',
    recognizedDegrees: ['B.Tech', 'B.Arch', 'M.Tech', 'MCA', 'MBA'],
    emailDomain: 'manit.ac.in'
  },
  {
    name: 'College of Engineering, Guindy',
    aliases: ['CEG Anna University', 'CEG', 'CEG Chennai'],
    state: 'Tamil Nadu',
    type: 'College',
    recognizedDegrees: ['B.E.', 'B.Tech', 'M.E.', 'M.Tech', 'MCA', 'MBA'],
    emailDomain: 'annauniv.edu'
  },
    {
    name: 'Maulana Azad National Institute of Technology',
    aliases: ['MANIT Bhopal', 'MANIT', 'NIT Bhopal'],
    state: 'Madhya Pradesh',
    type: 'Institute',
    recognizedDegrees: ['B.Tech', 'B.Arch', 'M.Tech', 'MCA', 'MBA', 'PhD'],
    emailDomain: 'manit.ac.in'
  },
  {
    name: 'Indian Institute of Information Technology, Bhopal',
    aliases: ['IIIT Bhopal', 'IIITB', 'IIITBH'],
    state: 'Madhya Pradesh',
    type: 'Institute',
    recognizedDegrees: ['B.Tech', 'PhD'],
    emailDomain: 'iiitbhopal.ac.in'
  },
  {
    name: 'All India Institute of Medical Sciences, Bhopal',
    aliases: ['AIIMS Bhopal', 'AIIMS BPL'],
    state: 'Madhya Pradesh',
    type: 'Institute',
    recognizedDegrees: ['MBBS', 'B.Sc. Nursing', 'MD', 'MS', 'M.Ch', 'PhD'],
    emailDomain: 'aiimsbhopal.edu.in'
  },
  {
    name: 'Rajiv Gandhi Proudyogiki Vishwavidyalaya',
    aliases: ['RGPV', 'RGTU', 'State Technological University of Madhya Pradesh'],
    state: 'Madhya Pradesh',
    type: 'University',
    recognizedDegrees: ['B.Tech', 'B.Pharm', 'M.Tech', 'M.Pharm', 'MCA', 'PhD'],
    emailDomain: 'rgpv.ac.in'
  },
  {
    name: 'Barkatullah University',
    aliases: ['BU Bhopal', 'Barkatullah Vishwavidyalaya', 'Bhopal University'],
    state: 'Madhya Pradesh',
    type: 'University',
    recognizedDegrees: ['BA', 'B.Sc.', 'B.Com', 'MA', 'M.Sc.', 'LL.B.', 'LL.M.', 'MBA', 'PhD'],
    emailDomain: 'bubhopal.ac.in'
  },
  {
    name: 'National Law Institute University',
    aliases: ['NLIU Bhopal', 'NLIU', 'NLU Bhopal'],
    state: 'Madhya Pradesh',
    type: 'University',
    recognizedDegrees: ['B.A. LL.B. (Hons.)', 'B.Sc. LL.B. (Hons.)', 'LL.M.', 'M.S. (Cyber Law)'],
    emailDomain: 'nliu.ac.in'
  },
  {
    name: 'School of Planning and Architecture, Bhopal',
    aliases: ['SPA Bhopal', 'SPA B'],
    state: 'Madhya Pradesh',
    type: 'Institute',
    recognizedDegrees: ['B.Arch', 'B.Plan', 'M.Arch', 'M.Plan', 'PhD'],
    emailDomain: 'spabhopal.ac.in'
  },
  {
    name: 'Gandhi Medical College',
    aliases: ['GMC Bhopal', 'GMC'],
    state: 'Madhya Pradesh',
    type: 'College',
    recognizedDegrees: ['MBBS', 'MD', 'MS', 'Diploma'],
    emailDomain: 'gmcbhopal.net'
  },
  {
    name: 'Jagran Lakecity University',
    aliases: ['JLU Bhopal', 'JLU'],
    state: 'Madhya Pradesh',
    type: 'University',
    recognizedDegrees: ['B.Tech', 'BBA', 'B.Com', 'BA LL.B.', 'MA', 'MBA', 'PhD'],
    emailDomain: 'jlu.edu.in'
  },
  {
    name: 'SAGE University, Bhopal',
    aliases: ['SUB', 'Sage University'],
    state: 'Madhya Pradesh',
    type: 'University',
    recognizedDegrees: ['B.Tech', 'BBA', 'BCA', 'B.Sc.', 'MBA', 'M.Tech', 'PhD'],
    emailDomain: 'sageuniversity.edu.in'
  },
  {
    name: 'LNCT University',
    aliases: ['LNCTU', 'LNCT University Bhopal'],
    state: 'Madhya Pradesh',
    type: 'University',
    recognizedDegrees: ['MBBS', 'B.Tech', 'B.Pharm', 'BBA', 'BCA', 'MBA', 'M.Tech'],
    emailDomain: 'lnctu.ac.in'
  },
  {
    name: 'Oriental Institute of Science and Technology',
    aliases: ['OIST Bhopal', 'OIST', 'Oriental College'],
    state: 'Madhya Pradesh',
    type: 'College',
    recognizedDegrees: ['B.Tech', 'M.Tech', 'MCA', 'MBA'],
    emailDomain: 'oriental.ac.in'
  },
  {
    name: 'People’s University',
    aliases: ['PU Bhopal', 'Peoples University'],
    state: 'Madhya Pradesh',
    type: 'University',
    recognizedDegrees: ['BDS', 'MBBS', 'B.Tech', 'B.Pharm', 'M.Tech', 'MDS', 'MBA'],
    emailDomain: 'peoplesuniversity.edu.in'
  },
  {
    name: 'Technocrats Institute of Technology',
    aliases: ['TIT Bhopal', 'TIT Group', 'TIT Main'],
    state: 'Madhya Pradesh',
    type: 'College',
    recognizedDegrees: ['B.Tech', 'M.Tech', 'MBA', 'MCA', 'B.Pharm'],
    emailDomain: 'technocratsgroup.edu.in'
  },
  {
    name: 'Bansal Institute of Science & Technology',
    aliases: ['BIST Bhopal', 'Bansal College'],
    state: 'Madhya Pradesh',
    type: 'College',
    recognizedDegrees: ['B.Tech', 'M.Tech', 'MBA', 'MCA'],
    emailDomain: 'bistbhopal.ac.in'
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Institution.deleteMany({});
  await Institution.insertMany(institutions);
  console.log(`Seeded ${institutions.length} institutions`);
  await mongoose.disconnect();
}

seed();
```

---

### File: `backend/middleware/errorHandler.js`

```javascript
function errorHandler(err, req, res, next) {
  console.error(err.message);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Something went wrong'
  });
}

export default errorHandler;
```

---

### File: `backend/middleware/upload.js`

```javascript
import multer from 'multer';

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const allowedTypes = ['application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export default upload;
```

---

### File: `backend/model/Institution.js`

```javascript
import mongoose from 'mongoose';

const institutionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  aliases: [String],        
  state: String,
  type: { type: String, enum: ['University', 'College', 'Institute'], default: 'College' },
  recognizedDegrees: [String],  
  emailDomain: String            
});

export default mongoose.model('Institution', institutionSchema);
```

---

### File: `backend/model/Resume.js`

```javascript
import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  filename: String,
  rawText: String,
  structuredData: {
    name: String,
    email: String,
    phone: String,
    college: String,
    degree: String,
    passingYear: String,
    skills: [String],
    projects: [{
      title: String,
      description: String,
      githubUrl: String,
      techStack: [String]
    }],
    experience: [{
      company: String,
      role: String,
      duration: String
    }],
    githubUsername: String,
    linkedinUrl: String
  },
  verification: {
    education: { type: Object, default: null },
    github: { type: Object, default: null },
    email: { type: Object, default: null }
  },
  score: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Resume', resumeSchema);
```

---

### File: `backend/routes/resumeRoutes.js`

```javascript
import express from 'express';
import upload from '../middleware/upload.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadResume, getResume } from '../controllers/resumeController.js';

const router = express.Router();

router.post('/upload', upload.single('file'), asyncHandler(uploadResume));
router.get('/:id', asyncHandler(getResume));

export default router;
```

---

### File: `backend/services/educationService.js`

```javascript
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
      status: 'not_recognized',
      reason: `"${college}" was not found in our verified institutions database. This does not necessarily indicate fraud — it may mean the institution isn't yet in our dataset.`
    };
  }

  const bestMatch = results[0].item;
  const matchConfidence = 1 - results[0].score;

  // Partial/contains match instead of exact — a resume's degree phrasing
  // ("B.Tech in Computer Science & Engineering") will rarely match a
  // clean list entry ("B.Tech") exactly.
  const degreeMatch = degree
    ? bestMatch.recognizedDegrees.some(d =>
        degree.toLowerCase().includes(d.toLowerCase())
      )
    : null;

  // Email domain mismatch is common and NOT inherently suspicious —
  // most students list a personal email. Treat it as informational only,
  // never as a fail condition.
  const emailDomainMatch = email && bestMatch.emailDomain
    ? email.toLowerCase().endsWith(bestMatch.emailDomain.toLowerCase())
    : null;

  const checks = {
    collegeMatch: {
      matched: true,
      matchedName: bestMatch.name,
      confidence: matchConfidence
    },
    degreeMatch,
    emailDomainMatch
  };


  const allPass = checks.collegeMatch.matched && (checks.degreeMatch !== false);

  return {
    status: allPass ? 'pass' : 'partial',
    matchedInstitution: bestMatch.name,
    confidence: matchConfidence,
    checks
  };
}
```

---

### File: `backend/services/emailService.js`

```javascript
export async function sendVerificationEmail(structuredData) {
  return { status: 'not_implemented' };
}
```

---

### File: `backend/services/extractService.js`

```javascript
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
  "cgpa": string | null,
  "passingYear": string,
  "skills": [string],
  "projects": [{ "title": string, "description": string, "githubUrl": string | null, "techStack": [string] }],
  "experience": [{ "company": string, "role": string, "duration": string }],
  "githubUsername": string | null,
  "linkedinUrl": string | null
}

Important: resumes exported from certain PDF tools sometimes have corrupted character encoding where letters and digits get visually confused (e.g. "l" instead of "1", "O" instead of "0", "!l" instead of "I"). When extracting email addresses, GitHub usernames, and other alphanumeric identifiers, use context to correct obvious cases of this (e.g. "officialmalviyal4@gmail.com" is almost certainly "officialmalviya14@gmail.com", since email usernames don't typically end in a lowercase letter right after a name). Do NOT alter normal prose text, names, or anything that isn't clearly a character-encoding artifact. If uncertain, keep the original.

If a field isn't present in the resume, use null or an empty array. Do not invent information.

Resume text:
"""
${rawText}
"""
`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
```

---

### File: `backend/services/githubService.js`

```javascript
import axios from 'axios';

const GITHUB_API = 'https://api.github.com';
const headers = {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json'
};

export async function verifyGithub(structuredData) {
  const { githubUsername, skills = [] } = structuredData;

  if (!githubUsername) {
    return { status: 'uncertain', reason: 'No GitHub username found on resume' };
  }

  try {
    const userRes = await axios.get(`${GITHUB_API}/users/${githubUsername}`, { headers });
    const profile = userRes.data;

    const reposRes = await axios.get(
      `${GITHUB_API}/users/${githubUsername}/repos?per_page=100&sort=updated`,
      { headers }
    );
    const repos = reposRes.data;

    const ownRepos = repos.filter(r => !r.fork);
    const forkedRepos = repos.filter(r => r.fork);

    // Aggregate languages across the user's own (non-forked) repos
    const languageSet = new Set();
    for (const repo of ownRepos.slice(0, 15)) { // cap to avoid burning rate limit
      try {
        const langRes = await axios.get(`${GITHUB_API}/repos/${repo.full_name}/languages`, { headers });
        Object.keys(langRes.data).forEach(lang => languageSet.add(lang.toLowerCase()));
      } catch {
        continue; // skip repos that error out, don't fail the whole check
      }
    }
    const languages = Array.from(languageSet);

    // Compare claimed skills against actual languages used in real repos
    const normalizedSkills = skills.map(s => s.toLowerCase());
    const matchedSkills = normalizedSkills.filter(skill =>
      languages.some(lang => lang.includes(skill) || skill.includes(lang))
    );
    const skillMatchRatio = normalizedSkills.length > 0
      ? matchedSkills.length / normalizedSkills.length
      : null;

    return {
      status: 'pass',
      profile: {
        username: profile.login,
        name: profile.name,
        publicRepos: profile.public_repos,
        accountCreated: profile.created_at
      },
      repoSummary: {
        ownRepoCount: ownRepos.length,
        forkedRepoCount: forkedRepos.length
      },
      languagesFound: languages,
      skillMatch: {
        matchedSkills,
        ratio: skillMatchRatio,
        note: skillMatchRatio !== null && skillMatchRatio < 0.3
          ? 'Claimed skills show little overlap with actual repository languages'
          : null
      }
    };
  } catch (err) {
    if (err.response?.status === 404) {
      return { status: 'fail', reason: `GitHub user "${githubUsername}" does not exist` };
    }
    return { status: 'error', reason: `GitHub verification failed: ${err.message}` };
  }
}
```

---

### File: `backend/services/ocrService.js`

```javascript
import axios from 'axios';
import FormData from 'form-data';

const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL;

export async function extractTextFromResume(fileBuffer, filename) {
  const formData = new FormData();
  formData.append('file', fileBuffer, filename);

  const response = await axios.post(
    `${OCR_SERVICE_URL}/extract-text`,
    formData,
    { headers: formData.getHeaders() }
  );

  return response.data.extracted_text;
}
```

---

### File: `backend/services/scoringService.js`

```javascript
export function calculateScore(verification) {
  const breakdown = [];

  // Education check
  if (verification.education) {
    const edu = verification.education;
    if (edu.status === 'pass') {
      breakdown.push({ check: 'Education match', status: 'pass', weight: 8, note: `Matched: ${edu.matchedInstitution}` });
    } else if (edu.status === 'partial') {
      breakdown.push({ check: 'Education match', status: 'partial', weight: 8, note: 'Institution matched but degree mismatch' });
    } else if (edu.status === 'not_recognized') {
      breakdown.push({ check: 'Education match', status: 'uncertain', weight: 8, note: edu.reason });
    } else {
      breakdown.push({ check: 'Education match', status: 'uncertain', weight: 8, note: 'No college extracted' });
    }
  }

  // GitHub check
  if (verification.github) {
    const gh = verification.github;
    if (gh.status === 'pass') {
      breakdown.push({ check: 'GitHub profile exists', status: 'pass', weight: 6, note: `${gh.profile.publicRepos} public repos` });
      if (gh.skillMatch?.ratio !== null) {
        const ratioStatus = gh.skillMatch.ratio >= 0.3 ? 'pass' : 'fail';
        breakdown.push({
          check: 'Skills match GitHub activity',
          status: ratioStatus,
          weight: 7,
          note: `${Math.round(gh.skillMatch.ratio * 100)}% of claimed skills found in repos`
        });
      }
    } else if (gh.status === 'fail') {
      breakdown.push({ check: 'GitHub profile exists', status: 'fail', weight: 6, note: gh.reason });
    } else {
      breakdown.push({ check: 'GitHub profile exists', status: 'uncertain', weight: 6, note: gh.reason || 'Not checked' });
    }
  }

  // Email check (placeholder until Phase 7 is wired in)
  if (verification.email) {
    breakdown.push({ check: 'Email verification', status: 'uncertain', weight: 3, note: 'Pending verification' });
  }

  // Weighted score: pass=1, partial=0.5, uncertain=0.4, fail=0
  const outcomeValue = { pass: 1, partial: 0.5, uncertain: 0.4, fail: 0 };
  let totalWeight = 0;
  let earnedWeight = 0;

  for (const item of breakdown) {
    totalWeight += item.weight;
    earnedWeight += item.weight * (outcomeValue[item.status] ?? 0.4);
  }

  const finalScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : null;

  let bucket;
  if (finalScore === null) bucket = 'Not assessed';
  else if (finalScore >= 80) bucket = 'High credibility';
  else if (finalScore >= 50) bucket = 'Needs review';
  else bucket = 'High risk';

  return {
    finalScore,
    bucket,
    breakdown
  };
}
```

---

### File: `backend/utils/asyncHandler.js`

```javascript
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default asyncHandler;
```

---

### File: `ocr-service/main.py`

```python
from fastapi import FastAPI, UploadFile, File
import pytesseract
from pdf2image import convert_from_bytes
import pdfplumber
import io

app = FastAPI()

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    contents = await file.read()
    pages = convert_from_bytes(contents, dpi=300)
    full_text = ""
    for page in pages:
        full_text += pytesseract.image_to_string(page) + "\n"
    return {"filename": file.filename, "extracted_text": full_text}
```

---

### File: `ocr-service/requirements.txt`

```text
fastapi
uvicorn
pytesseract
pdf2image
Pillow
python-multipart
```

---

### File: `ocr-service/test_ocr.py`

```python
import pytesseract
from pdf2image import convert_from_path

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_text_from_pdf(pdf_path):
    pages = convert_from_path(pdf_path, dpi=300)
    full_text = ""
    for i, page in enumerate(pages):
        text = pytesseract.image_to_string(page)
        full_text += f"\n--- Page {i+1} ---\n{text}"
    return full_text

if __name__ == "__main__":
    result = extract_text_from_pdf("Nikunj_Malviya_Resume 2.pdf")
    print(result)
```

---
