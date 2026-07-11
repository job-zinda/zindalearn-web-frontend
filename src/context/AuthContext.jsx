import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { getUserProfile } from '../services/userService';
import { toast } from 'react-hot-toast';
import socketService from '../services/socket';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('zinda_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [googleLoginEnabled, setGoogleLoginEnabled] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('zinda_token');
    localStorage.removeItem('zinda_user');
    setToken(null);
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUserProfile();
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('zinda_user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      setError(error.message);
      
      // Update block reason dynamically if 403 blocked is returned
      if (error.response?.status === 403 && error.response?.data?.blocked) {
        const backendReason = error.response.data.blockedReason || error.response.data.reason;
        const localUser = JSON.parse(localStorage.getItem('zinda_user') || '{}');
        const updatedUser = {
          ...localUser,
          isBlocked: true,
          blockedReason: backendReason
        };
        setUser(updatedUser);
        localStorage.setItem('zinda_user', JSON.stringify(updatedUser));
      } else if (error.response?.status === 401 || (error.response?.status === 403 && !error.response?.data?.blocked)) {
        // Only logout on definite auth failure, not network errors
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  const fetchPublicSettings = useCallback(async () => {
    try {
      const { data } = await api.get('/public/settings');
      if (data?.success && data?.data) {
        setMaintenanceMode(data.data.maintenanceMode);
        setGoogleLoginEnabled(data.data.enableGoogleLogin);
      }
    } catch (err) {
      if (err.response?.status === 503 || err.response?.data?.maintenance) {
        setMaintenanceMode(true);
      }
      console.error('Failed to fetch public settings:', err);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    fetchPublicSettings();
  }, [fetchPublicSettings]);

  useEffect(() => {
    if (token) {
      console.log('[AUTH] Global socket connection init');
      socketService.connect(token);
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [token]);

  const login = async (credentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('zinda_token', data.token);
      localStorage.setItem('zinda_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.blocked && err.response?.data?.token) {
        const data = err.response.data;
        localStorage.setItem('zinda_token', data.token);
        localStorage.setItem('zinda_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data;
      }
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      localStorage.setItem('zinda_token', data.token);
      localStorage.setItem('zinda_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      throw err;
    }
  };

  const googleLogin = async (googleData) => {
    try {
      const { data } = await api.post('/auth/google-login', googleData);
      localStorage.setItem('zinda_token', data.token);
      localStorage.setItem('zinda_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.blocked && err.response?.data?.token) {
        const data = err.response.data;
        localStorage.setItem('zinda_token', data.token);
        localStorage.setItem('zinda_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data;
      }
      throw err;
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('zinda_user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    try {
      const data = await getUserProfile();
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('zinda_user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      if (error.response?.status === 403 && error.response?.data?.blocked) {
        const backendReason = error.response.data.blockedReason || error.response.data.reason;
        const localUser = JSON.parse(localStorage.getItem('zinda_user') || '{}');
        const updatedUser = {
          ...localUser,
          isBlocked: true,
          blockedReason: backendReason
        };
        setUser(updatedUser);
        localStorage.setItem('zinda_user', JSON.stringify(updatedUser));
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      login,
      register,
      googleLogin,
      logout,
      updateUser,
      refreshUser,
      maintenanceMode,
      googleLoginEnabled,
      refreshPublicSettings: fetchPublicSettings,
      isAuthenticated: !!token && !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
