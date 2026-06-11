import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Radio } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useImmersion } from '@/components/ImmersionContext';
import RadarCapture from '@/components/radar/RadarCapture';
import RadarPulse from '@/components/radar/RadarPulse';
import RadarInstallPrompt from '@/components/radar/RadarInstallPrompt';
import { flushQueue, getQueue } from '@/components/radar/radar-types';

type Tab = 'captura' | 'pulso';

/**
 * Radar ¡BASTA! — PWA móvil para capturar las señales que alimentan
 * la Radiografía (/explorar-datos). Pantalla completa, sin chrome global.
 */
export default function Radar() {
  const { setImmersive } = useImmersion();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('captura');
  const [pendingCount, setPendingCount] = useState(0);

  // Pantalla completa: ocultar header/footer del sitio
  useEffect(() => {
    setImmersive(true);
    return () => setImmersive(false);
  }, [setImmersive]);

  // Manifest + meta tags de instalación, solo mientras el Radar está montado
  useEffect(() => {
    const tags: HTMLElement[] = [];
    const addLink = (rel: string, href: string, extra?: Record<string, string>) => {
      const el = document.createElement('link');
      el.rel = rel;
      el.href = href;
      Object.entries(extra ?? {}).forEach(([k, v]) => el.setAttribute(k, v));
      document.head.appendChild(el);
      tags.push(el);
    };
    const addMeta = (name: string, content: string) => {
      const el = document.createElement('meta');
      el.name = name;
      el.content = content;
      document.head.appendChild(el);
      tags.push(el);
    };
    addLink('manifest', '/radar.webmanifest');
    addLink('apple-touch-icon', '/radar-icon-192.png', { sizes: '192x192' });
    addMeta('apple-mobile-web-app-capable', 'yes');
    addMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    addMeta('apple-mobile-web-app-title', 'Radar');
    addMeta('theme-color', '#0a0a0a');

    const prevTitle = document.title;
    document.title = 'Radar ¡BASTA! — capturá señales del territorio';
    return () => {
      tags.forEach((el) => el.remove());
      document.title = prevTitle;
    };
  }, []);

  // Cola offline: reintentar al montar y cuando vuelve la conexión
  const flush = useCallback(async () => {
    const { sent, remaining } = await flushQueue();
    setPendingCount(remaining);
    if (sent > 0) {
      queryClient.invalidateQueries({ queryKey: ['/api/radar/resumen'] });
    }
  }, [queryClient]);

  useEffect(() => {
    setPendingCount(getQueue().length);
    void flush();
    const onOnline = () => void flush();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [flush]);

  const onSignalSent = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/radar/resumen'] });
  }, [queryClient]);

  return (
    <div className="relative min-h-[100dvh] bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
      {/* Fondo: anillos de radar latiendo, muy sutiles */}
      <div aria-hidden className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="absolute w-[140vw] h-[140vw] max-w-[800px] max-h-[800px]">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 m-auto rounded-full border border-[#7D5BDE]"
              style={{ width: `${36 + i * 30}%`, height: `${36 + i * 30}%` }}
              initial={{ opacity: 0.05 }}
              animate={{ opacity: [0.04, 0.1, 0.04] }}
              transition={{ duration: 4, delay: i * 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
      </div>

      {/* Header propio del Radar */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)] pb-2">
        <div className="flex items-center gap-2">
          <img src="/radar-icon-192.png" alt="" className="w-7 h-7 rounded-lg" />
          <span className="text-[13px] font-medium tracking-wide text-slate-200">
            Radar <span className="text-[#9D85E8]">¡BASTA!</span>
          </span>
        </div>
        {pendingCount > 0 && (
          <span
            className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-full px-2.5 py-1"
            data-testid="radar-pending-badge"
          >
            {pendingCount} {pendingCount === 1 ? 'señal en espera' : 'señales en espera'}
          </span>
        )}
      </header>

      <div className="relative z-10">
        <RadarInstallPrompt />
      </div>

      <main className="relative z-10 flex-1 flex flex-col">
        {tab === 'captura' ? (
          <RadarCapture onSignalSent={onSignalSent} onViewPulse={() => setTab('pulso')} />
        ) : (
          <RadarPulse />
        )}
      </main>

      {/* Tab bar inferior */}
      <nav className="fixed bottom-0 inset-x-0 z-20 bg-[#0a0a0a]/85 backdrop-blur-md border-t border-white/10 pb-[max(env(safe-area-inset-bottom),10px)]">
        <div className="grid grid-cols-2 max-w-md mx-auto">
          {([
            { key: 'captura', label: 'Capturar', icon: Radio },
            { key: 'pulso', label: 'El Pulso', icon: Activity },
          ] as const).map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex flex-col items-center gap-1 pt-3 pb-1.5 min-h-[56px]"
                data-testid={`radar-tab-${key}`}
              >
                <Icon
                  className="w-5 h-5 transition-colors"
                  style={{ color: active ? '#9D85E8' : '#64748b' }}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                <span
                  className="text-[11px] transition-colors"
                  style={{ color: active ? '#cbd5e1' : '#64748b' }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
