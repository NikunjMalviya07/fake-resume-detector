import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  filename: String,
  rawText: String,
  hrId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  structuredData: {
    name: String,
    email: String,
    phone: String,
    college: String,
    degree: String,
    cgpa: String,
    passingYear: String,
    tenthPassingYear: Number,
    twelfthPassingYear: Number,
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
    studentRecord: { type: Object, default: null },
    github: { type: Object, default: null },
    email: { type: Object, default: null },
    experience: { type: [Object], default: [] }
  },
  score: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Resume', resumeSchema);