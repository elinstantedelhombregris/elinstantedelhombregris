import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, LocateFixed, MapPin, Send, WifiOff } from 'lucide-react';
import { ACCENT_BUTTON, GLASS_CARD } from '@/lib/design-tokens';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import {
  RADAR_TYPES, type RadarTypeDef, type SignalPayload,
  sendSignal, queueSignal,
} from './radar-types';

type GeoState = 'idle' | 'asking' | 'ok' | 'denied';
type Phase = 'pick' | 'write' | 'sent' | 'queued';

interface RadarCaptureProps {
  onSignalSent: () => void;
  onViewPulse: () => void;
}

/**
 * Flujo de captura: elegir tipo → escribir → enviar.
 * Nunca bloquea por falta de GPS ni de conexión (cola offline).
 */
export default function RadarCapture({ onSignalSent, onViewPulse }: RadarCaptureProps) {
  const [phase, setPhase] = useState<Phase>('pick');
  const [selected, setSelected] = useState<RadarTypeDef | null>(null);
  const [text, setText] = useState('');
  const [place, setPlace] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoState, setGeoState] = useState<GeoState>('idle');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isLoggedIn = Boolean(localStorage.getItem('authToken'));

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoState('denied');
      return;
    }
    setGeoState('asking');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoState('ok');
      },
      () => setGeoState('denied'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  };

  const pickType = (type: RadarTypeDef) => {
    setSelected(type);
    setPhase('write');
    setErrorMsg(null);
    if (geoState === 'idle') requestLocation();
  };

  useEffect(() => {
    if (phase === 'write') {
      // pequeño delay para que la transición no pelee con el teclado
      const id = setTimeout(() => textareaRef.current?.focus(), 350);
      return () => clearTimeout(id);
    }
  }, [phase]);

  const reset = () => {
    setPhase('pick');
    setSelected(null);
    setText('');
    setErrorMsg(null);
  };

  const submit = async () => {
    if (!selected || sending) return;
    const trimmed = text.trim();
    if (trimmed.length < 10) {
      setErrorMsg('Contanos un poco más — al menos 10 caracteres');
      return;
    }
    setSending(true);
    setErrorMsg(null);

    const payload: SignalPayload = {
      type: selected.key,
      text: trimmed,
      ...(place.trim() ? { location: place.trim() } : {}),
      ...(coords ? { latitude: coords.lat, longitude: coords.lng } : {}),
    };

    const result = await sendSignal(payload);
    setSending(false);

    if (result.ok) {
      setPhase('sent');
      onSignalSent();
      return;
    }
    if (result.reason === 'offline') {
      if (selected.requiresAuth) {
        setErrorMsg('Necesitás conexión para registrar este tipo de señal.');
        return;
      }
      queueSignal(payload);
      setPhase('queued');
      return;
    }
    setErrorMsg(result.message);
  };

  const needsLogin = selected?.requiresAuth && !isLoggedIn;

  return (
    <div className="flex-1 flex flex-col px-5 pb-28 pt-2">
      {/* Transiciones solo de entrada: sin depender de animaciones de salida
          (rAF puede congelarse en webviews en segundo plano) */}
        {phase === 'pick' && (
          <motion.div
            key="pick"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex-1 flex flex-col"
          >
            <motion.h1
              variants={fadeUp}
              className="font-serif text-[28px] leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 mt-4 mb-1"
            >
              ¿Qué querés hacer visible?
            </motion.h1>
            <motion.p variants={fadeUp} className="text-sm text-slate-400 mb-6">
              Tu señal se suma a la Radiografía del país. Anónima si querés, tuya siempre.
            </motion.p>

            <div className="grid grid-cols-2 gap-3">
              {RADAR_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <motion.button
                    key={type.key}
                    variants={fadeUp}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => pickType(type)}
                    className={`${GLASS_CARD} relative overflow-hidden p-4 min-h-[108px] flex flex-col items-start justify-between text-left active:bg-white/[0.06] transition-colors`}
                    data-testid={`radar-type-${type.key}`}
                  >
                    <span
                      aria-hidden
                      className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-[0.13] blur-xl"
                      style={{ backgroundColor: type.color }}
                    />
                    <Icon className="w-6 h-6 mb-2" style={{ color: type.color }} strokeWidth={1.75} />
                    <div>
                      <span className="block text-[15px] font-medium text-white">{type.label}</span>
                      <span className="block text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {type.question}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {phase === 'write' && selected && (
          <motion.div
            key="write"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex-1 flex flex-col"
          >
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-slate-400 text-sm py-3 -ml-1 w-fit"
              data-testid="radar-back"
            >
              <ArrowLeft className="w-4 h-4" /> Cambiar tipo
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium border"
                style={{ color: selected.color, borderColor: `${selected.color}55`, backgroundColor: `${selected.color}14` }}
              >
                <selected.icon className="w-3.5 h-3.5" strokeWidth={2} />
                {selected.label}
              </span>
            </div>

            <h2 className="font-serif text-[22px] leading-snug text-white mb-4">
              {selected.question}
            </h2>

            {needsLogin ? (
              <div className={`${GLASS_CARD} p-5`}>
                <p className="text-sm text-slate-300 mb-4">
                  Los {selected.key === 'compromiso' ? 'compromisos' : 'recursos'} llevan tu nombre:
                  necesitás una cuenta para registrarlos.
                </p>
                <Link
                  href="/login"
                  className={`${ACCENT_BUTTON} inline-block rounded-full px-6 py-3 text-sm font-medium`}
                >
                  Iniciar sesión
                </Link>
                <p className="text-xs text-slate-500 mt-3">
                  Los sueños, necesidades, bastas y valores no piden cuenta — podés mandarlos ya.
                </p>
              </div>
            ) : (
              <>
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={selected.placeholder}
                  maxLength={1000}
                  rows={5}
                  className="w-full rounded-2xl bg-white/[0.04] border border-white/10 focus:border-[#7D5BDE]/60 focus:outline-none focus:ring-2 focus:ring-[#7D5BDE]/25 text-white text-[16px] leading-relaxed p-4 placeholder:text-slate-600 resize-none transition-colors"
                  data-testid="radar-textarea"
                />
                <div className="flex justify-end mt-1.5">
                  <span className={`text-[11px] ${text.length > 950 ? 'text-amber-400' : 'text-slate-600'}`}>
                    {text.length}/1000
                  </span>
                </div>

                <div className="mt-3 space-y-2.5">
                  <button
                    onClick={geoState === 'ok' ? undefined : requestLocation}
                    className={`flex items-center gap-2 text-[13px] rounded-full px-3.5 py-2 border transition-colors ${
                      geoState === 'ok'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 active:bg-white/[0.07]'
                    }`}
                    data-testid="radar-geo-chip"
                  >
                    <LocateFixed className={`w-4 h-4 ${geoState === 'asking' ? 'animate-pulse' : ''}`} />
                    {geoState === 'ok' && 'Ubicación detectada'}
                    {geoState === 'asking' && 'Buscando tu ubicación…'}
                    {(geoState === 'idle' || geoState === 'denied') && 'Agregar mi ubicación'}
                  </button>

                  <div className="flex items-center gap-2 rounded-full px-3.5 py-1 border border-white/10 bg-white/[0.03]">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                    <input
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                      placeholder="Lugar (opcional): barrio, ciudad…"
                      maxLength={255}
                      className="bg-transparent text-[13px] text-slate-300 placeholder:text-slate-600 focus:outline-none py-1.5 w-full"
                      data-testid="radar-place-input"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[13px] text-red-400 mt-3"
                    data-testid="radar-error"
                  >
                    {errorMsg}
                  </motion.p>
                )}

                <div className="mt-auto pt-6">
                  <button
                    onClick={submit}
                    disabled={sending || text.trim().length === 0}
                    className={`${ACCENT_BUTTON} w-full rounded-full py-4 text-[16px] font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-40 disabled:shadow-none`}
                    data-testid="radar-send"
                  >
                    <Send className="w-5 h-5" />
                    {sending ? 'Enviando…' : 'Enviar señal'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {(phase === 'sent' || phase === 'queued') && selected && (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center px-4"
            data-testid="radar-celebration"
          >
            {/* Emisión: anillos que se expanden desde el centro */}
            <div className="relative w-32 h-32 mb-8">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute inset-0 rounded-full border"
                  style={{ borderColor: selected.color }}
                  initial={{ scale: 0.3, opacity: 0.9 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 1.8, delay: i * 0.45, repeat: Infinity, ease: 'easeOut' }}
                />
              ))}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.12, 1] }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute inset-0 m-auto w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${selected.color}22`, border: `1px solid ${selected.color}66` }}
              >
                {phase === 'queued'
                  ? <WifiOff className="w-8 h-8" style={{ color: selected.color }} />
                  : <selected.icon className="w-8 h-8" style={{ color: selected.color }} />}
              </motion.div>
            </div>

            <h2 className="font-serif text-2xl text-white mb-2">
              {phase === 'sent' ? 'Tu señal ya es parte de la Radiografía' : 'Señal guardada'}
            </h2>
            <p className="text-sm text-slate-400 max-w-[280px] mb-8">
              {phase === 'sent'
                ? 'Cada señal hace más nítido el gemelo digital de la Argentina que queremos.'
                : 'No hay conexión ahora — la mandamos sola apenas vuelva la señal.'}
            </p>

            <div className="flex flex-col gap-3 w-full max-w-[280px]">
              <button
                onClick={reset}
                className={`${ACCENT_BUTTON} rounded-full py-3.5 text-[15px] font-semibold`}
                data-testid="radar-another"
              >
                Mandar otra señal
              </button>
              <button
                onClick={onViewPulse}
                className="rounded-full py-3.5 text-[15px] text-slate-300 border border-white/10 bg-white/[0.03] active:bg-white/[0.07]"
              >
                Ver el pulso del país
              </button>
            </div>
          </motion.div>
        )}
    </div>
  );
}
