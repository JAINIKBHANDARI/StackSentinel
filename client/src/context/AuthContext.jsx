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
      const storedUser = localStorage.getItem('stacksentinel_user');

      if (!storedToken) {
        setLoading(false);
        return;
      }

      // If demo session, restore directly
      if (storedToken.includes('demo') && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } catch (e) {
          localStorage.removeItem('stacksentinel_token');
          localStorage.removeItem('stacksentinel_user');
        }
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
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
          } catch (e) {
            setUser(null);
            setToken(null);
          }
        } else {
          localStorage.removeItem('stacksentinel_token');
          localStorage.removeItem('stacksentinel_user');
          setUser(null);
          setToken(null);
        }
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

  // Demo Login handler (for instant evaluation or offline preview)
  const loginDemo = (role = 'ADMIN') => {
    const demoUser = {
      id: role === 'ADMIN' ? 'demo-admin-id' : 'demo-user-id',
      name: role === 'ADMIN' ? 'Site Administrator' : 'Lead DevOps Engineer',
      email: role === 'ADMIN' ? 'admin@stacksentinel.io' : 'dev@stacksentinel.io',
      role: role,
      createdAt: new Date().toISOString()
    };
    const demoToken = `stacksentinel_demo_jwt_token_${role.toLowerCase()}_2026`;
    setUser(demoUser);
    setToken(demoToken);
    localStorage.setItem('stacksentinel_token', demoToken);
    localStorage.setItem('stacksentinel_user', JSON.stringify(demoUser));
    return demoUser;
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
        loginDemo,
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
