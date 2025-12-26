import { useState, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { RepoCard } from '@/components/RepoCard';
import { IssueCard } from '@/components/IssueCard';
import { FilterButton } from '@/components/FilterButton';
import { SkillTag } from '@/components/SkillTag';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { mockRepositories, mockIssues } from '@/data/mockData';
import type { FilterMode } from '@/types';
import { Sparkles, BookOpen, Target } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const filteredRepos = useMemo(() => {
    let repos = [...mockRepositories];
    
    // Filter by user's languages
    if (preferences.languages.length > 0) {
      repos = repos.filter(repo => 
        preferences.languages.includes(repo.language) ||
        repo.topics.some(t => preferences.languages.map(l => l.toLowerCase()).includes(t.toLowerCase()))
      );
    }

    // Apply filter mode
    switch (filterMode) {
      case 'beginner':
        repos = repos.filter(r => r.contributionScore >= 85);
        break;
      case 'gsoc':
        repos = repos.filter(r => r.topics.includes('gsoc'));
        break;
      case 'hacktoberfest':
        repos = repos.filter(r => r.topics.includes('hacktoberfest'));
        break;
    }

    return repos.sort((a, b) => b.contributionScore - a.contributionScore);
  }, [preferences.languages, filterMode]);

  const filteredIssues = useMemo(() => {
    let issues = [...mockIssues];

    // Filter by user's skills
    if (preferences.languages.length > 0 || preferences.frameworks.length > 0) {
      const allSkills = [...preferences.languages, ...preferences.frameworks].map(s => s.toLowerCase());
      issues = issues.filter(issue =>
        issue.requiredSkills.some(skill => allSkills.includes(skill.toLowerCase()))
      );
    }

    // Filter by experience level
    switch (preferences.experienceLevel) {
      case 'beginner':
        issues = issues.filter(i => i.difficulty === 'easy');
        break;
      case 'intermediate':
        issues = issues.filter(i => ['easy', 'medium'].includes(i.difficulty));
        break;
    }

    // Apply filter mode
    switch (filterMode) {
      case 'beginner':
        issues = issues.filter(i => i.difficulty === 'easy');
        break;
      case 'gsoc':
        issues = issues.filter(i => i.labels.some(l => l.name.toLowerCase().includes('gsoc')));
        break;
      case 'hacktoberfest':
        issues = issues.filter(i => i.labels.some(l => l.name.toLowerCase().includes('hacktoberfest')));
        break;
    }

    return issues;
  }, [preferences, filterMode]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-mono font-bold text-3xl mb-2">
            Welcome back, {user?.name || 'Developer'}
          </h1>
          <p className="text-muted-foreground">
            Here are your personalized recommendations
          </p>
        </div>

        {/* Skills Summary */}
        <div className="brutal-card p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-secondary flex items-center justify-center border-2 border-foreground">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="font-mono font-bold text-lg">Your Skills</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {preferences.languages.map(lang => (
              <SkillTag key={lang} label={lang} selected size="sm" />
            ))}
            {preferences.frameworks.map(fw => (
              <SkillTag key={fw} label={fw} size="sm" />
            ))}
            <SkillTag 
              label={preferences.experienceLevel.charAt(0).toUpperCase() + preferences.experienceLevel.slice(1)} 
              size="sm" 
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {(['all', 'beginner', 'gsoc', 'hacktoberfest'] as FilterMode[]).map(mode => (
            <FilterButton
              key={mode}
              mode={mode}
              currentMode={filterMode}
              onClick={setFilterMode}
            />
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Repositories */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary flex items-center justify-center border-2 border-foreground">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="font-mono font-bold text-xl">Top Repositories</h2>
            </div>
            <div className="space-y-4">
              {filteredRepos.length > 0 ? (
                filteredRepos.slice(0, 4).map(repo => (
                  <RepoCard key={repo.id} repository={repo} />
                ))
              ) : (
                <div className="brutal-card p-8 text-center">
                  <p className="font-mono text-muted-foreground">
                    No repositories match your filters
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Issues */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent flex items-center justify-center border-2 border-foreground">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="font-mono font-bold text-xl">Recommended Issues</h2>
            </div>
            <div className="space-y-4">
              {filteredIssues.length > 0 ? (
                filteredIssues.slice(0, 5).map(issue => (
                  <IssueCard key={issue.id} issue={issue} />
                ))
              ) : (
                <div className="brutal-card p-8 text-center">
                  <p className="font-mono text-muted-foreground">
                    No issues match your filters
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
