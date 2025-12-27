import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, GitFork, AlertCircle, ExternalLink, FileText, Users, Clock } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { IssueCard } from '@/components/IssueCard';
import { ScoreBadge } from '@/components/ScoreBadge';
import { SkillTag } from '@/components/SkillTag';
import { Button } from '@/components/ui/button';
import { mockRepositories, mockIssues } from '@/data/mockData';

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

export default function Repository() {
  const { id } = useParams();
  const repository = mockRepositories.find(r => r.id === Number(id));
  const repoIssues = mockIssues.filter(i =>
    i.repository.full_name === repository?.full_name
  );

  if (!repository) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-mono font-bold text-2xl mb-4">Repository not found</h1>
            <Link to="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        {/* Back button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 font-mono font-bold text-sm uppercase mb-8 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Repository Header */}
        <div className="brutal-card p-8 mb-8">
          <div className="flex items-start gap-6">
            <img
              src={repository.owner.avatar_url}
              alt={repository.owner.login}
              className="w-20 h-20 border-[3px] border-foreground shadow-[4px_4px_0px_0px_hsl(var(--foreground))]"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-mono font-bold text-3xl mb-2">
                    {repository.full_name}
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl">
                    {repository.description}
                  </p>
                </div>
                <ScoreBadge score={repository.contributionScore} size="lg" />
              </div>

              <div className="flex flex-wrap gap-2 mt-6">
                {repository.language && (
                  <SkillTag label={repository.language} selected />
                )}
                {repository.topics.map(topic => (
                  <SkillTag key={topic} label={topic} />
                ))}
              </div>

              <div className="flex items-center gap-8 mt-6 font-mono">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span className="font-bold text-lg">{formatNumber(repository.stargazers_count)}</span>
                  <span className="text-muted-foreground">stars</span>
                </div>
                <div className="flex items-center gap-2">
                  <GitFork className="w-5 h-5" />
                  <span className="font-bold text-lg">{formatNumber(repository.forks_count)}</span>
                  <span className="text-muted-foreground">forks</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-bold text-lg">{formatNumber(repository.open_issues_count)}</span>
                  <span className="text-muted-foreground">open issues</span>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <a href={repository.html_url} target="_blank" rel="noopener noreferrer">
                  <Button>
                    <ExternalLink className="w-4 h-4" />
                    View on GitHub
                  </Button>
                </a>
                {repository.has_contributing && (
                  <a
                    href={`${repository.html_url}/blob/main/CONTRIBUTING.md`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline">
                      <FileText className="w-4 h-4" />
                      Contributing Guide
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Recent Activity', value: 'High', icon: Clock },
            { label: 'Issue Response', value: 'Fast', icon: AlertCircle },
            { label: 'Community', value: 'Active', icon: Users },
            { label: 'Documentation', value: 'Good', icon: FileText },
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

        {/* Related Issues */}
        <section>
          <h2 className="font-mono font-bold text-2xl mb-6">
            Open Issues for You
          </h2>
          {repoIssues.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {repoIssues.map(issue => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          ) : (
            <div className="brutal-card p-8 text-center">
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
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
