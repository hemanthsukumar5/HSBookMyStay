import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch, saveTokens, clearTokens, getAccessToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch('/api/users/me/');
      setUser(res.data);
    } catch {
      setUser(null);
      clearTokens();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (username, password) => {
    const res = await apiFetch('/api/users/login/', {
      method: 'POST',
      body: { username, password },
      auth: false,
    });
    saveTokens(res.data.access, res.data.refresh);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await apiFetch('/api/users/register/', {
      method: 'POST',
      body: data,
      auth: false,
    });
    return res.data;
  };

  const logout = async () => {
    try {
      const refreshToken = (await import('js-cookie')).default.get('refresh_token');
      if (refreshToken) {
        await apiFetch('/api/users/logout/', {
          method: 'POST',
          body: { refresh: refreshToken },
        });
      }
    } catch {
      // Even if the call fails, we clear cookies
    }
    clearTokens();
    setUser(null);
  };

  const value = { user, loading, login, register, logout, fetchUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
