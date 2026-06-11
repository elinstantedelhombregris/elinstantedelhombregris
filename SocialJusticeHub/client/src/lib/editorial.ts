// Dark-theme color maps for the plata editorial system.
// Category names match blog post categories stored in the DB.
export const categoryColorsDark: Record<string, string> = {
  'Comunidad': 'border bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Organización': 'border bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Despertar': 'border bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Servicio': 'border bg-rose-500/10 text-rose-400 border-rose-500/20',
  'Sistemas': 'border bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Diseño': 'border bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Amabilidad': 'border bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Reflexión': 'border bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Decisión Colectiva': 'border bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
};

export const getCategoryColorDark = (category: string): string =>
  categoryColorsDark[category] || 'border bg-white/5 text-slate-300 border-white/10';

export const levelColorsDark: Record<string, string> = {
  beginner: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  intermediate: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  advanced: 'bg-red-500/15 text-red-300 border border-red-500/30',
};
