import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';

const OAuthCallback = () => {
  const {setUser} = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const getToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          const response = await axios.get(`http://localhost:5000/auth/token?code=${code}`);
          setUser(response.data.user); 
          console.log('respone user in oauth', response.data.user);
          navigate('/home'); 
        } catch (error) {
          console.error('OAuth error:', error);
        }
      } else {
        console.error('No authorization code found');
      }
    };

    getToken();
  }, [navigate, setUser]);

  return (
    <div>Loading...</div>
  );
};

export default OAuthCallback;
