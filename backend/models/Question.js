import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  qno: { type: Number, required: true },
  qname: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  constraints: [String],
  examples: [
    {
      images: [String],
      input: { type: String, required: true },
      output: { type: String, required: true },
      explanation: { type: String }
    }
  ],
  topics: [String],
  testcases: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true }
    }
  ],
  code: {
    type: Map, 
    of: String, 
  },
  status: { type: String, enum: ['solved', 'attempted', 'unsolved'], default: 'unsolved' },
  created_at: { type: Date, default: Date.now }
});

const Question = mongoose.model('Question', questionSchema);
export default Question;
