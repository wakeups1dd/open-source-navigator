import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, GitFork, AlertCircle, ExternalLink, FileText, Users, Clock, Loader2, RefreshCw } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { IssueCard } from '@/components/IssueCard';
import { ScoreBadge } from '@/components/ScoreBadge';
import { SkillTag } from '@/components/SkillTag';
import { Button } from '@/components/ui/button';
import { useRepository } from '@/hooks/useGitHubData';

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

export default function Repository() {
  const { id } = useParams();
  const { repository, issues: repoIssues, loading, error, refetch } = useRepository(id);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background flex-col lg:flex-row w-full">
        <Sidebar />
        <main className="flex-1 w-full min-w-0 p-4 lg:p-8 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (error || !repository) {
    return (
      <div className="flex min-h-screen bg-background flex-col lg:flex-row w-full">
        <Sidebar />
        <main className="flex-1 w-full min-w-0 p-4 lg:p-8 flex items-center justify-center">
          <div className="brutal-card p-6 max-w-md text-center">
            <h1 className="font-mono font-bold text-xl mb-4">Repository not found</h1>
            <p className="text-muted-foreground mb-6">
              {error?.message || "We couldn't find the repository you're looking for."}
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button onClick={refetch}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background flex-col lg:flex-row w-full">
      <Sidebar />

      <main className="flex-1 w-full min-w-0 p-4 lg:p-8 overflow-auto pb-20 sm:pb-8">
        {/* Back button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 font-mono font-bold text-sm uppercase mb-6 sm:mb-8 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Repository Header */}
        <div className="brutal-card p-4 sm:p-8 mb-6 sm:mb-8 w-full max-w-full">
          <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6">
            <img
              src={repository.owner.avatar_url}
              alt={repository.owner.login}
              className="w-16 h-16 sm:w-20 sm:h-20 border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))] shrink-0"
            />
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="min-w-0 w-full">
                  <h1 className="font-mono font-bold text-2xl sm:text-3xl mb-2 break-words leading-tight">
                    {repository.full_name}
                  </h1>
                  <p className="text-base sm:text-lg text-muted-foreground max-w-2xl break-words">
                    {repository.description || 'No description provided.'}
                  </p>
                </div>
                {'matchScore' in repository ? (
                  <ScoreBadge score={Math.round(repository.matchScore.total)} size="lg" className="shrink-0" />
                ) : (
                  <ScoreBadge score={repository.contributionScore || 50} size="lg" className="shrink-0" />
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4 sm:mt-6">
                {repository.language && (
                  <SkillTag label={repository.language} selected />
                )}
                {repository.topics.map(topic => (
                  <SkillTag key={topic} label={topic} />
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-8 mt-4 sm:mt-6 font-mono text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-bold text-base sm:text-lg">{formatNumber(repository.stargazers_count)}</span>
                  <span className="text-muted-foreground hidden sm:inline">stars</span>
                </div>
                <div className="flex items-center gap-2">
                  <GitFork className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-bold text-base sm:text-lg">{formatNumber(repository.forks_count)}</span>
                  <span className="text-muted-foreground hidden sm:inline">forks</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-bold text-base sm:text-lg">{formatNumber(repository.open_issues_count)}</span>
                  <span className="text-muted-foreground hidden sm:inline">open issues</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4 mt-6 sm:mt-8">
                <a href={repository.html_url} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on GitHub
                  </Button>
                </a>
                {/* We don't have has_contributing in the fetched data usually, stripping for now or can check file existence separately. 
                    Adding a generic CONTRIBUTING.md link if standard. */}
                <a
                  href={`${repository.html_url}/blob/main/CONTRIBUTING.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button variant="outline" className="w-full sm:w-auto">
                    <FileText className="w-4 h-4 mr-2" />
                    Contributing Guide
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown - Only if we have it */}
        {'matchScore' in repository && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Skill Match', value: repository.matchScore.skillMatch > 20 ? 'High' : 'Medium', icon: FileText },
              { label: 'Popularity', value: repository.matchScore.popularityScore > 5 ? 'High' : 'Medium', icon: Users },
              { label: 'Difficulty', value: 'Appropriate', icon: AlertCircle },
              { label: 'Activity', value: repository.matchScore.activityScore > 5 ? 'Recent' : 'Low', icon: Clock },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="brutal-card p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-muted flex items-center justify-center border-2 border-foreground">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-sm text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="font-mono font-bold text-lg">{item.value}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Related Issues */}
        <section>
          <h2 className="font-mono font-bold text-xl sm:text-2xl mb-4 sm:mb-6">
            Open Issues for You
          </h2>
          {repoIssues.length > 0 ? (
            <div className="grid lg:grid-cols-2 gap-4">
              {repoIssues.map(issue => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          ) : (
            <div className="brutal-card p-6 sm:p-8 text-center">
              <p className="font-mono text-muted-foreground">
                No matching issues found for this repository.
              </p>
              <a
                href={`${repository.html_url}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4"
              >
                <Button variant="outline">
                  Browse All Issues
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
