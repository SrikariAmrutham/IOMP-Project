import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
// import "./ForumCategory.css";

const ForumCategory = () => {
  const { category } = useParams(); // Get the category from the URL
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch posts for the selected category
    axios
      .get(`http://localhost:5000/forum/category/${category}`)
      .then((response) => {
        setPosts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching forum posts:", error);
        setLoading(false);
      });
  }, [category]);

  if (loading) {
    return <div className="forum-category-loading">Loading posts...</div>;
  }

  return (
    <div className="forum-category">
      <h2 className="forum-category-title">{category.replace('_', ' ')}</h2>
      {posts.length === 0 ? (
        <div className="forum-category-empty">No posts available.</div>
      ) : (
        <ul className="forum-category-list">
          {posts.map((post) => (
            <li key={post.id} className="forum-category-item">
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <span>By: {post.author}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ForumCategory;
