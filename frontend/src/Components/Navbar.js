// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import './Navbar.css';

// const Navbar = () => {
//   const navigate = useNavigate();

//   // Handle logout
//   const handleLogout = () => {
//     console.log('Logging out...');
//     navigate('/');
//   };

//   return (
//     <nav className="navbar">
//       <div className="navbar-brand" onClick={() => navigate('/home')}>
//         <h1>CodeClimb</h1>
//       </div>
//       <div className="navbar-links">
//         <span onClick={() => navigate('/home')}>Home</span>
//         <span onClick={() => navigate('/forums')}>Forums</span> {/* New Forums Link */}
//       </div>
//       <div className="navbar-search">
//         <input type="text" placeholder="Search questions..." />
//         <button>Search</button>
//       </div>
//       <div className="navbar-actions">
//         <button className="logout-button" onClick={handleLogout}>Logout</button>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  // Handle logout (add your logout logic here)
  const handleLogout = () => {
    // Example logout logic (clear auth token, redirect, etc.)
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
