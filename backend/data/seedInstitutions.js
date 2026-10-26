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