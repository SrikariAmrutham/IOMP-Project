import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useUser } from '../UserContext';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const {user} = useUser();
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/questions')
      .then(response => {
        setQuestions(response.data);
      })
      .catch(err => console.error('Error fetching questions:', err));
  }, []);

  const handleLogout = () => {
    
    localStorage.removeItem('user'); // Clear localStorage
    window.location.reload();
    navigate('/');
  };
  

  const handleSearch = (query) => {
    setSearchQuery(query);
  
    if (query.trim() === '') {
      setFilteredQuestions([]);
      return;
    }
  
    const results = questions.filter((question) => {
      if (!isNaN(query)) {
        return question.qno?.toString() === query; // Exact match for numbers
      }
      return (
        question.qname?.toLowerCase().includes(query.toLowerCase()) ||
        question.difficulty?.toLowerCase().includes(query.toLowerCase()) ||
        (Array.isArray(question.topics) && question.topics.some((topic) =>
          topic.toLowerCase().includes(query.toLowerCase())
        )) // Ensure topics is an array
      );
    });
  
    setFilteredQuestions(results);
  };
  

  

  return (
    <div className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')}>
        <h2>CodeClimb</h2>
      </div>

      {/* Search bar */}
      {user && (
        <div className="navbar-search">
          <input
            type="text"
            placeholder="Search by question number, name, difficulty, or topics..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />

          {/* Search Results */}
          {filteredQuestions.length > 0 && (
            <div className="search-results">
              <ul>
                {filteredQuestions.map((question) => (
                  <li
                    key={question._id}
                    onClick={() => navigate(`/question/${question._id}`)}
                    className="search-result-item"
                  >
                    <strong>{question.qname}</strong> ({question.difficulty})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

    <div className="navbar-actions">
        {user ? (
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button className='login-button' onClick={() => navigate('/')}>Login</button>
        )}
      </div>
    </div>

  );
};

export default Navbar;
