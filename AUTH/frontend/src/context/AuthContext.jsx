// src/context/AuthContext.js
import { createContext, useState, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({}); // Will hold user info and accessToken

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    const accessToken = response.data.accessToken;
    const user = response.data.user;

    // Set auth state
    setAuth({ user, accessToken });

    // Set the token for all subsequent API requests
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  };

  const logout = () => {
    // Clear auth state
    setAuth({});
    // Remove the authorization header
    delete api.defaults.headers.common['Authorization'];
    // Optionally, you could also call a /logout endpoint on your backend
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily access the context
export const useAuth = () => {
  return useContext(AuthContext);
};