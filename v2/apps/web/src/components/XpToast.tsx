import { AnimatePresence, motion } from 'framer-motion';
import { Award, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import { xpEventBus, type XpEvent } from '~/lib/xp-event-bus';

const KIND_LABELS: Record<string, string> = {
  civic_assessment_completed: 'Diagnóstico ciudadano',
  goal_completed: 'Meta cumplida',
  quiz_completed: 'Cuestionario completado',
  pulse_submitted: 'Pulso enviado',
  propuesta_submitted: 'Propuesta publicada',
  community_post_created: 'Post compartido',
  content_read: 'Lectura registrada',
};

interface ToastItem extends XpEvent {
  id: number;
}

const TIMEOUT_MS = 4000;
const MAX_VISIBLE = 3;

let nextId = 1;

export function XpToast() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsub = xpEventBus.subscribe((evt) => {
      setItems((prev) => [...prev, { ...evt, id: nextId++ }].slice(-MAX_VISIBLE));
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const timers = items.map((it) =>
      window.setTimeout(() => {
        setItems((prev) => prev.filter((p) => p.id !== it.id));
      }, TIMEOUT_MS),
    );
    return () => {
      for (const t of timers) window.clearTimeout(t);
    };
  }, [items]);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {items.map((evt) => (
          <motion.div
            key={evt.id}
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto rounded-lg border border-white/10 bg-background/95 px-4 py-3 shadow-lg backdrop-blur-md"
          >
            {evt.newLevel !== null ? (
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-iris-violet" aria-hidden />
                <div>
                  <div className="text-sm font-semibold">¡Subiste al Nivel {evt.newLevel}!</div>
                  <div className="text-xs text-muted-foreground">+{evt.xpAwarded} XP</div>
                </div>
              </div>
            ) : evt.newBadges.length > 0 ? (
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-iris-violet" aria-hidden />
                <div>
                  <div className="text-sm font-semibold">Nueva insignia: {evt.newBadges[0]?.title}</div>
                  <div className="text-xs text-muted-foreground">+{evt.xpAwarded} XP</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-iris-violet" aria-hidden />
                <div>
                  <div className="text-sm font-semibold">+{evt.xpAwarded} XP</div>
                  <div className="text-xs text-muted-foreground">{KIND_LABELS[evt.kind] ?? evt.kind}</div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
