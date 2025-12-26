import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { handleCallback } = useAuth();
    const { preferences } = useUserPreferences();

    useEffect(() => {
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');

        console.log('AuthCallback - userParam:', userParam);
        console.log('AuthCallback - error:', error);

        if (error) {
            // Handle error
            console.error('OAuth error:', error);
            navigate('/login?error=' + error);
            return;
        }

        if (userParam) {
            try {
                const userData = JSON.parse(decodeURIComponent(userParam));
                console.log('Parsed user data:', userData);

                // Set user data
                handleCallback(userData);

                // Use setTimeout to ensure state is updated before navigation
                setTimeout(() => {
                    // Redirect based on onboarding status
                    if (preferences.isOnboarded) {
                        console.log('Navigating to dashboard');
                        navigate('/dashboard', { replace: true });
                    } else {
                        console.log('Navigating to onboarding');
                        navigate('/onboarding', { replace: true });
                    }
                }, 100);
            } catch (err) {
                console.error('Failed to parse user data:', err);
                navigate('/login?error=invalid_data');
            }
        } else {
            console.log('No user param, redirecting to login');
            navigate('/login');
        }
    }, [searchParams, handleCallback, navigate, preferences.isOnboarded]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                <p className="text-lg font-mono">Completing authentication...</p>
            </div>
        </div>
    );
}
