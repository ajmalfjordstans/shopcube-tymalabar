'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { CustomerAuth } from '@/types/order';
import { saveCustomerSession, loadCustomerSession, clearCustomerSession, isTokenValid } from '@/lib/order/auth';

interface AuthContextValue {
  session: CustomerAuth | null;
  isLoggedIn: boolean;
  initialized: boolean;
  login: (auth: CustomerAuth) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function OrderAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<CustomerAuth | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (isTokenValid()) {
      setSession(loadCustomerSession());
    } else {
      clearCustomerSession();
    }
    setInitialized(true);
  }, []);

  const login = useCallback((auth: CustomerAuth) => {
    try {
      saveCustomerSession(auth);
    } catch {
      toast.error("Couldn't save your session — storage may be full.");
    }
    setSession(auth);
  }, []);

  const logout = useCallback(() => {
    clearCustomerSession();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoggedIn: !!session, initialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside OrderAuthProvider');
  return ctx;
}
