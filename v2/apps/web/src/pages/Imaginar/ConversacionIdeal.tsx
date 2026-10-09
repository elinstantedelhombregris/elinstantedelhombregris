import { useQuery } from '@tanstack/react-query';
import { contribucionSchema } from '@v2/shared';
import { useEffect, useRef, useState } from 'react';

import { Asistencia } from './Asistencia';
import { DestinoDelAporte } from './DestinoDelAporte';
import { MarcoConversacion } from './MarcoConversacion';
import { PasoPregunta } from './PasoPregunta';
import { Recibo } from './Recibo';
import { Revision } from './Revision';

import type { CampanaDeAporte } from './FraseCampana';
import type { LugarMapa } from '../ElMapa/instrumento/BusquedaTerritorial';
import type { ReciboParticipacion } from '~/lib/queries/participacion';

import { BotonAccion, ErrorOperacion } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';
import { despertar } from '~/lib/despertar';
import { quitarParametroDeLaUrl } from '~/lib/participacion/aportar';
import { armarAporteGuiado, PREGUNTAS_GUIADAS } from '~/lib/participacion/armar-aporte';
import { borrarBorrador, guardarBorrador, leerBorradores } from '~/lib/participacion/borradores';
import { recortarEnFrase, unirRespuestas } from '~/lib/participacion/texto-aporte';
import { useCampanaDeAporte } from '~/lib/participacion/useCampanaDeAporte';
import { useLugarSincronizado } from '~/lib/participacion/useLugarSincronizado';
import { usePublicarAporte } from '~/lib/queries/participacion';

const ENTRADA =
  'Contanos qué querrías que fuera posible en tu vida. Son tres preguntas, no necesitás cuenta y nada se publica hasta que lo revises.';

interface Publicado {
  recibo: ReciboParticipacion;
  campana: CampanaDeAporte | null;
  textoVisible: boolean;
  territorio: string;
}

/**
 * Las tres preguntas de «Imaginar mi Argentina», dentro del panel del mapa.
 *
 * La campaña, la edición y el borrador se leen EN VIVO del enlace; el lugar
 * sigue al que se mira en el mapa. Publica siempre un `sueño`, y lo publicado
 * se llama «aporte».
 */
