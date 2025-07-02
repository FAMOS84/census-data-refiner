
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  sessionTimeRemaining: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Get PIN from environment variable with fallback
const CORRECT_PIN = import.meta.env.VITE_AUTH_PIN || '1234';

// Log warning if using default PIN in production
if (CORRECT_PIN === '1234' && import.meta.env.PROD) {
  console.warn('⚠️ Warning: Using default PIN in production. Set VITE_AUTH_PIN environment variable.');
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(0);

  // Check session validity
  const isSessionValid = useCallback(() => {
    if (!sessionStart) return false;
    return Date.now() - sessionStart < SESSION_TIMEOUT;
  }, [sessionStart]);

  // Auto-logout on session timeout
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated && !isSessionValid()) {
        logout();
      } else if (isAuthenticated && sessionStart) {
        const remaining = Math.max(0, SESSION_TIMEOUT - (Date.now() - sessionStart));
        setSessionTimeRemaining(Math.ceil(remaining / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, sessionStart, isSessionValid]);

  useEffect(() => {
    // Check if user was previously authenticated
    const authStatus = sessionStorage.getItem('census-auth');
    const authTime = sessionStorage.getItem('census-auth-time');
    
    if (authStatus === 'true' && authTime) {
      const storedTime = parseInt(authTime, 10);
      if (Date.now() - storedTime < SESSION_TIMEOUT) {
        setIsAuthenticated(true);
        setSessionStart(storedTime);
      } else {
        // Session expired, clean up
        sessionStorage.removeItem('census-auth');
        sessionStorage.removeItem('census-auth-time');
      }
    }
  }, []);

  const login = async (pin: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Server-side validation through edge function
      const { data, error } = await supabase.functions.invoke('validate-pin', {
        body: { pin }
      });

      if (error) {
        console.error('Pin validation error:', error);
        return { success: false, error: 'Authentication service unavailable' };
      }

      if (data?.valid) {
        const now = Date.now();
        setIsAuthenticated(true);
        setSessionStart(now);
        sessionStorage.setItem('census-auth', 'true');
        sessionStorage.setItem('census-auth-time', now.toString());
        return { success: true };
      } else {
        return { success: false, error: 'Invalid PIN' };
      }
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to client-side validation if server is unavailable
      if (pin === CORRECT_PIN) {
        const now = Date.now();
        setIsAuthenticated(true);
        setSessionStart(now);
        sessionStorage.setItem('census-auth', 'true');
        sessionStorage.setItem('census-auth-time', now.toString());
        return { success: true };
      }
      return { success: false, error: 'Invalid PIN' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setSessionStart(null);
    setSessionTimeRemaining(0);
    sessionStorage.removeItem('census-auth');
    sessionStorage.removeItem('census-auth-time');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, sessionTimeRemaining }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
