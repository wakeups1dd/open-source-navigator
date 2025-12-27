import { useState, useEffect } from 'react';
import type { UserPreferences, ExperienceLevel } from '@/types';
import { useAuth } from './useAuth';
import axios from 'axios';

const STORAGE_KEY = 'opensource-compass-preferences';
const API_URL = 'http://localhost:3001/api';

const defaultPreferences: UserPreferences = {
  languages: [],
  frameworks: [],
  experienceLevel: 'beginner',
  isOnboarded: false,
};

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultPreferences;
  });

  // Sync with database when user logs in
  useEffect(() => {
    if (user?.id) {
      const fetchPreferences = async () => {
        try {
          const response = await axios.get(`${API_URL}/user/${user.id}/preferences`);
          const dbPreferences = response.data;

          // If DB has preferences, use them. 
          // You might want to merge with local if DB is empty but typically DB is source of truth.
          if (dbPreferences && Object.keys(dbPreferences).length > 0) {
            setPreferences(prev => ({
              ...prev, // Keep existing fields if missing in DB (unlikely if full object)
              ...dbPreferences
            }));
          }
        } catch (error) {
          console.error('Failed to fetch preferences from DB:', error);
        }
      };

      fetchPreferences();
    }
  }, [user?.id]);

  // Persist to LocalStorage and Database
  useEffect(() => {
    // Save to local storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));

    // Save to DB if user is logged in
    if (user?.id) {
      // Debounce could be added here, but for now direct saving is fine for low frequency updates
      axios.put(`${API_URL}/user/${user.id}/preferences`, preferences)
        .catch(err => console.error('Failed to save preferences to DB:', err));
    }
  }, [preferences, user?.id]);

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
    console.log('Setting isOnboarded to true');
    setPreferences(prev => {
      const updated = { ...prev, isOnboarded: true };
      console.log('Updated preferences:', updated);
      return updated;
    });
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
