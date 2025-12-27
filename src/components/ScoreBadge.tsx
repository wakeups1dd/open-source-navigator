import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ScoreBadge({ score, size = 'md', className }: ScoreBadgeProps) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-18 h-18 text-xl',
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-secondary';
    if (score >= 75) return 'bg-primary text-primary-foreground';
    return 'bg-muted';
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center font-mono font-bold border-[3px] border-foreground',
        'shadow-[3px_3px_0px_0px_hsl(var(--foreground))]',
        sizeClasses[size],
        getScoreColor(score),
        className
      )}
    >
      {score}
    </div>
  );
}
