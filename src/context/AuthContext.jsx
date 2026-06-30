import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for stored user credentials on load and sync across tabs
  useEffect(() => {
    const checkUserLoggedIn = () => {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
        const lastActivity = localStorage.getItem('lastAppActivity');
        const now = Date.now();

        if (lastActivity && now - parseInt(lastActivity, 10) > INACTIVITY_TIMEOUT) {
          localStorage.removeItem('userInfo');
          localStorage.removeItem('lastAppActivity');
          setUser(null);
        } else {
          setUser(JSON.parse(storedUser));
          localStorage.setItem('lastAppActivity', now.toString());
        }
      }
      setLoading(false);
    };
    checkUserLoggedIn();

    const handleStorageChange = (e) => {
      if (e.key === 'userInfo') {
        const storedUser = e.newValue ? JSON.parse(e.newValue) : null;
        setUser(storedUser);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Track user activity and auto-logout on inactivity
  useEffect(() => {
    if (!user) {
      localStorage.removeItem('lastAppActivity');
      return;
    }

    const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
    let lastWriteTime = Date.now();

    // Initialize/update lastAppActivity on mount or login
    localStorage.setItem('lastAppActivity', lastWriteTime.toString());

    const updateActivity = () => {
      const now = Date.now();
      // Throttle writes to localStorage every 5 seconds
      if (now - lastWriteTime > 5000) {
        localStorage.setItem('lastAppActivity', now.toString());
        lastWriteTime = now;
      }
    };

    // Listeners for user activity
    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('touchstart', updateActivity);

    // Periodically check for inactivity timeout
    const interval = setInterval(() => {
      const lastActivity = localStorage.getItem('lastAppActivity');
      if (lastActivity) {
        const elapsed = Date.now() - parseInt(lastActivity, 10);
        if (elapsed > INACTIVITY_TIMEOUT) {
          logout();
        }
      }
    }, 10000); // Check every 10 seconds

    return () => {
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      clearInterval(interval);
    };
  }, [user]);

  /**
   * Register new user account
   */
  const register = async (name, username, email, password, role, profileFile) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('role', role);
      if (profileFile) {
        formData.append('profilePicture', profileFile);
      }

      const { data } = await API.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.',
      };
    }
  };

  /**
   * Log in user account
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data } = await API.post('/auth/login', { email, password });

      if (data.requireVerification) {
        setLoading(false);
        return { success: true, requireVerification: true, email: data.email };
      }

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Invalid credentials.',
      };
    }
  };

  /**
   * Update current user profile
   */
  const updateProfile = async (name, email, password, profileFile, geminiApiKey) => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      if (password) {
        formData.append('password', password);
      }
      if (profileFile) {
        formData.append('profilePicture', profileFile);
      }
      if (geminiApiKey !== undefined) {
        formData.append('geminiApiKey', geminiApiKey);
      }

      const { data } = await API.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile.',
      };
    }
  };

  /**
   * Log out user session
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    localStorage.removeItem('lastAppActivity');
  };

  /**
   * Refresh local user statistics (XP, streak)
   */
  const refreshStats = async () => {
    if (!user) return;
    try {
      const { data } = await API.get('/auth/profile');
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to sync profile statistics', error);
    }
  };

  /**
   * Request password reset OTP
   */
  const forgotPassword = async (email) => {
    try {
      await API.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to request OTP. Please verify your email.',
      };
    }
  };

  /**
   * Verify OTP
   */
  const verifyOTP = async (email, otp) => {
    try {
      const { data } = await API.post('/auth/verify-otp', { email, otp });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid or expired OTP.',
      };
    }
  };

  /**
   * Reset password with OTP
   */
  const resetPassword = async (email, otp, password) => {
    try {
      const { data } = await API.put('/auth/reset-password', { email, otp, password });
      return { success: true, token: data.token };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password. OTP may be invalid or expired.',
      };
    }
  };

  /**
   * Verify login OTP for first time logins
   */
  const verifyLoginOTP = async (email, otp) => {
    try {
      setLoading(true);
      const { data } = await API.post('/auth/verify-login-otp', { email, otp });

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Verification failed. Invalid or expired OTP.',
      };
    }
  };

  /**
   * Log in / Register with Google
   */
  const loginWithGoogle = async (emailOrToken, name, username, profilePicture, password, role) => {
    try {
      setLoading(true);
      
      const payload = {};
      if (emailOrToken && emailOrToken.includes('@')) {
        // Fallback simulated authentication mode
        payload.email = emailOrToken;
        payload.name = name;
        payload.username = username;
        payload.profilePicture = profilePicture;
        if (password) {
          payload.password = password;
        }
        if (role) {
          payload.role = role;
        }
      } else {
        // Real Google OAuth Access Token
        payload.accessToken = emailOrToken;
        if (role) {
          payload.role = role;
        }
      }

      const { data } = await API.post('/auth/google-login', payload);

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return {
        success: false,
        message: error.response?.data?.message || 'Google login failed.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        updateProfile,
        logout,
        refreshStats,
        forgotPassword,
        verifyOTP,
        resetPassword,
        verifyLoginOTP,
        loginWithGoogle,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
