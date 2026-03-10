import { useState, useContext } from 'react';
import { UserContext } from '@/App';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';

const MOOD_OPTIONS = [
  { value: 1, emoji: '\u{1F614}', label: 'Dificil' },
  { value: 2, emoji: '\u{1F615}', label: 'Complicada' },
  { value: 3, emoji: '\u{1F610}', label: 'Normal' },
  { value: 4, emoji: '\u{1F642}', label: 'Buena' },
  { value: 5, emoji: '\u{1F60A}', label: 'Excelente' },
];

const PROGRESS_OPTIONS = [
  { value: 1, label: 'Nada' },
  { value: 2, label: 'Poco' },
  { value: 3, label: 'Algo' },
  { value: 4, label: 'Bastante' },
  { value: 5, label: 'Mucho' },
];

const WeeklyCheckin = () => {
  const userContext = useContext(UserContext);
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(3);
  const [progressRating, setProgressRating] = useState(3);
  const [highlight, setHighlight] = useState('');
  const [challenge, setChallenge] = useState('');
  const [nextWeekIntention, setNextWeekIntention] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!userContext?.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Button className="bg-blue-600" onClick={() => window.location.href = '/login'}>Iniciar sesion</Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Get Monday of current week
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  const weekOf = monday.toISOString().split('T')[0];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest('POST', '/api/checkins', {
        weekOf,
        mood,
        progressRating,
        highlight: highlight || null,
        challenge: challenge || null,
        nextWeekIntention: nextWeekIntention || null,
        goalsReviewed: [],
      });
      if (res.ok) {
        setSubmitted(true);
        queryClient.invalidateQueries({ queryKey: ['/api/checkins/current-week'] });
      }
    } catch (e) {
      console.error('Error submitting checkin:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    // Step 0: Mood
    <motion.div key="mood" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
      <h2 className="text-2xl font-serif font-bold text-white mb-2">¿Como fue tu semana?</h2>
      <p className="text-slate-400 text-sm mb-8">Selecciona lo que mejor describa tu estado general.</p>
      <div className="flex justify-center gap-4">
        {MOOD_OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => setMood(option.value)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
              mood === option.value
                ? 'bg-blue-500/20 border-blue-500/50 scale-110'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <span className="text-3xl">{option.emoji}</span>
            <span className="text-xs text-slate-400">{option.label}</span>
          </button>
        ))}
      </div>
    </motion.div>,

    // Step 1: Progress
    <motion.div key="progress" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
      <h2 className="text-2xl font-serif font-bold text-white mb-2">¿Cuanto avanzaste en tus metas?</h2>
      <p className="text-slate-400 text-sm mb-8">No importa si fue poco, lo que cuenta es la honestidad.</p>
      <div className="flex justify-center gap-3">
        {PROGRESS_OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => setProgressRating(option.value)}
            className={`px-5 py-3 rounded-xl border text-sm font-medium transition-all ${
              progressRating === option.value
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </motion.div>,

    // Step 2: Highlight
    <motion.div key="highlight" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
      <h2 className="text-2xl font-serif font-bold text-white mb-2">¿Que fue lo mejor de tu semana?</h2>
      <p className="text-slate-400 text-sm mb-6">Puede ser algo pequeño. Reconocer logros refuerza la motivacion.</p>
      <Textarea
        placeholder="Lo que mas rescato de esta semana..."
        value={highlight}
        onChange={(e) => setHighlight(e.target.value)}
        className="bg-white/5 border-white/10 text-white min-h-[120px]"
      />
    </motion.div>,

    // Step 3: Challenge
    <motion.div key="challenge" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
      <h2 className="text-2xl font-serif font-bold text-white mb-2">¿Que te costo mas?</h2>
      <p className="text-slate-400 text-sm mb-6">Identificar obstaculos es el primer paso para superarlos.</p>
      <Textarea
        placeholder="Lo que mas me costo esta semana..."
        value={challenge}
        onChange={(e) => setChallenge(e.target.value)}
        className="bg-white/5 border-white/10 text-white min-h-[120px]"
      />
    </motion.div>,

    // Step 4: Next week
    <motion.div key="next" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
      <h2 className="text-2xl font-serif font-bold text-white mb-2">¿Que queres lograr la semana que viene?</h2>
      <p className="text-slate-400 text-sm mb-6">Una sola intencion clara vale mas que diez vagas.</p>
      <Textarea
        placeholder="Mi intencion para la semana que viene..."
        value={nextWeekIntention}
        onChange={(e) => setNextWeekIntention(e.target.value)}
        className="bg-white/5 border-white/10 text-white min-h-[120px]"
      />
    </motion.div>,
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
        <Header />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-6" />
            <h1 className="text-3xl font-serif font-bold text-white mb-3">Check-in completado</h1>
            <p className="text-slate-400 mb-8">Tu reflexion semanal fue registrada. Nos vemos la semana que viene.</p>
            <Link href="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8">
                Volver al panel
              </Button>
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
      <Header />

      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-white">Check-in Semanal</h1>
            <p className="text-slate-500 text-xs mt-1">Semana del {new Date(weekOf).toLocaleDateString('es-AR')}</p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-10">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === step ? 'bg-blue-500 w-6' : idx < step ? 'bg-blue-500/50' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Current step */}
        {steps[step]}

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          <Button
            variant="ghost"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="text-slate-400 hover:text-white disabled:opacity-30"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          {step < steps.length - 1 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 h-11 rounded-xl"
            >
              Siguiente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 h-11 rounded-xl"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enviar check-in'}
            </Button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default WeeklyCheckin;
