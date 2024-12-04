import React, { useState, useEffect } from 'react';
import './Styles.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';

const Home = () => {
  
  const { user } = useUser();
  console.log('User home', user);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [difficulty, setDifficulty] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5000/questions')
      .then(response => {
        setQuestions(response.data);
        setFilteredQuestions(response.data);
      })
      .catch(err => console.error('Error fetching questions:', err));
  }, []);

  const handleDifficultyChange = (e) => {
    const level = e.target.value;
    setDifficulty(level);
    if (level === 'all') {
      setFilteredQuestions(questions);
    } else {
      setFilteredQuestions(questions.filter(q => q.difficulty === level));
    }
  };

  const handleQuestionClick = (questionId) => {
    navigate(`/question/${questionId}`);
  };

  return (
    <div className="main-container">
      <div className="filter-container">
        <h2>Filter by Difficulty</h2>
        <select value={difficulty} onChange={handleDifficultyChange}>
          <option value="all">All</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <div className="questions-list">
        <h2>Questions List</h2>
        <ul>
          {filteredQuestions.map((question) => (
            <li key={question._id} onClick={() => handleQuestionClick(question._id)}>
              <span>{question.qno}. {question.qname}</span>
              <span className={`difficulty ${question.difficulty}`}>
                {question.difficulty}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;
