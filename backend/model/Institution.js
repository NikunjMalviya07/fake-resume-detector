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