import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Components/Login';
import Home from './Components/Home'; 
import Signup from './Components/Signup';
import OAuthCallback from './Components/OAuthCallback';
import QuestionDetails from './Components/QuestionDetails';
import Navbar from './Components/Navbar';
import { useUser } from './UserContext';
import Forums from './Components/Forums';

const App = () => {
  
  const [user, setUser] = React.useState(null);

  return (
    <Router>
      <Navbar user={useUser} />
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup setUser={setUser} />} />
        <Route path="/callback" element={<OAuthCallback setUser={setUser} />} />
        <Route path="/home" element={<Home user={user} />} />
        <Route path="/question/:id" element={<QuestionDetails />} />
        <Route path="/forums" element={<Forums />} />
        </Routes>
    </Router>
  );
};

export default App;
