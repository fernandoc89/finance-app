import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useEffect, useState } from 'react';
import api from '../api/client';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  async function loadStoredData() {
    const storedUser = await AsyncStorage.getItem('@FinanceApp:user');
    const storedToken = await AsyncStorage.getItem('@FinanceApp:token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      api.defaults.headers.Authorization = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }

  async function signIn(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    const { user, token } = response.data;

    setUser(user);
    api.defaults.headers.Authorization = `Bearer ${token}`;

    await AsyncStorage.setItem('@FinanceApp:user', JSON.stringify(user));
    await AsyncStorage.setItem('@FinanceApp:token', token);
  }

  async function signOut() {
    setUser(null);
    await AsyncStorage.clear();
    api.defaults.headers.Authorization = '';
  }

  async function register(name: string, email: string, password: string) {
    await api.post('/auth/register', { name, email, password });
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, register }}>
      {children}
    </AuthContext.Provider>
  );
};
