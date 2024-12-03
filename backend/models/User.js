import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    picture: { type: String },
    submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }], // References to submissions
  
  });
  
  
  
  const User = mongoose.model('User', userSchema);
  export default User;
