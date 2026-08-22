// client/src/contexts/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const initializeAuth = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    
    initializeAuth();
  }, []);
  
  const login = async (credentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
    return response;
  };
  
  const register = async (userData) => {
    return await authService.register(userData);
  };
  
  const logout = () => {
    authService.logout();
    setUser(null);
  };
  
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
