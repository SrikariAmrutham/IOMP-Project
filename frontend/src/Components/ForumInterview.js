import React, { useEffect, useState } from 'react';

import Discussion  from './Discussion';
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook
import  ForumNav  from './ForumNav';

const ForumInterview = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate(); // Initialize the useNavigate hook

    const handlePostClick = () => {
      navigate("/post/interview_experience"); // Navigate to the post page
    };
    const fetchAlgorithmsPosts = async () => {
      try {
        setIsLoading(true); // Set loading state
        const response = await fetch("http://localhost:5000/api/posts/interview_experience");
        if (!response.ok) {
          throw new Error("Failed to fetch posts for interview_experience.");
        }
        const data = await response.json();
        setPosts(data); // Update posts state
      } catch (error) {
        console.error("Error fetching Algorithms posts:", error);
        setPosts([]); // Clear posts in case of an error
      } finally {
        setIsLoading(false); // End loading state
      }
    };
    useEffect(() => {
        fetchAlgorithmsPosts(); // Fetch "Algorithms" posts on component mount
      }, []);
    
  return  <div>
      <ForumNav section = "interview"/>
      <Discussion postData={posts} onClickPost={handlePostClick}/>
    </div>
    
};

export default ForumInterview;