import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook
import "./DiscussionNav.css"; // Import the CSS file

const DiscussionNav = ({ onFilterChange ,  onClickPost}) => {
  const [filter, setFilter] = useState("latest");

  const handleFilterChange = (event) => {
    const selectedFilter = event.target.value;
    setFilter(selectedFilter);
    if (onFilterChange) {
      onFilterChange(selectedFilter); // Notify parent about the change
    }
  };

  return (
    <div className="sub-navbar">
      <button className="post-button" onClick={onClickPost}>
        Make Post
      </button>
      <select
        className="filter-dropdown"
        value={filter}
        onChange={handleFilterChange}
      >
        <option value="latest">Latest</option>
        <option value="more-likes">More Likes</option>
      </select>
    </div>
  );
};

export default DiscussionNav;