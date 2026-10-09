import { USO_DATOS_CONTRATO_ANTERIOR, METODO_LECTURA_CONTRATO_ANTERIOR } from '@v2/shared';

import type { ContratoCampana } from '@v2/shared';

/** Cómo se usan los datos y cómo se lee lo escuchado: parte de las reglas de la campaña. */
export function LecturaDatosContrato({
  contrato,
}: {
  contrato: Partial<Pick<ContratoCampana, 'usoDatos' | 'metodoLectura' | 'institucion'>>;
}) {
  return (
    <section className="mt-9 grid gap-6 border-y py-7 md:grid-cols-2">
      <div>
        <h2 className="font-anton text-2xl">Uso de los datos</h2>
        <p className="mt-3 whitespace-pre-wrap leading-relaxed">
          {contrato.usoDatos === undefined
            ? USO_DATOS_CONTRATO_ANTERIOR
            : contrato.usoDatos ||
              'El equipo todavía debe explicar este uso antes de abrir la campaña.'}
        </p>
      </div>
      <div>
        <h2 className="font-anton text-2xl">Método de lectura y revisión</h2>
        <p className="mt-3 whitespace-pre-wrap leading-relaxed">
          {contrato.metodoLectura === undefined
            ? METODO_LECTURA_CONTRATO_ANTERIOR
            : contrato.metodoLectura ||
              'El equipo todavía debe definir cómo leerá y revisará los aportes.'}
        </p>
      </div>
      {contrato.institucion ? (
        <p className="text-sm md:col-span-2">
          Institución mencionada por quien abre la campaña: {contrato.institucion}. Esta mención no
          acredita representación ni aceptación institucional de la campaña.
        </p>
      ) : null}
    </section>
  );
}
