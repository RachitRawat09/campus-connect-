import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [planInfo, setPlanInfo] = useState(null);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [user, token]);

  const login = (userData, token) => {
    setUser(userData);
    setToken(token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setPlanInfo(null);
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  const updatePlanInfo = (info) => {
    setPlanInfo(info);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, planInfo, updatePlanInfo }}>
      {children}
    </AuthContext.Provider>
  );
}; 