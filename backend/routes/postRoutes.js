import express from 'express';
import postController from '../controllers/postController.js';
import validatePostData from '../middlewares/validatePost.js';
const router = express.Router();


// Route to fetch all posts by category with optional sorting
router.get('/:category', postController.getPostsByCategory);

// Route to fetch all posts by category with optional sorting
router.get('/id/:id', postController.getPostById);

// Route to add a new post (with validation middleware)
router.post('/', validatePostData, postController.addPost);  // Using validatePostData middleware to validate before adding a post

// Route to update likes
router.put('/:id/likes', postController.updateLikes);


export default router;

