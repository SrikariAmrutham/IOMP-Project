import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: { type: [String], default: [] },
  category: { type: String, required: true },
  username: { type: String, required: false }, // Optional username
  anonymous: { type: Boolean, default: false },
  images: { type: [String], default: [] }, // Array of image URLs
  likes: { type: Number, default: 0 }, // Add likes field with a default value of 0
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

const Post = mongoose.model("Post", PostSchema);
export default Post;

