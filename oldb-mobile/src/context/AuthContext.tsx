import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { setUnauthorizedHandler } from '@/src/api/client';
import { createAccount, loginAccount } from '@/src/api/apiService';
import type { LoginRequest, SessionUser, SignupRequest } from '@/src/domain/types';
import {
  clearSession,
  loadSession,
  saveSession,
} from '@/src/storage/secureSession';

type AuthContextValue = {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (payload: LoginRequest) => Promise<void>;
  signUp: (payload: SignupRequest) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signOut = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const session = await loadSession();
        if (mounted) setUser(session);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const signIn = useCallback(async (payload: LoginRequest) => {
    const response = await loginAccount(payload);
    const next: SessionUser = {
      token: response.token,
      username: response.username,
      profileName: response.profileName,
      role: response.role,
      email: payload.email,
      avatarUrl: response.avatarUrl ?? null,
    };
    await saveSession(next);
    setUser(next);
  }, []);

  const signUp = useCallback(async (payload: SignupRequest) => {
    await createAccount(payload);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user?.token,
      signIn,
      signUp,
      signOut,
    }),
    [user, isLoading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
