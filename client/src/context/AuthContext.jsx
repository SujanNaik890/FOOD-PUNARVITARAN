import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure Axios Defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000';

const initialToken = localStorage.getItem('fb_token');
if (initialToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fb_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  // Sync user profile with server session on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await axios.get('/api/v1/auth/me');
        if (res.data?.success && res.data?.data?.user) {
          const remoteUser = res.data.data.user;
          setUser(remoteUser);
          localStorage.setItem('fb_user', JSON.stringify(remoteUser));
        }
      } catch (err) {
        // If not authenticated on server, clean up stale local storage
        if (err.response?.status === 401) {
          setUser(null);
          localStorage.removeItem('fb_user');
          localStorage.removeItem('fb_token');
          delete axios.defaults.headers.common['Authorization'];
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
        localStorage.setItem('fb_token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      setUser(loggedUser);
      localStorage.setItem('fb_user', JSON.stringify(loggedUser));
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
        localStorage.setItem('fb_token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      setUser(registeredUser);
      localStorage.setItem('fb_user', JSON.stringify(registeredUser));
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
    localStorage.removeItem('fb_user');
    localStorage.removeItem('fb_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
