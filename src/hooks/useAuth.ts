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
    // Determine the redirect URI based on the current environment
    // In production (Vercel), it should be the /api/auth/callback endpoint on the same domain
    const baseUrl = window.location.origin;
    // If running locally with separate backend, use localhost:3001, otherwise use the /api route
    const isLocalDevelopment = baseUrl.includes('localhost:8080');
    const redirectUri = isLocalDevelopment
      ? 'http://localhost:3001/auth/github/callback'
      : `${baseUrl}/api/auth/callback`;

    const scope = 'read:user user:email';

    console.log('GitHub OAuth - Client ID:', clientId);
    console.log('Redirect URI:', redirectUri);

    if (!clientId) {
      console.error('Missing VITE_GITHUB_CLIENT_ID');
      setIsLoading(false);
      return;
    }

    // Redirect to GitHub OAuth
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

    console.log('Redirecting to:', githubAuthUrl);
    window.location.href = githubAuthUrl;
  };

  const loginWithGoogle = () => {
    setIsLoading(true);
    const baseUrl = window.location.origin;
    const isLocalDevelopment = baseUrl.includes('localhost:8080');
    // For local dev, hit the mock server directly
    // For prod, hit the /api/auth endpoint
    const authUrl = isLocalDevelopment
      ? 'http://localhost:3001/auth/google'
      : `${baseUrl}/api/auth/google`;

    window.location.href = authUrl;
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
    loginWithGoogle,
    logout,
    handleCallback,
  };
}
