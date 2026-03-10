import { motion } from 'framer-motion';
import { Activity, Zap, Users, Target, Sparkles, Globe, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

type ActivityFeedItem = {
  id: number;
  type: 'new_initiative' | 'new_member' | 'milestone_completed' | 'task_completed' | 'comment' | 'update';
  title: string;
  description?: string | null;
  createdAt: string;
};

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `hace ${diffD}d`;
}

const TribalPulse = () => {
  const { data: feedItems = [] } = useQuery<ActivityFeedItem[]>({
    queryKey: ['activity-feed-pulse'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/activity-feed?limit=10');
      if (!res.ok) return [];
      return res.json();
    },
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_member': return <Users className="w-3 h-3 text-blue-400" />;
      case 'new_initiative': return <Sparkles className="w-3 h-3 text-purple-400" />;
      case 'task_completed': return <CheckCircle className="w-3 h-3 text-emerald-400" />;
      case 'milestone_completed': return <Target className="w-3 h-3 text-orange-400" />;
      case 'comment': return <Zap className="w-3 h-3 text-yellow-400" />;
      default: return <Activity className="w-3 h-3 text-slate-400" />;
    }
  };

  // Use feed items or a placeholder if empty
  const items = feedItems.length > 0 ? feedItems : [
    { id: 0, type: 'update' as const, title: 'La Tribu esta esperando tu primer movimiento...', createdAt: new Date().toISOString() }
  ];

  return (
    <div className="w-full bg-[#050505] border-b border-white/5 relative overflow-hidden h-10 flex items-center z-40">
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] z-10 pointer-events-none" />

      {/* Label */}
      <div className="absolute left-0 pl-4 z-20 flex items-center gap-2 bg-[#050505] h-full pr-4 border-r border-white/5">
        <div className="relative flex items-center justify-center">
          <span className="absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
          Pulso Vital
        </span>
      </div>

      {/* Ticker */}
      <div className="flex-1 overflow-hidden relative">
        <motion.div
          className="flex items-center gap-12 whitespace-nowrap pl-40"
          animate={{ x: [0, -1000] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          {[...items, ...items, ...items].map((item, i) => (
            <div key={`${item.id}-${i}`} className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-default">
              <div className="flex items-center gap-2">
                {getIcon(item.type)}
                <span className="text-xs font-medium text-slate-300">
                  {item.title}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                <Globe className="w-2 h-2" />
                {getRelativeTime(item.createdAt)}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TribalPulse;
