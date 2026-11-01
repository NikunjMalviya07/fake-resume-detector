import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../model/Student.js';

dotenv.config();

// Fully pre-defined, static dataset — this IS the "ground truth" database
// we compare extracted resume data against. Nothing here is randomly
// generated; every value is fixed so results are 100% repeatable.
const students = [
  {
    name: 'Nikunj Malviya',
    college: 'OIST Bhopal',
    degree: 'B.Tech',
    cgpa: 8.5,
    graduationYear: 2029,
    tenthPercentage: 92,
    tenthPassingYear: 2023,
    tenthSchool: 'R.D. Convent Higher Secondary School',
    twelfthPercentage: 87,
    twelfthPassingYear: 2025,
    twelfthSchool: 'R.D. Convent Higher Secondary School'
  },
  {
    name: 'Nandani Sharma',
    college: 'MANIT Bhopal',
    degree: 'B.Tech',
    cgpa: 9.1,
    graduationYear: 2026,
    tenthPercentage: 95,
    tenthPassingYear: 2020,
    tenthSchool: 'Delhi Public School Bhopal',
    twelfthPercentage: 91,
    twelfthPassingYear: 2022,
    twelfthSchool: 'Delhi Public School Bhopal'
  },
  {
    name: 'Mona Karale',
    college: 'OIST Bhopal',
    degree: 'B.Tech',
    cgpa: 7.4,
    graduationYear: 2025,
    tenthPercentage: 81,
    tenthPassingYear: 2019,
    tenthSchool: 'Carmel Convent School Bhopal',
    twelfthPercentage: 78,
    twelfthPassingYear: 2021,
    twelfthSchool: 'Carmel Convent School Bhopal'
  },
  {
    name: 'Prakruti Dongre',
    college: 'IIIT Bhopal',
    degree: 'B.Tech',
    cgpa: 8.9,
    graduationYear: 2027,
    tenthPercentage: 89,
    tenthPassingYear: 2021,
    tenthSchool: "St. Joseph's Convent School",
    twelfthPercentage: 85,
    twelfthPassingYear: 2023,
    twelfthSchool: "St. Joseph's Convent School"
  },
  {
    name: 'Navya Agrawal',
    college: 'TIT Bhopal',
    degree: 'B.Tech',
    cgpa: 7.8,
    graduationYear: 2026,
    tenthPercentage: 84,
    tenthPassingYear: 2020,
    tenthSchool: 'Kendriya Vidyalaya Bhopal',
    twelfthPercentage: 80,
    twelfthPassingYear: 2022,
    twelfthSchool: 'Kendriya Vidyalaya Bhopal'
  },
  {
    name: 'Pushpendra Singh Rajput',
    college: 'LNCT Bhopal',
    degree: 'B.Tech',
    cgpa: 8.2,
    graduationYear: 2025,
    tenthPercentage: 88,
    tenthPassingYear: 2019,
    tenthSchool: 'Sagar Public School Bhopal',
    twelfthPercentage: 83,
    twelfthPassingYear: 2021,
    twelfthSchool: 'Sagar Public School Bhopal'
  },
  {
    // Deliberate near-duplicate name of the entry above, but a different
    // person entirely — different college, different everything.
    // Good test case for name-collision handling.
    name: 'Pushpendra Rajput',
    college: 'OIST Bhopal',
    degree: 'B.Tech',
    cgpa: 6.9,
    graduationYear: 2028,
    tenthPercentage: 76,
    tenthPassingYear: 2022,
    tenthSchool: 'Campion School Bhopal',
    twelfthPercentage: 72,
    twelfthPassingYear: 2024,
    twelfthSchool: 'Campion School Bhopal'
  },
  {
    name: 'Pranay Birla',
    college: 'MANIT Bhopal',
    degree: 'B.Tech',
    cgpa: 9.3,
    graduationYear: 2027,
    tenthPercentage: 96,
    tenthPassingYear: 2021,
    tenthSchool: 'Bhopal Public School',
    twelfthPercentage: 93,
    twelfthPassingYear: 2023,
    twelfthSchool: 'Bhopal Public School'
  },
  {
    name: 'Purvi Agarwal',
    college: 'IIIT Bhopal',
    degree: 'B.Tech',
    cgpa: 8.0,
    graduationYear: 2026,
    tenthPercentage: 86,
    tenthPassingYear: 2020,
    tenthSchool: 'Jahangirabad Public School',
    twelfthPercentage: 82,
    twelfthPassingYear: 2022,
    twelfthSchool: 'Jahangirabad Public School'
  },
  {
    name: 'Meet Patel',
    college: 'TIT Bhopal',
    degree: 'B.Tech',
    cgpa: 7.6,
    graduationYear: 2025,
    tenthPercentage: 83,
    tenthPassingYear: 2019,
    tenthSchool: 'Vikas Vidyalaya Bhopal',
    twelfthPercentage: 79,
    twelfthPassingYear: 2021,
    twelfthSchool: 'Vikas Vidyalaya Bhopal'
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for student seeding');

  await Student.deleteMany({});
  await Student.insertMany(students);

  console.log('\nSeeded student records (keep this for your own reference/report):\n');
  console.table(students.map(r => ({
    name: r.name, college: r.college, cgpa: r.cgpa, gradYear: r.graduationYear,
    '10th%': r.tenthPercentage, '10thYear': r.tenthPassingYear,
    '12th%': r.twelfthPercentage, '12thYear': r.twelfthPassingYear
  })));

  await mongoose.disconnect();
  console.log('\nDone. Connection closed.');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});