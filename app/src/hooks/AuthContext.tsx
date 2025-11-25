import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sdk } from '@/lib/sdk'; // Assuming sdk is exported from here
import { User } from '@shared/schema'; // Assuming shared types

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On component mount, try to load user data from storage
    try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    } catch (error) {
        console.error("Failed to parse auth data from localStorage", error);
        // Clear corrupted storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: any) => {
    const response = await sdk.auth.login(credentials);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('authUser', JSON.stringify(response.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    // Here you might want to redirect the user to the login page
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
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
