import { cn } from '@/lib/utils';

interface SkillTagProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function SkillTag({ label, selected, onClick, size = 'md' }: SkillTagProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'font-mono font-bold border-2 border-foreground transition-all duration-150',
        'hover:-translate-x-0.5 hover:-translate-y-0.5',
        'active:translate-x-0.5 active:translate-y-0.5',
        sizeClasses[size],
        selected
          ? 'bg-primary text-primary-foreground shadow-[3px_3px_0px_0px_hsl(var(--foreground))]'
          : 'bg-background text-foreground shadow-[2px_2px_0px_0px_hsl(var(--foreground))]',
        selected && 'hover:shadow-[4px_4px_0px_0px_hsl(var(--foreground))]',
        !selected && 'hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))]'
      )}
    >
      {label}
    </button>
  );
}
