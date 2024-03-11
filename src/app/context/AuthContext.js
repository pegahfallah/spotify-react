"use client";
// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [playlists, setPlaylists] = useState([])

  useEffect(() => {
    const storedToken = window.localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const login = (newToken) => {
    setToken(newToken);
    window.localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken(null);
    window.localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, playlists, setPlaylists }}>
      {children}
    </AuthContext.Provider>
  );
};
