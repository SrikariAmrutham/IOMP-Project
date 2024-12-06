import React, { useEffect, useState } from 'react';
import  {useNavigate } from "react-router-dom"; // Import the useNavigate hook
import  Discussion  from './Discussion';
import  ForumNav from './ForumNav';


const ForumAlgorithms = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate(); // Initialize the useNavigate hook

    const handlePostClick = () => {
      navigate("/post/algorithms"); // Navigate to the post page
    };
    const fetchAlgorithmsPosts = async () => {
      try {
        setIsLoading(true); // Set loading state
        const response = await fetch("http://localhost:5000/api/posts/algorithms");
        if (!response.ok) {
          throw new Error("Failed to fetch posts for Algorithms.");
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
      <ForumNav section="algorithms"/>
      <Discussion postData={posts} onClickPost={handlePostClick}/>
    </div>
    
};

export default ForumAlgorithms;