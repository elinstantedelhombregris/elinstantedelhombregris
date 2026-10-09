import { solicitarExportacionSchema } from '@v2/shared';
import { useEffect, useRef, useState } from 'react';

import { CAMPO } from './constantes';
import { BotonAccion, ErrorOperacion } from './Elementos';

import type { SolicitudExportacion, TrabajoExportacion } from '@v2/shared';

import { api, ApiError } from '~/lib/api';
import { filtrosPublicos } from '~/lib/participacion/exportar';
import { escribir } from '~/lib/queries/participacion';

interface Control {
  id: string;
  idSolicitud: string;
  formato: SolicitudExportacion['formato'];
}
function guardar(clave: string, control: Control) {
  try {
    sessionStorage.setItem(clave, JSON.stringify(control));
  } catch {
    /* La lectura sigue sin almacenamiento local. */
  }
}
export function DescargarDatos({
  consulta = {},
  titulo = 'Descargar estos datos',
}: {
  consulta?: Record<string, string>;
  titulo?: string;
}) {
  const [formato, setFormato] = useState<SolicitudExportacion['formato']>('csv');
  const [trabajo, setTrabajo] = useState<TrabajoExportacion | null>(null);
  const [control, setControl] = useState<Control | null>(null);
  const [pendiente, setPendiente] = useState<SolicitudExportacion | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState('');
  const operacion = useRef({ numero: 0 });
  const clave =
    'basta-exportacion:' +
    JSON.stringify(Object.entries(consulta).sort(([a], [b]) => a.localeCompare(b)));
  useEffect(() => {
    const secuencia = operacion.current;
    secuencia.numero++;
    setOcupado(false);
    setTrabajo(null);
    setControl(null);
    setPendiente(null);
    setError('');
    try {
      const texto = sessionStorage.getItem(clave);
      const previo: unknown = texto ? JSON.parse(texto) : null;
      if (
        previo &&
        typeof previo === 'object' &&
        'id' in previo &&
        'idSolicitud' in previo &&
        'formato' in previo &&
        typeof previo.id === 'string' &&
        typeof previo.idSolicitud === 'string' &&
        ['csv', 'jsonl', 'geojson'].includes(String(previo.formato))
      ) {
        const c = previo as Control;
        setControl(c);
        setFormato(c.formato);
      }
      const textoPendiente = sessionStorage.getItem(clave + ':solicitud');
      const pedido = solicitarExportacionSchema.safeParse(
        textoPendiente ? JSON.parse(textoPendiente) : null,
      );
      if (pedido.success) {
        setPendiente(pedido.data);
        setFormato(pedido.data.formato);
      }
    } catch {
      /* Una referencia dañada no publica ni pide un nuevo archivo. */
    }
    return () => {
      secuencia.numero++;
    };
  }, [clave]);
  useEffect(() => {
    if (!control) return;
    const ac = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const leer = async () => {
      try {
        const actual = await api.get<TrabajoExportacion>(
          `/api/v1/exportaciones/trabajos/${encodeURIComponent(control.id)}`,
          { signal: ac.signal },
        );
        if (ac.signal.aborted) return;
        setTrabajo(actual);
        setError('');
        if (actual.estado === 'solicitado' || actual.estado === 'preparando')
          timer = setTimeout(() => {
            void leer();
          }, 3000);
      } catch (e) {
        if (!ac.signal.aborted) {
          setError(e instanceof Error ? e.message : 'No pudimos consultar el trabajo.');
          if (e instanceof ApiError && [400, 404, 410].includes(e.status)) {
            setControl(null);
            setTrabajo(null);
            try {
              sessionStorage.removeItem(clave);
            } catch {
              /* Sin copia local. */
            }
          } else
            timer = setTimeout(() => {
              void leer();
            }, 10_000);
        }
      }
    };
    void leer();
    return () => {
      ac.abort();
      if (timer) clearTimeout(timer);
    };
  }, [control, clave]);
  const activo =
    ocupado ||
    trabajo?.estado === 'solicitado' ||
    trabajo?.estado === 'preparando' ||
    Boolean(control && !trabajo);
  const pedir = async () => {
    if (ocupado) return;
    const turno = ++operacion.current.numero;
    setOcupado(true);
    setError('');
    try {
      const filtros = filtrosPublicos(consulta);
      const solicitud =
        pendiente?.formato === formato
          ? pendiente
          : solicitarExportacionSchema.parse({
              idSolicitud: crypto.randomUUID(),
              formato,
              filtros,
              ...(consulta.umbral || consulta.k
                ? {
                    analisis: {
                      umbral: Number(consulta.umbral ?? '0.72'),
                      k: Number(consulta.k ?? '12'),
                    },
                  }
                : {}),
            });
      setPendiente(solicitud);
      setControl(null);
      setTrabajo(null);
      try {
        sessionStorage.setItem(clave + ':solicitud', JSON.stringify(solicitud));
        sessionStorage.removeItem(clave);
      } catch {
        /* Se conserva el pedido en memoria. */
      }
      const t = await escribir<TrabajoExportacion>(
        'post',
        '/api/v1/exportaciones/trabajos',
        solicitud,
      );
      const c = { id: t.id, idSolicitud: solicitud.idSolicitud, formato };
      guardar(clave, c);
      if (turno === operacion.current.numero) {
        setControl(c);
        setTrabajo(t);
        setPendiente(null);
      }
      try {
        sessionStorage.removeItem(clave + ':solicitud');
      } catch {
        /* El servidor ya confirmó el trabajo. */
      }
    } catch (e) {
      if (turno === operacion.current.numero)
        setError(e instanceof Error ? e.message : 'No pudimos pedir el archivo.');
    } finally {
      if (turno === operacion.current.numero) setOcupado(false);
    }
  };
  const cancelar = async () => {
    if (!control) return;
    const turno = ++operacion.current.numero;
    setOcupado(true);
    setError('');
    try {
      const actualizado = await escribir<TrabajoExportacion>(
        'post',
        `/api/v1/exportaciones/trabajos/${control.id}/cancelar`,
        { idSolicitud: control.idSolicitud },
      );
      if (turno === operacion.current.numero) setTrabajo(actualizado);
    } catch (e) {
      if (turno === operacion.current.numero)
        setError(e instanceof Error ? e.message : 'No pudimos cancelar la preparación.');
    } finally {
      if (turno === operacion.current.numero) setOcupado(false);
    }
  };
  const estado = trabajo?.estado;
  return (
    <div className="bg-papel-crudo border p-5">
      <label className="block text-sm">
        Formato de los registros
        <select
          className={`${CAMPO} max-w-[250px]`}
          value={formato}
          disabled={activo}
          onChange={(e) => {
            setFormato(e.target.value as SolicitudExportacion['formato']);
            setPendiente(null);
            try {
              sessionStorage.removeItem(clave + ':solicitud');
            } catch {
              /* Sin copia local. */
            }
          }}
        >
          <option value="csv">CSV para tablas</option>
          <option value="jsonl">JSONL para análisis</option>
          <option value="geojson">GeoJSON para mapas</option>
        </select>
      </label>
      <div className="mt-4 flex flex-wrap gap-3">
        <BotonAccion
          disabled={activo}
          onClick={() => {
            void pedir();
          }}
        >
          {activo
            ? 'Preparando el archivo…'
            : pendiente
              ? 'Reintentar el pedido'
              : trabajo
                ? 'Pedir un archivo nuevo'
                : titulo}
        </BotonAccion>
        {control && (estado === 'solicitado' || estado === 'preparando') ? (
          <BotonAccion
            tono="papel"
            disabled={ocupado}
            onClick={() => {
              void cancelar();
            }}
          >
            Cancelar preparación
          </BotonAccion>
        ) : null}
        {trabajo && estado === 'disponible' ? (
          <a
            href={`/api/v1/exportaciones/trabajos/${trabajo.id}/archivo`}
            className="font-space border-tinta bg-violeta text-papel inline-flex min-h-11 items-center border px-5 py-3 text-xs uppercase tracking-wide"
          >
            Descargar ZIP preparado
          </a>
        ) : null}
      </div>
      {trabajo ? (
        <div role="status" className="text-tinta-75 mt-4 text-sm">
          <p>
            {estado === 'solicitado'
              ? 'Tu lectura entró en la cola.'
              : estado === 'preparando'
                ? 'Estamos reuniendo el alcance completo.'
                : estado === 'disponible'
                  ? 'Archivo completo y disponible.'
                  : (trabajo.mensaje ?? 'Pedí una lectura nueva.')}
          </p>
          <p className="mt-2">
            {trabajo.registros.toLocaleString('es-AR')} registros preparados
            {trabajo.total ? ` de ${trabajo.total.toLocaleString('es-AR')}` : ''} · corte{' '}
            {new Date(trabajo.corte).toLocaleString('es-AR')}.
          </p>
          {estado === 'disponible' ? (
            <p className="mt-2">
              Disponible hasta {new Date(trabajo.venceEn).toLocaleString('es-AR')}. Revisamos otra
              vez los permisos al abrir el archivo.
            </p>
          ) : null}
        </div>
      ) : null}
      <ErrorOperacion mensaje={error} />
      <p className="text-tinta-50 mt-3 text-sm">
        La preparación sigue aunque cierres esta pestaña. Incluye todas las páginas del alcance
        elegido, permisos, omisiones y fecha de corte. No descarga la base interna.
      </p>
      <p className="text-tinta-50 mt-2 text-sm">
        El servidor transmite el ZIP directamente. Si una fuente se corrige o se retira, pedí una
        lectura nueva. Para más de 100.000 registros o 256 MB, dividí por zona, tema o fechas.
      </p>
    </div>
  );
}
