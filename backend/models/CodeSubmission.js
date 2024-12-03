import mongoose from "mongoose";
const CodeSubmissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Question' },
    language: String,
    testResults: Array,
    status: { type: String, enum: ['solved', 'attempted'] }, // Status: solved or attempted
    createdAt: { type: Date, default: Date.now },
  });
  const CodeSubmission = mongoose.model('CodeSubmission', CodeSubmissionSchema);
export default CodeSubmission;
