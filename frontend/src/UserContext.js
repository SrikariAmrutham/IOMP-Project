// UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user data exists in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); 
    }
  }, []);

  const saveUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData)); // Save user data to localStorage
    setUser(userData); // Set user data in state
  };
  const login = (userData) => {
    setUser(userData);
  };


  const logout = () => {
    localStorage.removeItem('user'); // Remove user data from localStorage
    setUser(null); // Clear user data from state
  };

  return (
    <UserContext.Provider value={{ user, setUser: saveUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
