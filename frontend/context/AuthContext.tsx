'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  guestId: string | null;
  isGuest: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
  /** Returns the correct auth header value for API calls */
  getAuthHeader: () => Record<string, string>;
}

// ─── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function generateGuestId() {
  return 'guest_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, token: null,
    guestId: null, isGuest: false,
    isAuthenticated: false, isLoading: true,
  });

  // Rehydrate from storage on mount
  useEffect(() => {
    try {
      const token   = localStorage.getItem('vg_token');
      const rawUser = localStorage.getItem('vg_user');
      const guestId = sessionStorage.getItem('vg_guest_id'); // cleared when tab closes

      if (token && rawUser) {
        setState({ user: JSON.parse(rawUser), token, guestId: null, isGuest: false, isAuthenticated: true, isLoading: false });
      } else if (guestId) {
        setState({ user: null, token: null, guestId, isGuest: true, isAuthenticated: true, isLoading: false });
      } else {
        setState(s => ({ ...s, isLoading: false }));
      }
    } catch {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Login failed');

    localStorage.setItem('vg_token', data.token);
    localStorage.setItem('vg_user', JSON.stringify(data.user));
    sessionStorage.removeItem('vg_guest_id');
    setState({ user: data.user, token: data.token, guestId: null, isGuest: false, isAuthenticated: true, isLoading: false });
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Sign up failed');

    localStorage.setItem('vg_token', data.token);
    localStorage.setItem('vg_user', JSON.stringify(data.user));
    sessionStorage.removeItem('vg_guest_id');
    setState({ user: data.user, token: data.token, guestId: null, isGuest: false, isAuthenticated: true, isLoading: false });
  }, []);

  const loginAsGuest = useCallback(() => {
    const guestId = generateGuestId();
    sessionStorage.setItem('vg_guest_id', guestId); // auto-cleared on tab close
    setState({ user: null, token: null, guestId, isGuest: true, isAuthenticated: true, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('vg_token');
    localStorage.removeItem('vg_user');
    sessionStorage.removeItem('vg_guest_id');
    setState({ user: null, token: null, guestId: null, isGuest: false, isAuthenticated: false, isLoading: false });
  }, []);

  const getAuthHeader = useCallback((): Record<string, string> => {
    if (state.token)   return { Authorization: `Bearer ${state.token}` };
    if (state.guestId) return { 'X-Guest-Id': state.guestId };
    return {};
  }, [state.token, state.guestId]);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, loginAsGuest, logout, getAuthHeader }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
