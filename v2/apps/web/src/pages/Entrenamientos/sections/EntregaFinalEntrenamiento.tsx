import { useEffect, useMemo, useState } from 'react';

import { BotonPapel, Kicker } from '~/components/papel/primitives';

interface EntregaFinalEntrenamientoProps {
  cursoSlug: string;
  cursoTitulo: string;
  productoFinal: string;
  promesas: readonly string[];
}

interface BorradorEntrega {
  situacion: string;
  evidencia: string;
  decision: string;
  prueba: string;
}

const BORRADOR_VACIO: BorradorEntrega = {
  situacion: '',
  evidencia: '',
  decision: '',
  prueba: '',
};

const CAMPOS: readonly {
  clave: keyof BorradorEntrega;
  etiqueta: string;
  ayuda: string;
  placeholder: string;
}[] = [
  {
    clave: 'situacion',
    etiqueta: '1. Situación real',
    ayuda: 'Acotá lugar, actores, plazo y tensión. Un caso concreto vale más que un tema enorme.',
    placeholder: '¿Dónde pasa, a quién afecta y qué decisión está trabada?',
  },
  {
    clave: 'evidencia',
    etiqueta: '2. Evidencia disponible',
    ayuda: 'Separá lo observado de lo supuesto y anotá qué dato todavía falta.',
    placeholder: 'Hechos, documentos, voces, números y vacíos de información…',
  },
  {
    clave: 'decision',
    etiqueta: '3. Decisión que cambia',
    ayuda: 'Explicá qué harías distinto después del entrenamiento y por qué.',
    placeholder: 'Antes iba a… Ahora elijo… porque…',
  },
  {
    clave: 'prueba',
    etiqueta: '4. Prueba en 48 horas',
    ayuda: 'Diseñá un paso pequeño, reversible y observable. Incluí quién hace qué y cuándo.',
    placeholder: 'En las próximas 48 horas vamos a… Sabremos si funcionó cuando…',
  },
];

function claveLocal(cursoSlug: string) {
  return `entrenamientos:entrega:${cursoSlug}:v1`;
}

function leerBorrador(cursoSlug: string): BorradorEntrega {
  if (typeof window === 'undefined') return BORRADOR_VACIO;
  try {
    const guardado = window.localStorage.getItem(claveLocal(cursoSlug));
    if (guardado === null) return BORRADOR_VACIO;
    const datos = JSON.parse(guardado) as Partial<BorradorEntrega>;
    return {
      situacion: typeof datos.situacion === 'string' ? datos.situacion : '',
      evidencia: typeof datos.evidencia === 'string' ? datos.evidencia : '',
      decision: typeof datos.decision === 'string' ? datos.decision : '',
      prueba: typeof datos.prueba === 'string' ? datos.prueba : '',
    };
  } catch {
    return BORRADOR_VACIO;
  }
}

function markdownDeEntrega(
  cursoTitulo: string,
  productoFinal: string,
  promesas: readonly string[],
  borrador: BorradorEntrega,
) {
  const respuestas = CAMPOS.map(
    ({ clave, etiqueta }) => `## ${etiqueta}\n\n${borrador[clave].trim() || '_Pendiente_'}`,
  ).join('\n\n');
  const criterios = promesas.map((promesa) => `- [ ] ${promesa}`).join('\n');
  return `# Bitácora final · ${cursoTitulo}\n\n**Producto:** ${productoFinal}\n\n${respuestas}\n\n## Contrastes del curso\n\n${criterios}\n\n## Revisión honesta\n\n- [ ] El caso es específico.\n- [ ] Distinguí evidencia de interpretación.\n- [ ] Otra persona puede revisar la entrega.\n- [ ] El próximo paso tiene responsable y fecha.\n`;
}

/**
 * Convierte el cierre del quiz en una entrega transferible. El borrador queda
 * sólo en el navegador: no exige cuenta ni manda datos al servidor.
 */
