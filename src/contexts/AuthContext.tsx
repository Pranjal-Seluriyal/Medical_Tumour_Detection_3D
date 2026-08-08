import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, type User } from '../services/auth';
import { profileService } from '../services/profile';

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  loginUser: (email: string, password?: string) => Promise<void>;
  signupUser: (name: string, email: string, password?: string) => Promise<void>;
  logoutUser: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error('Failed to load user session:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const loginUser = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const data = await authService.login({ email, password });
      setUser(data.user);
      setIsLoggedIn(true);
    } finally {
      setIsLoading(false);
    }
  };

  const signupUser = async (name: string, email: string, password?: string) => {
    setIsLoading(true);
    try {
      const data = await authService.register({ name, email, password });
      setUser(data.user);
      setIsLoggedIn(true);
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = () => {
    authService.logout();
    setUser(null);
    setIsLoggedIn(false);
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      const updatedUser = await profileService.updateProfile(updates);
      setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
    } catch (err) {
      console.error('Failed to update user profile in context:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        isLoading,
        loginUser,
        signupUser,
        logoutUser,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
