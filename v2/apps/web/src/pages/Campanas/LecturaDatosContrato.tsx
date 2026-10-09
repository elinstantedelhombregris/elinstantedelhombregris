import { USO_DATOS_CONTRATO_ANTERIOR, METODO_LECTURA_CONTRATO_ANTERIOR } from '@v2/shared';

import type { ContratoCampana } from '@v2/shared';

export function LecturaDatosContrato({ contrato }: { contrato: Partial<Pick<ContratoCampana, 'usoDatos' | 'metodoLectura' | 'institucion'>> }) {
  return (
    <section className="mt-9 grid gap-6 border-y py-7 md:grid-cols-2">
      <div>
        <h2 className="font-anton text-2xl">Uso de los datos</h2>
        <p className="mt-3 whitespace-pre-wrap leading-relaxed">{contrato.usoDatos === undefined ? USO_DATOS_CONTRATO_ANTERIOR : contrato.usoDatos || 'El equipo todavía debe explicar este uso antes de convocar.'}</p>
      </div>
      <div>
        <h2 className="font-anton text-2xl">Método de lectura y revisión</h2>
        <p className="mt-3 whitespace-pre-wrap leading-relaxed">{contrato.metodoLectura === undefined ? METODO_LECTURA_CONTRATO_ANTERIOR : contrato.metodoLectura || 'El equipo todavía debe definir cómo leerá y revisará los aportes.'}</p>
      </div>
      {contrato.institucion ? (
        <p className="text-sm md:col-span-2">Institución mencionada por quien convoca: {contrato.institucion}. Esta mención no acredita representación ni aceptación institucional del proceso.</p>
      ) : null}
    </section>
  );
}
