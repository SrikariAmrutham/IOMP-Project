import React from "react";
import { useNavigate } from "react-router-dom";
import "./Discussion.css";
import  DiscussionNav  from "./DiscussionNav";

const Discussion = ({ postData, onClickPost }) => {
  const navigate = useNavigate();

  const handleCardClick = (id) => {
    navigate(`/discussion/${id}`); // Navigate to the detailed post page
  };

  console.log(postData)

  return (
    <div className="discussion-container">
      <DiscussionNav onClickPost={onClickPost} /><br/>

      {postData && postData.length > 0 ? (
        postData.map((post) => (
          <div
            key={post._id}
            className="discussion-card"
            onClick={() => handleCardClick(post._id)}
          >
            <h3 className="discussion-title">{post.title}</h3>
            <p className="discussion-likes">Likes: {post.likes}</p>
          </div>
        ))
      ) : (
        <p className="no-posts-message">No posts available.</p>
      )}
    </div>
  );
};

export default Discussion;