export function ConversacionIdeal({
  lugarInicial = null,
  irADirecto,
  alMapa,
}: {
  /** El lugar que se está mirando en el mapa. */
  lugarInicial?: LugarMapa | null;
  irADirecto?: () => void;
  alMapa?: () => void;
}) {
  const auth = useAuth();
  const campanaCtx = useCampanaDeAporte();
  const { pedido, explicita, campana, destino, bloqueo } = campanaCtx;
  const [paso, setPaso] = useState(0);
  const [frases, setFrases] = useState(['', '', '']);
  const [lectura, setLectura] = useState('');
  const [recortado, setRecortado] = useState(false);
  const [tema, setTema] = useState('');
  const { lugar, elegir: elegirLugar } = useLugarSincronizado(lugarInicial);
  const [publicar, setPublicar] = useState(false);
  const [cede, setCede] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [incluir, setIncluir] = useState(false);
  const [nota, setNota] = useState('');
  const [error, setError] = useState('');
  const [publicado, setPublicado] = useState<Publicado | null>(null);
  const identidad = useRef<string>(crypto.randomUUID());
  const intento = useRef<{ contenido: string; id: string; cuenta: number | null } | null>(null);
  const raiz = useRef<HTMLDivElement>(null);
  const enviar = usePublicarAporte();
  const servicio = useQuery({
    queryKey: ['contexto-participacion'],
    queryFn: () => api.get<{ proveedor: string | null }>('/api/v1/contribuciones/contexto'),
  });

  // El borrador se carga una vez por identificador: que el enlace cambie por
  // otra razón (mirar otro lugar del mapa) no vuelve a pisar lo que se escribió.
  const borradorCargado = useRef<string | null>(null);
  useEffect(() => {
    const id = pedido.borrador;
    if (!id || borradorCargado.current === id) return;
    borradorCargado.current = id;
    void leerBorradores()
      .then((lista) => {
        const b = lista.find((v) => v.id === id);
        if (!b) return;
        setFrases(b.frases);
        identidad.current = b.id;
        setNota('Retomaste un borrador que estaba guardado solo en este dispositivo.');
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'No pudimos leer el borrador.');
      });
  }, [pedido.borrador]);

  // El foco pasa al título del paso solo cuando el paso cambia, no al aparecer.
  const pasoPrevio = useRef(paso);
  useEffect(() => {
    if (pasoPrevio.current === paso) return;
    pasoPrevio.current = paso;
    raiz.current?.querySelector<HTMLElement>('[data-foco-paso]')?.focus();
  }, [paso]);

  const preguntaDe = (i: number) =>
    i === 0 && explicita && campana ? campana.contrato.pregunta : (PREGUNTAS_GUIADAS[i] ?? '');
  const avanzar = () => {
    if (paso === 0 && !frases[0]?.trim()) return;
    if (paso === 2) {
      intento.current = null;
      const unido = recortarEnFrase(unirRespuestas(frases));
      setLectura(unido.texto);
      setRecortado(unido.recortado);
      setConfirmado(false);
    }
    setPaso(paso + 1);
  };
  const guardar = async () => {
    try {
      await guardarBorrador({
        id: identidad.current,
        fecha: new Date().toISOString(),
        frases,
        campanaId: pedido.campana ?? null,
        edicion: campana && explicita ? campana.revision : null,
      });
      setNota('Tu borrador quedó en este dispositivo. No se publicó ni se subió a una cuenta.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos guardar el borrador.');
    }
  };
  const publicarAporte = () => {
    setError('');
    if (bloqueo) return;
    const respuestas = incluir
      ? frases
          .map((respuesta, i) => ({ pregunta: preguntaDe(i) || 'Mi borrador', respuesta }))
          .filter((f) => f.respuesta.trim())
      : [];
    const armar = (idLocal: string, cuenta: number | null) =>
      armarAporteGuiado({
        idLocal,
        texto: lectura,
        cedeLicencia: cede,
        tema,
        lugar,
        cuentaEsperada: cuenta,
        destino,
        fragmentos: respuestas,
      });
    // El mismo contenido conserva el identificador al reintentar; otro contenido, uno nuevo.
    const contenido = JSON.stringify(armar('', null));
    if (intento.current?.contenido !== contenido)
      intento.current = { contenido, id: crypto.randomUUID(), cuenta: auth.user?.id ?? null };
    const validado = contribucionSchema.safeParse(
      armar(intento.current.id, intento.current.cuenta),
    );
    if (!validado.success) {
      setError(validado.error.issues.map((i) => i.message).join(' '));
      return;
    }
    const aDestino = destino;
    enviar.mutate(validado.data, {
      onSuccess: (recibo) => {
        despertar();
        void borrarBorrador(identidad.current).catch(() => undefined);
        setPublicado({
          recibo,
          campana: aDestino,
          textoVisible: cede,
          territorio: lugar?.name ?? 'todo el país',
        });
      },
    });
  };
  const sumarOtro = () => {
    identidad.current = crypto.randomUUID();
    intento.current = null;
    setPublicado(null);
    setPaso(0);
    setFrases(['', '', '']);
    setLectura('');
    setRecortado(false);
    setTema('');
    setPublicar(false);
    setCede(false);
    setConfirmado(false);
    setIncluir(false);
    setNota('');
    setError('');
    quitarParametroDeLaUrl('borrador');
  };

  if (publicado)
    return (
      <MarcoConversacion>
        <Recibo {...publicado} {...(alMapa ? { alMapa } : {})} sumarOtro={sumarOtro} />
      </MarcoConversacion>
    );

  return (
    <MarcoConversacion entrada={ENTRADA} {...(irADirecto ? { irADirecto } : {})}>
      <div ref={raiz}>
        <DestinoDelAporte contexto={campanaCtx} en="inicio" />
        <div aria-hidden className="mb-3 flex gap-2">
          {PREGUNTAS_GUIADAS.map((p, i) => (
            <span key={p} className={`h-1 flex-1 ${i <= paso ? 'bg-violeta' : 'bg-papel-borde'}`} />
          ))}
        </div>
        <p className="font-space text-violeta mb-5 text-xs uppercase">
          {paso < 3 ? `Pregunta ${paso + 1} de 3` : 'Última parte: revisión'}
        </p>
        {paso < 3 ? (
          <PasoPregunta
            paso={paso}
            pregunta={preguntaDe(paso)}
            valor={frases[paso] ?? ''}
            cambiar={(v) => {
              setFrases((prev) => prev.map((f, i) => (i === paso ? v : f)));
            }}
            volver={() => {
              setPaso(paso - 1);
            }}
            seguir={avanzar}
          />
        ) : (
          <>
            <Asistencia
              texto={unirRespuestas(frases)}
              proveedor={servicio.data?.proveedor ?? null}
              usar={(v) => {
                setLectura(v);
                setRecortado(false);
                setConfirmado(false);
              }}
            />
            <Revision
              lectura={lectura}
              cambiar={(v) => {
                setLectura(v);
                setRecortado(false);
                setConfirmado(false);
              }}
              recortado={recortado}
              tema={tema}
              cambiarTema={setTema}
              lugar={lugar}
              elegirLugar={elegirLugar}
              publicar={publicar}
              cede={cede}
              setPublicar={setPublicar}
              setCede={setCede}
              confirmado={confirmado}
              confirmar={setConfirmado}
              incluirOrigen={incluir}
              incluir={setIncluir}
              volver={() => {
                setPaso(2);
              }}
              enviar={publicarAporte}
              enviando={enviar.isPending}
              bloqueo={bloqueo}
              destino={<DestinoDelAporte contexto={campanaCtx} en="revision" />}
              {...(enviar.error ? { error: enviar.error.message } : {})}
            />
          </>
        )}
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <BotonAccion
            type="button"
            tono="papel"
            onClick={() => {
              void guardar();
            }}
          >
            Guardar borrador en este dispositivo
          </BotonAccion>
          <p className="text-tinta-50 max-w-[550px] text-sm">
            Se guarda solo en este navegador: otras personas que lo usen podrían leerlo. Podés
            borrarlo desde Mi espacio.
          </p>
        </div>
        <ErrorOperacion mensaje={error} />
        {nota ? (
          <p role="status" className="text-verde mt-4">
            {nota}
          </p>
        ) : null}
      </div>
    </MarcoConversacion>
  );
}
