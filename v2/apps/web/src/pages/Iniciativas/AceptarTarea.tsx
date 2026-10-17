import { estadoTareaSchema } from '@v2/shared';

import { texto } from './campos';
import { FormularioGestion } from './Formulario';

export function AceptarTarea({
  id,
  tareaId,
  revision,
  abrir = false,
}: {
  id: number;
  tareaId: number;
  revision: number;
  abrir?: boolean;
}) {
  return (
    <details open={abrir} className="border-verde border-l-2 pl-4">
      <summary className="min-h-11 cursor-pointer font-semibold">Quiero hacer esta tarea</summary>
      <p className="mt-3">
        Al aceptar te hacés responsable del alcance publicado. Tu firma y tu nota serán públicas.
        Podés liberar la responsabilidad si no podés continuar.
      </p>
      <FormularioGestion
        ruta={`/${id}/tareas/${tareaId}/estado`}
        revision={revision}
        boton="Acepto hacerme cargo de esta tarea"
        campos={[
          { clave: 'firma', etiqueta: 'Mi firma pública' },
          { clave: 'nota', etiqueta: 'Cómo me organizo para cumplir esta tarea', tipo: 'textarea' },
        ]}
        preparar={(v, r) =>
          estadoTareaSchema.parse({
            ...r,
            accion: 'aceptar',
            firma: texto(v, 'firma'),
            nota: texto(v, 'nota'),
          })
        }
      />
    </details>
  );
}
