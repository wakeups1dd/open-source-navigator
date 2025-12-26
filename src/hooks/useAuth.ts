import { useState, useEffect } from 'react';

interface User {
  id: string;
  login: string;
  name: string;
  avatar_url: string;
  email: string | null;
  bio?: string | null;
  public_repos?: number;
  followers?: number;
  following?: number;
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

  // GitHub OAuth login
  const login = async () => {
    setIsLoading(true);

    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Iv23liPsiwK9ZtFne8Hv';
    const redirectUri = 'http://localhost:3001/auth/github/callback';
    const scope = 'read:user user:email';

    console.log('GitHub OAuth - Client ID:', clientId);
    console.log('Redirect URI:', redirectUri);

    // Redirect to GitHub OAuth
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

    console.log('Redirecting to:', githubAuthUrl);
    window.location.href = githubAuthUrl;
  };

  // Handle OAuth callback
  const handleCallback = (userData: User) => {
    console.log('Setting user data:', userData);
    setUser(userData);
    setIsLoading(false);
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    // Redirect to login page
    window.location.href = '/login';
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    handleCallback,
  };
}
