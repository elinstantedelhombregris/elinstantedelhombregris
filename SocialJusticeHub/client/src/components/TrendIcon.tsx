import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

export default function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up' || trend === '↑') return <TrendingUp className="w-4 h-4 text-emerald-400" />;
  if (trend === 'down' || trend === '↓') return <TrendingDown className="w-4 h-4 text-rose-400" />;
  if (trend === 'new') return <Sparkles className="w-4 h-4 text-amber-400" />;
  return <Minus className="w-4 h-4 text-slate-500" />;
}
