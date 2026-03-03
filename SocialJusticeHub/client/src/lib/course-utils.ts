export const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'vision': return 'Visión';
    case 'action': return 'Acción';
    case 'community': return 'Comunidad';
    case 'reflection': return 'Reflexión';
    case 'hombre-gris': return 'Hombre Gris';
    case 'economia': return 'Economía';
    case 'comunicacion': return 'Comunicación';
    case 'civica': return 'Cívica';
    default: return category;
  }
};

export const getLevelLabel = (level: string): string => {
  switch (level) {
    case 'beginner': return 'Principiante';
    case 'intermediate': return 'Intermedio';
    case 'advanced': return 'Avanzado';
    default: return level;
  }
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
};

export const levelColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
};
