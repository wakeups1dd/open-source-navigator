import { ExternalLink, Clock, Target } from 'lucide-react';
import { SkillTag } from './SkillTag';
import type { Issue } from '@/types';
import type { ScoredIssue } from '@/services/matching';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface IssueCardProps {
  issue: ScoredIssue | Issue;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return `${Math.floor(diffInDays / 30)} months ago`;
}

const difficultyColors = {
  easy: 'bg-secondary text-secondary-foreground',
  medium: 'bg-primary text-primary-foreground',
  hard: 'bg-destructive text-destructive-foreground',
};

export function IssueCard({ issue }: IssueCardProps) {
  return (
    <div className="brutal-card p-3 sm:p-5 animate-fade-in sm:border-[3px] sm:shadow-[4px_4px_0px_0px_hsl(var(--foreground))] border-2 shadow-[2px_2px_0px_0px_hsl(var(--foreground))]">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground">
              {issue.repository.full_name}
            </span>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <span className="text-xs font-mono text-muted-foreground">
              #{issue.number}
            </span>
          </div>
          <h3 className="font-mono font-bold text-sm sm:text-base leading-tight line-clamp-2 break-words">
            {issue.title}
          </h3>
        </div>
        <div
          className={cn(
            'px-2 sm:px-3 py-1 font-mono font-bold text-[10px] sm:text-xs uppercase border-2 border-foreground self-start sm:self-auto shrink-0',
            difficultyColors[issue.difficulty]
          )}
        >
          {issue.difficulty}
        </div>
      </div>

      <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground line-clamp-2">
        {issue.explanation}
      </p>

      <div className="flex flex-wrap gap-2 mt-3">
        {issue.requiredSkills.map(skill => (
          <SkillTag key={skill} label={skill} size="sm" />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {issue.labels.map(label => (
          <span
            key={label.id}
            className="px-2 py-0.5 text-[10px] sm:text-xs font-mono font-bold border border-foreground"
            style={{ backgroundColor: `#${label.color}20` }}
          >
            {label.name}
          </span>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 sm:mt-4 pt-3 border-t-2 border-foreground gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(issue.created_at)}
          </div>
          {'matchScore' in issue && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-primary text-primary-foreground border border-foreground text-xs font-mono font-bold">
                    <Target className="w-3 h-3" />
                    {Math.round(issue.matchScore.total)}%
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-1 text-xs">
                    <p className="font-bold">Why recommended:</p>
                    {issue.matchScore.breakdown.map((reason, i) => (
                      <p key={i}>• {reason}</p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <a
          href={issue.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3 py-1.5 font-mono font-bold text-xs uppercase bg-background border-2 border-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))] hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))] transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5 w-full sm:w-auto"
        >
          Open Issue
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
