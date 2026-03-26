import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'wouter';
import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Eye,
  Compass,
  Sprout,
  Map,
  Users,
  ChevronRight,
  ChevronLeft,
  Check,
  Mail,
  MapPin,
  Sparkles,
  Activity,
  Heart,
  Home,
  Briefcase,
  Wallet,
  GraduationCap,
  Orbit,
  PartyPopper,
  Leaf,
  Globe2,
  type LucideIcon,
  SkipForward,
  Send,
  ArrowRight
} from 'lucide-react';

const PILLARS = [
  { icon: Eye, label: 'Visión', desc: 'Tu brújula interna para navegar el cambio' },
  { icon: Compass, label: 'Hombre Gris', desc: 'Reconocer lo que te frena para liberarte' },
  { icon: Sprout, label: 'Semilla', desc: 'Un acto simple pero poderoso cada día' },
  { icon: Map, label: 'Mapa', desc: 'Tu diagnóstico personal de 12 áreas de vida' },
  { icon: Users, label: 'Tribu', desc: 'Comunidad que transforma junta' },
];

const LIFE_AREAS: { name: string; icon: LucideIcon }[] = [
  { name: 'Salud', icon: Activity },
  { name: 'Apariencia', icon: Sparkles },
  { name: 'Amor', icon: Heart },
  { name: 'Familia', icon: Home },
  { name: 'Amigos', icon: Users },
  { name: 'Carrera', icon: Briefcase },
  { name: 'Dinero', icon: Wallet },
  { name: 'Crecimiento Personal', icon: GraduationCap },
  { name: 'Espiritualidad', icon: Orbit },
  { name: 'Recreación', icon: PartyPopper },
  { name: 'Entorno', icon: Leaf },
  { name: 'Comunidad', icon: Globe2 },
];

const TOTAL_STEPS = 5;

