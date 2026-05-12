import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'wouter';

import { useGamificationMe } from '~/lib/queries/gamification';
import { xpEventBus } from '~/lib/xp-event-bus';

export function XPChip() {
  const { data } = useGamificationMe(true);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const unsub = xpEventBus.subscribe(() => {
      setPulse((p) => p + 1);
    });
    return unsub;
  }, []);

  if (!data) return null;

  return (
    <Link
      href="/mi-perfil"
      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs hover:bg-white/10"
    >
      <motion.span
        key={pulse}
        initial={pulse === 0 ? false : { scale: 1.4 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-1"
      >
        <Zap className="h-3 w-3 text-iris-violet" aria-hidden />
        <span className="font-semibold tabular-nums">Nv{data.level}</span>
        <span className="text-muted-foreground">· {data.xp.toLocaleString('es-AR')} XP</span>
      </motion.span>
    </Link>
  );
}
