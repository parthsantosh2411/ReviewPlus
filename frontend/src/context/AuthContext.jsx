import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

/* ---------- helpers ---------- */
const TOKEN_KEY = 'reviewpulse_token';
const USER_KEY = 'reviewpulse_user';

const decodeJwt = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const isTokenValid = (token) => {
  if (!token) return false;
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return false;
  return payload.exp * 1000 > Date.now();
};

/* ---------- provider ---------- */
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // initial check

  // On mount — hydrate from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedToken && isTokenValid(savedToken)) {
      setToken(savedToken);
      setIsAuthenticated(true);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        const payload = decodeJwt(savedToken);
        setUser({
          email: payload?.email || '',
          role: payload?.role || 'viewer',
          brandId: payload?.brandId || '',
        });
      }
    } else {
      // stale — clean up
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    setLoading(false);
  }, []);

  const login = useCallback((jwt, userData) => {
    localStorage.setItem(TOKEN_KEY, jwt);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(jwt);
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = { isAuthenticated, user, token, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
