import { PREGUNTA_MI_ARGENTINA_IDEAL, SLUG_CAMPANA_NACIONAL, lineaSugerida } from '@v2/shared';
import { motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSearch } from 'wouter';

import { DestinoDelAporte } from '../Imaginar/DestinoDelAporte';

import { Pasos } from './comun/Pasos';
import {
  APORTE_VACIO,
  useEtiquetaDeTema,
  useNombreDeProvincia,
  type AporteEnCurso,
} from './imaginar/datos';
import { Listo } from './imaginar/Listo';
import { PantallaLinea } from './imaginar/PantallaLinea';
import { PantallaPregunta } from './imaginar/PantallaPregunta';
import { PantallaPublicar } from './imaginar/PantallaPublicar';
import { useBorradorIdeal } from './imaginar/useBorradorIdeal';
import { usePublicarIdeal, type Publicado } from './imaginar/usePublicarIdeal';

import { Kicker } from '~/components/papel/primitives';
import { despertar } from '~/lib/despertar';
import { tomarTextoEnCurso } from '~/lib/participacion/texto-en-curso';
import { useCampanaDeAporte } from '~/lib/participacion/useCampanaDeAporte';
import { useProvincias } from '~/lib/queries/open-data';

type Pantalla = 'pregunta' | 'linea' | 'publicar' | 'listo';

/**
 * Imaginar — el primer momento de Mi Argentina ideal (spec 2026-10-19 §3).
 *
 * Tres pantallas cortas y un cierre, una cosa por pantalla: la pregunta, el aporte en
 * pocas palabras (como lo van a ver los demás) y publicar. Lo escrito vive en memoria;
 * guardarlo en el dispositivo es explícito. La campaña sale del enlace, en vivo, con la
 * regla de siempre (`useCampanaDeAporte`): sin campaña nombrada, el aporte entra en la
 * nacional. Con `?volver=mirar` el cierre vuelve a Mirar.
 */
