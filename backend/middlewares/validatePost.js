const validatePost = (req, res, next) => {
    const { title, content, category } = req.body;
  
    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }
  
    next();
  };
  
export default validatePost;
  