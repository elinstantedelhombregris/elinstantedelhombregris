import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';

import { PASOS_ESCUELA } from './pasos';

import { BotonPapel } from '~/components/papel/primitives';
import { CAMPO } from '~/components/participacion/constantes';
import { MarcoParticipacion } from '~/components/participacion/Elementos';
import { useTituloDePagina } from '~/lib/titulo-de-pagina';

export function RecorridoEscuela() {
  useTituloDePagina('Llegar a tiempo a la escuela · ejemplo completo');
  const [paso, cambiarPaso] = useState(0);
  const [ficha, elegirFicha] = useState('');
  const [vinculada, vincular] = useState(false);
  const [miembro, sumarse] = useState(false);
  const [aceptada, aceptar] = useState(false);
  const [ejecucion, ejecutar] = useState<'pendiente' | 'en_curso' | 'declarada'>('pendiente');
  const [revision, revisar] = useState<'pendiente' | 'ampliar' | 'revisada'>('pendiente');
  const [devuelta, devolver] = useState(false);
  const titulo = useRef<HTMLHeadingElement>(null);
  const actual = PASOS_ESCUELA[paso] ?? PASOS_ESCUELA[0];
  useEffect(() => {
    titulo.current?.focus();
  }, [paso]);
  function reiniciar() {
    cambiarPaso(0);
    elegirFicha('');
    vincular(false);
    sumarse(false);
    aceptar(false);
    ejecutar('pendiente');
    revisar('pendiente');
    devolver(false);
  }
  return (
    <MarcoParticipacion
      titulo="Llegar a tiempo a la escuela"
      kicker="Un recorrido completo · ejemplo ficticio"
      entrada="Desde algo que queremos hacer posible hasta una tarea, su resultado y lo que aprendemos juntos."
    >
      <p className="border-violeta border-l-4 p-4 font-semibold">
        Ejemplo ficticio. Podés practicar sin cuenta. Las acciones de esta página no publican
        aportes, no crean tareas y no cuentan como resultados reales.
      </p>
      <nav aria-label="Etapas del ejemplo escolar" className="my-6 flex flex-wrap gap-2">
        {PASOS_ESCUELA.map((p, i) => (
          <button
            key={p.titulo}
            type="button"
            aria-current={paso === i ? 'step' : undefined}
            className={`min-h-11 border px-3 py-2 text-left ${paso === i ? 'border-tinta bg-tinta text-papel' : 'border-tinta'}`}
            onClick={() => {
              cambiarPaso(i);
            }}
          >
            {i + 1}. {p.titulo}
          </button>
        ))}
      </nav>
      <article className="border-tinta space-y-5 border p-5 md:p-8">
        <p className="text-sm">
          Paso {paso + 1} de {PASOS_ESCUELA.length} · Quién responde: {actual.quien}
        </p>
        <h2 ref={titulo} tabIndex={-1} className="font-anton text-3xl">
          {actual.titulo}
        </h2>
        <p>{actual.accion}</p>
        <div className="border-tinta/30 border-y py-4">
          <h3 className="font-semibold">Qué queda y con qué alcance</h3>
          <p className="mt-2">{actual.salida}</p>
        </div>
        {paso === 3 ? (
          <section className="space-y-4" aria-label="Practicar tarea y vínculo">
            <h3 className="font-anton text-2xl">Probá las dos decisiones</h3>
            <label className="block">
              Ficha de ejemplo donde devolver los resultados
              <select
                className={CAMPO}
                value={ficha}
                disabled={vinculada}
                onChange={(e) => {
                  elegirFicha(e.target.value);
                }}
              >
                <option value="">Elegí una ficha</option>
                <option value="escuela">
                  Llegar a tiempo a la escuela · zona escolar de ejemplo
                </option>
              </select>
            </label>
            <BotonPapel
              disabled={!ficha || vinculada}
              onClick={() => {
                vincular(true);
              }}
            >
              Simular vínculo con la ficha
            </BotonPapel>
            <p>
              {vinculada
                ? 'Destino elegido: Llegar a tiempo a la escuela.'
                : 'La administración todavía no eligió el destino.'}
            </p>
            <BotonPapel
              variant="fantasma"
              disabled={miembro}
              onClick={() => {
                sumarse(true);
              }}
            >
              Simular ingreso al equipo
            </BotonPapel>
            <p>
              {miembro
                ? 'Ya integrás el equipo de ejemplo. Todavía podés decidir si aceptás la tarea.'
                : 'Primero leés el alcance y elegís sumarte al equipo.'}
            </p>
            <BotonPapel
              disabled={!miembro || aceptada}
              onClick={() => {
                aceptar(true);
              }}
            >
              Simular aceptación personal
            </BotonPapel>
            <p>
              {aceptada
                ? 'Responsabilidad aceptada · firma ficticia: Participante de ejemplo.'
                : 'La tarea sigue sin responsable.'}
            </p>
          </section>
        ) : null}
        {paso === 4 ? (
          <section className="space-y-4" aria-label="Practicar ejecución">
            {!aceptada || !vinculada ? (
              <p>Para practicar la ejecución, aceptá la tarea y elegí su ficha en el paso 4.</p>
            ) : null}
            <BotonPapel
              disabled={!aceptada || !vinculada || ejecucion !== 'pendiente'}
              onClick={() => {
                ejecutar('en_curso');
              }}
            >
              Iniciar tarea de ejemplo
            </BotonPapel>
            <BotonPapel
              variant="fantasma"
              disabled={ejecucion !== 'en_curso'}
              onClick={() => {
                ejecutar('declarada');
              }}
            >
              Declarar registro realizado
            </BotonPapel>
            <p role="status">
              {ejecucion === 'declarada'
                ? 'Ejecución declarada. Resumen ficticio disponible en la ficha; revisión pendiente.'
                : ejecucion === 'en_curso'
                  ? 'Tarea de ejemplo en curso.'
                  : 'Ejecución pendiente.'}
            </p>
          </section>
        ) : null}
        {paso === 5 ? (
          <section className="space-y-4" aria-label="Practicar revisión">
            {ejecucion !== 'declarada' ? <p>Primero completá la declaración del paso 5.</p> : null}
            <BotonPapel
              variant="fantasma"
              disabled={ejecucion !== 'declarada' || revision === 'revisada'}
              onClick={() => {
                revisar('ampliar');
              }}
            >
              Simular pedido de más información
            </BotonPapel>
            <BotonPapel
              disabled={ejecucion !== 'declarada' || revision === 'revisada'}
              onClick={() => {
                revisar('revisada');
              }}
            >
              Simular revisión de otra cuenta
            </BotonPapel>
            <p role="status">
              {revision === 'revisada'
                ? 'Revisión ficticia: se contrastaron los horarios publicados. Falta observar el servicio y otro turno; no se comprobó una mejora de puntualidad.'
                : revision === 'ampliar'
                  ? 'Se pide aclarar las fechas de las fuentes. El resultado sigue pendiente de revisión; el ensayo supone esa aclaración antes de aprobar.'
                  : 'Revisión pendiente.'}
            </p>
          </section>
        ) : null}
        {paso === 6 ? (
          <section className="space-y-4" aria-label="Devolución de ejemplo">
            <BotonPapel
              disabled={revision !== 'revisada' || devuelta}
              onClick={() => {
                devolver(true);
              }}
            >
              Simular devolución a participantes
            </BotonPapel>
            <p role="status">
              {devuelta
                ? 'Ciclo de ejemplo completado: hay una devolución y una próxima pregunta. La puntualidad sigue sin evaluarse.'
                : 'La devolución de este ensayo espera la revisión del paso 6.'}
            </p>
            <p>
              <strong>Desacuerdo que se conserva:</strong> cambiar el ingreso puede complicar el
              trabajo y los cuidados. El equipo debe responder antes de elegir esa alternativa.
            </p>
          </section>
        ) : null}
        <p>
          <strong>Próximo paso:</strong> {actual.siguiente}
        </p>
        <div className="flex flex-wrap gap-3">
          <BotonPapel
            variant="fantasma"
            disabled={paso === 0}
            onClick={() => {
              cambiarPaso(paso - 1);
            }}
          >
            Anterior
          </BotonPapel>
          <BotonPapel
            disabled={paso === PASOS_ESCUELA.length - 1}
            onClick={() => {
              cambiarPaso(paso + 1);
            }}
          >
            Siguiente paso
          </BotonPapel>
        </div>
      </article>
      <aside className="mt-6 space-y-3 border-t pt-5" aria-label="Estado del ensayo">
        <p>
          Ensayo en esta página: ficha {vinculada ? 'vinculada' : 'pendiente'} · responsabilidad{' '}
          {aceptada ? 'aceptada' : 'pendiente'} · resultado{' '}
          {revision === 'revisada' ? 'revisado en el ejemplo' : 'pendiente de revisión'}.
        </p>
        <button className="min-h-11 underline" onClick={reiniciar}>
          Reiniciar el ejemplo
        </button>
      </aside>
      <div className="mt-6 flex flex-wrap gap-5">
        <Link className="min-h-11 underline" href="/iniciativas">
          Buscar tareas reales para sumarme
        </Link>
        <Link className="min-h-11 underline" href="/campanas">
          Explorar campañas reales
        </Link>
        <Link className="min-h-11 underline" href="/el-mapa">
          Explorar el mapa
        </Link>
      </div>
    </MarcoParticipacion>
  );
}