export function Imaginar() {
  const consulta = new URLSearchParams(useSearch());
  const volverAMirar = consulta.get('volver') === 'mirar';
  const lugar = consulta.get('lugar');
  const campanaCtx = useCampanaDeAporte();
  const { pedido, explicita, campana, destino, bloqueo } = campanaCtx;
  const [pantalla, setPantalla] = useState<Pantalla>('pregunta');
  const [aporte, setAporte] = useState<AporteEnCurso>(APORTE_VACIO);
  const [publicado, setPublicado] = useState<Publicado | null>(null);
  const reducido = useReducedMotion() ?? false;
  const raiz = useRef<HTMLDivElement>(null);

  const cambiar = useCallback((parcial: Partial<AporteEnCurso>) => {
    setAporte((a) => ({ ...a, ...parcial }));
  }, []);
  const cargarTexto = useCallback((texto: string) => {
    setAporte((a) => ({ ...a, texto, lineaTocada: false }));
  }, []);

  const nacional = (slug: string | undefined) => slug === SLUG_CAMPANA_NACIONAL;
  const otraCampana = explicita && campana && !nacional(campana.slug) ? campana : null;
  const pregunta = otraCampana ? otraCampana.contrato.pregunta : PREGUNTA_MI_ARGENTINA_IDEAL;
  const entraAMirar = nacional(destino?.slug);
  const nombreCampana =
    destino && !nacional(destino.slug)
      ? `la campaña «${destino.contrato.titulo}»`
      : 'Mi Argentina ideal';
  const rotulo = destino
    ? `${nacional(destino.slug) ? 'Mi Argentina ideal' : destino.contrato.titulo} · edición ${destino.revision}`
    : 'Mi Argentina ideal';

  const borrador = useBorradorIdeal({
    pedido: pedido.borrador,
    campanaId: pedido.campana ?? null,
    edicion: explicita && campana ? campana.revision : null,
    alCargar: cargarTexto,
  });
  const envio = usePublicarIdeal({ destino, bloqueo, pregunta });
  const provincias = useProvincias();
  const provincia = useNombreDeProvincia(aporte.provincia);
  const tema = useEtiquetaDeTema(aporte.tema);

  // Lo que se empezó a escribir en la portada sigue acá, ya en la segunda pantalla.
  // Se toma en un efecto y no al crear el estado: así se lee una sola vez.
  useLayoutEffect(() => {
    const texto = tomarTextoEnCurso();
    if (!texto.trim()) return;
    setAporte((a) => ({ ...a, texto, linea: lineaSugerida(texto), lineaTocada: false }));
    setPantalla('linea');
  }, []);

  // Un `?lugar=` que es una provincia la deja elegida, si la persona todavía no eligió.
  useEffect(() => {
    const id = Number(lugar);
    if (!lugar || !provincias.data?.some((p) => p.id === id)) return;
    setAporte((a) => (a.provincia ? a : { ...a, provincia: String(id) }));
  }, [lugar, provincias.data]);

  // Al cambiar de pantalla, el foco va al título y la página vuelve arriba.
  const previa = useRef(pantalla);
  useEffect(() => {
    if (previa.current === pantalla) return;
    previa.current = pantalla;
    raiz.current?.querySelector<HTMLElement>('[data-foco]')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reducido ? 'auto' : 'smooth' });
  }, [pantalla, reducido]);

  const irA = (p: Pantalla) => {
    envio.limpiarError();
    setPantalla(p);
  };
  const publicar = () => {
    envio.publicar(aporte, (p) => {
      despertar();
      borrador.descartar();
      setPublicado(p);
      setPantalla('listo');
    });
  };

  return (
    <main className="mx-auto flex w-full min-w-0 max-w-[480px] flex-col gap-4 px-4 pb-14 pt-6">
      <Kicker color="tinta" className="font-bold">
        {rotulo}
      </Kicker>
      <Pasos actual="imaginar" />
      <motion.div
        ref={raiz}
        key={pantalla}
        initial={reducido ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducido ? 0.12 : 0.24, ease: 'easeOut' }}
        className="flex min-w-0 flex-col gap-4 pt-2"
      >
        {pantalla === 'pregunta' ? (
          <PantallaPregunta
            pregunta={pregunta}
            texto={aporte.texto}
            cambiar={(texto) => {
              cambiar({ texto });
            }}
            seguir={() => {
              setAporte((a) => (a.lineaTocada ? a : { ...a, linea: lineaSugerida(a.texto) }));
              irA('linea');
            }}
            guardar={() => void borrador.guardar(aporte.texto)}
            nota={borrador.nota}
            error={borrador.error}
            destino={<DestinoDelAporte contexto={campanaCtx} en="inicio" />}
          />
        ) : null}
        {pantalla === 'linea' ? (
          <PantallaLinea
            aporte={aporte}
            cambiar={cambiar}
            volver={() => {
              irA('pregunta');
            }}
            seguir={() => {
              irA('publicar');
            }}
          />
        ) : null}
        {pantalla === 'publicar' ? (
          <PantallaPublicar
            aporte={aporte}
            cambiar={(parcial) => {
              envio.limpiarError();
              cambiar(parcial);
            }}
            volver={() => {
              irA('linea');
            }}
            publicar={publicar}
            enviando={envio.enviando}
            error={envio.error}
            bloqueo={bloqueo}
            destino={<DestinoDelAporte contexto={campanaCtx} en="revision" />}
            entraAMirar={entraAMirar}
            nombreCampana={nombreCampana}
            provincia={provincia}
            tema={tema}
          />
        ) : null}
        {pantalla === 'listo' && publicado ? (
          <Listo
            publicado={publicado}
            volverAMirar={volverAMirar}
            entraAMirar={nacional(publicado.campana?.slug)}
            provincia={provincia}
            tema={tema}
          />
        ) : null}
      </motion.div>
    </main>
  );
}
