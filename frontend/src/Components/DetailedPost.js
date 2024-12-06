import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import "./DetailedPost.css"; // Create and use a CSS file for styling
import axios from "axios";
import { useUser } from "../UserContext";

const DetailedPost = () => {
  const { id } = useParams(); // Extract the post ID from the URL
  const { user } = useUser();
  const [post, setPost] = useState(null);
  const [likes, setLikes] = useState(0); // Initialize likes state
  const [liked, setLiked] = useState(false); // Track if the user has liked the post

  useEffect(() => {
    // Fetch the post by ID
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/posts/id/${id}`); // Replace with your API endpoint
        const data = await response.json();
        setPost(data);
        setLikes(data.likes)
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [id]);
  
  const toggleLike = async () => {
    try {
      // Toggle like state
      const updatedLikes = liked ? - 1 : 1;
      console.log(updatedLikes)
      // Update likes in the database
      await axios.put(`http://localhost:5000/api/posts/${id}/likes`, { likes: updatedLikes });

      // Update local state
      setLikes(likes+updatedLikes);
      setLiked(!liked);
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };


  if (!post) return <p>Loading...</p>;

  return (
    <div className="detailed-post-container">
      <h1 className="detailed-post-title">{post.title}</h1>
      <div className="detailed-post-meta">
        <p className="detailed-post-category">Category: {post.category}</p>
        {post.username && !post.anonymous && (
          <p className="detailed-post-author">Posted by: {post.username}</p>
        )}
        {post.anonymous && <p className="detailed-post-author">Posted anonymously</p>}
        <p className="detailed-post-date">
          Posted on: {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>
      {post.images?.length > 0 && (
        <div className="detailed-post-images">
          {post.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Post image ${index + 1}`}
              className="detailed-post-image"
            />
          ))}
        </div>
      )}
      <div className="detailed-post-content-container">
        <ReactMarkdown className="detailed-post-content">{post.content}</ReactMarkdown>
      </div>
      <div className="detailed-post-tags">
        <h4>Tags:</h4>
        {post.tags?.length > 0 ? (
          post.tags.map((tag, index) => (
            <span key={index} className="detailed-post-tag">
              #{tag}
            </span>
          ))
        ) : (
          <p>No tags available</p>
        )}
      </div>
      <div className="detailed-post-likes-container">
        <button className={`like-button ${liked ? 'liked' : ''}`} onClick={toggleLike}>
          {liked ? 'Unlike' : 'Like'}
        </button>
        <p className="detailed-post-likes">Likes: {likes}</p>
      </div>
    </div>
  );
};

export default DetailedPost;