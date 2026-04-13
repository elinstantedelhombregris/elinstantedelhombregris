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
  Brain,
  Shield,
  Lightbulb,
  TreePine,
  Globe,
  Sprout,
  Droplets,
  Sun,
  Flame,
  MapPin
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
      title: "Preparar la Tierra",
      subtitle: "Ver lo que no vimos",
      description: "El primer paso es cultivar conciencia. Removemos el terreno interno para reconocer patrones, dolores y mandatos que aún nos secan.",
      icon: <TreePine className="w-12 h-12" />,
      gradient: "from-amber-900/80 to-orange-900/80",
      details: [
        "Nombrar las crisis personales sin negarlas",
        "Practicar autoobservación y silencio",
        "Registrar qué produce hastío",
        'Identificar el instante antes del "basta"'
      ]
    },
    {
      step: 2,
      title: "Sembrar Hábitos",
      subtitle: "Acciones pequeñas, lluvias constantes",
      description: 'Cada hábito sostenido es una señal más en el mapa. Definimos prácticas diarias que nos conecten con propósito, servicio y verdad operativa.',
      icon: <Droplets className="w-12 h-12" />,
      gradient: "from-blue-600/80 to-cyan-600/80",
      details: [
        "Diseñar rituales diarios de gratitud",
        "Sumar micro-acciones de justicia",
        "Elegir un hábito de servicio semanal",
        "Perseverar en la tercera jornada"
      ]
    },
    {
      step: 3,
      title: "Cuidar el Brote",
      subtitle: "Relaciones que evitan la violencia",
      description: "Si no cuidamos los vínculos, el conflicto escala. Cuidar nuestras relaciones garantiza que la transformación sea consciente y sostenible.",
      icon: <Shield className="w-12 h-12" />,
      gradient: "from-emerald-600/80 to-green-600/80",
      details: [
        "Practicar empatía radical",
        "Cuidar los vínculos familiares",
        "Resolver conflictos pacíficamente",
        "Multiplicar círculos de diálogo"
      ]
    },
    {
      step: 4,
      title: "Probar y Multiplicar",
      subtitle: "Del compromiso a la evidencia pública",
      description: 'Lo que no se prueba no se puede exigir. Subir evidencia, documentar qué funciona y qué no, y compartir lo aprendido con tu círculo de reconstrucción.',
      icon: <Sun className="w-12 h-12" />,
      gradient: "from-yellow-500/80 to-orange-500/80",
      details: [
        "Subir evidencia al mapa",
        "Documentar qué funciona y qué no",
        "Compartir con tu círculo de reconstrucción",
        'Multiplicar lo probado en nuevos territorios'
      ]
    }
  ];

  const momentosBasta = [
    {
      titulo: "La Factura",
      escena: "Mirás el ticket del supermercado. Los números suben, tu salario no. Pero esta vez no suspirás — esta vez VES. Ves el sistema detrás del precio. Ves las decisiones que nadie te consultó. Ves la cadena de incompetencia y cinismo que llega hasta tu mesa.",
      pregunta: "¿Cuántas facturas más vas a pagar en silencio?",
      icon: <Target className="w-8 h-8" />,
      gradient: "from-red-600/80 to-orange-600/80"
    },
    {
      titulo: "El Espejo",
      escena: "Tu hijo te pregunta por qué hay gente durmiendo en la calle. Te mirás adentro buscando una respuesta digna y no la encontrás. Porque no existe una respuesta digna para la indignidad normalizada. En ese silencio, algo se rompe.",
      pregunta: "¿Qué Argentina vas a dejarle a quien viene después?",
      icon: <Eye className="w-8 h-8" />,
      gradient: "from-blue-600/80 to-indigo-600/80"
    },
    {
      titulo: "La Noticia",
      escena: "Otro escándalo. Otro funcionario. Otra promesa rota. Siempre cambiabas de canal. Pero hoy no cambiás de canal — cambiás de actitud. No es bronca. No es resignación. Es algo más peligroso para el sistema: es claridad.",
      pregunta: "¿Y si el problema no es 'ellos' sino que vos todavía no actuaste?",
      icon: <Lightbulb className="w-8 h-8" />,
      gradient: "from-amber-600/80 to-yellow-600/80"
    },
    {
      titulo: "El Silencio",
      escena: "Son las 3 de la mañana. El pensamiento llega sin invitación: 'Este no es el país que merecemos.' No es nuevo ese pensamiento. Lo que es nuevo es que esta vez no te das vuelta y volvés a dormir. Esta vez te levantás.",
      pregunta: "¿Qué estás esperando que no sea tu propia decisión?",
      icon: <Brain className="w-8 h-8" />,
      gradient: "from-purple-600/80 to-violet-600/80"
    }
  ];

  const propagacion = [
    {
      nivel: "01",
      titulo: "Tu Compromiso",
      subtitulo: "Una declaración irreversible",
      descripcion: "Todo empieza con una persona que declara qué está dispuesta a sostener. No necesitás un título ni permiso. Necesitás un compromiso concreto ligado a una misión.",
      alcance: "1 persona",
      icon: <Sprout className="w-6 h-6" />
    },
    {
      nivel: "02",
      titulo: "Tu Círculo",
      subtitulo: "El círculo se forma",
      descripcion: "Tu compromiso atrae a otros. Un círculo de reconstrucción nace cuando varias personas deciden sostener un estándar compartido en el mismo territorio.",
      alcance: "5–10 personas",
      icon: <Heart className="w-6 h-6" />
    },
    {
      nivel: "03",
      titulo: "Tu Célula",
      subtitulo: "La célula territorial se activa",
      descripcion: "Varios círculos forman una célula territorial: unidad mínima de servicio y acción. Relevamiento, verificación, cuadrillas, acompañamiento.",
      alcance: "50–200 personas",
      icon: <Users className="w-6 h-6" />
    },
    {
      nivel: "04",
      titulo: "Tu Misión",
      subtitulo: "La misión toma cuerpo",
      descripcion: "Miles de compromisos alimentan una misión nacional. La evidencia se acumula, las propuestas se concretan, y el mandato territorial se vuelve exigible.",
      alcance: "Miles",
      icon: <Globe className="w-6 h-6" />
    },
    {
      nivel: "05",
      titulo: "Tu Evidencia",
      subtitulo: "La evidencia se vuelve irrefutable",
      descripcion: "Lo que se prueba no se puede negar. Cuando millones de señales, compromisos y evidencias convergen, el país deja de improvisar y empieza a reconstruirse con verdad operativa.",
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

              <h1 className="heading-hero mb-6">
                <span className="block text-transparent bg-clip-text bg-gradient-to-b from-emerald-200 via-emerald-400 to-green-600">
                  La Semilla
                </span>
                <span className="block text-3xl md:text-5xl font-light text-emerald-100/70 mt-2">
                  Del compromiso que te cambia
                </span>
              </h1>

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

        {/* El Momento ¡BASTA! */}
        <section className="section-spacing bg-gradient-to-b from-[#050a05] via-[#0a0808] to-[#050a05] border-y border-red-900/20">
          <div className="container-content">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-900/20 border border-red-500/20 text-red-400 text-sm font-mono mb-6 tracking-widest uppercase">
                  <Flame className="w-4 h-4" />
                  El Instante Irreversible
                </div>
                <h2 className="heading-section mb-6">
                  El Momento <span className="text-red-400">¡BASTA!</span>
                </h2>
                <p className="text-body max-w-3xl mx-auto text-lg">
                  No es una fecha en el calendario. No es un discurso político. Es ese instante
                  silencioso, privado, irreversible, en el que algo se quiebra dentro tuyo —
                  y lo que nace ya no puede morir.
                </p>
              </div>

              <div className="space-y-6">
                {momentosBasta.map((momento, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: idx * 0.1 }}
                    className="group"
                  >
                    <div className="rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 overflow-hidden">
                      <div className="grid md:grid-cols-[auto_1fr]">
                        <div className={`bg-gradient-to-br ${momento.gradient} p-8 flex items-center justify-center md:w-32`}>
                          <div className="text-white">{momento.icon}</div>
                        </div>
                        <div className="p-8">
                          <h3 className="text-xl font-bold text-white mb-4 tracking-wide">{momento.titulo}</h3>
                          <p className="text-emerald-100/70 leading-relaxed mb-6 text-lg">
                            {momento.escena}
                          </p>
                          <div className="bg-red-900/15 border border-red-500/20 rounded-xl px-6 py-4">
                            <p className="text-red-300 font-semibold italic text-lg">
                              {momento.pregunta}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-16 text-center"
              >
                <div className="rounded-3xl border border-emerald-500/20 bg-emerald-900/10 p-12">
                  <p className="text-3xl font-bold text-white mb-4">
                    ¿Ya sentiste ese momento?
                  </p>
                  <p className="text-emerald-200/60 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                    Si estás leyendo esto, es porque algo ya se movió adentro tuyo. La semilla ya germinó.
                    Ahora solo queda una pregunta: ¿vas a dejarla morir o vas a regarla?
                  </p>
                  <PowerCTA
                    text="REGISTRAR MI COMPROMISO"
                    variant="primary"
                    onClick={() => setShowCommitmentModal(true)}
                    size="lg"
                    animate={true}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Germination Cycle Interactive */}
        <section className="section-spacing bg-[#050a05] relative border-t border-emerald-900/20">
          <div className="container-content">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="heading-section mb-6">El Ciclo de Germinación</h2>
                <p className="text-body max-w-2xl mx-auto">
                  Todo proceso de cambio atraviesa tensiones antes del florecimiento. Este ciclo te guía para preparar la tierra y sembrar consciencia.
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
                              <p className="mb-4">{step.description}</p>
                              <ul className="space-y-2">
                                {step.details.map((detail, i) => (
                                  <li key={i} className="flex items-center gap-2">
                                    <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                                    {detail}
                                  </li>
                                ))}
                              </ul>
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

        {/* La Chispa Se Propaga */}
        <section className="section-spacing bg-[#081008]">
          <div className="container-content">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-900/20 border border-amber-500/20 text-amber-400 text-sm font-mono mb-6 tracking-widest uppercase">
                  <Flame className="w-4 h-4" />
                  Efecto Contagio
                </div>
                <h2 className="heading-section mb-6">
                  La Chispa <span className="text-amber-400">Se Propaga</span>
                </h2>
                <p className="text-body max-w-2xl mx-auto">
                  Un incendio forestal comienza con una brasa. Un despertar nacional
                  comienza con una persona que dice "basta" — y lo cumple.
                </p>
              </div>

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
                  <div className="inline-block bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-3xl p-10 border border-amber-500/20">
                    <p className="text-2xl md:text-3xl font-bold text-white mb-4">
                      46 millones de semillas.
                    </p>
                    <p className="text-amber-200/70 text-lg max-w-2xl mx-auto leading-relaxed">
                      No hace falta esperar a millones. Hace falta dejar de delegar la primera parte.
                      <strong className="text-amber-300"> Lo que se prueba se puede exigir.</strong>
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Tu semilla alimenta una misión */}
        <section className="section-spacing relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-[#050a05] to-[#050a05]" />

          <div className="container-content relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-sm font-mono mb-6 tracking-widest uppercase">
                  <Target className="w-4 h-4" />
                  Cinco misiones nacionales
                </div>
                <h2 className="heading-section mb-6">
                  Tu semilla alimenta <span className="text-emerald-400">una misión</span>
                </h2>
                <p className="text-body max-w-2xl mx-auto">
                  Cada compromiso personal se conecta con una de las cinco misiones de la reconstrucción. No es un gesto simbólico — es una pieza de una arquitectura más grande.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { mission: "La Base Está", action: "Si cuidás un vecino", icon: "❶", color: "red" },
                  { mission: "Territorio Legible", action: "Si documentás lo que pasa", icon: "❷", color: "blue" },
                  { mission: "Producción y Suelo Vivo", action: "Si ofrecés un oficio", icon: "❸", color: "green" },
                  { mission: "Infancia, Escuela y Cultura", action: "Si acompañás un pibe", icon: "❹", color: "purple" },
                  { mission: "Instituciones y Futuro", action: "Si exigís transparencia", icon: "❺", color: "amber" },
                ].map((m, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500/20 transition-colors">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <p className="text-emerald-100/60 text-sm mb-1">{m.action}</p>
                      <p className="text-white font-semibold">Misión {i + 1}: {m.mission}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-10">
                <PowerCTA
                  text="ELEGIR MI ROL EN LA RECONSTRUCCIÓN"
                  variant="accent"
                  onClick={() => setShowCommitmentModal(true)}
                  size="lg"
                  animate={true}
                />
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
                  { label: "Qué estamos viendo", text: "Millones de personas que sienten el hartazgo pero no tienen dónde canalizarlo con método." },
                  { label: "Qué hacemos ahora", text: "Convertir cada compromiso en semilla medible, ligada a una misión y a un territorio." },
                  { label: "Qué no vamos a hacer todavía", text: "Prometer que un hábito personal salva un país. La semilla necesita mapa, mandato y círculo." },
                  { label: "Cómo se mide", text: "Compromisos activos, misiones alimentadas, evidencia generada." },
                  { label: "Qué podés hacer vos", text: "Declarar un compromiso concreto, elegir una misión, y sostenerlo con estándar." },
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
