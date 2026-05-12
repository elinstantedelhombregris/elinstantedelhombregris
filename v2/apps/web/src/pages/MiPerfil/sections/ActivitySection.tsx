import type { GamificationMe } from '~/lib/queries/gamification';

const KIND_LABELS: Record<string, string> = {
  civic_assessment_completed: 'Diagnóstico ciudadano',
  goal_completed: 'Meta cumplida',
  quiz_completed: 'Cuestionario completado',
  pulse_submitted: 'Pulso enviado',
  propuesta_submitted: 'Propuesta publicada',
  community_post_created: 'Post compartido',
  content_read: 'Artículo leído',
};

const rtf = new Intl.RelativeTimeFormat('es-AR', { numeric: 'auto' });

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffSec = Math.round((then - now) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return rtf.format(diffSec, 'second');
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
  if (abs < 2592000) return rtf.format(Math.round(diffSec / 86400), 'day');
  if (abs < 31536000) return rtf.format(Math.round(diffSec / 2592000), 'month');
  return rtf.format(Math.round(diffSec / 31536000), 'year');
}

export function ActivitySection({ items }: { items: GamificationMe['recentActivity'] }) {
  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h2 className="font-serif text-lg font-semibold">Actividad reciente</h2>
        <p className="mt-2 text-sm text-muted-foreground">Tu actividad va a aparecer acá.</p>
      </section>
    );
  }
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <h2 className="font-serif text-lg font-semibold">Actividad reciente</h2>
      <ul className="mt-3 divide-y divide-white/5">
        {items.map((it) => (
          <li key={it.id} className="flex items-center justify-between py-2 text-sm">
            <span>
              <span className="font-semibold text-iris-violet">+{it.xpAwarded} XP</span>{' '}
              — {KIND_LABELS[it.kind] ?? it.kind}
            </span>
            <span className="text-xs text-muted-foreground">{relativeTime(it.createdAt)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
