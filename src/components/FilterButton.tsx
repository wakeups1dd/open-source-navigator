import { cn } from '@/lib/utils';
import type { FilterMode } from '@/types';
import { Sparkles, GraduationCap, Calendar, Layers } from 'lucide-react';

interface FilterButtonProps {
  mode: FilterMode;
  currentMode: FilterMode;
  onClick: (mode: FilterMode) => void;
}

const filterConfig: Record<FilterMode, { label: string; icon: typeof Sparkles; color: string }> = {
  all: {
    label: 'All Projects',
    icon: Layers,
    color: 'bg-background',
  },
  beginner: {
    label: 'Beginner Friendly',
    icon: Sparkles,
    color: 'bg-secondary',
  },
  gsoc: {
    label: 'GSoC Orgs',
    icon: GraduationCap,
    color: 'bg-primary',
  },
  hacktoberfest: {
    label: 'Hacktoberfest',
    icon: Calendar,
    color: 'bg-accent',
  },
};

export function FilterButton({ mode, currentMode, onClick }: FilterButtonProps) {
  const config = filterConfig[mode];
  const Icon = config.icon;
  const isActive = mode === currentMode;

  return (
    <button
      onClick={() => onClick(mode)}
      className={cn(
        'flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 font-mono font-bold text-xs sm:text-sm uppercase',
        'border-2 sm:border-[3px] border-foreground transition-all duration-150',
        'hover:-translate-x-0.5 hover:-translate-y-0.5',
        'active:translate-x-1 active:translate-y-1 active:shadow-none',
        isActive
          ? `${config.color} shadow-[4px_4px_0px_0px_hsl(var(--foreground))]`
          : 'bg-background shadow-[2px_2px_0px_0px_hsl(var(--foreground))]',
        isActive && mode === 'gsoc' && 'text-primary-foreground',
        isActive
          ? 'hover:shadow-[5px_5px_0px_0px_hsl(var(--foreground))]'
          : 'hover:shadow-[3px_3px_0px_0px_hsl(var(--foreground))]'
      )}
    >
      <Icon className="w-4 h-4" />
      {config.label}
    </button>
  );
}
