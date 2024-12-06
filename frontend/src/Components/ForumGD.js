import React, { useEffect, useState } from 'react';

import  Discussion  from './Discussion';
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook
import  ForumNav  from './ForumNav';


const ForumGD = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate(); // Initialize the useNavigate hook

    const handlePostClick = () => {
      navigate("/post/general_discussions"); // Navigate to the post page
    };
    const fetchAlgorithmsPosts = async () => {
      try {
        setIsLoading(true); // Set loading state
        const response = await fetch("http://localhost:5000/api/posts/general_discussions");
        if (!response.ok) {
          throw new Error("Failed to fetch posts for general_discussions.");
        }
        const data = await response.json();
        setPosts(data); // Update posts state
      } catch (error) {
        console.error("Error fetching general_discussions posts:", error);
        setPosts([]); // Clear posts in case of an error
      } finally {
        setIsLoading(false); // End loading state
      }
    };
    useEffect(() => {
        fetchAlgorithmsPosts(); // Fetch "Algorithms" posts on component mount
      }, []);
    
  return  <div>
      <ForumNav section = "general"/>
      <Discussion postData={posts} onClickPost={handlePostClick}/>
    </div>
    
};

export default ForumGD;