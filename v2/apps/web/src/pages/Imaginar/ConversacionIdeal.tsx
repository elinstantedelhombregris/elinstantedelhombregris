import { useQuery } from '@tanstack/react-query';
import { CONTRATO_SENAL, contribucionSchema } from '@v2/shared';
import { useEffect, useRef, useState } from 'react';
import { useSearch } from 'wouter';

import { Asistencia } from './Asistencia';
import { MarcoConversacion } from './MarcoConversacion';
import { Recibo } from './Recibo';
import { Revision } from './Revision';

import type { LugarMapa } from '../ElMapa/instrumento/BusquedaTerritorial';

import { CAMPO } from '~/components/participacion/constantes';
import { BotonAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { api } from '~/lib/api';
import { useAuth } from '~/lib/auth/use-auth';
import { guardarBorrador, leerBorradores } from '~/lib/participacion/borradores';
import { useCampana, usePublicarAporte } from '~/lib/queries/participacion';

const PREGUNTAS = [
  'En tu Argentina ideal, ¿qué sería posible en tu vida?',
  '¿Por qué eso es importante para vos?',
  '¿Qué tendría que funcionar para hacerlo posible?',
];
export function ConversacionIdeal({
  integrada = false,
  lugarInicial = null,
}: {
  integrada?: boolean;
  lugarInicial?: LugarMapa | null;
}) {
  const auth = useAuth();
  const search = useSearch();
  const origen = useRef(new URLSearchParams(search));
  const q = origen.current;
  const campanaId = q.get('campana');
  const edicion = Number(q.get('edicion'));
  const edicionInvalida =
    q.has('edicion') && (!campanaId || !Number.isSafeInteger(edicion) || edicion <= 0);
  const [edicionElegida, fijarEdicion] = useState<number | undefined>(
    Number.isSafeInteger(edicion) && edicion > 0 ? edicion : undefined,
  );
  const campana = useCampana(campanaId ?? undefined, edicionElegida);
  useEffect(() => {
    if (campanaId && !edicionInvalida && campana.data && edicionElegida === undefined)
      fijarEdicion(campana.data.revision);
  }, [campanaId, edicionInvalida, campana.data, edicionElegida]);
  const [paso, setPaso] = useState(0);
  const [frases, setFrases] = useState(['', '', '']);
  const [lectura, setLectura] = useState('');
  const [tema, setTema] = useState('');
  const [lugar, setLugar] = useState<LugarMapa | null>(lugarInicial);
  const [publicar, setPublicar] = useState(false);
  const [cede, setCede] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [incluir, setIncluir] = useState(false);
  const [nota, setNota] = useState('');
  const [error, setError] = useState('');
  const identidad = useRef<string>(crypto.randomUUID());
  const intento = useRef<{ contenido: string; id: string; cuenta: number | null } | null>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const enviar = usePublicarAporte();
  const contexto = useQuery({
    queryKey: ['contexto-participacion'],
    queryFn: () => api.get<{ proveedor: string | null }>('/api/v1/contribuciones/contexto'),
  });
  useEffect(() => {
    const id = new URLSearchParams(search).get('borrador');
    if (!id) return;
    void leerBorradores()
      .then((lista) => {
        const b = lista.find((v) => v.id === id);
        if (b) {
          setFrases(b.frases);
          identidad.current = b.id;
          setNota('Retomaste un borrador que estaba guardado solo en este dispositivo.');
        }
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'No pudimos leer el borrador.');
      });
  }, [search]);
  useEffect(() => {
    titulo.current?.focus();
  }, [paso]);
  const TituloPregunta = integrada ? 'h3' : 'h2';
  const pregunta =
    paso === 0 && campana.data ? campana.data.contrato.pregunta : (PREGUNTAS[paso] ?? '');
  const avanzar = () => {
    if (paso === 2) {
      intento.current = null;
      setLectura(frases.filter(Boolean).join('\n\n'));
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
        campanaId,
      });
      setNota('Tu reflexión quedó en este dispositivo. No se publicó ni se subió a una cuenta.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos guardar el borrador.');
    }
  };
  const publicarVoz = () => {
    setError('');
    if (edicionInvalida) {
      setError(
        'La edición del enlace no es válida. Conservá tu reflexión y revisá el proceso antes de compartir.',
      );
      return;
    }
    const cuerpo = {
      senal: {
        contrato: CONTRATO_SENAL,
        idLocal: intento.current?.id ?? crypto.randomUUID(),
        tipo: 'sueño',
        texto: lectura.trim(),
        cedeLicencia: cede,
        sinTema: !tema.trim(),
        casa: 'sinRespuesta',
        tema: tema.trim() || null,
        ...(lugar
          ? {
              provinceId: lugar.provinceId,
              ...(['locality', 'settlement'].includes(lugar.level) ? { cityId: lugar.id } : {}),
            }
          : {}),
      },
      cuentaEsperada: intento.current?.cuenta ?? auth.user?.id ?? null,
      campanaId: campana.data?.id ?? null,
      edicion: campana.data?.revision ?? null,
      fragmentos: incluir
        ? frases
            .map((respuesta, i) => ({
              pregunta:
                i === 0 && campana.data
                  ? campana.data.contrato.pregunta
                  : (PREGUNTAS[i] ?? 'Mi reflexión'),
              respuesta,
            }))
            .filter((f) => f.respuesta.trim())
        : [],
      interpretacionConfirmada: true,
      aceptaPublicar: true,
    };
    const contenido = JSON.stringify({
      ...cuerpo,
      cuentaEsperada: undefined,
      senal: { ...cuerpo.senal, idLocal: undefined },
    });
    if (intento.current?.contenido !== contenido)
      intento.current = { contenido, id: crypto.randomUUID(), cuenta: auth.user?.id ?? null };
    cuerpo.senal.idLocal = intento.current.id;
    cuerpo.cuentaEsperada = intento.current.cuenta;
    const validado = contribucionSchema.safeParse(cuerpo);
    if (!validado.success) {
      setError(validado.error.issues.map((i) => i.message).join(' '));
      return;
    }
    enviar.mutate(validado.data);
  };
  if (enviar.data)
    return (
      <MarcoConversacion
        integrada={integrada}
        titulo="Una posibilidad empieza a encontrarse con otras."
        entrada="Una voz tiene valor cuando conserva su sentido y puede seguir su recorrido."
      >
        <Recibo
          recibo={enviar.data}
          campanaId={campana.data?.id ?? null}
          textoVisible={cede}
          territorio={lugar?.name ?? 'Argentina'}
        />
      </MarcoConversacion>
    );
  const faseCerrada =
    edicionInvalida || Boolean(campanaId && campana.data && campana.data.estado !== 'abierta');
  return (
    <MarcoConversacion
      integrada={integrada}
      titulo="Mi Argentina ideal."
      entrada="No hace falta tener un plan. Empecemos por la vida que querrías poder vivir. Después veremos qué condiciones la sostienen."
    >
      {edicionInvalida ? (
        <Nota>
          La edición del enlace no es válida. Tu reflexión sigue privada; revisá la convocatoria
          antes de compartirla.
        </Nota>
      ) : null}
      {campanaId ? (
        <Nota>
          {campana.isLoading ? (
            'Buscando la campaña…'
          ) : campana.isError ? (
            'No pudimos leer la campaña. Tu texto sigue con vos; reintentá antes de publicarlo en ese proceso.'
          ) : (
            <>
              Campaña: <strong>{campana.data?.contrato.titulo}</strong> · edición{' '}
              {campana.data?.revision}.{' '}
              {faseCerrada
                ? 'Esta ronda no recibe aportes ahora. Podés guardar tu reflexión y volver cuando se abra.'
                : 'Participás en esta edición después de revisar tu aporte.'}
            </>
          )}
        </Nota>
      ) : null}
      <div aria-hidden className="mb-3 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-1 flex-1 ${i <= paso ? 'bg-violeta' : 'bg-papel-borde'}`} />
        ))}
      </div>
      <p className="font-space text-violeta mb-5 text-xs uppercase">
        {paso < 3 ? `Tu reflexión · ${paso + 1} de 3` : 'Revisión y elección'}
      </p>
      {paso < 3 ? (
        <section
          className={
            integrada
              ? 'border-tinta/20 border-y py-5'
              : 'border-tinta bg-papel-crudo border p-5 min-[961px]:p-8'
          }
        >
          <TituloPregunta
            ref={titulo}
            tabIndex={-1}
            className={`font-anton leading-tight ${integrada ? 'text-[28px]' : 'text-[clamp(26px,3vw,40px)]'}`}
          >
            {pregunta}
          </TituloPregunta>
          <p className="text-tinta-75 mt-4 leading-relaxed">
            {paso === 0
              ? 'Una escena alcanza para empezar. Qué harías, con quién, cómo sería un día tuyo.'
              : 'Podés contestar, dejarlo abierto o seguir. El futuro no se diseña a la fuerza.'}
          </p>
          <textarea
            aria-label={pregunta}
            rows={integrada ? 4 : 6}
            maxLength={2000}
            value={frases[paso] ?? ''}
            onChange={(e) => {
              setFrases((prev) => prev.map((f, i) => (i === paso ? e.target.value : f)));
            }}
            className={CAMPO}
            placeholder={paso === 0 ? 'En mi Argentina ideal…' : 'Lo que para mí importa…'}
          />
          <p className="text-tinta-50 mt-2 text-xs">
            {(frases[paso] ?? '').length} de 2000 caracteres · todavía privado
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {paso > 0 ? (
              <BotonAccion
                tono="papel"
                onClick={() => {
                  setPaso(paso - 1);
                }}
              >
                Volver
              </BotonAccion>
            ) : null}
            <BotonAccion disabled={paso === 0 && !frases[0]?.trim()} onClick={avanzar}>
              {paso === 2 ? 'Revisar lo que voy a compartir' : 'Seguir imaginando'}
            </BotonAccion>
            {paso > 0 ? (
              <button type="button" className="min-h-11 underline" onClick={avanzar}>
                Dejar esta pregunta abierta
              </button>
            ) : null}
          </div>
        </section>
      ) : (
        <>
          <Asistencia
            texto={frases.filter(Boolean).join('\n\n')}
            proveedor={contexto.data?.proveedor ?? null}
            leer={(v) => {
              setLectura(v);
              setConfirmado(false);
            }}
          />
          <Revision
            lectura={lectura}
            cambiar={(v) => {
              setLectura(v);
              setConfirmado(false);
            }}
            tema={tema}
            cambiarTema={setTema}
            lugar={lugar}
            elegirLugar={setLugar}
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
            enviar={publicarVoz}
            enviando={enviar.isPending}
            bloqueado={faseCerrada || Boolean(campanaId && !campana.data)}
            {...(enviar.error ? { error: enviar.error.message } : {})}
          />
        </>
      )}
      <div className="mt-7 flex flex-wrap items-center gap-4">
        <BotonAccion
          tono="papel"
          onClick={() => {
            void guardar();
          }}
        >
          Guardar en este dispositivo
        </BotonAccion>
        <p className="text-tinta-50 max-w-[550px] text-sm">
          Elegís guardarlo localmente. Otras personas que usen este navegador podrían leerlo; podés
          borrarlo desde Mi espacio.
        </p>
      </div>
      <ErrorOperacion mensaje={error} />
      {nota ? (
        <p role="status" className="text-verde mt-4">
          {nota}
        </p>
      ) : null}
    </MarcoConversacion>
  );
}