const Bienvenida = () => {
  const userContext = useContext(UserContext);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [emailSent, setEmailSent] = useState(false);

  // Redirect if not logged in or already onboarded
  useEffect(() => {
    if (!userContext?.user) {
      setLocation('/login');
    } else if (userContext.user.onboardingCompleted) {
      setLocation('/dashboard');
    }
  }, [userContext?.user, setLocation]);

  // Fetch provinces
  const { data: provinces = [] } = useQuery<{ id: number; name: string }[]>({
    queryKey: ['/api/geographic/provinces'],
    staleTime: 300000,
  });

  // Fetch cities when province is selected
  const selectedProvinceId = provinces.find(p => p.name === selectedProvince)?.id;
  const { data: cities = [] } = useQuery<{ id: number; name: string }[]>({
    queryKey: [`/api/geographic/provinces/${selectedProvinceId}/cities`],
    enabled: !!selectedProvinceId,
    staleTime: 300000,
  });

  // Save location mutation
  const saveLocationMutation = useMutation({
    mutationFn: async (location: string) => {
      const response = await apiRequest('PUT', '/api/auth/profile', { location });
      if (!response.ok) throw new Error('Failed to save location');
      return response.json();
    },
    onSuccess: (data) => {
      if (userContext) userContext.setUser(data.user);
    },
  });

  // Save interests mutation
  const saveInterestsMutation = useMutation({
    mutationFn: async (interests: string[]) => {
      const response = await apiRequest('POST', '/api/user/interests', { interests });
      if (!response.ok) throw new Error('Failed to save interests');
      return response.json();
    },
  });

  // Send verification email mutation
  const sendVerificationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/send-verification');
      if (!response.ok) throw new Error('Failed to send verification');
      return response.json();
    },
    onSuccess: () => {
      setEmailSent(true);
      toast({ title: 'Email enviado', description: 'Revisá tu casilla de correo' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo enviar el email. Intentá más tarde.', variant: 'destructive' });
    },
  });

  // Complete onboarding mutation
  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/complete-onboarding');
      if (!response.ok) throw new Error('Failed to complete onboarding');
      return response.json();
    },
    onSuccess: (data) => {
      if (userContext) userContext.setUser(data.user);
    },
  });

  const user = userContext?.user;
  if (!user) return null;

  // Skip location step if user already provided location during registration
  const skipLocationStep = !!user.location;

  const handleNext = async () => {
    // Save data on step transitions
    if (step === 1 && selectedProvince) {
      const location = selectedCity ? `${selectedCity}, ${selectedProvince}` : selectedProvince;
      saveLocationMutation.mutate(location);
    }
    if (step === 2 && selectedInterests.length > 0) {
      saveInterestsMutation.mutate(selectedInterests);
    }
    let nextStep = step + 1;
    // Skip location step if already provided during registration
    if (nextStep === 1 && skipLocationStep) {
      nextStep = 2;
    }
    if (nextStep < TOTAL_STEPS) {
      setStep(nextStep);
    }
  };

  const handleFinish = async (destination: string) => {
    // Save any pending interests
    if (selectedInterests.length > 0) {
      saveInterestsMutation.mutate(selectedInterests);
    }
    await completeOnboardingMutation.mutateAsync();
    setLocation(destination);
  };

  const toggleInterest = (name: string) => {
    setSelectedInterests(prev =>
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  const fadeVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.08 } },
  };

  const staggerItem = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Step indicator */}
      <div className="fixed top-4 right-6 z-50 text-xs font-mono text-slate-500">
        {step + 1} / {TOTAL_STEPS}
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {/* Step 0: Welcome */}
            {step === 0 && (
              <motion.div key="welcome" {...fadeVariants} className="text-center space-y-10">
                <div className="space-y-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  >
                    <h1 className="text-4xl md:text-5xl font-bold font-serif">
                      Bienvenido/a,{' '}
                      <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {user.name.split(' ')[0]}
                      </span>
                    </h1>
                  </motion.div>
                  <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                    ¡BASTA! se construye sobre 5 pilares. Cada uno es una herramienta para tu transformación.
                  </p>
                </div>

                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-1 sm:grid-cols-5 gap-4"
                >
                  {PILLARS.map((pillar) => {
                    const Icon = pillar.icon;
                    return (
                      <motion.div
                        key={pillar.label}
                        variants={staggerItem}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:border-blue-500/30 hover:bg-white/[0.07] transition-all duration-300"
                      >
                        <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-blue-400" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-200 mb-1">{pillar.label}</h3>
                        <p className="text-[11px] text-slate-500 leading-tight">{pillar.desc}</p>
                      </motion.div>
                    );
                  })}
                </motion.div>

                <Button
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-12 text-base font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all"
                >
                  Empezar
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {/* Step 1: Province/City selection */}
            {step === 1 && (
              <motion.div key="location" {...fadeVariants} className="space-y-8">
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                    <MapPin className="h-7 w-7 text-emerald-400" />
                  </div>
                  <h2 className="text-3xl font-bold font-serif">¿De dónde sos?</h2>
                  <p className="text-slate-400 max-w-sm mx-auto">
                    Esto nos ayuda a conectarte con tu comunidad local y mostrarte contenido relevante.
                  </p>
                </div>

                <div className="space-y-4 max-w-sm mx-auto">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Provincia</label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => {
                        setSelectedProvince(e.target.value);
                        setSelectedCity('');
                      }}
                      className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white px-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                    >
                      <option value="" className="bg-[#1a1a1a]">Seleccionar provincia...</option>
                      {provinces.map((p) => (
                        <option key={p.id} value={p.name} className="bg-[#1a1a1a]">{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedProvince && cities.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Ciudad</label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white px-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-colors"
                      >
                        <option value="" className="bg-[#1a1a1a]">Seleccionar ciudad...</option>
                        {cities.map((c) => (
                          <option key={c.id} value={c.name} className="bg-[#1a1a1a]">{c.name}</option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    variant="ghost"
                    onClick={handleNext}
                    className="text-slate-500 hover:text-slate-300 hover:bg-white/5"
                  >
                    <SkipForward className="mr-2 h-4 w-4" />
                    Omitir
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!selectedProvince}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-11 font-bold disabled:opacity-30 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                  >
                    Continuar
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Interest areas */}
            {step === 2 && (
              <motion.div key="interests" {...fadeVariants} className="space-y-8">
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                    <Sparkles className="h-7 w-7 text-purple-400" />
                  </div>
                  <h2 className="text-3xl font-bold font-serif">¿Qué áreas te importan más?</h2>
                  <p className="text-slate-400 max-w-sm mx-auto">
                    Elegí al menos 3 áreas de vida en las que quieras enfocarte.
                  </p>
                </div>

                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                >
                  {LIFE_AREAS.map((area) => {
                    const Icon = area.icon;
                    const isSelected = selectedInterests.includes(area.name);
                    return (
                      <motion.button
                        key={area.name}
                        variants={staggerItem}
                        onClick={() => toggleInterest(area.name)}
                        className={`relative p-4 rounded-xl border text-left transition-all duration-300 ${
                          isSelected
                            ? 'bg-blue-500/10 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <Check className="h-4 w-4 text-blue-400" />
                          </div>
                        )}
                        <Icon className={`h-5 w-5 mb-2 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                        <span className={`text-sm font-medium ${isSelected ? 'text-blue-200' : 'text-slate-300'}`}>
                          {area.name}
                        </span>
                      </motion.button>
                    );
                  })}
                </motion.div>

                <div className="text-center text-sm text-slate-500">
                  {selectedInterests.length} de 12 seleccionadas
                  {selectedInterests.length > 0 && selectedInterests.length < 3 && (
                    <span className="text-amber-400/80 ml-2">· Elegí al menos 3</span>
                  )}
                </div>

                <div className="flex items-center justify-center gap-4 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(step === 2 && skipLocationStep ? 0 : step - 1)}
                    className="text-slate-500 hover:text-slate-300 hover:bg-white/5"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Atrás
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={selectedInterests.length < 3}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-11 font-bold disabled:opacity-30 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                  >
                    Continuar
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Email verification */}
            {step === 3 && (
              <motion.div key="email" {...fadeVariants} className="space-y-8 text-center">
                <div className="space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                    <Mail className="h-7 w-7 text-amber-400" />
                  </div>
                  <h2 className="text-3xl font-bold font-serif">Verificá tu email</h2>
                  <p className="text-slate-400 max-w-sm mx-auto">
                    Esto protege tu cuenta y te permite recuperar tu contraseña.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-sm mx-auto">
                  <p className="text-slate-300 text-sm mb-1">Tu email registrado:</p>
                  <p className="text-white font-mono text-base mb-6">{user.email}</p>

                  {emailSent ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-emerald-400">
                        <Check className="h-5 w-5" />
                        <span className="font-medium">Email enviado</span>
                      </div>
                      <p className="text-slate-500 text-sm">
                        Revisá tu casilla. Podés verificar en cualquier momento.
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={() => sendVerificationMutation.mutate()}
                      disabled={sendVerificationMutation.isPending}
                      className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-medium"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {sendVerificationMutation.isPending ? 'Enviando...' : 'Enviar email de verificación'}
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(step - 1)}
                    className="text-slate-500 hover:text-slate-300 hover:bg-white/5"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Atrás
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-11 font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                  >
                    Continuar
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: CTA */}
            {step === 4 && (
              <motion.div key="cta" {...fadeVariants} className="text-center space-y-10">
                <div className="space-y-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="text-5xl mb-4"
                  >
                    🎯
                  </motion.div>
                  <h2 className="text-3xl md:text-4xl font-bold font-serif">
                    ¡Todo listo,{' '}
                    <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                      {user.name.split(' ')[0]}
                    </span>
                    !
                  </h2>
                  <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                    Tu espacio está preparado. ¿Por dónde querés empezar?
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    onClick={() => handleFinish('/life-areas')}
                    disabled={completeOnboardingMutation.isPending}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-8 h-12 text-base font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all"
                  >
                    <Map className="mr-2 h-5 w-5" />
                    Hacer el Diagnóstico
                  </Button>
                  <Button
                    onClick={() => handleFinish('/dashboard')}
                    disabled={completeOnboardingMutation.isPending}
                    variant="outline"
                    className="w-full sm:w-auto border-white/20 text-slate-300 hover:bg-white/10 hover:text-white px-8 h-12 text-base font-medium"
                  >
                    Ir al Panel
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => setStep(step - 1)}
                  className="text-slate-600 hover:text-slate-400 hover:bg-white/5 text-sm"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Volver
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Bienvenida;
