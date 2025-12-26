import { useState, useEffect } from 'react';

interface User {
  id: string;
  login: string;
  name: string;
  avatar_url: string;
  email: string | null;
}

const STORAGE_KEY = 'opensource-compass-user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // Mock GitHub login for demo purposes
  const login = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data
    const mockUser: User = {
      id: '12345',
      login: 'developer',
      name: 'Developer',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=developer',
      email: 'developer@example.com',
    };
    
    setUser(mockUser);
    setIsLoading(false);
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
