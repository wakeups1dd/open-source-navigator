import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SkillTag } from '@/components/SkillTag';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { languages, frameworks } from '@/data/mockData';
import type { ExperienceLevel } from '@/types';
import { cn } from '@/lib/utils';

const experienceLevels: { value: ExperienceLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'New to open source, looking for guidance' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some contributions, ready for more' },
  { value: 'advanced', label: 'Advanced', description: 'Experienced contributor, seeking challenges' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const {
    preferences,
    updateLanguages,
    updateFrameworks,
    updateExperienceLevel,
    completeOnboarding,
  } = useUserPreferences();

  const [step, setStep] = useState(1);

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

  const handleComplete = () => {
    completeOnboarding();
    navigate('/dashboard');
  };

  const canProceed = () => {
    if (step === 1) return preferences.languages.length > 0;
    if (step === 2) return preferences.frameworks.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-primary flex items-center justify-center border-[3px] border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]">
            <Compass className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-mono font-bold text-2xl">Setup Your Profile</h1>
            <p className="text-muted-foreground">Step {step} of 3</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-12">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={cn(
                'flex-1 h-3 border-2 border-foreground transition-all',
                s <= step ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>

        {/* Step 1: Languages */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="font-mono font-bold text-3xl mb-2">
              Select Your Languages
            </h2>
            <p className="text-muted-foreground mb-8">
              Choose the programming languages you're comfortable with
            </p>
            <div className="flex flex-wrap gap-3">
              {languages.map(lang => (
                <SkillTag
                  key={lang}
                  label={lang}
                  size="lg"
                  selected={preferences.languages.includes(lang)}
                  onClick={() => toggleLanguage(lang)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Frameworks */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="font-mono font-bold text-3xl mb-2">
              Select Your Frameworks
            </h2>
            <p className="text-muted-foreground mb-8">
              Pick the frameworks and tools you've worked with
            </p>
            <div className="flex flex-wrap gap-3">
              {frameworks.map(fw => (
                <SkillTag
                  key={fw}
                  label={fw}
                  size="lg"
                  selected={preferences.frameworks.includes(fw)}
                  onClick={() => toggleFramework(fw)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Experience Level */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="font-mono font-bold text-3xl mb-2">
              Your Experience Level
            </h2>
            <p className="text-muted-foreground mb-8">
              Help us match you with the right issues
            </p>
            <div className="space-y-4">
              {experienceLevels.map(level => (
                <button
                  key={level.value}
                  onClick={() => updateExperienceLevel(level.value)}
                  className={cn(
                    'w-full p-6 text-left border-[3px] border-foreground transition-all duration-150',
                    'hover:-translate-x-1 hover:-translate-y-1',
                    'active:translate-x-0.5 active:translate-y-0.5',
                    preferences.experienceLevel === level.value
                      ? 'bg-primary text-primary-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))]'
                      : 'bg-card shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:shadow-[4px_4px_0px_0px_hsl(var(--foreground))]'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-mono font-bold text-xl mb-1">{level.label}</h3>
                      <p className={cn(
                        'text-sm',
                        preferences.experienceLevel === level.value
                          ? 'text-primary-foreground/80'
                          : 'text-muted-foreground'
                      )}>
                        {level.description}
                      </p>
                    </div>
                    {preferences.experienceLevel === level.value && (
                      <div className="w-8 h-8 bg-secondary flex items-center justify-center border-2 border-foreground">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t-[3px] border-foreground">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(s => s - 1)}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete}>
              Start Exploring
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
