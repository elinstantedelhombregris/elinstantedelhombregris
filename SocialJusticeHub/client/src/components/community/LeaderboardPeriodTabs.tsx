import { cn } from '@/lib/utils';

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'global';

interface LeaderboardPeriodTabsProps {
  value: LeaderboardPeriod;
  onChange: (value: LeaderboardPeriod) => void;
  className?: string;
}

const options: Array<{ value: LeaderboardPeriod; label: string }> = [
  { value: 'weekly', label: 'Esta semana' },
  { value: 'monthly', label: 'Este mes' },
  { value: 'global', label: 'Todo el tiempo' },
];

const LeaderboardPeriodTabs = ({ value, onChange, className }: LeaderboardPeriodTabsProps) => {
  return (
    <div
      role="tablist"
      aria-label="Período del ranking"
      className={cn(
        'inline-flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md',
        className
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-mono tracking-[0.15em] uppercase transition-all',
              isActive
                ? 'bg-white/10 text-white shadow-[0_0_12px_rgba(255,255,255,0.08)]'
                : 'text-slate-500 hover:text-slate-200'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default LeaderboardPeriodTabs;
