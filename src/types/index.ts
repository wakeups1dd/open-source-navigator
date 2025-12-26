export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserPreferences {
  languages: string[];
  frameworks: string[];
  experienceLevel: ExperienceLevel;
  isOnboarded: boolean;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  topics: string[];
  updated_at: string;
  has_contributing: boolean;
  contributionScore: number;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  labels: Label[];
  created_at: string;
  repository: {
    name: string;
    full_name: string;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  requiredSkills: string[];
  explanation: string;
}

export interface Label {
  id: number;
  name: string;
  color: string;
}

export type FilterMode = 'all' | 'beginner' | 'gsoc' | 'hacktoberfest';
