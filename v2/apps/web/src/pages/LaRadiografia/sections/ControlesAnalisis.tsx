import { useState } from 'react';
import { Link } from 'wouter';

import { BusquedaTerritorial } from '../../ElMapa/instrumento/BusquedaTerritorial';

import { CompartirProceso } from '~/components/participacion/CompartirProceso';
import { CAMPO } from '~/components/participacion/constantes';
import { BotonAccion, ErrorOperacion, Nota } from '~/components/participacion/Elementos';
import { TemaDelAporte } from '~/components/participacion/TemaDelAporte';
import { useAuth } from '~/lib/auth/use-auth';
import { useCampanas, useOperacionPersonal } from '~/lib/queries/participacion';

export function ControlesAnalisis({
  filtros,
  cambiar,
  corte,
}: {
  filtros: Record<string, string>;
  cambiar: (f: Record<string, string>) => void;
  corte: string | null;
}) {
  const campanas = useCampanas();
  const auth = useAuth();
  const guardar = useOperacionPersonal();
  const [nombre, setNombre] = useState('');
  const editar = (clave: string, valor: string) => {
    const nuevo = { ...filtros };
    if (valor) nuevo[clave] = valor;
    else {
      cambiar(Object.fromEntries(Object.entries(nuevo).filter(([k]) => k !== clave)));
      return;
    }
    cambiar(nuevo);
  };
  return (
    <section
      className="bg-papel-crudo text-tinta mb-7 border p-5"
      aria-label="Elegir el alcance del análisis"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label>
          Campaña
          <select
            className={CAMPO}
            value={filtros.campana ?? ''}
            onChange={(e) => {
              editar('campana', e.target.value);
            }}
          >
            <option value="">Todas las voces elegibles</option>
            {campanas.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.contrato.titulo}
              </option>
            ))}
          </select>
        </label>
        <TemaDelAporte
          valor={filtros.tema ?? ''}
          cambiar={(v) => {
            editar('tema', v);
          }}
          rotulo="Tema declarado"
        />
        <div>
          <p className="mb-2">Ámbito territorial</p>
          <BusquedaTerritorial
            onElegir={(l) => {
              editar('territorio', String(l.id));
            }}
          />
          {filtros.territorio ? (
            <button
              type="button"
              className="text-violeta mt-2 min-h-11 underline"
              onClick={() => {
                editar('territorio', '');
              }}
            >
              Volver al alcance nacional
            </button>
          ) : null}
        </div>
        <label>
          Clase de aporte
          <select
            className={CAMPO}
            value={filtros.tipo ?? ''}
            onChange={(e) => {
              editar('tipo', e.target.value);
            }}
          >
            <option value="">Todos los tipos</option>
            <option value="sueño">Sueños</option>
            <option value="propuesta">Propuestas</option>
            <option value="necesidad">Necesidades</option>
            <option value="recurso">Recursos</option>
            <option value="práctica">Prácticas</option>
            <option value="pregunta">Preguntas</option>
            <option value="basta">Situaciones que queremos cambiar</option>
            <option value="saber">Saberes</option>
            <option value="compromiso">Compromisos</option>
          </select>
        </label>
        <label>
          Desde
          <input
            type="date"
            className={CAMPO}
            value={filtros.desde?.slice(0, 10) ?? ''}
            onChange={(e) => {
              editar(
                'desde',
                e.target.value ? new Date(`${e.target.value}T00:00:00-03:00`).toISOString() : '',
              );
            }}
          />
        </label>
        <label>
          Hasta
          <input
            type="date"
            className={CAMPO}
            value={filtros.hasta?.slice(0, 10) ?? ''}
            onChange={(e) => {
              editar(
                'hasta',
                e.target.value
                  ? new Date(`${e.target.value}T23:59:59.999-03:00`).toISOString()
                  : '',
              );
            }}
          />
        </label>
      </div>
      <Nota>
        Los patrones describen semejanza entre textos. Los acuerdos necesitan respuestas explícitas
        y se trabajan en las fichas de futuro. Cada lectura declara su modelo, corte y cobertura.
      </Nota>
      <CompartirProceso
        href={`/la-radiografia?${new URLSearchParams(filtros).toString()}`}
        titulo="Compartir este análisis"
      />
      <div className="flex flex-wrap gap-4">
        <Link
          href={`/datos-abiertos?${new URLSearchParams(filtros).toString()}`}
          className="text-violeta inline-flex min-h-11 items-center underline"
        >
          Descargar estos datos
        </Link>
        <Link
          href="/datos-abiertos"
          className="text-violeta inline-flex min-h-11 items-center underline"
        >
          Descargar el registro público
        </Link>
        <Link href="/fichas" className="text-violeta inline-flex min-h-11 items-center underline">
          Futuros y acuerdos en elaboración
        </Link>
      </div>
      {auth.user ? (
        <div className="mt-5 flex flex-wrap items-end gap-4">
          <label className="flex-1">
            Nombre para guardar esta lectura
            <input
              className={CAMPO}
              value={nombre}
              maxLength={120}
              onChange={(e) => {
                setNombre(e.target.value);
              }}
            />
          </label>
          <BotonAccion
            tono="papel"
            disabled={guardar.isPending || nombre.trim().length < 3}
            onClick={() => {
              guardar.mutate({
                metodo: 'post',
                ruta: '/api/v1/mi-espacio/analisis',
                cuerpo: { nombre, consulta: filtros, corte },
              });
            }}
          >
            Guardar en mi espacio
          </BotonAccion>
          {guardar.isSuccess ? (
            <p role="status" className="text-verde">
              La lectura quedó guardada.
            </p>
          ) : null}
          <ErrorOperacion mensaje={guardar.error?.message} />
        </div>
      ) : (
        <Link
          href="/ingresar?volver=%2Fmi-espacio"
          className="text-violeta mt-4 inline-flex min-h-11 items-center underline"
        >
          Ingresar para guardar análisis
        </Link>
      )}
    </section>
  );
}
