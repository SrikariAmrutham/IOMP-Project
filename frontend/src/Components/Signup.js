import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Styles.css';

const Signup = ({ setUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    const formData = { name, email, password };

    try {
      const response = await axios.post('http://localhost:5000/signup', formData);
      setSuccess('Signup successful! You can now log in.');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      setSuccess('');
    }
  };

  const handleOAuthLogin = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/auth/url');
      window.location.href = data.url; 
    } catch (err) {
      setError('Failed to initiate OAuth login');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            id="name"
            value={name}
            placeholder='Username'
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            id="email"
            value={email}
            placeholder='Email'
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group password-container">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            placeholder='Password'
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="toggle-password"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? '🔒' : '🔓'}
          </span>
        </div>

        <button type="submit" className="main-button">Sign Up</button>
      </form>
      <div className="links-container">
        <span
          className="link"
          onClick={() => navigate('/', { replace: true })}
        >
          Login
        </span>
        <span
          className="link"
          onClick={() => handleOAuthLogin()}
        >
          Sign up with Google
        </span>
      </div>
    </div>
  );
};

export default Signup;
