import { useState } from 'react';
import { Link } from 'wouter';

import { BusquedaTerritorial, type LugarMapa } from './ElMapa/instrumento/BusquedaTerritorial';
import { ESTADOS_TAREA } from './Iniciativas/campos';
import { ListaGestion } from './Iniciativas/Lista';

import type { EscuchaPublica } from '@v2/shared';

import { MarcoParticipacion } from '~/components/participacion/Elementos';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

export function EscuchaTerritorial() {
  useTituloDePagina('Escucha territorial');
  const [lugar, setLugar] = useState<LugarMapa | null>(null),
    [estado, setEstado] = useState('');
  const params = new URLSearchParams();
  if (lugar) params.set('territorioId', String(lugar.id));
  if (estado) params.set('estado', estado);
  return (
    <MarcoParticipacion
      titulo="A quiénes falta escuchar"
      entrada="Organizá una escucha con zona, método y fecha. Registrá también ausencias y límites para entender qué aprendimos y qué sigue pendiente."
      kicker="Cobertura y trabajo territorial"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          [
            'Registros publicados',
            'Muestran que hubo aportes con el alcance y la precisión autorizados.',
          ],
          [
            'Vigencia de observaciones',
            'Se lee con su fecha y método. Un registro antiguo no describe necesariamente el presente.',
          ],
          [
            'Alcance de la escucha',
            'Describe dónde y cómo se relevó. No mide qué porcentaje de población está representada.',
          ],
        ].map(([titulo, detalle]) => (
          <section className="border-tinta border p-5" key={titulo}>
            <h2 className="font-anton text-2xl">{titulo}</h2>
            <p className="mt-3">{detalle}</p>
          </section>
        ))}
      </div>
      <details className="border-tinta my-6 border p-5">
        <summary className="cursor-pointer font-semibold">
          Ejemplo: escuchar horarios de una escuela
        </summary>
        <ol className="mt-4 list-decimal space-y-3 pl-5">
          <li>
            Una iniciativa propone conversar con familias de la zona escolar. Define tres
            encuentros, su invitación y una fecha para revisar.
          </li>
          <li>
            Una persona integrante acepta coordinar. Conserva notas privadas y pide autorización
            antes de publicar un aporte.
          </li>
          <li>
            Al terminar, informa el período, número de encuentros, diferencias encontradas y a
            quiénes faltó escuchar. Tres encuentros no representan al barrio entero.
          </li>
          <li>
            Otra cuenta revisa el método. Si faltaron quienes trabajan de noche, se abre una próxima
            tarea para esa ausencia.
          </li>
        </ol>
        <p className="mt-4 font-semibold">
          Ejemplo ficticio; no se registra como un relevamiento realizado.
        </p>
      </details>
      <p className="mb-5">
        <Link className="underline" href="/iniciativas/ejemplo">
          Recorrer el ejemplo de escucha y administración paso a paso →
        </Link>
      </p>
      <Link className="mb-6 inline-flex min-h-11 underline" href="/iniciativas/nueva?escucha=si">
        Planear una escucha en mi iniciativa →
      </Link>
      <h2 className="font-anton text-3xl">Escuchas propuestas y realizadas</h2>
      <div className="my-4 space-y-3">
        <BusquedaTerritorial onElegir={setLugar} superficie="papel" />
        {lugar ? (
          <p>
            Territorio exacto del catálogo: {lugar.name}.{' '}
            <button
              className="underline"
              onClick={() => {
                setLugar(null);
              }}
            >
              Ver todos
            </button>
          </p>
        ) : null}
        <p className="text-sm">
          El filtro usa el territorio declarado; no incorpora automáticamente localidades de una
          provincia.
        </p>
        <label>
          Estado
          <select
            className="border-tinta bg-papel ml-3 border p-2"
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
            }}
          >
            <option value="">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="realizada">Ejecución declarada</option>
          </select>
        </label>
      </div>
      <ListaGestion<EscuchaPublica>
        ruta={`/escuchas?${params.toString()}`}
        vacio="No hay tareas de escucha para esta consulta. Esto no significa que nadie haya escuchado en ese territorio."
      >
        {(t) => (
          <article key={t.id} className="border-tinta space-y-3 border p-5">
            <h3 className="font-anton text-2xl">{t.titulo}</h3>
            <p>
              {t.escucha?.zona} · {t.escucha?.canal}
            </p>
            <p>
              {ESTADOS_TAREA[t.estado] ?? t.estado}. Revisión prevista: {t.fecha}. Responsable:{' '}
              {t.firma ?? 'pendiente'}.
            </p>
            <p>
              Unidad: {t.escucha?.unidad} · versión {t.escucha?.versionUnidad}.
            </p>
            <p>{t.escucha?.convocatoria}</p>
            <p>
              {t.revisiones} registros de evidencia con revisión; no equivalen a representatividad.
            </p>
            <Link
              className="inline-flex min-h-11 underline"
              href={`/iniciativas/${t.iniciativaSlug}?seccion=tareas&tarea=${t.id}`}
            >
              Ver tarea, ausencias y resultados en {t.iniciativaTitulo}
            </Link>
          </article>
        )}
      </ListaGestion>
    </MarcoParticipacion>
  );
}
