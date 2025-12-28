import { useNavigate } from 'react-router-dom';
import { Github, Compass, ArrowRight, Zap, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isLoading } = useAuth();
  const { preferences } = useUserPreferences();

  const handleLogin = async () => {
    await login();
    if (preferences.isOnboarded) {
      navigate('/dashboard');
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Hero */}
      <div className="flex-1 p-4 md:p-8 lg:p-16 flex flex-col justify-center">
        <div className="max-w-xl">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 bg-primary flex items-center justify-center border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
              <Compass className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-mono font-bold text-3xl">OpenSource</h1>
              <p className="font-mono text-lg text-muted-foreground">Compass</p>
            </div>
          </div>

          {/* Headline */}
          <h2 className="font-mono font-bold text-4xl lg:text-5xl leading-tight mb-6">
            Find Your Perfect
            <span className="block bg-secondary px-2 mt-2 inline-block border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
              Open Source Project
            </span>
          </h2>

          <p className="text-lg text-muted-foreground mb-10 max-w-md">
            Discover GitHub repositories and issues tailored to your skills.
            Start contributing to open source today.
          </p>

          {/* Features */}
          <div className="space-y-4 mb-12">
            {[
              { icon: Zap, text: 'AI-powered issue recommendations' },
              { icon: Target, text: 'Matched to your skill level' },
              { icon: Users, text: 'Join thriving communities' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent flex items-center justify-center border-2 border-foreground">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-mono font-bold">{text}</span>
              </div>
            ))}
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            size="lg"
            className="text-lg w-full mb-4"
          >
            <Github className="w-5 h-5 mr-2" />
            {isLoading ? 'Connecting...' : 'Continue with GitHub'}
            <ArrowRight className="w-5 h-5 ml-auto" />
          </Button>

          <Button
            onClick={() => loginWithGoogle()}
            disabled={isLoading}
            variant="outline"
            size="lg"
            className="text-lg w-full border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-8 right-8 w-24 h-24 bg-secondary border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]" />
        <div className="absolute bottom-16 left-8 w-16 h-16 bg-accent border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]" />
        <div className="absolute top-1/3 left-16 w-8 h-8 bg-background border-2 border-foreground" />

        {/* Main content */}
        <div className="relative z-10 text-center">
          <div className="grid grid-cols-2 gap-4 mb-8">
            {['React', 'Python', 'Go', 'Rust'].map(lang => (
              <div
                key={lang}
                className="px-6 py-4 bg-background border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] font-mono font-bold text-lg"
              >
                {lang}
              </div>
            ))}
          </div>
          <p className="font-mono font-bold text-2xl text-primary-foreground">
            100K+ Projects
            <span className="block text-lg opacity-80 mt-1">Ready for Contributors</span>
          </p>
        </div>
      </div>
    </div>
  );
}
