import { Link } from 'wouter';

import type { VisionCompartida } from '@v2/shared';

const ESCALAS: Record<string, string> = {
  comunitaria: 'Comunidad',
  municipal: 'Municipio',
  provincial: 'Provincia',
  nacional: 'Nación',
  entre_territorios: 'Coordinación entre territorios',
};
const ESTADOS: Record<string, string> = {
  publicada: 'Síntesis publicada por su equipo',
  borrador: 'Síntesis en revisión',
  requiere_revision: 'Síntesis pendiente de revisión por retiro de una referencia',
};
export function TarjetaVision({ ficha: f }: { ficha: VisionCompartida['fichas'][number] }) {
  return (
    <li className="border-tinta break-inside-avoid border p-6">
      <p className="text-sm">
        {f.territorio ?? 'Todo el país'} · Versión {f.revision} · {f.fuentes} fuentes
        documentadas
      </p>
      <h2 className="font-anton mt-3 text-3xl">
        <Link className="underline decoration-1 underline-offset-4" href={`/fichas/${f.id}`}>
          {f.titulo}
        </Link>
      </h2>
      <p className="mt-4 whitespace-pre-wrap break-words">
        <strong>Futuro deseado: </strong>
        {f.futuro || 'Pendiente de formular'}
      </p>
      <p className="mt-3 text-sm">
        {f.sintesis
          ? (ESTADOS[f.sintesis] ?? 'Estado de síntesis por revisar')
          : 'Propuesta sin síntesis deliberativa'}
      </p>
      {f.objetivos.length ? (
        <ul className="mt-5 space-y-4">
          {f.objetivos.map((o) => (
            <li key={o.id} className="border-violeta border-l-2 pl-4">
              <h3 className="font-semibold">{o.titulo}</h3>
              <p className="mt-1 whitespace-pre-wrap break-words">{o.resultado}</p>
              <p className="mt-2 text-sm">
                Escala propuesta: {ESCALAS[o.escala] ?? o.escala} · Horizonte: {o.horizonte}
              </p>
              <Link
                className="mt-2 inline-flex min-h-11 underline"
                href={`/fichas/${f.id}#evidencia`}
              >
                Ver línea de base, meta, fuentes y límites
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4">Todavía faltan objetivos verificables.</p>
      )}
      <p className="mt-4 whitespace-pre-wrap break-words">
        <strong>Próxima investigación: </strong>
        {f.proximaTarea || 'Pendiente de acordar'}
      </p>
      <Link className="mt-3 inline-flex min-h-11 underline" href={`/fichas/${f.id}#conversacion`}>
        Revisar argumentos, acuerdos y desacuerdos
      </Link>
    </li>
  );
}
