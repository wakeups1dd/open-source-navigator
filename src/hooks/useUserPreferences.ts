import { useState, useEffect } from 'react';
import type { UserPreferences, ExperienceLevel } from '@/types';

const STORAGE_KEY = 'opensource-compass-preferences';

const defaultPreferences: UserPreferences = {
  languages: [],
  frameworks: [],
  experienceLevel: 'beginner',
  isOnboarded: false,
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultPreferences;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const updateLanguages = (languages: string[]) => {
    setPreferences(prev => ({ ...prev, languages }));
  };

  const updateFrameworks = (frameworks: string[]) => {
    setPreferences(prev => ({ ...prev, frameworks }));
  };

  const updateExperienceLevel = (experienceLevel: ExperienceLevel) => {
    setPreferences(prev => ({ ...prev, experienceLevel }));
  };

  const completeOnboarding = () => {
    setPreferences(prev => ({ ...prev, isOnboarded: true }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    preferences,
    updateLanguages,
    updateFrameworks,
    updateExperienceLevel,
    completeOnboarding,
    resetPreferences,
  };
}
