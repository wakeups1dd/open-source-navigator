import { Star, GitFork, AlertCircle, ExternalLink, Info } from 'lucide-react';
import { ScoreBadge } from './ScoreBadge';
import { SkillTag } from './SkillTag';
import type { Repository } from '@/types';
import type { ScoredRepository } from '@/services/matching';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RepoCardProps {
  repository: ScoredRepository | Repository;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

export function RepoCard({ repository }: RepoCardProps) {
  return (
    <div className="brutal-card p-3 sm:p-6 animate-fade-in sm:border-[3px] sm:shadow-[4px_4px_0px_0px_hsl(var(--foreground))] border-2 shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <img
            src={repository.owner.avatar_url}
            alt={repository.owner.login}
            className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-foreground shrink-0"
          />
          <div className="min-w-0 flex-1">
            <Link
              to={`/repository/${repository.id}`}
              className="font-mono font-bold text-base sm:text-lg hover:text-primary transition-colors truncate block"
            >
              {repository.full_name}
            </Link>
            <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 mt-1 break-words">
              {repository.description}
            </p>
          </div>
        </div>
        <div className="self-end sm:self-auto">
          {'matchScore' in repository ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-2">
                    <ScoreBadge
                      score={Math.round(repository.matchScore.total)}
                      className="w-10 h-10 sm:w-14 sm:h-14 text-sm sm:text-lg"
                    />
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-1 text-xs">
                    <p className="font-bold">Match Breakdown:</p>
                    {repository.matchScore.breakdown.map((reason, i) => (
                      <p key={i}>• {reason}</p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <ScoreBadge
              score={repository.contributionScore || 50}
              className="w-10 h-10 sm:w-14 sm:h-14 text-sm sm:text-lg"
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
        {repository.language && (
          <SkillTag label={repository.language} size="sm" />
        )}
        {repository.topics.slice(0, 3).map(topic => (
          <SkillTag key={topic} label={topic} size="sm" />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 mt-3 sm:mt-4 text-xs sm:text-sm font-mono">
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="font-bold">{formatNumber(repository.stargazers_count)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <GitFork className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="font-bold">{formatNumber(repository.forks_count)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="font-bold">{formatNumber(repository.open_issues_count)} issues</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 mt-4 pt-3 sm:pt-4 border-t-2 border-foreground">
        <Link
          to={`/repository/${repository.id}`}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 font-mono font-bold text-xs sm:text-sm uppercase bg-primary text-primary-foreground border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5"
        >
          View Details
        </Link>
        <a
          href={repository.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5"
        >
          <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </a>
      </div>
    </div>
  );
}
