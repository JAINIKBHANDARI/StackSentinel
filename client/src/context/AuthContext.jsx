import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('stacksentinel_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate existing token on initial mount
  useEffect(() => {
    const verifyUserSession = async () => {
      const storedToken = localStorage.getItem('stacksentinel_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.data?.success) {
          setUser(response.data.data.user);
          setToken(storedToken);
        }
      } catch (err) {
        console.warn('Session verification failed:', err.userFriendlyMessage);
        localStorage.removeItem('stacksentinel_token');
        localStorage.removeItem('stacksentinel_user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUserSession();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.success) {
      const { user: userData, token: authToken } = response.data.data;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('stacksentinel_token', authToken);
      localStorage.setItem('stacksentinel_user', JSON.stringify(userData));
      return userData;
    }
  };

  // Register handler
  const register = async (name, email, password, role = 'USER') => {
    const response = await api.post('/auth/register', { name, email, password, role });
    if (response.data?.success) {
      const { user: userData, token: authToken } = response.data.data;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('stacksentinel_token', authToken);
      localStorage.setItem('stacksentinel_user', JSON.stringify(userData));
      return userData;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('stacksentinel_token');
    localStorage.removeItem('stacksentinel_user');
    setUser(null);
    setToken(null);
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
