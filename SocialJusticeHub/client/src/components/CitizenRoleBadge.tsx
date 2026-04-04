import type { CitizenRole } from '../../../shared/strategic-initiatives';
import { CITIZEN_ROLE_META } from '@/lib/initiative-utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CitizenRoleBadgeProps {
  role: CitizenRole;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export default function CitizenRoleBadge({ role, size = 'sm', showLabel = true }: CitizenRoleBadgeProps) {
  const meta = CITIZEN_ROLE_META[role];
  if (!meta) return null;

  const Icon = meta.icon;
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 border border-white/10 ${textSize} text-slate-300 hover:bg-white/15 transition-colors`}>
            <Icon className={iconSize} />
            {showLabel && <span>{meta.label}</span>}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm font-medium">{meta.label}</p>
          <p className="text-xs text-slate-400">{meta.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface CitizenRoleListProps {
  roles: CitizenRole[];
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function CitizenRoleList({ roles, size = 'sm', showLabel = true }: CitizenRoleListProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {roles.map(role => (
        <CitizenRoleBadge key={role} role={role} size={size} showLabel={showLabel} />
      ))}
    </div>
  );
}
