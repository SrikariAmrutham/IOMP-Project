import Post from '../models/Post.js';

// Fetch all posts by category
const getPostsByCategory = async (req, res) => {
    try {
      const { category } = req.params;
      const { sort } = req.query;
  
      // Default to 'latest' if sort is not provided
      const sortCriteria = sort
        ? { 'new-to-old': { createdAt: -1 }, 'more-likes': { likes: -1 } }[sort]
        : { createdAt: -1 };
  
      const posts = await Post.find({ category }).sort(sortCriteria);
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching posts' });
    }
  };

// Fetch a single post by its ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure that the ID is valid (e.g., MongoDB ObjectId)
    if (!id || id.length !== 24) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    // Find the post by its unique ID
    const post = await Post.findOne({ _id: req.params.id });

    // Handle case where the post is not found
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Error fetching post" });
  }
};

  

// Add a new post
const addPost = async (req, res) => {
  try {
    const { title, content, category, tags, username, anonymous } = req.body;

    // If anonymous is true, use "Anonymous" as the username; otherwise, use the provided username
    const postUsername = anonymous ? "Anonymous" : username;

    // Create a new post with the data, including the username
    const newPost = new Post({
      title,
      content,
      category,
      tags,
      username: postUsername,  // Save the username (either "Anonymous" or actual username)
    });

    await newPost.save();

    res.status(201).json({ message: 'Post added successfully', post: newPost });
  } catch (error) {
    res.status(500).json({ error: 'Error adding post' });
  }
};



// Update likes of a post
const updateLikes = async (req, res) => {
  try {
    const { id } = req.params;
    const { likes } = req.body;
    

    // Ensure the post ID is valid
    if (!id || id.length !== 24) {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }

    // Update the post likes in the database
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $inc: { likes: likes } }, // Increment or decrement the likes by 1
      { new: true } // Return the updated document
    );

    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json({ message: 'Likes updated successfully', post: updatedPost });
  } catch (error) {
    console.error('Error updating likes:', error);
    res.status(500).json({ error: 'Error updating likes' });
  }
};


export default { getPostsByCategory, addPost, getPostById ,updateLikes};


