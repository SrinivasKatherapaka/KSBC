import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const AuthContext = createContext(null);

const ROLE_MAP = {
  'cfo@banking.com': 'cfo_executive',
  'admin@banking.com': 'admin',
  'loan@banking.com': 'loan_officer',
  'treasury@banking.com': 'treasury_manager',
  'compliance@banking.com': 'compliance_officer',
  'customerops@banking.com': 'customer_ops',
  'finance@banking.com': 'finance_manager'
};

const normalizeUser = (userData) => {
  if (!userData) return null;
  const email = (userData.email || '').toLowerCase().trim();
  const fallbackRole = ROLE_MAP[email] || 'cfo_executive';
  return {
    ...userData,
    role: userData.role || fallbackRole
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('banking_erp_user');
      return stored ? normalizeUser(JSON.parse(stored)) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('banking_erp_token') || null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await apiClient.get('/auth/profile');
        if (res.data.success && res.data.user) {
          const normalized = normalizeUser(res.data.user);
          setUser(normalized);
          localStorage.setItem('banking_erp_user', JSON.stringify(normalized));
        } else {
          // If token fails, don't immediately wipe if we have a valid normalized demo user
          const stored = localStorage.getItem('banking_erp_user');
          if (stored) {
            setUser(normalizeUser(JSON.parse(stored)));
          }
        }
      } catch (err) {
        console.warn('Session profile restore note:', err.message);
        const stored = localStorage.getItem('banking_erp_user');
        if (stored) {
          try {
            setUser(normalizeUser(JSON.parse(stored)));
          } catch {
            logout();
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      if (res.data.success) {
        const normalized = normalizeUser(res.data.user);
        localStorage.setItem('banking_erp_token', res.data.token);
        localStorage.setItem('banking_erp_user', JSON.stringify(normalized));
        setToken(res.data.token);
        setUser(normalized);
        return res.data;
      }
    } catch (err) {
      // Local fallback for demo personnel accounts if backend unreachable
      const cleanEmail = email.trim().toLowerCase();
      if (ROLE_MAP[cleanEmail] && (password === 'password123' || password === 'password')) {
        const fallbackUser = normalizeUser({
          id: `demo-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
          email: cleanEmail,
          first_name: cleanEmail.split('@')[0].toUpperCase(),
          last_name: 'Officer',
          role: ROLE_MAP[cleanEmail],
          is_active: true
        });
        const fakeToken = `demo_jwt_${Date.now()}`;
        localStorage.setItem('banking_erp_token', fakeToken);
        localStorage.setItem('banking_erp_user', JSON.stringify(fallbackUser));
        setToken(fakeToken);
        setUser(fallbackUser);
        return { success: true, user: fallbackUser, token: fakeToken };
      }
      throw new Error(err.response?.data?.error || err.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    if (res.data.success) {
      const normalized = normalizeUser(res.data.user || userData);
      localStorage.setItem('banking_erp_token', res.data.token);
      localStorage.setItem('banking_erp_user', JSON.stringify(normalized));
      setToken(res.data.token);
      setUser(normalized);
      return res.data;
    }
    throw new Error(res.data.error || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('banking_erp_token');
    localStorage.removeItem('banking_erp_user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (roles = []) => {
    if (!user) return false;
    const effectiveRole = user.role || 'cfo_executive';
    if (effectiveRole === 'admin' || effectiveRole === 'cfo_executive') return true;
    if (roles.length === 0) return true;
    return roles.includes(effectiveRole);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, hasRole }}>
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

