import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { SkillTag } from '@/components/SkillTag';
import { Button } from '@/components/ui/button';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useAuth } from '@/hooks/useAuth';
import { languages, frameworks } from '@/data/mockData';
import type { ExperienceLevel } from '@/types';
import { cn } from '@/lib/utils';
import { RefreshCcw, Save, Check } from 'lucide-react';
import { toast } from 'sonner';

const experienceLevels: { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    preferences,
    updateLanguages,
    updateFrameworks,
    updateExperienceLevel,
    resetPreferences,
  } = useUserPreferences();

  const toggleLanguage = (lang: string) => {
    const current = preferences.languages;
    if (current.includes(lang)) {
      updateLanguages(current.filter(l => l !== lang));
    } else {
      updateLanguages([...current, lang]);
    }
  };

  const toggleFramework = (fw: string) => {
    const current = preferences.frameworks;
    if (current.includes(fw)) {
      updateFrameworks(current.filter(f => f !== fw));
    } else {
      updateFrameworks([...current, fw]);
    }
  };

  const handleReset = () => {
    resetPreferences();
    toast.success('Preferences reset. Redirecting to onboarding...');
    setTimeout(() => navigate('/onboarding'), 1000);
  };

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl">
          <h1 className="font-mono font-bold text-3xl mb-2">Settings</h1>
          <p className="text-muted-foreground mb-8">
            Manage your profile and preferences
          </p>

          {/* Profile Section */}
          <section className="brutal-card p-6 mb-8">
            <h2 className="font-mono font-bold text-xl mb-4">Profile</h2>
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar_url}
                alt={user?.name}
                className="w-16 h-16 border-[3px] border-foreground"
              />
              <div>
                <p className="font-mono font-bold text-lg">{user?.name}</p>
                <p className="text-muted-foreground">@{user?.login}</p>
              </div>
            </div>
          </section>

          {/* Languages */}
          <section className="brutal-card p-6 mb-8">
            <h2 className="font-mono font-bold text-xl mb-4">Programming Languages</h2>
            <div className="flex flex-wrap gap-2">
              {languages.map(lang => (
                <SkillTag
                  key={lang}
                  label={lang}
                  selected={preferences.languages.includes(lang)}
                  onClick={() => toggleLanguage(lang)}
                />
              ))}
            </div>
          </section>

          {/* Frameworks */}
          <section className="brutal-card p-6 mb-8">
            <h2 className="font-mono font-bold text-xl mb-4">Frameworks & Tools</h2>
            <div className="flex flex-wrap gap-2">
              {frameworks.map(fw => (
                <SkillTag
                  key={fw}
                  label={fw}
                  selected={preferences.frameworks.includes(fw)}
                  onClick={() => toggleFramework(fw)}
                />
              ))}
            </div>
          </section>

          {/* Experience Level */}
          <section className="brutal-card p-6 mb-8">
            <h2 className="font-mono font-bold text-xl mb-4">Experience Level</h2>
            <div className="flex gap-3">
              {experienceLevels.map(level => (
                <button
                  key={level.value}
                  onClick={() => updateExperienceLevel(level.value)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 font-mono font-bold text-sm',
                    'border-2 border-foreground transition-all duration-150',
                    'hover:-translate-x-0.5 hover:-translate-y-0.5',
                    preferences.experienceLevel === level.value
                      ? 'bg-primary text-primary-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]'
                      : 'bg-background shadow-[2px_2px_0px_0px_hsl(var(--foreground))]'
                  )}
                >
                  {preferences.experienceLevel === level.value && (
                    <Check className="w-4 h-4" />
                  )}
                  {level.label}
                </button>
              ))}
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={handleSave}>
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RefreshCcw className="w-4 h-4" />
              Reset & Re-onboard
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
