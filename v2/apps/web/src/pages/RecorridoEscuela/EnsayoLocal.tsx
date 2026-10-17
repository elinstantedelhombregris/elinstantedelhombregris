import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { z } from 'zod';

import { api } from '~/lib/api';

const ensayoSchema = z.object({
  tipo: z.literal('escuela_local'),
  inicio: z.string().date(),
  cierre: z.string().date(),
  campanaId: z.string().uuid(),
  fichaId: z.string().uuid(),
  iniciativaSlug: z.string().regex(/^[a-z0-9-]+$/),
  tareaId: z.number().int().positive(),
  cuentas: z.array(z.object({ usuario: z.string(), rol: z.string() })),
  clave: z.string(),
});
type Ensayo = z.infer<typeof ensayoSchema>;

/** Sólo se monta en desarrollo; el endpoint existe únicamente en la entrada local. */
export function EnsayoLocal() {
  const [ensayo, setEnsayo] = useState<Ensayo | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void api
      .get<unknown>('/api/local/escuela', { signal: controller.signal })
      .then((dato) => {
        const resultado = ensayoSchema.safeParse(dato);
        if (resultado.success && !controller.signal.aborted) setEnsayo(resultado.data);
      })
      .catch(() => {
        /* El ejemplo sin API sigue disponible. */
      });
    return () => {
      controller.abort();
    };
  }, []);
  if (!ensayo) return null;
  const tarea = `/iniciativas/${ensayo.iniciativaSlug}?seccion=tareas&tarea=${ensayo.tareaId}`;
  const ficha = `/fichas/${ensayo.fichaId}`;
  const campana = `/campanas/${ensayo.campanaId}`;
  const ingresar = `/ingresar?volver=${encodeURIComponent(tarea)}`;
  return (
    <section
      id="ensayo-local"
      className="border-verde mb-8 scroll-mt-24 space-y-5 border-2 p-5 md:p-8"
      aria-label="Práctica con API local"
    >
      <h2 className="font-anton text-3xl">Probalo con cuentas y datos guardados</h2>
      <p>
        API local conectada. Estas acciones se guardan en la base de ensayo de esta computadora. Los
        horarios, las cuentas y el caso son ficticios. No ingreses datos personales reales.
        Reiniciar la API conserva tu progreso.
      </p>
      <p>
        Ensayo preparado el {ensayo.inicio}. Revisión prevista: {ensayo.cierre}.
      </p>
      <div className="flex flex-wrap gap-5">
        <Link className="min-h-11 underline" href={campana}>
          1. Leer la campaña del ensayo
        </Link>
        <Link className="min-h-11 underline" href={ficha}>
          2. Leer la ficha y su objeción
        </Link>
        <Link className="min-h-11 font-semibold underline" href={tarea}>
          3. Abrir la tarea de práctica
        </Link>
      </div>
      <details>
        <summary className="min-h-11 cursor-pointer font-semibold underline">
          Cuentas y pasos para probar el ciclo completo
        </summary>
        <p className="my-3">
          Contraseña de las tres cuentas, sólo en este ensayo: <code>{ensayo.clave}</code>.
        </p>
        <ul className="space-y-3">
          {ensayo.cuentas.map((c) => (
            <li key={c.usuario}>
              <code>{c.usuario}</code> — {c.rol}.
            </li>
          ))}
        </ul>
        <p className="mt-4">
          <Link className="underline" href={ingresar}>
            Ingresar y volver a la tarea
          </Link>
          . Para cambiar de rol, abrí{' '}
          <Link className="underline" href="/mi-espacio?pestana=cuenta">
            Cuenta y datos
          </Link>
          , cerrá la sesión y volvé a ingresar con el otro usuario. También podés usar ventanas
          privadas distintas.
        </p>
        <ol className="mt-5 list-decimal space-y-4 pl-5">
          <li>
            <strong>Coordinación:</strong> abrí «Elegir ficha de devolución», buscá «Llegar a
            tiempo», elegí la ficha del ensayo, confirmá y guardá el destino. No necesitás copiar
            enlaces.
          </li>
          <li>
            <strong>Participante:</strong> elegí «Sumarme al equipo», leé el alcance y aceptá la
            tarea con tu firma de ensayo y una nota. Entrar al equipo no te asigna la tarea.
          </li>
          <li>
            <strong>Participante:</strong> en «Aceptar o registrar un paso», elegí «Iniciar o
            retomar» y explicá qué vas a hacer. Contrastá la planilla de abajo; después registrá
            «Declarar ejecución realizada».
          </li>
          <li>
            <strong>Participante:</strong> abrí «Ver evidencia y resultados» y «Registrar evidencia
            del resultado». Explicá las cuentas y los límites, autorizá su publicación en este
            ensayo y publicá. La evidencia ya debe verse en la ficha, pendiente de revisión.
          </li>
          <li>
            <strong>Revisión:</strong> ingresá con la tercera cuenta, sumate al equipo y abrí la
            evidencia. Registrá la revisión con firma y fundamento. Una cuenta distinta no acredita
            independencia entre personas.
          </li>
          <li>
            <strong>Coordinación:</strong> volvé a la ficha y comprobá resultado, revisión y
            objeción. Publicá en la campaña una devolución que distinga lo calculado de lo pendiente
            y responda al desacuerdo sobre trabajo y cuidados.
          </li>
        </ol>
        <p className="mt-4">
          Si la versión cambió, revisá el contenido actualizado antes de confirmar el siguiente
          paso. Si la tarea ya está tomada, seguí con esa cuenta o liberá su responsabilidad desde
          ella.
        </p>
      </details>
      <details>
        <summary className="min-h-11 cursor-pointer font-semibold underline">
          Planilla ficticia para realizar la tarea
        </summary>
        <p className="my-3">
          Ingreso supuesto: 08:00. Sumá la llegada a la parada y los minutos de caminata. A–E son
          cinco combinaciones inventadas, no personas ni servicios reales.
        </p>
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Cinco horarios inventados para practicar el cálculo</caption>
          <thead>
            <tr>
              <th className="p-2">Caso</th>
              <th className="p-2">Llegada</th>
              <th className="p-2">Caminata</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['A', '07:35', '15 min'],
              ['B', '07:50', '15 min'],
              ['C', '07:40', '10 min'],
              ['D', '07:55', '10 min'],
              ['E', '07:30', '20 min'],
            ].map(([caso, hora, minutos]) => (
              <tr key={caso}>
                <td className="p-2">{caso}</td>
                <td className="p-2">{hora}</td>
                <td className="p-2">{minutos}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3">
          El resultado debe aclarar que un cálculo de horarios inventados no mide el transporte, las
          demoras ni la puntualidad real. Sigue pendiente escuchar otros turnos y responder la
          objeción sobre los cuidados.
        </p>
      </details>
      <Link
        className="inline-flex min-h-11 items-center underline"
        href={`${ficha}#resultados-campo`}
      >
        Ver qué volvió a la ficha
      </Link>
      <p className="text-sm">
        La simulación de abajo sigue disponible: sus botones sólo cambian esa demostración y no
        guardan acciones en la API.
      </p>
    </section>
  );
}
