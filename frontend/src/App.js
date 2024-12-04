import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Components/Login';
import Home from './Components/Home';
import Signup from './Components/Signup';
import OAuthCallback from './Components/OAuthCallback';
import QuestionDetails from './Components/QuestionDetails';
import Navbar from './Components/Navbar';
import Forums from './Components/Forums';
import { UserProvider } from './UserContext';

const App = () => {
  return (
    <UserProvider>
        <Router>
        <Navbar/>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup  />} />
            <Route path="/callback" element={<OAuthCallback  />} />
            <Route path="/home" element={<Home  />} />
            <Route path="/question/:id" element={<QuestionDetails />} />
            <Route path="/forums" element={<Forums />} />
          </Routes>
        </Router>
    </UserProvider>
  );
};

export default App;
