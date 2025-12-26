import { useNavigate } from 'react-router-dom';
import { Github, Compass, ArrowRight, Zap, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
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
      <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center">
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
            className="text-lg"
          >
            <Github className="w-5 h-5" />
            {isLoading ? 'Connecting...' : 'Continue with GitHub'}
            <ArrowRight className="w-5 h-5" />
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
