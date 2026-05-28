import React, { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth';
import type { User } from '../types/auth';

const TOKEN_KEY = '@FinanceApp:token';
const USER_KEY = '@FinanceApp:user';

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function persistSession(user: User, token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signOut = useCallback(() => {
    setUser(null);
    clearSession();
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await authApi.getProfile();
        setUser(profile);
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
      } catch {
        clearSession();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void restoreSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { user: authenticatedUser, token } = await authApi.login(email, password);
    persistSession(authenticatedUser, token);
    setUser(authenticatedUser);
  };

  const register = async (name: string, email: string, password: string) => {
    const { user: registeredUser, token } = await authApi.register(name, email, password);
    persistSession(registeredUser, token);
    setUser(registeredUser);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, register }}>
      {children}
    </AuthContext.Provider>
  );
};
