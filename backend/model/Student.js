import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  college: { type: String, required: true },
  degree: { type: String, default: 'B.Tech' },
  cgpa: { type: Number, required: true },
  graduationYear: { type: Number, required: true },
  tenthPercentage: { type: Number, required: true },
  tenthSchool: { type: String, required: true },
  tenthPassingYear: { type: Number, required: true },
  twelfthPercentage: { type: Number, required: true },
  twelfthSchool: { type: String, required: true },
  twelfthPassingYear: { type: Number, required: true }
});

export default mongoose.model('Student', studentSchema);