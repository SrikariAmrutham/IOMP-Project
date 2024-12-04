import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logging out...");
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')}>
        <h1>CodeClimb</h1>
      </div>
      <div className="navbar-search">
        <input type="text" placeholder="Search questions..." />
        <button>Search</button>
      </div>
      
      <div className="navbar-actions">
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
