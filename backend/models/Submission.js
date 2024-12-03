import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Question' },
  code: { type: String, required: true },
  language: { type: String, required: true },
  testResults: [
    {
      testCase: { 
        input: { type: String },
        output: { type: String }
      },
      result: { type: String, enum: ['pass', 'fail'], required: true },
      expected: { type: String, required: true },
      actual: { type: String, required: true }
    }
  ],
  solved: { type: Boolean, default: false }, // Solved status
  timestamp: { type: Date, default: Date.now }, // Time of submission
});

const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);

export default Submission;
