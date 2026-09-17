'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserProfile {
  email: string;
  role: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role: string, token?: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedLoginTime = localStorage.getItem('tm_auth_login_time');
        if (storedLoginTime) {
          const elapsed = Date.now() - parseInt(storedLoginTime, 10);
          if (elapsed > TWENTY_FOUR_HOURS_MS) {
            console.warn('Session expired after 24 hours. Logging out...');
            await logout();
            return;
          }
        }

        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser({ email: data.email, role: data.role });
            if (!storedLoginTime) {
              localStorage.setItem('tm_auth_login_time', Date.now().toString());
            }
          } else {
            setUser(null);
            localStorage.removeItem('tm_auth_login_time');
          }
        } else {
          setUser(null);
          localStorage.removeItem('tm_auth_login_time');
        }
      } catch (err) {
        console.error('Session check failed:', err);
        setUser(null);
        localStorage.removeItem('tm_auth_login_time');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Periodic check to auto logout if 24 hours elapsed while user has page open
  useEffect(() => {
    const interval = setInterval(async () => {
      const storedLoginTime = localStorage.getItem('tm_auth_login_time');
      if (storedLoginTime) {
        const elapsed = Date.now() - parseInt(storedLoginTime, 10);
        if (elapsed > TWENTY_FOUR_HOURS_MS) {
          console.warn('Periodic check: Session expired after 24 hours. Logging out...');
          await logout();
        }
      }
    }, 60 * 1000); // check every minute

    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, role: string) => {
    localStorage.setItem('tm_auth_login_time', Date.now().toString());
    setUser({ email, role });
  };

  const logout = async () => {
    try {
      localStorage.removeItem('tm_auth_login_time');
      sessionStorage.clear();
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Failed to log out:', err);
    } finally {
      localStorage.removeItem('tm_auth_login_time');
      sessionStorage.clear();
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
