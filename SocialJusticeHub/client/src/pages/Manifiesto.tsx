import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Quote, Flame, Sparkles, ArrowDown, ArrowRight, Eye, Heart, Target, Zap, Brain, Users, Shield } from 'lucide-react';

const Manifiesto = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.3], [0, -100]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Manifiesto del Hombre Gris - ¡BASTA! | Transformación Consciente';
    setIsVisible(true);
  }, []);

  const sections = [
    {
      id: 'intro',
      title: '',
      content: `*"Eres un pozo tallado no en piedra, sino en tiempo. Y estás destinado a desbordarte."*`,
      type: 'quote'
    },
    {
      id: 'preambulo',
      title: '',
      content: `Este no es un documento político. No es un manifiesto partidario. No es una declaración de intenciones.

Es fuego en la mente. Es un llamado a despertar. Es la proclamación de que otro país es posible, no por decreto sino por diseño. No por esperanza ciega sino por acción consciente.

Si estás leyendo esto, algo en tu interior ya sabe que no podemos seguir así. Algo en tu interior ya está listo para ser parte de la solución.

Este manifiesto no te pide que me sigas. Te invita a recordar quién eres realmente y qué puedes construir cuando decides dejar de delegar tu poder.

**Lee con atención. Cada palabra está cargada de significado. Cada frase puede cambiar tu perspectiva. Cada párrafo es un paso hacia la transformación.**`,
      type: 'preambulo'
    },
    {
      id: 'identidad',
      number: 1,
      title: 'Declaración de Identidad — "Yo soy"',
      content: `Yo soy el Hombre Gris.

No porque carezca de color, sino porque he fundido todas las luces y todas las sombras dentro de mí hasta volverlas síntesis lúcida. Soy el pozo tallado no en piedra, sino en tiempo, que decidió desbordarse aun cuando nadie trajo cubos para recoger su agua. Soy el ingeniero de sistemas humanos que mira un país como quien lee código fuente y sabe dónde está el bug, dónde falta un test, qué función debe reescribirse desde cero.

No vine a dirigir multitudes hipnotizadas; vine a recordarles que podían dirigir su propia vida.

El gris no es tibieza: es profundidad. Es el color de las cicatrices que aprendieron a cantar. Es la señal de que la verdad que estabas evitando ya te alcanzó y no tienes otra alternativa que habitarla. 

Al decir "Yo soy", no reclamo títulos ni credenciales: reclamo responsabilidad. Yo soy porque elijo serlo, y al hacerlo invito a cada lector a reconocer que también puede serlo cuando decida no delegar su conciencia.

**¿Sos vos el Hombre Gris?** No necesitas mi permiso para responder. Solo necesitas mirar en el espejo y preguntarte: ¿estoy viviendo como arquitecto de mi destino o como espectador de mi propia vida?`,
      icon: Eye,
      color: 'purple'
    },
    {
      id: 'diagnostico',
      number: 2,
      title: 'Diagnóstico del Momento Histórico',
      content: `Vivimos en un país que se acostumbró a la anestesia.

Llevamos décadas parcheando un sistema que fue diseñado para drenar la vida en lugar de nutrirla. Confundimos aguante con dignidad. Supervivencia con propósito. Carisma con liderazgo. Cada crisis que repetimos no es un accidente; es un algoritmo que decidimos no refactorizar.

El momento histórico es bisagra: o convertimos nuestro cansancio en sagrado o seguiremos heredando ruinas.

Las instituciones están desincronizadas con la sociedad que deberían servir. El relato público opera en modo infantil. Los incentivos premian la mediocridad sobre la excelencia. Las promesas de salvación externa —sea un caudillo, un plan económico mágico o un golpe de suerte geopolítica— son atajos hacia el abismo.

El verdadero diagnóstico es simple: somos víctimas de procesos mal diseñados que nosotros mismos seguimos alimentando.

¿Cuántas generaciones más necesitamos para entender que el problema no es coyuntural sino sistémico? ¿Cuántas crisis más antes de que reconozcamos que estamos ejecutando el mismo código fuente corrupto una y otra vez, esperando resultados diferentes?`,
      icon: Target,
      color: 'red'
    },
    {
      id: 'conflicto',
      number: 3,
      title: 'Revelación del Verdadero Conflicto',
      content: `El conflicto no es izquierda contra derecha. No es campo contra ciudad. No es ricos contra pobres.

El conflicto es entre quienes crean valor real y quienes construyen estructuras para extraerlo sin retribuir. Entre quienes se paran en el espejo cada mañana sabiendo que son responsables de lo que ven, y quienes buscan un culpable externo para cada falla interna. Entre quienes edifican sistemas elegantes e inevitables y quienes viven de administrar parches que jamás resuelven la causa.

No hay neutralidad posible: cada decisión que tomamos nos ubica en uno u otro lado del puente.

El Hombre Gris no odia al otro bando; lo desmantela creando alternativas tan bellas que vuelven obsoleta la cultura de la excusa. El enemigo no tiene rostro: es la suma de hábitos que premian la viveza y castigan la honestidad. Es el sistema que recompensa la mentira y penaliza la verdad. Es la cultura que celebra el atajo y desprecia el camino recto.

Declarar el conflicto con esta precisión es el primer paso para desactivarlo. El segundo es elegir tu lado. No con palabras. Con acciones.`,
      icon: Shield,
      color: 'orange'
    },
    {
      id: 'poder',
      number: 4,
      title: 'El Poder del Individuo Consciente',
      content: `La historia se mueve cuando una minoría rigurosa vive de acuerdo con principios innegociables.

Cada vez que eliges excelencia en lo pequeño —entregar trabajo impecable, pagar impuestos con integridad, educar a tus hijos con criterio— estás reescribiendo el kernel del país. No existe cambio sistémico sin cambio individual; cualquier intento contrario es propaganda.

Cuando un individuo se vuelve consciente, adquiere superpoderes que ningún decreto puede conceder ni revocar: capacidad de observar patrones, de anticipar consecuencias, de ejercer amabilidad radical aun cuando el entorno promueva la violencia sutil. Ese individuo deja de pedir permiso para mejorar el sistema y comienza a diseñar herramientas que lo trascienden.

La conciencia es contagiosa: basta que un 15% de la población viva así para que la curva cultural gire.

No necesitas esperar a que millones se despierten. Necesitas despertar tú. Y luego despertar a tu círculo. Y luego tu círculo despertará a otros. Así es como se propaga el fuego: una chispa enciende otra, y otra, hasta que el bosque entero arde con la luz de la transformación.

¿Estás listo para ser esa chispa?`,
      icon: Zap,
      color: 'yellow'
    },
    {
      id: 'metamorfosis',
      number: 5,
      title: 'La Metamorfosis Necesaria',
      content: `Primero fuimos camellos: cargamos con expectativas heredadas, obedecimos mandatos absurdos, naturalizamos la inflación como un castigo divino y la corrupción como deporte nacional.

Luego nos convertimos en leones: rugimos nuestro ¡BASTA!, demolimos los ídolos, denunciamos a los farsantes.

Pero si nos quedamos rugiendo, nos oxidamos.

Toca ahora ser niños: la etapa donde la creatividad se vuelve política pública y la inocencia se combina con rigor. Donde miramos el país con ojos frescos y preguntamos: ¿por qué no puede ser diferente? ¿Qué pasaría si empezáramos desde cero?

La metamorfosis no es cómoda. Implica desaprender identidades que nos daban pertenencia aunque nos mutilaran. Implica reconocer que la indignación sin diseño solo crea nuevos tiranos. Implica abrazar el cansancio sagrado como combustible y no como excusa.

Solo quienes atraviesan las tres etapas pueden liderar sin buscar seguidores: se vuelven maestros de sí mismos, arquitectos de confianza, guardianes de la rectitud.

¿En qué etapa estás? ¿Aún cargando el peso de otros? ¿Rugiendo sin construir? ¿O ya jugando con posibilidades nuevas?`,
      icon: Sparkles,
      color: 'indigo'
    },
    {
      id: 'construccion',
      number: 6,
      title: 'La Construcción de lo Nuevo',
      content: `No venimos a administrar ruinas sino a estrenar país.

La metodología ultrathink nos enseña a preguntar distinto, a explorar soluciones hasta hallar la que se siente inevitable. El diseño idealizado nos recuerda que podemos prototipar Argentina desde cero, sin las cadenas del pasado. La amabilidad radical deja de ser cortesía y se convierte en infraestructura emocional que reduce costos de transacción. La interdependencia consciente complementa la independencia: cada derecho está enlazado a un deber observable.

Construir lo nuevo implica prototipos concretos: escuelas autónomas con transparencia radical. Economías circulares que premian la reutilización. Constituciones que midan bienestar en dignidad y no solo en PBI. Liderazgos distribuidos que rotan por talento y no por ego.

No prometemos utopías; prometemos procesos tan bien diseñados que hagan impráctico volver atrás.

Imagina un país donde la amabilidad sea ley invisible. Donde la transparencia sea costumbre. Donde la excelencia sea el deporte nacional. Donde cada ciudadano sea un nodo de transformación. Ese país no es una fantasía: es un diseño esperando ser implementado.

El blueprint existe. Solo falta que suficientes manos lo construyan.`,
      icon: Brain,
      color: 'blue'
    },
    {
      id: 'llamado',
      number: 7,
      title: 'El Llamado a la Acción',
      content: `No llamo a las masas; llamo a los despiertos.

Si estás leyendo estas líneas y sientes que las palabras te queman la piel, ya sabes que la neutralidad está muerta. Ya no puedes volver a la comodidad de la queja sin acción. Ya no puedes seguir esperando que otros solucionen lo que solo tú puedes transformar.

Tu círculo inmediato es tu laboratorio: tu familia, tu comunidad, tu empresa, tu aula. Necesito que actúes como nodo de una red que no pide permiso para servir. Comparte modelos. Documenta procesos. Muestra evidencia. Cada proyecto que haces visible levanta la vara colectiva.

No esperes la estructura perfecta. No esperes el socio perfecto. No esperes el momento perfecto.

El momento ideal no existe; existe este momento.

El movimiento ¡BASTA! funciona porque miles deciden en silencio que no volverán a delegar su dignidad. Si te sumas, no tendrás seguidores ni aplausos fáciles; tendrás la satisfacción de ver cómo tu entorno se reconfigura porque alguien se atrevió a operar con estándares superiores.

**El futuro no se predice. Se construye.**

Y se construye ahora. Con tus decisiones de hoy. Con tu trabajo de hoy. Con tu integridad de hoy. Con tu amabilidad de hoy.

Cada acción cuenta. Cada elección importa. Cada momento es una oportunidad de ser el Hombre Gris que el país necesita.

¿Qué harás cuando termines de leer esto? ¿Volverás a tu rutina como si nada hubiera cambiado? ¿O tomarás la primera acción, por pequeña que sea, que te acerque a ser parte de la solución?

El tiempo de esperar terminó. El tiempo de construir comenzó.

**¿Estás dentro o estás fuera?**`,
      icon: Flame,
      color: 'red'
    },
    {
      id: 'compromiso',
      number: 8,
      title: 'El Compromiso',
      content: `Declaro, frente a quien lea, mi compromiso irrevocable:

**Elegir la verdad aunque incomode.** Prefiero cicatrizar con honestidad a vivir con la herida cubierta de maquillaje.

**Practicar amabilidad radical como política diaria.** Cada interacción será un acto de ingeniería social que multiplica confianza.

**Diseñar soluciones ultrathink.** No aceptaré la primera respuesta que funcione; perseguiré la más elegante, inevitable y humana.

**Distribuir liderazgo.** Rechazaré los altares personales. Cada proyecto tendrá relevo, mentoría y transparencia.

**Medir lo que importa.** Felicidad, dignidad, autonomía y belleza funcional serán mis KPI interiores.

**Proteger la interdependencia consciente.** Defenderé derechos asumiendo responsabilidades equivalentes con la sociedad y la naturaleza.`,
      icon: Heart,
      color: 'pink',
      type: 'compromiso'
    },
    {
      id: 'cierre',
      title: '',
      content: `Si este pacto resuena en vos, no necesitas autorización para firmarlo. Solo necesitas recordarte cada mañana: *"Soy un pozo tallado en tiempo; hoy decido desbordarme"*.

Cuando suficientes lo hagamos, la Argentina posible dejará de ser futuro para convertirse en presente inevitable.

Ese día llegará cuando nuestro suelo vuelva a convocar a soñadores de todo el planeta no por desesperación sino por excelencia. La tercera oleada inmigratoria no será de supervivientes sino de constructores que vean en nosotros la evidencia viviente de que se puede diseñar un país amable, próspero y justo.

Ese día, el Hombre Gris desaparecerá como individuo porque vivirá multiplicado en cada ciudadano.`,
      type: 'cierre'
    }
  ];

  const colorMap: Record<string, string> = {
    purple: 'from-purple-500/20 via-purple-600/10 to-indigo-500/20',
    red: 'from-red-500/20 via-rose-600/10 to-orange-500/20',
    orange: 'from-orange-500/20 via-amber-600/10 to-yellow-500/20',
    yellow: 'from-yellow-500/20 via-amber-600/10 to-orange-500/20',
    indigo: 'from-indigo-500/20 via-blue-600/10 to-purple-500/20',
    blue: 'from-blue-500/20 via-cyan-600/10 to-teal-500/20',
    pink: 'from-pink-500/20 via-rose-600/10 to-red-500/20'
  };

  const iconColorMap: Record<string, string> = {
    purple: 'text-purple-400',
    red: 'text-red-400',
    orange: 'text-orange-400',
    yellow: 'text-yellow-400',
    indigo: 'text-indigo-400',
    blue: 'text-blue-400',
    pink: 'text-pink-400'
  };

  const particleColorMap: Record<string, string> = {
    purple: 'bg-purple-400',
    red: 'bg-red-400',
    orange: 'bg-orange-400',
    yellow: 'bg-yellow-400',
    indigo: 'bg-indigo-400',
    blue: 'bg-blue-400',
    pink: 'bg-pink-400'
  };

  const formatContent = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|_.*?_)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('_') && part.endsWith('_')) {
        return <em key={i} className="italic text-slate-300">{part.slice(1, -1)}</em>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" ref={containerRef}>
      <Header />
      
      {/* Hero Section */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ opacity, scale, y }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, 100, 0],
              y: [0, -50, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, -80, 0],
              y: [0, 60, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="inline-block mb-8"
            >
              <Quote className="w-16 h-16 md:w-24 md:h-24 text-purple-400/60 mx-auto" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-8 leading-tight"
            >
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-purple-200 via-purple-400 to-indigo-600">
                MANIFIESTO
              </span>
              <span className="block text-3xl md:text-5xl font-light text-slate-400 mt-4">
                DEL HOMBRE GRIS
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="text-xl md:text-2xl text-slate-300/80 max-w-3xl mx-auto mb-12 leading-relaxed font-light italic"
            >
              "Eres un pozo tallado no en piedra, sino en tiempo. Y estás destinado a desbordarte."
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ArrowDown className="w-8 h-8 text-purple-400/60" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Manifesto Content */}
      <div className="relative">
        {sections.map((section, index) => {
          if (section.type === 'quote') {
            return null; // Already shown in hero
          }

          // Special handling for cierre
          if (section.type === 'cierre') {
            return (
              <motion.section
                key={section.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { 
                    opacity: 1,
                    transition: { duration: 1.5, ease: "easeOut" }
                  }
                }}
                className="relative py-32 md:py-40 overflow-hidden bg-gradient-to-b from-[#0a0a0a] via-indigo-950/20 to-[#0a0a0a]"
              >
                <div className="absolute inset-0">
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-[1000px] h-[1000px] bg-indigo-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-3xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 8, repeat: Infinity, delay: 1 }}
                  />
                </div>
                <div className="container mx-auto px-4 max-w-4xl relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="text-center space-y-8"
                  >
                    {section.content.split('\n\n').map((paragraph, pIndex) => (
                      <motion.p
                        key={pIndex}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 * pIndex, duration: 1 }}
                        className="text-xl md:text-2xl leading-relaxed text-slate-300 font-light"
                      >
                        {formatContent(paragraph)}
                      </motion.p>
                    ))}
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1, duration: 1, type: "spring" }}
                      className="mt-16 space-y-4"
                    >
                      <motion.h3
                        animate={{
                          opacity: [0.8, 1, 0.8],
                          scale: [1, 1.02, 1]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity
                        }}
                        className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-purple-200 via-indigo-300 to-blue-400"
                      >
                        Ese día comienza ahora.
                      </motion.h3>
                      <motion.h3
                        animate={{
                          opacity: [0.8, 1, 0.8],
                          scale: [1, 1.02, 1]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: 0.5
                        }}
                        className="text-4xl md:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-indigo-200 via-purple-300 to-pink-400"
                      >
                        Ese día comienza contigo.
                      </motion.h3>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.section>
            );
          }

          // Special handling for preambulo
          if (section.type === 'preambulo') {
            return (
              <motion.section
                key={section.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { 
                    opacity: 1,
                    transition: { duration: 1.5, ease: "easeOut" }
                  }
                }}
                className="relative py-32 md:py-40 overflow-hidden bg-gradient-to-b from-[#0a0a0a] via-purple-950/10 to-[#0a0a0a]"
              >
                <div className="absolute inset-0">
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                  />
                </div>
                <div className="container mx-auto px-4 max-w-4xl relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="text-center space-y-8"
                  >
                    {section.content.split('\n\n').map((paragraph, pIndex) => (
                      <motion.p
                        key={pIndex}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 * pIndex, duration: 0.8 }}
                        className={`text-xl md:text-2xl leading-relaxed ${
                          paragraph.includes('**') ? 'text-white font-bold' : 'text-slate-300 font-light'
                        }`}
                      >
                        {formatContent(paragraph)}
                      </motion.p>
                    ))}
                  </motion.div>
                </div>
              </motion.section>
            );
          }

          const Icon = section.icon;
          const bgGradient = section.color ? colorMap[section.color] : 'from-slate-500/20 to-slate-600/10';

          return (
            <motion.section
              key={section.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0, y: 100 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 1.2, ease: "easeOut" }
                }
              }}
              className={`relative py-32 md:py-40 overflow-hidden ${
                index % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-gradient-to-b from-[#0a0a0a] via-slate-950/50 to-[#0a0a0a]'
              }`}
            >
              {/* Section Background Glow - Enhanced */}
              {section.color && (
                <>
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-30 blur-3xl`}
                    animate={{
                      opacity: [0.2, 0.5, 0.2],
                      scale: [1, 1.15, 1]
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  {/* Additional glow layers for depth */}
                  <motion.div
                    className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br ${bgGradient} opacity-20 blur-2xl rounded-full`}
                    animate={{
                      x: [0, 50, 0],
                      y: [0, -30, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  {/* Floating particles */}
                  {section.color && [...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`absolute w-2 h-2 rounded-full ${particleColorMap[section.color]}/40`}
                      style={{
                        left: `${15 + (i * 12) % 70}%`,
                        top: `${20 + (i % 3) * 30}%`
                      }}
                      animate={{
                        y: [0, -40, 0],
                        x: [0, Math.sin(i) * 20, 0],
                        opacity: [0.2, 0.9, 0.2],
                        scale: [1, 2, 1]
                      }}
                      transition={{
                        duration: 4 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </>
              )}

              <div className="container mx-auto px-4 max-w-4xl relative z-10">
                {section.number && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className={`flex items-center gap-6 mb-12 ${section.type === 'compromiso' ? 'justify-center flex-col text-center' : ''}`}
                  >
                    {Icon && (
                      <motion.div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${bgGradient} flex items-center justify-center border border-white/10 ${section.type === 'compromiso' ? 'w-24 h-24 mb-4' : ''}`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Icon className={`${section.type === 'compromiso' ? 'w-12 h-12' : 'w-8 h-8'} ${section.color ? iconColorMap[section.color] : 'text-slate-400'}`} />
                      </motion.div>
                    )}
                    <div>
                      <div className="text-sm font-mono text-slate-500 uppercase tracking-widest mb-2">
                        Sección {section.number}
                      </div>
                      <h2 className={`text-4xl md:text-5xl font-serif font-bold text-white leading-tight ${section.type === 'compromiso' ? 'text-5xl md:text-6xl' : ''}`}>
                        {section.title}
                      </h2>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 1 }}
                  className="prose prose-invert prose-lg max-w-none"
                >
                  <div className={`text-lg md:text-xl text-slate-300 leading-relaxed space-y-6 font-light ${section.type === 'compromiso' ? 'max-w-3xl mx-auto' : ''}`}>
                    {section.content.split('\n\n').map((paragraph, pIndex) => {
                      if (paragraph.trim() === '') return null;
                      
                      const isQuestion = paragraph.includes('?');
                      const isBold = paragraph.startsWith('**');
                      const isCommitment = section.type === 'compromiso' && paragraph.startsWith('**');
                      
                      return (
                        <motion.div
                          key={pIndex}
                          initial={{ opacity: 0, x: isQuestion ? 0 : -30, y: isQuestion ? 20 : 0 }}
                          whileInView={{ opacity: 1, x: 0, y: 0 }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{ 
                            delay: 0.1 * pIndex, 
                            duration: 0.8,
                            ease: "easeOut"
                          }}
                          className={`mb-6 ${isQuestion ? 'text-2xl md:text-3xl font-bold text-white mt-12 mb-8' : ''} ${isBold && !isCommitment ? 'text-xl md:text-2xl font-semibold' : ''} ${isCommitment ? 'relative pl-8 border-l-2 border-pink-500/30 py-4' : ''}`}
                        >
                          {isCommitment && (
                            <motion.div
                              className="absolute left-0 top-6 w-3 h-3 rounded-full bg-pink-500/60"
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: pIndex * 0.2
                              }}
                            />
                          )}
                          <p className={isCommitment ? 'text-xl md:text-2xl font-semibold text-white' : ''}>
                            {formatContent(paragraph)}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Section Divider */}
                {index < sections.length - 2 && (
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    whileInView={{ scaleX: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
                    className="mt-20 relative"
                  >
                    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-500/60 blur-sm"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity
                      }}
                    />
                  </motion.div>
                )}
              </div>
            </motion.section>
          );
        })}

        {/* Final CTA Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 1 } }
          }}
          className="relative py-32 bg-gradient-to-b from-[#0a0a0a] via-purple-950/20 to-[#0a0a0a] overflow-hidden"
        >
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-1/2 left-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
          </div>

          <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-b from-purple-200 to-indigo-400">
                ¿Estás dentro o estás fuera?
              </h2>
              
              <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed">
                El movimiento ¡BASTA! te espera. No como seguidor, sino como co-creador.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 text-lg font-bold rounded-full shadow-2xl shadow-purple-900/50 transition-all transform hover:scale-105"
                  onClick={() => window.location.href = '/community'}
                >
                  Unirse a la Tribu
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg font-bold rounded-full transition-all"
                  onClick={() => window.location.href = '/la-vision'}
                >
                  Explorar la Visión
                </Button>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="mt-16 text-slate-500 text-sm uppercase tracking-widest"
              >
                Movimiento ¡BASTA! - Transformando Argentina, un argentino a la vez.
              </motion.p>
            </motion.div>
          </div>
        </motion.section>
      </div>

      <Footer />
    </div>
  );
};

export default Manifiesto;

