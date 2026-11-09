import dotenv from 'dotenv';
dotenv.config();

import { verifyGithub } from '../services/githubService.js';

// Edit this object to match whatever you want to test —
// this is exactly the shape `structuredData` normally has after Gemini extraction.
const testData = {
  githubUsername: 'poorviagrawal04',
  skills: ['C', 'C++', 'Python', 'HTML', 'CSS', 'Git', 'GitHub', 'Visual Studio Code'],
  projects: [
    {
      title: 'Smart India Hackathon (SIH) 2026 — Problem Statement SIH26139',
      description: 'Collaborated with a team on a technology solution developed for the Smart India Hackathon, contributing to backend-related tasks. Supported the project presentation and worked in a team development setting, coordinating contributions with teammates and building familiarity with backend implementation workflows.',
      githubUrl: 'https://github.com/Discos1ty/MAGI'
    }
  ]
};

async function run() {
  console.log('Running verifyGithub() with test data...\n');
  const result = await verifyGithub(testData);
  console.log(JSON.stringify(result, null, 2));
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});