import { Star, GitFork, AlertCircle, ExternalLink } from 'lucide-react';
import { ScoreBadge } from './ScoreBadge';
import { SkillTag } from './SkillTag';
import type { Repository } from '@/types';
import { Link } from 'react-router-dom';

interface RepoCardProps {
  repository: Repository;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

export function RepoCard({ repository }: RepoCardProps) {
  return (
    <div className="brutal-card p-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <img
            src={repository.owner.avatar_url}
            alt={repository.owner.login}
            className="w-12 h-12 border-2 border-foreground"
          />
          <div className="min-w-0 flex-1">
            <Link
              to={`/repository/${repository.id}`}
              className="font-mono font-bold text-lg hover:text-primary transition-colors truncate block"
            >
              {repository.full_name}
            </Link>
            <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
              {repository.description}
            </p>
          </div>
        </div>
        <ScoreBadge score={repository.contributionScore} />
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {repository.language && (
          <SkillTag label={repository.language} size="sm" />
        )}
        {repository.topics.slice(0, 3).map(topic => (
          <SkillTag key={topic} label={topic} size="sm" />
        ))}
      </div>

      <div className="flex items-center gap-6 mt-4 text-sm font-mono">
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4" />
          <span className="font-bold">{formatNumber(repository.stargazers_count)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <GitFork className="w-4 h-4" />
          <span className="font-bold">{formatNumber(repository.forks_count)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" />
          <span className="font-bold">{formatNumber(repository.open_issues_count)} issues</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 pt-4 border-t-2 border-foreground">
        <Link
          to={`/repository/${repository.id}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 font-mono font-bold text-sm uppercase bg-primary text-primary-foreground border-2 border-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_hsl(var(--foreground))] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-150"
        >
          View Details
        </Link>
        <a
          href={repository.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-150"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
