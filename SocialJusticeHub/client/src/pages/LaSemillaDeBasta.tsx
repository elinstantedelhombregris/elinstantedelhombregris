import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useContext, useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Users,
  Target,
  Eye,
  Globe,
  Sprout,
  Droplets,
  Sun,
  Flame,
  MapPin,
  Wind
} from 'lucide-react';
import PowerCTA from '@/components/PowerCTA';
import CommitmentModal from '@/components/CommitmentModal';
import NextStepCard from '@/components/NextStepCard';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { UserContext } from '@/App';

type CommitmentType = 'initial' | 'intermediate' | 'public';

type CommitmentSubmission = {
  type: CommitmentType;
  data: {
    personalCommitment: string;
    actionType: string;
    communityCommitment: string;
  };
  timestamp: string;
};

type SemilleroCommitment = {
  id: number;
  commitmentText: string;
  commitmentType: CommitmentType;
  province?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string | null;
  user: {
    id: number;
    name: string;
    username: string;
  };
};

type SemilleroData = {
  commitments: SemilleroCommitment[];
  stats: {
    total: number;
    last24h: number;
    byType: Array<{ type: string; total: number }>;
  };
};

const semilleroQueryKey = ['semilla-commitments'] as const;

const emptySemilleroData: SemilleroData = {
  commitments: [],
  stats: {
    total: 0,
    last24h: 0,
    byType: []
  }
};

const actionTypeLabels: Record<string, string> = {
  community: 'Participar en mi comunidad local',
  education: 'Educar a otros sobre temas importantes',
  volunteer: 'Voluntariado en organizaciones',
  advocacy: 'Defender causas que me importan',
  environment: 'Cuidar el medio ambiente',
  transparency: 'Promover transparencia y honestidad',
  other: 'Otra acción específica'
};

const getBrowserCoordinates = async (): Promise<{ latitude: number; longitude: number } | null> => {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return null;
  }

  try {
    if ('permissions' in navigator && navigator.permissions?.query) {
      const geolocationStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      if (geolocationStatus.state === 'denied') {
        return null;
      }
    }
  } catch {
    // Ignore permissions API errors; fallback to geolocation request.
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => resolve(null),
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000
      }
    );
  });
};

