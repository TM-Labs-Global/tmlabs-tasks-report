'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/shared/api/supabase';

interface UserProfile {
  email: string;
  role: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role: string, token: { access_token: string; refresh_token: string } | null) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncSupabaseSession = async (token: { access_token: string; refresh_token: string } | null) => {
    if (token && supabase) {
      await supabase.auth.setSession({
        access_token: token.access_token,
        refresh_token: token.refresh_token,
      });
    }
  };


  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser({ email: data.email, role: data.role });
            await syncSupabaseSession(data.supabaseToken);
          }
        }
      } catch (err) {
        console.error('Failed to restore authentication session:', err);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email: string, role: string, token: { access_token: string; refresh_token: string } | null) => {
    setUser({ email, role });
    await syncSupabaseSession(token);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Failed to log out:', err);
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }}>
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
