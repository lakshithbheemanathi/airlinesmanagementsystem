import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('skywings_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('skywings_token') || null);
  const [loading, setLoading] = useState(false);

  // Sync token to Axios headers
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success && response.data.data) {
        const authData = response.data.data;
        const userData = {
          id: authData.id,
          fullName: authData.fullName,
          email: authData.email,
          phone: authData.phone,
          role: authData.role,
        };

        setUser(userData);
        setToken(authData.token);

        localStorage.setItem('skywings_user', JSON.stringify(userData));
        localStorage.setItem('skywings_token', authData.token);

        return { success: true, user: userData };
      } else {
        return { success: false, message: response.data.message || 'Login failed' };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid email or password. Please try again.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', userData);
      return {
        success: response.data.success,
        message: response.data.message || 'Registration successful!',
      };
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please check your details.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const response = await api.put('/auth/profile', profileData);
      if (response.data.success && response.data.data) {
        const updatedUser = {
          ...user,
          fullName: response.data.data.fullName,
          phone: response.data.data.phone,
        };
        setUser(updatedUser);
        localStorage.setItem('skywings_user', JSON.stringify(updatedUser));
        return { success: true, message: 'Profile updated successfully!', data: updatedUser };
      }
      return { success: false, message: response.data.message || 'Update failed' };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to update profile' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('skywings_user');
    localStorage.removeItem('skywings_token');
    delete api.defaults.headers.common['Authorization'];
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isPassenger = user?.role === 'ROLE_USER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        updateProfile,
        logout,
        isAuthenticated,
        isAdmin,
        isPassenger,
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