export function EntregaFinalEntrenamiento({
  cursoSlug,
  cursoTitulo,
  productoFinal,
  promesas,
}: EntregaFinalEntrenamientoProps) {
  const [borrador, setBorrador] = useState<BorradorEntrega>(() => leerBorrador(cursoSlug));
  const [estadoDescarga, setEstadoDescarga] = useState<'quieto' | 'listo'>('quieto');
  const completos = CAMPOS.filter(({ clave }) => borrador[clave].trim().length >= 12).length;
  const markdown = useMemo(
    () => markdownDeEntrega(cursoTitulo, productoFinal, promesas, borrador),
    [borrador, cursoTitulo, productoFinal, promesas],
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(claveLocal(cursoSlug), JSON.stringify(borrador));
    } catch {
      // El entrenamiento sigue funcionando si el navegador bloquea el almacenamiento local.
    }
  }, [borrador, cursoSlug]);

  function actualizar(clave: keyof BorradorEntrega, valor: string) {
    setEstadoDescarga('quieto');
    setBorrador((anterior) => ({ ...anterior, [clave]: valor }));
  }

  function descargar() {
    const archivo = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = window.URL.createObjectURL(archivo);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `bitacora-${cursoSlug}.md`;
    enlace.click();
    window.URL.revokeObjectURL(url);
    setEstadoDescarga('listo');
  }

  return (
    <section className="border-violeta bg-papel-crudo mt-7 border-2 p-6 sm:p-8">
      <Kicker className="mb-3">Taller de entrega</Kicker>
      <h2 className="font-anton text-3xl leading-tight">Que el curso deje una prueba.</h2>
      <p className="text-tinta-75 mt-3 max-w-[650px] text-[15px] leading-relaxed">
        Tu producto es <strong>{productoFinal}</strong>. Armá acá el primer borrador: se guarda sólo
        en este navegador y podés bajarlo como archivo editable.
      </p>

      <div className="mt-6 grid gap-5">
        {CAMPOS.map(({ clave, etiqueta, ayuda, placeholder }) => (
          <label key={clave} className="block">
            <span className="font-space text-tinta block text-[12px] font-bold uppercase tracking-[0.08em]">
              {etiqueta}
            </span>
            <span className="text-tinta-75 mt-1 block text-[13px] leading-relaxed">{ayuda}</span>
            <textarea
              value={borrador[clave]}
              onChange={(evento) => {
                actualizar(clave, evento.currentTarget.value);
              }}
              placeholder={placeholder}
              rows={4}
              className="border-tinta bg-papel text-tinta focus:border-violeta mt-2 w-full resize-y border p-3 text-[15px] leading-relaxed outline-none"
            />
          </label>
        ))}
      </div>

      <div className="border-papel-borde mt-7 border-t pt-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p
            className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.1em]"
            aria-live="polite"
          >
            {completos} de {CAMPOS.length} piezas con contenido
          </p>
          <BotonPapel type="button" variant="violeta" onClick={descargar}>
            Descargar bitácora .md ↓
          </BotonPapel>
        </div>
        {estadoDescarga === 'listo' ? (
          <p className="text-verde mt-3 text-[13px] font-semibold" role="status">
            Bitácora descargada. Revisala con alguien que conozca el caso.
          </p>
        ) : null}
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {[
          ['Específica', 'Nombra caso, actores, lugar y plazo.'],
          ['Trazable', 'Distingue fuente, evidencia e interpretación.'],
          ['Contrastable', 'Otra persona puede discutirla o verificarla.'],
          ['Accionable', 'Tiene un paso pequeño, responsable y fecha.'],
        ].map(([titulo, detalle]) => (
          <div key={titulo} className="border-papel-borde border-t pt-3">
            <strong className="font-space text-violeta text-[10px] uppercase tracking-[0.08em]">
              {titulo}
            </strong>
            <p className="text-tinta-75 mt-1 text-[13px] leading-relaxed">{detalle}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
