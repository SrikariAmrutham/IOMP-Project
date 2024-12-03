import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../UserContext';


const Forums = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', description: '' });
  const [newComment, setNewComment] = useState({ text: '', postId: '' });
  const [error, setError] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/forums');
      setPosts(response.data);
    } catch (err) {
      console.error('Error fetching forum posts:', err);
      setError('Failed to load forum posts');
    }
  };

  const handlePostSubmit = async () => {
    const token = user?.token || localStorage.getItem('token'); // Retrieve the token
  
    if (!token) {
      console.error('No token found'); // Ensure a token exists
      return;
    }
  
    try {
      await axios.post(
        'http://localhost:5000/forums',
        { title: newPost.title, description: newPost.description },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass token in headers
          },
          withCredentials: true,
        }
      );
      setNewPost({ title: '', description: '' });
      fetchPosts();
    } catch (err) {
      console.error('Error creating forum post:', err);
      setError('Failed to create post');
    }
  };
  
  const handleCommentSubmit = async (postId) => {
    try {
      await axios.post(`http://localhost:5000/forums/${postId}/comments`, { text: newComment.text }, { withCredentials: true });
      setNewComment({ text: '', postId: '' });
      fetchPosts();
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    }
  };

  return (
    <div className="forums-container">
      <h1>Forums</h1>
      <div className="new-post">
        <h2>Create a New Post</h2>
        <input
          type="text"
          placeholder="Title"
          value={newPost.title}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
        />
        <textarea
          placeholder="Description"
          value={newPost.description}
          onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
        ></textarea>
        <button onClick={handlePostSubmit}>Post</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="posts">
        {posts.map((post) => (
          <div className="post" key={post._id}>
            <h3>{post.title}</h3>
            <p>{post.description}</p>
            <div className="comments">
            {post.comments.map((comment) => (
              <div className="comment" key={comment._id}>
                <strong>{comment.userId.name}</strong>: {comment.text}
              </div>
            ))}
            <div className="new-comment">
              <textarea
                placeholder="Add a comment..."
                value={newComment.postId === post._id ? newComment.text : ''}
                onChange={(e) => setNewComment({ text: e.target.value, postId: post._id })}
              ></textarea>
              <button onClick={() => handleCommentSubmit(post._id)}>Comment</button>
            </div>
          </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Forums;
