// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import './Styles.css';

// const Login = ({ setUser }) => {
//   const [name, setName] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!name || !password) {
//       setError('Please fill in all required fields');
//       return;
//     }

//     try {
//       const response = await axios.post('http://localhost:5000/login', { name, password });
//       setSuccess('Login successful!');
//       setError('');
//       setUser(response.data.user); 
//       navigate('/home', { replace: true });
//     } catch (err) {
//       setError(err.response?.data?.message || 'An error occurred');
//       setSuccess('');
//     }
//   };
//     const handleOAuthLogin = async () => {
//     try {
//       const { data } = await axios.get('http://localhost:5000/auth/url');
//       window.location.href = data.url; 
//     } catch (err) {
//       setError('Failed to initiate OAuth login');
//     }
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   return (
//     <div className="auth-container">
//       <h2>Login</h2>
//       {error && <div className="error">{error}</div>}
//       {success && <div className="success">{success}</div>}
//       <form onSubmit={handleSubmit}>
//         <div className="form-group">
//           <input
//             type="text"
//             id="name"
//             value={name}
//             placeholder='Username'
//             onChange={(e) => setName(e.target.value)}
//           />
//         </div>
//         <div className="form-group password-container">
//           <input
//             type={showPassword ? 'text' : 'password'}
//             id="password"
//             value={password}
//             placeholder='Password'
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <span
//             className="toggle-password"
//             onClick={togglePasswordVisibility}
//           >
//             {showPassword ? '🔒' : '🔓'}
//           </span>
//         </div>

//         <button type="submit" className="main-button">Login</button>
//       </form>
//       <div className="links-container">
//         <span
//           className="link"
//           onClick={() => navigate('/signup', { replace: true })}
//         >
//           Sign Up
//         </span>
//         <span
//           className="link"
//           onClick={() => handleOAuthLogin()}
//         >
//           Sign in with Google
//         </span>
//       </div>
//     </div>
//   );
// };

// export default Login;


import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';  // Import useUser from context
import './Styles.css';

const Login = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser(); // Access setUser from context

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/login', { name, password });
      setSuccess('Login successful!');
      setError('');
      setUser(response.data.user);  // Set user data in context
      navigate('/home', { replace: true });
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
      <h2>Login</h2>
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

        <button type="submit" className="main-button">Login</button>
      </form>
      <div className="links-container">
        <span
          className="link"
          onClick={() => navigate('/signup', { replace: true })}
        >
          Sign Up
        </span>
        <span
          className="link"
          onClick={() => handleOAuthLogin()}
        >
          Sign in with Google
        </span>
      </div>
    </div>
  );
};

export default Login;
