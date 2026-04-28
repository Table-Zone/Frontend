'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  language: string;
  hasWorkspace: boolean;
  workspace?: {
    id: string;
    slug: string;
    name: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      userAPI.getMe()
        .then((res) => {
          if (res?.data?.data) {
            setUser(res.data.data);
          }
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          document.cookie = 'access_token=; path=/; max-age=0';
        })
        .finally(() => setIsLoading(false));
    } else {
      // No token in localStorage — make sure cookie is also cleared
      document.cookie = 'access_token=; path=/; max-age=0';
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    console.log('[Auth] Calling login API...');
    const res = await authAPI.login({ email, password });
    console.log('[Auth] Login API response:', res.data);
    const { accessToken, user } = res.data.data;
    localStorage.setItem('access_token', accessToken);
    // Also set cookie for middleware
    document.cookie = `access_token=${accessToken}; path=/; max-age=86400`;
    setUser(user);
    return user;
  };

  const logout = async () => {
    await authAPI.logout();
    localStorage.removeItem('access_token');
    document.cookie = 'access_token=; path=/; max-age=0';
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
