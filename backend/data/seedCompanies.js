import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../model/Company.js';

dotenv.config();

// DEMO NOTE: these verificationEmail addresses use two of your real Gmail
// inboxes, split across companies, with Gmail's "+alias" trick added so you
// can still tell which company each incoming email corresponds to. Both
// inboxes will genuinely receive mail — this isn't simulated, it's real
// email delivery to real accounts you control.
const INBOX_A = 'nikunjjee2025';
const INBOX_B = 'officialmalviya14';

const companies = [
  { name: 'TCS', aliases: ['tata consultancy services', 'tcs'], verificationEmail: `${INBOX_B}+tcs@gmail.com` },
  { name: 'Infosys', aliases: ['infosys limited', 'infosys'], verificationEmail: `${INBOX_A}+infosys@gmail.com` },
  { name: 'Wipro', aliases: ['wipro limited', 'wipro'], verificationEmail: `${INBOX_B}+wipro@gmail.com` },
  { name: 'Accenture', aliases: ['accenture'], verificationEmail: `${INBOX_A}+accenture@gmail.com` },
  { name: 'Tech Mahindra', aliases: ['techmahindra', 'tech mahindra'], verificationEmail: `${INBOX_B}+techmahindra@gmail.com` },
  { name: 'Capgemini', aliases: ['capgemini'], verificationEmail: `${INBOX_A}+capgemini@gmail.com` },
  { name: 'IBM', aliases: ['international business machines', 'ibm'], verificationEmail: `${INBOX_B}+ibm@gmail.com` },
  { name: 'Cognizant', aliases: ['cognizant technology solutions', 'cognizant'], verificationEmail: `${INBOX_A}+cognizant@gmail.com` }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for company seeding');

  await Company.deleteMany({});
  await Company.insertMany(companies);

  console.log('\nSeeded companies:\n');
  console.table(companies.map(c => ({ name: c.name, verificationEmail: c.verificationEmail })));

  await mongoose.disconnect();
  console.log('\nDone. Connection closed.');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});