const LaSemillaDeBasta = () => {
  const userContext = useContext(UserContext);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const rootPathLength = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

  const { data: semilleroData = emptySemilleroData } = useQuery({
    queryKey: semilleroQueryKey,
    queryFn: async (): Promise<SemilleroData> => {
      try {
        const response = await apiRequest('GET', '/api/commitments?limit=80');
        if (!response.ok) return emptySemilleroData;

        const payload = await response.json().catch(() => null);
        if (!payload?.data) return emptySemilleroData;
        return payload.data as SemilleroData;
      } catch (error) {
        return emptySemilleroData;
      }
    },
  });

  const handleCommitment = async (commitmentData: CommitmentSubmission) => {
    const personalCommitment = commitmentData.data.personalCommitment.trim();
    const communityCommitment = commitmentData.data.communityCommitment.trim();

    if (!personalCommitment) {
      toast({
        title: 'Compromiso incompleto',
        description: 'Escribí tu compromiso personal para sembrarlo en el semillero.',
        variant: 'destructive'
      });
      throw new Error('MISSING_PERSONAL_COMMITMENT');
    }

    if (!userContext?.isLoggedIn) {
      toast({
        title: 'Iniciá sesión para sembrar',
        description: 'Necesitás iniciar sesión para registrar tu compromiso en el semillero.',
        variant: 'destructive'
      });
      setLocation('/login');
      throw new Error('AUTH_REQUIRED');
    }

    const actionLabel = actionTypeLabels[commitmentData.data.actionType] ?? commitmentData.data.actionType;
    const commitmentText = [
      personalCommitment,
      actionLabel ? `Acción semilla: ${actionLabel}` : '',
      communityCommitment ? `Plan de riego: ${communityCommitment}` : ''
    ].filter(Boolean).join('\n');

    const coordinates = await getBrowserCoordinates();

    const commitmentPayload: {
      commitmentText: string;
      commitmentType: CommitmentType;
      latitude?: number;
      longitude?: number;
    } = {
      commitmentText,
      commitmentType: commitmentData.type
    };

    if (coordinates) {
      commitmentPayload.latitude = coordinates.latitude;
      commitmentPayload.longitude = coordinates.longitude;
    }

    const response = await apiRequest('POST', '/api/commitment', {
      ...commitmentPayload
    });

    if (response.status === 401 || response.status === 403) {
      toast({
        title: 'Sesión requerida',
        description: 'Tu sesión no está activa. Volvé a iniciar para registrar tu compromiso.',
        variant: 'destructive'
      });
      setLocation('/login');
      throw new Error('AUTH_REQUIRED');
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message = errorBody?.message ?? 'No se pudo registrar el compromiso.';
      toast({
        title: 'Error al registrar',
        description: message,
        variant: 'destructive'
      });
      throw new Error(message);
    }

    await queryClient.invalidateQueries({ queryKey: semilleroQueryKey });

    toast({
      title: 'Semilla registrada',
      description: 'Tu compromiso ya forma parte del semillero vivo.'
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'La Semilla | ¡BASTA!';
  }, []);

  const semillaIndicators = [
    {
      id: 'semillas',
      label: 'Semillas plantadas',
      value: semilleroData.stats.total,
      unit: '',
      trend: 'up' as const,
      color: 'green' as const,
      icon: <Sprout className="w-6 h-6" />,
      description: 'Personas que dejaron de contemplar y empezaron a sostener'
    },
    {
      id: 'recientes',
      label: 'Últimas 24 horas',
      value: semilleroData.stats.last24h,
      unit: '',
      trend: 'up' as const,
      color: 'blue' as const,
      icon: <Droplets className="w-6 h-6" />,
      description: 'Compromisos nuevos en el último día'
    },
    {
      id: 'misiones',
      label: 'Misiones activas',
      value: semilleroData.stats.byType?.length ?? 0,
      unit: '',
      trend: 'up' as const,
      color: 'purple' as const,
      icon: <Target className="w-6 h-6" />,
      description: 'Tipos de acción elegidos por la comunidad'
    }
  ];

  const germinationSteps = [
    {
      step: 1,
      title: "El entusiasmo se seca",
      subtitle: "Cuando la inspiración no alcanza",
      description: "El primer día es fácil. El compromiso brilla, te sentís parte de algo, la energía sobra. Después llega el martes. Y el siguiente. Y la semilla no creció. La mayoría abandona acá — no por cobardía, sino porque confundieron inspiración con compromiso. La inspiración es un fósforo. El compromiso es leña. Lo que buscás no es motivación. Es la disciplina de regar cuando no sentís nada.",
      icon: <Flame className="w-12 h-12" />,
      gradient: "from-amber-900/80 to-orange-900/80",
      details: []
    },
    {
      step: 2,
      title: "El entorno empuja para atrás",
      subtitle: "Cuando todo sigue igual menos vos",
      description: "Vas a cambiar y tu entorno no. Tu familia, tu laburo, tu barrio — todo sigue operando con las reglas de siempre. La presión no es explícita. Nadie te dice \"dejá de intentar.\" Es más sutil: una mirada, un chiste, un \"¿y eso para qué sirve?\" La semilla crece contra gravedad. Siempre fue así. El que planta no espera permiso del suelo.",
      icon: <Wind className="w-12 h-12" />,
      gradient: "from-blue-600/80 to-cyan-600/80",
      details: []
    },
    {
      step: 3,
      title: "Te convertís en lo que viniste a cambiar",
      subtitle: "Cuando el compromiso se vuelve ego",
      description: "Esta es la más peligrosa y nadie la ve venir. Empezás a sostener algo y un día te descubrís juzgando al que no lo hace. Sintiéndote superior. Usando tu compromiso como identidad, no como servicio. La semilla que se mira a sí misma deja de crecer. Humildad no es el punto de partida — es lo que tenés que reconquistar cada vez que te olvidás.",
      icon: <Eye className="w-12 h-12" />,
      gradient: "from-emerald-600/80 to-green-600/80",
      details: []
    },
    {
      step: 4,
      title: "Lo que plantaste da fruto y no lo controlás",
      subtitle: "Cuando soltar es el último servicio",
      description: "Si sostenés, algo crece. Pero no crece como vos imaginaste. Otros lo toman, lo transforman, lo llevan donde no esperabas. Eso no es fracaso — es éxito. La semilla nunca fue tuya. El compromiso es plantar. El fruto le pertenece al territorio. Soltar el control es el último acto de servicio.",
      icon: <Sprout className="w-12 h-12" />,
      gradient: "from-yellow-500/80 to-orange-500/80",
      details: []
    }
  ];

  const propagacion = [
    {
      nivel: "01",
      titulo: "Tu Compromiso",
      subtitulo: "Una declaración que nadie te pidió",
      descripcion: "Todo empieza con alguien que decide sin esperar consenso. No necesitás un título. Necesitás algo concreto que te obligue a ser distinto mañana.",
      alcance: "1 persona",
      icon: <Sprout className="w-6 h-6" />
    },
    {
      nivel: "02",
      titulo: "Tu Círculo",
      subtitulo: "Los que aparecen sin que los busques",
      descripcion: "Tu coherencia atrae a otros. Un círculo nace cuando varias personas deciden sostener un estándar compartido en el mismo territorio. No se reclutan — se reconocen.",
      alcance: "5–10 personas",
      icon: <Heart className="w-6 h-6" />
    },
    {
      nivel: "03",
      titulo: "Tu Célula",
      subtitulo: "La unidad mínima de servicio",
      descripcion: "Varios círculos forman una célula territorial. Relevamiento, verificación, acompañamiento. Lo suficientemente chica para conocerse. Lo suficientemente grande para mover algo.",
      alcance: "50–200 personas",
      icon: <Users className="w-6 h-6" />
    },
    {
      nivel: "04",
      titulo: "Tu Misión",
      subtitulo: "La evidencia se acumula",
      descripcion: "Miles de compromisos alimentan una misión nacional. Lo que empezó como decisión privada se vuelve dato público, propuesta concreta, mandato exigible.",
      alcance: "Miles",
      icon: <Globe className="w-6 h-6" />
    },
    {
      nivel: "05",
      titulo: "Tu Evidencia",
      subtitulo: "Lo que se prueba no se puede negar",
      descripcion: "Cuando millones de señales convergen, el país deja de improvisar. No hace falta convencer a nadie — hace falta demostrar que hay otro camino y sostenerlo.",
      alcance: "46 millones",
      icon: <Sun className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#050a05] text-emerald-50 selection:bg-emerald-500/30 font-sans" ref={containerRef}>
      <Header />
      <main className="overflow-hidden relative">
        
        {/* THE LIVING ROOT - Global Connector */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-6xl pointer-events-none z-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 1000" preserveAspectRatio="none">
            <motion.path
              d="M50,0 C50,100 20,200 50,300 C80,400 50,500 50,600 C20,700 80,800 50,900 C20,1000 50,1000 50,1000"
              fill="none"
              stroke="url(#rootGradient)"
              strokeWidth="0.5"
              style={{ pathLength: rootPathLength }}
            />
            <defs>
              <linearGradient id="rootGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Organic Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#050a05] to-[#050a05]" />
          
          {/* Floating Spores */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-emerald-400 rounded-full blur-[1px]"
                initial={{ 
                  width: Math.random() * 4 + 'px',
                  height: Math.random() * 4 + 'px',
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                  opacity: 0
                }}
                animate={{ 
                  y: [0, -100],
                  opacity: [0, 0.8, 0],
                }}
                transition={{ 
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  delay: Math.random() * 5
                }}
              />
            ))}
          </div>

          <div className="container-content relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5 }}
                className="mb-8"
              >
                <div className="inline-flex items-center justify-center p-4 rounded-full bg-emerald-900/30 border border-emerald-500/30 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <Sprout className="w-12 h-12 text-emerald-400" />
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-6"
              >
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-emerald-200 via-emerald-400 to-green-600">
                  La Semilla
                </span>
                <span className="block text-3xl md:text-5xl font-light text-emerald-100/70 mt-2">
                  Del compromiso que te cambia
                </span>
              </motion.h1>

              <div className="text-xl md:text-2xl text-emerald-100/60 max-w-3xl mx-auto mb-12 leading-relaxed font-light space-y-4">
                <p>Viste el tablero. Entendiste el gris.<br />Pero ver no alcanza.</p>
                <p>
                  Hay un momento más silencioso que el despertar — y más difícil.<br />
                  Es cuando dejás de entender y empezás a hacer.<br />
                  No una marcha. No un voto. No una opinión.<br />
                  Un compromiso concreto que te obliga a ser distinto mañana.
                </p>
                <p>Eso es la semilla. No lo que plantás afuera.<br />Lo que plantás en vos.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
                <PowerCTA
                  text="REGISTRAR MI COMPROMISO"
                  variant="primary"
                  onClick={() => setShowCommitmentModal(true)}
                  size="lg"
                  animate={true}
                />
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => window.scrollTo({ top: 900, behavior: 'smooth' })}
                  className="bg-transparent border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/20 hover:text-emerald-200 rounded-full px-8 h-14"
                >
                  VER EL CICLO
                </Button>
              </div>

              {/* Living Metrics */}
              <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
                {semillaIndicators.map((stat) => (
                  <motion.div 
                    key={stat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-md group-hover:bg-emerald-500/20 transition-colors" />
                    <div className="relative bg-[#0a150a] border border-emerald-500/20 rounded-2xl p-6 text-center">
                      <div className="text-emerald-400 mb-2 flex justify-center">{stat.icon}</div>
                      <div className="text-3xl font-bold text-white font-mono">{stat.value.toLocaleString()}</div>
                      <div className="text-xs text-emerald-500/70 uppercase tracking-wider mt-1">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* El Acto */}
        <section className="section-spacing bg-gradient-to-b from-[#050a05] via-[#060b06] to-[#050a05]">
          <div className="container-content">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/20 border border-emerald-500/20 text-emerald-400 text-sm font-mono mb-6 tracking-widest uppercase">
                  <Sprout className="w-4 h-4" />
                  El verdadero instante
                </div>
                <h2 className="heading-section mb-6">
                  Despertar es fácil. Plantar es otra cosa.
                </h2>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-6 text-lg md:text-xl text-emerald-100/70 leading-relaxed font-light"
              >
                <p>
                  Despertar tiene algo de cómodo.<br />
                  Ves lo que no funciona, lo nombrás, sentís la claridad<br />
                  — y esa claridad se siente como poder.<br />
                  Pero no lo es.
                </p>
                <p>
                  Hay miles de personas despiertas que no hacen nada.<br />
                  Que ven el tablero completo y se quedan mirando.<br />
                  Que tienen razón sobre todo y no cambiaron nada.<br />
                  La lucidez sin compromiso es la forma más elegante de seguir esperando.
                </p>
                <p>
                  Plantar es distinto.<br />
                  Plantar es decir: esto que entendí ahora me obliga.<br />
                  No como consigna. Como forma de vivir.<br />
                  Un compromiso que se prueba todos los días,<br />
                  que te incomoda cuando no lo cumplís,<br />
                  que nadie te va a aplaudir por sostener.
                </p>
                <p className="text-emerald-200/90 font-normal">
                  El gris despierta. La semilla actúa.<br />
                  Y entre esas dos cosas hay un abismo<br />
                  que la mayoría no cruza nunca.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-16 text-center"
              >
                <p className="text-xl md:text-2xl text-emerald-100/50 leading-relaxed font-light italic">
                  La pregunta no es si entendés lo que está mal.<br />
                  La pregunta es si estás dispuesto a ser distinto<br />
                  por algo que no lleva tu nombre.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Germination Cycle Interactive */}
        <section className="section-spacing bg-[#050a05] relative border-t border-emerald-900/20">
          <div className="container-content">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="heading-section mb-6">No es un plan de 4 pasos. Es lo que pasa cuando lo intentás.</h2>
                <p className="text-body max-w-2xl mx-auto">
                  Nadie te dice esto: comprometerte de verdad genera resistencia — adentro y afuera. Estas son las tensiones que vas a atravesar. No para evitarlas. Para reconocerlas cuando lleguen.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Interactive Visual */}
                <div className="relative aspect-square rounded-full bg-emerald-900/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050a05_70%)]" />
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                      className="text-center relative z-10"
                    >
                      <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${germinationSteps[activeStep].gradient} flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(16,185,129,0.3)]`}>
                        <div className="text-white">{germinationSteps[activeStep].icon}</div>
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-2">{germinationSteps[activeStep].title}</h3>
                      <p className="text-emerald-200/70">{germinationSteps[activeStep].subtitle}</p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Controls */}
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
                    {germinationSteps.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveStep(idx)}
                        className={`w-3 h-3 rounded-full transition-all ${activeStep === idx ? 'bg-emerald-400 w-8' : 'bg-emerald-900 hover:bg-emerald-700'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Steps List */}
                <div className="space-y-4">
                  {germinationSteps.map((step, idx) => (
                    <motion.div
                      key={idx}
                      className={`p-6 rounded-2xl border transition-all cursor-pointer ${activeStep === idx ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                      onClick={() => setActiveStep(idx)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`text-sm font-mono mt-1 ${activeStep === idx ? 'text-emerald-400' : 'text-emerald-800'}`}>
                          0{idx + 1}
                        </div>
                        <div>
                          <h4 className={`text-lg font-bold mb-2 ${activeStep === idx ? 'text-white' : 'text-emerald-100/50'}`}>
                            {step.title}
                          </h4>
                          {activeStep === idx && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="text-emerald-200/70 text-sm leading-relaxed"
                            >
                              <p>{step.description}</p>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* La Red */}
        <section className="section-spacing bg-[#081008]">
          <div className="container-content">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/20 border border-emerald-500/20 text-emerald-400 text-sm font-mono mb-6 tracking-widest uppercase">
                  <Heart className="w-4 h-4" />
                  La red
                </div>
                <h2 className="heading-section mb-6">
                  Nadie planta <span className="text-emerald-400">solo.</span>
                </h2>
                <p className="text-body max-w-2xl mx-auto mb-12">
                  Una semilla no hace un bosque. Pero un bosque siempre empezó con una semilla que no pidió permiso.
                </p>
              </div>

              {/* Editorial prose before timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="max-w-3xl mx-auto mb-16 space-y-4 text-lg text-emerald-100/60 leading-relaxed font-light text-center"
              >
                <p>
                  Hay algo que pasa cuando sostenés un compromiso sin hacer ruido:<br />
                  alguien lo nota.<br />
                  No porque lo publiques. Porque se nota.<br />
                  La coherencia es magnética — no convence, atrae.
                </p>
                <p>
                  No vas a reclutar a nadie. No vas a dar discursos.<br />
                  Vas a sostener algo y el que estaba buscando<br />
                  lo mismo va a aparecer al lado tuyo.<br />
                  Así se forma una red. No por diseño. Por resonancia.
                </p>
              </motion.div>

              <div className="relative">
                <div className="space-y-0">
                  {propagacion.map((nivel, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: idx * 0.12 }}
                    >
                      <div className="relative pl-20 md:pl-24 pb-12 last:pb-0">
                        {/* Connector dot */}
                        <div className="absolute left-6 md:left-8 top-2 w-5 h-5 rounded-full bg-[#081008] border-2 border-emerald-500 z-10 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                          <div className="absolute inset-0.5 rounded-full bg-emerald-400/30 animate-ping" style={{ animationDuration: `${3 + idx}s` }} />
                        </div>

                        {/* Vertical line */}
                        {idx < propagacion.length - 1 && (
                          <div className="absolute left-[30px] md:left-[38px] top-7 w-px bg-gradient-to-b from-emerald-500/40 to-emerald-500/10 h-full" />
                        )}

                        {/* Card */}
                        <div className="bg-white/[0.03] rounded-2xl p-8 border border-white/5 hover:border-emerald-500/20 transition-all duration-300 group">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-11 h-11 rounded-xl bg-emerald-900/30 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                              {nivel.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className="text-emerald-500 font-mono text-xs">{nivel.nivel}</span>
                                <h3 className="text-xl font-bold text-white">{nivel.titulo}</h3>
                              </div>
                              <p className="text-emerald-400/70 text-sm">{nivel.subtitulo}</p>
                            </div>
                            <span className="text-xs uppercase tracking-widest text-amber-400/70 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-900/10 hidden sm:block font-mono">
                              {nivel.alcance}
                            </span>
                          </div>
                          <p className="text-emerald-100/60 leading-relaxed pl-[60px]">{nivel.descripcion}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Final crescendo */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="mt-12 text-center relative z-10"
                >
                  <div className="inline-block bg-gradient-to-r from-emerald-900/20 to-green-900/20 rounded-3xl p-10 border border-emerald-500/20">
                    <p className="text-2xl md:text-3xl font-bold text-white mb-4">
                      46 millones es el potencial.
                    </p>
                    <p className="text-emerald-200/70 text-lg max-w-2xl mx-auto leading-relaxed">
                      Pero no empieza con millones. Empieza con uno que dejó de delegar.<br />
                      <strong className="text-emerald-300">Lo que se prueba se puede exigir. Lo que se sostiene se vuelve irrefutable.</strong>
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        {/* ━━━ CLOSING PATTERN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8 md:p-10">
              <div className="space-y-6">
                {[
                  { label: "Qué estamos viendo", text: "Gente que dejó de opinar y empezó a sostener. Compromisos concretos, no adhesiones tibias." },
                  { label: "Qué hacemos ahora", text: "Cada compromiso se ancla a un territorio y se convierte en dato. Lo que se prueba se puede exigir." },
                  { label: "Qué no vamos a hacer", text: "Quedarnos en la declaración. Una semilla sin riego es un deseo. Lo que sigue es mapa, mandato y círculo." },
                  { label: "Cómo se mide", text: "Compromisos sostenidos en el tiempo, territorios activos, evidencia que no se puede ignorar." },
                  { label: "Qué podés hacer vos", text: "Plantar un compromiso, anclarlo a tu territorio y bancártela cuando nadie aplauda." },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                    <span className="text-emerald-400 font-bold text-sm whitespace-nowrap min-w-[220px]">{item.label}</span>
                    <span className="text-slate-400 text-sm leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <NextStepCard
          title="Llevá tu declaración al Mapa"
          description="Tu compromiso cobra vida cuando se carga en el territorio. Servir es poner tu verdad al servicio de los demás."
          href="/el-mapa"
          gradient="from-emerald-900 to-blue-900"
          icon={<MapPin className="w-5 h-5" />}
        />


      </main>
      <Footer />

      <CommitmentModal
        isOpen={showCommitmentModal}
        onClose={() => setShowCommitmentModal(false)}
        onCommit={handleCommitment}
        type="intermediate"
        title="REGISTRAR MI COMPROMISO"
      />
    </div>
  );
};

export default LaSemillaDeBasta;
