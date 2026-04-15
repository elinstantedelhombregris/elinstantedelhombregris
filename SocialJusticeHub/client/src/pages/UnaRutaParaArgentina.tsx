import { useEffect } from 'react';
import { useImmersion } from '@/components/ImmersionContext';
import {
  CinematicScroll,
  CinematicChapter,
  ChapterTitle,
  NarratorBlock,
} from '@cinematic-scroll/index';
import type { ChapterPalette } from '@cinematic-scroll/types';

const RUTA_PALETTES: ChapterPalette[] = [
  {
    bg: '#0a0a0a',
    text: '#8a8a8a',
    textMuted: '#555555',
    accent: '#6a6a6a',
    border: '#1a1a1a',
    cardBg: '#ffffff',
    testimonialAccent: '#777777',
    statColor: '#999999',
    grain: 0.06,
    vignette: 0.4,
  },
  {
    bg: '#0e0c09',
    text: '#a08060',
    textMuted: '#6b5540',
    accent: '#886644',
    border: '#1e1a14',
    cardBg: '#d4c5a0',
    testimonialAccent: '#997755',
    statColor: '#bb9966',
    grain: 0.04,
    vignette: 0.35,
  },
  {
    bg: '#080c10',
    text: '#6699bb',
    textMuted: '#3d5f7a',
    accent: '#4488aa',
    border: '#121e28',
    cardBg: '#88bbdd',
    testimonialAccent: '#5599bb',
    statColor: '#77aacc',
    grain: 0.035,
    vignette: 0.3,
  },
  {
    bg: '#080e0b',
    text: '#66cc88',
    textMuted: '#3d7a55',
    accent: '#44aa66',
    border: '#122e1a',
    cardBg: '#88ddaa',
    testimonialAccent: '#55bb77',
    statColor: '#77cc99',
    grain: 0.025,
    vignette: 0.25,
  },
  {
    bg: '#0c0a10',
    text: '#bb88ee',
    textMuted: '#7a55aa',
    accent: '#7D5BDE',
    border: '#1e1428',
    cardBg: '#bb88ee',
    testimonialAccent: '#9966cc',
    statColor: '#cc99ff',
    grain: 0.015,
    vignette: 0.15,
  },
];

const CHAPTER_TITLES = [
  'La Semilla',
  'La Prueba',
  'La Circunscripción',
  'La Cabecera de Puente',
  'La Ejecución',
];

export default function UnaRutaParaArgentina() {
  const { setImmersive } = useImmersion();

  useEffect(() => {
    setImmersive(true);
    return () => setImmersive(false);
  }, [setImmersive]);

  return (
    <CinematicScroll palettes={RUTA_PALETTES} chapters={CHAPTER_TITLES}>
      <CinematicChapter index={0}>
        <ChapterTitle
          number={1}
          title="La Semilla"
          subtitle="2026 — 2028"
          epigraph="Todo empieza con alguien que hace las cuentas."
        />
        <NarratorBlock>
          Seis crisis en 135 años. El patrón no era un accidente — era una arquitectura.
          Dependencia de commodities, bimonetarismo peso-dólar, federalismo fiscal
          disfuncional, impunidad judicial, especulación inmobiliaria. Las mismas cinco
          fracturas estructurales desde 1890.
        </NarratorBlock>
        <NarratorBlock emphasis="strong">
          Pero esta vez fue diferente. Esta vez alguien hizo las cuentas.
        </NarratorBlock>
        <NarratorBlock>
          La idea era una locura. Una aseguradora cooperativa, construida por ciudadanos,
          a costo. Contra el mercado. Contra 200 mil millones de dólares anuales en rentas
          capturadas. Con $320 dólares por persona.
        </NarratorBlock>
        <NarratorBlock>
          25.000 personas invirtieron sin saber si iban a volver a ver esa plata. Eso no
          era comercio. Era un acto político.
        </NarratorBlock>
      </CinematicChapter>

      <CinematicChapter index={1}>
        <ChapterTitle
          number={2}
          title="La Prueba"
          subtitle="2028 — 2032"
          epigraph="Gobernar no es mandar. Gobernar es escuchar."
        />
        <NarratorBlock>
          El movimiento decidió probar el modelo. Un municipio. La pregunta era simple
          y brutal: ¿puede gobernar gente que nunca gobernó?
        </NarratorBlock>
        <NarratorBlock emphasis="strong">
          Lo primero que hicieron fue escuchar.
        </NarratorBlock>
        <NarratorBlock>
          10.000 voces en el primer mes. Sueños, necesidades, declaraciones de ¡BASTA!
          Las señales se hicieron visibles en el mapa. Se agruparon alrededor de problemas.
          Agua. Seguridad. Escuelas.
        </NarratorBlock>
        <NarratorBlock>
          Demostraron que funciona. Una ciudad. Ahora la pregunta era: ¿puede escalar?
        </NarratorBlock>
      </CinematicChapter>

      <CinematicChapter index={2}>
        <ChapterTitle
          number={3}
          title="La Circunscripción"
          subtitle="2032 — 2036"
          epigraph="No fue un partido. Fue una forma de vivir que se expandió."
        />
        <NarratorBlock>
          De un municipio a una provincia. El efecto red. Pero la política provincial
          tiene depredadores más grandes. Narcos, sindicatos, la vieja guardia.
        </NarratorBlock>
        <NarratorBlock>
          Necesitaban articular lo que querían. No eslóganes — sistemas. No promesas —
          diseños idealizados con métricas y caminos concretos.
        </NarratorBlock>
        <NarratorBlock emphasis="strong">
          Tenían las ideas. Tenían el territorio. Ahora necesitaban ver cómo encajaba todo.
        </NarratorBlock>
      </CinematicChapter>

      <CinematicChapter index={3}>
        <ChapterTitle
          number={4}
          title="La Cabecera de Puente"
          subtitle="2036 — 2038"
          epigraph="Dieciséis planes. Un organismo vivo."
        />
        <NarratorBlock>
          Congreso Nacional. Bancas ganadas. El movimiento entró en la institución
          que estaba diseñado para transformar.
        </NarratorBlock>
        <NarratorBlock>
          16 planes. Cientos de dependencias. USD 283-526 mil millones. Un horizonte
          de 20 años. ¿Quién orquesta esto?
        </NarratorBlock>
        <NarratorBlock emphasis="strong">
          Por primera vez, la nación vio su propio rediseño como un sistema interconectado.
        </NarratorBlock>
      </CinematicChapter>

      <CinematicChapter index={4}>
        <ChapterTitle
          number={5}
          title="La Ejecución"
          subtitle="2038 — 2040+"
          epigraph="La crisis llegó. Pero esta vez, el pueblo tenía un plan."
        />
        <NarratorBlock emphasis="strong">
          La crisis. Como siempre en Argentina — cíclica, estructural, inevitable.
          Pero esta vez: plataforma, asambleas, gobierno alternativo, organización.
          Todo construido. Todo probado.
        </NarratorBlock>
        <NarratorBlock>
          72 horas. Esa era la ventana. La Regla de la Ventana: desplegá lo que tenés.
          Un ¡BASTA! a medio construir es infinitamente mejor que ningún plan.
        </NarratorBlock>
        <NarratorBlock emphasis="strong">
          Lo que pasó en Argentina entre 2026 y 2040 no tiene precedente. No porque
          fuera perfecto. Porque fue nuestro.
        </NarratorBlock>
      </CinematicChapter>
    </CinematicScroll>
  );
}
