import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure Axios Defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000';

// Attach Axios request interceptor to dynamically use per-tab token
axios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('fb_token') || localStorage.getItem('fb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const getStoredUser = () => {
  try {
    const session = sessionStorage.getItem('fb_user');
    if (session) return JSON.parse(session);
    const local = localStorage.getItem('fb_user');
    return local ? JSON.parse(local) : null;
  } catch (e) {
    return null;
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(false);

  // Sync tab user profile with server session on mount using tab-specific Bearer token
  useEffect(() => {
    const verifySession = async () => {
      const activeToken = sessionStorage.getItem('fb_token') || localStorage.getItem('fb_token');
      if (!activeToken) {
        setUser(null);
        return;
      }

      try {
        const res = await axios.get('/api/v1/auth/me');
        if (res.data?.success && res.data?.data?.user) {
          const remoteUser = res.data.data.user;
          setUser(remoteUser);
          sessionStorage.setItem('fb_user', JSON.stringify(remoteUser));
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setUser(null);
          sessionStorage.removeItem('fb_user');
          sessionStorage.removeItem('fb_token');
          localStorage.removeItem('fb_user');
          localStorage.removeItem('fb_token');
        }
      }
    };

    verifySession();
  }, []);

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/v1/auth/login', { identifier, password });
      const loggedUser = res.data.data.user;
      const token = res.data.data.token;

      if (token) {
        // Tab-isolated session storage ensures multiple tabs can run different roles
        sessionStorage.setItem('fb_token', token);
        localStorage.setItem('fb_token', token);
      }

      sessionStorage.setItem('fb_user', JSON.stringify(loggedUser));
      localStorage.setItem('fb_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      return { success: true, user: loggedUser };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/v1/auth/register', userData);
      const registeredUser = res.data.data.user;
      const token = res.data.data.token;

      if (token) {
        sessionStorage.setItem('fb_token', token);
        localStorage.setItem('fb_token', token);
      }

      sessionStorage.setItem('fb_user', JSON.stringify(registeredUser));
      localStorage.setItem('fb_user', JSON.stringify(registeredUser));
      setUser(registeredUser);
      return { success: true, user: registeredUser };
    } catch (err) {
      const errors = err.response?.data?.errors;
      let detailedMsg = err.response?.data?.message || 'Registration failed.';
      if (errors && errors.length > 0) {
        detailedMsg = errors.map((e) => e.message).join('; ');
      }
      return {
        success: false,
        message: detailedMsg
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/v1/auth/logout');
    } catch (e) {
      // Proceed with local logout regardless
    }
    setUser(null);
    sessionStorage.removeItem('fb_user');
    sessionStorage.removeItem('fb_token');
    localStorage.removeItem('fb_user');
    localStorage.removeItem('fb_token');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
