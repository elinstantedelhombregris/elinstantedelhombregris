import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Share, SquarePlus, X } from 'lucide-react';
import { GLASS_CARD } from '@/lib/design-tokens';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'radar-install-dismissed';

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Banner de instalación: en Android usa el prompt nativo (beforeinstallprompt),
 * en iOS muestra los pasos de "Agregar a inicio". Desaparece si ya está instalada.
 */
export default function RadarInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSSteps, setShowIOSSteps] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || sessionStorage.getItem(DISMISS_KEY)) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);

    if (isIOS()) setVisible(true);

    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* sin storage, solo esta vista */ }
  };

  const install = async () => {
    if (installEvent) {
      await installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      if (outcome === 'accepted') setVisible(false);
    } else if (isIOS()) {
      setShowIOSSteps((v) => !v);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className={`${GLASS_CARD} mx-5 mt-2 p-3.5`}
          data-testid="radar-install-banner"
        >
          <div className="flex items-center gap-3">
            <img src="/radar-icon-192.png" alt="" className="w-9 h-9 rounded-xl shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-white font-medium leading-tight">
                Llevá el Radar en tu teléfono
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Se instala como una app, sin tiendas ni descargas.
              </p>
            </div>
            <button
              onClick={install}
              className="shrink-0 flex items-center gap-1.5 rounded-full bg-[#7D5BDE] active:bg-[#8D6FE4] text-white text-[12px] font-medium px-3.5 py-2"
              data-testid="radar-install-cta"
            >
              <Download className="w-3.5 h-3.5" /> Instalar
            </button>
            <button onClick={dismiss} aria-label="Cerrar" className="shrink-0 text-slate-500 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {showIOSSteps && (
            <motion.ol
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 border-t border-white/10 space-y-2 text-[12px] text-slate-400"
            >
              <li className="flex items-center gap-2">
                <Share className="w-4 h-4 text-[#9D85E8] shrink-0" />
                1. Tocá <strong className="text-slate-200">Compartir</strong> en la barra de Safari
              </li>
              <li className="flex items-center gap-2">
                <SquarePlus className="w-4 h-4 text-[#9D85E8] shrink-0" />
                2. Elegí <strong className="text-slate-200">Agregar a inicio</strong>
              </li>
            </motion.ol>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
