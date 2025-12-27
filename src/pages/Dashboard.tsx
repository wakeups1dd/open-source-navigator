import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { RepoCard } from '@/components/RepoCard';
import { IssueCard } from '@/components/IssueCard';
import { FilterButton } from '@/components/FilterButton';
import { SkillTag } from '@/components/SkillTag';
import { DashboardSkeleton } from '@/components/SkeletonLoader';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useRecommendations, useRateLimit } from '@/hooks/useGitHubData';
import { githubService } from '@/services/github';
import type { FilterMode } from '@/types';
import { Sparkles, BookOpen, Target, RefreshCw, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const { repositories, issues, loading, error, refetch } = useRecommendations();
  const { rateLimit } = useRateLimit();

  // Set GitHub token when user is authenticated
  useEffect(() => {
    // In a real implementation, you'd get the GitHub access token from OAuth
    // For now, we'll use unauthenticated requests
    // githubService.setToken(user?.githubToken);
  }, [user]);

  // Filter data based on filter mode
  const filteredRepos = repositories.filter(repo => {
    switch (filterMode) {
      case 'beginner':
        return repo.matchScore.total >= 70;
      case 'gsoc':
        return repo.topics?.includes('gsoc');
      case 'hacktoberfest':
        return repo.topics?.includes('hacktoberfest');
      default:
        return true;
    }
  });

  const filteredIssues = issues.filter(issue => {
    switch (filterMode) {
      case 'beginner':
        return issue.difficulty === 'easy';
      case 'gsoc':
        return issue.labels.some(l => l.name.toLowerCase().includes('gsoc'));
      case 'hacktoberfest':
        return issue.labels.some(l => l.name.toLowerCase().includes('hacktoberfest'));
      default:
        return true;
    }
  });

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <DashboardSkeleton />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 flex items-center justify-center">
          <div className="brutal-card p-4 sm:p-8 max-w-md text-center w-full">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-destructive" />
            <h2 className="font-mono font-bold text-lg sm:text-xl mb-2">Failed to Load Data</h2>
            <p className="text-muted-foreground text-sm mb-4">
              {error.message || 'Unable to fetch GitHub data. Please try again.'}
            </p>
            <Button onClick={refetch} className="w-full sm:w-auto">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background flex-col lg:flex-row w-full">
      <Sidebar />

      <main className="flex-1 w-full min-w-0 p-3 sm:p-4 lg:p-8 pb-20 sm:pb-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="font-mono font-bold text-xl sm:text-2xl lg:text-3xl mb-2 leading-tight">
                Welcome back, <br className="sm:hidden" />
                {user?.name || 'Developer'}
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm lg:text-base">
                Here are your personalized recommendations based on real GitHub data
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              className="gap-2 w-full sm:w-auto self-start"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* API Rate Limit Status */}
        <div className="brutal-card p-3 sm:p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 bg-accent flex items-center justify-center border-2 border-foreground shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="font-mono font-bold text-sm">GitHub API Status</p>
              <p className="text-xs text-muted-foreground">
                {rateLimit.remaining} / {rateLimit.limit} requests remaining
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto pl-11 sm:pl-0">
            <p className="text-xs text-muted-foreground">
              Resets: {new Date(rateLimit.reset * 1000).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Skills Summary */}
        <div className="brutal-card p-3 sm:p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary flex items-center justify-center border-2 border-foreground shrink-0">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h2 className="font-mono font-bold text-base sm:text-lg">Your Skills</h2>
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
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
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
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Repositories */}
          <section>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary flex items-center justify-center border-2 border-foreground shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-mono font-bold text-lg sm:text-xl">Top Repositories</h2>
                <p className="text-xs text-muted-foreground">
                  {filteredRepos.length} matches found
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {filteredRepos.length > 0 ? (
                filteredRepos.slice(0, 6).map(repo => (
                  <RepoCard key={repo.id} repository={repo} />
                ))
              ) : (
                <div className="brutal-card p-6 sm:p-8 text-center">
                  <p className="font-mono text-muted-foreground text-sm">
                    No repositories match your filters. Try adjusting your skills or filters.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Issues */}
          <section>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent flex items-center justify-center border-2 border-foreground shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="font-mono font-bold text-lg sm:text-xl">Recommended Issues</h2>
                <p className="text-xs text-muted-foreground">
                  {filteredIssues.length} matches found
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {filteredIssues.length > 0 ? (
                filteredIssues.slice(0, 8).map(issue => (
                  <IssueCard key={issue.id} issue={issue} />
                ))
              ) : (
                <div className="brutal-card p-6 sm:p-8 text-center">
                  <p className="font-mono text-muted-foreground text-sm">
                    No issues match your filters. Try different criteria.
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
