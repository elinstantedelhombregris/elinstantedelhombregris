import { editarHitoSchema, nuevoHitoSchema } from '@v2/shared';

import { AUTORIZACION, texto } from './campos';
import { FormularioGestion } from './Formulario';
import { ListaGestion } from './Lista';

import type { CampoGestion } from './campos';
import type { HitoIniciativa } from '@v2/shared';

const campos: CampoGestion[] = [
  { clave: 'titulo', etiqueta: 'Nombre del hito' },
  { clave: 'descripcion', etiqueta: 'Qué se revisará y con qué criterio', tipo: 'textarea' },
  { clave: 'fecha', etiqueta: 'Fecha de revisión', tipo: 'date' },
  AUTORIZACION,
];
export function HitosIniciativa({ id, administrar }: { id: number; administrar: boolean }) {
  return (
    <section>
      <h2 className="font-anton text-3xl">Hitos de revisión</h2>
      <ListaGestion<HitoIniciativa> ruta={`/${id}/hitos`}>
        {(h) => (
          <article className="border-tinta space-y-3 border p-5" key={h.id}>
            <h3 className="font-anton text-2xl">{h.titulo}</h3>
            <p>{h.descripcion}</p>
            <p>
              Revisión: {h.fecha} · {h.completado ? 'registrada' : 'pendiente'} · hito {h.id}
            </p>
            {h.derivado ? (
              <p>Se administra desde la prueba de la ficha.</p>
            ) : administrar ? (
              <details>
                <summary className="cursor-pointer underline">Editar o cerrar hito</summary>
                <p className="mt-3 text-sm">
                  Para cerrar, todas sus tareas activas necesitan ejecución declarada y evidencia
                  revisada. La descripción debe conservar la conclusión y sus límites.
                </p>
                <FormularioGestion
                  ruta={`/${id}/hitos/${h.id}`}
                  metodo="patch"
                  revision={h.revision}
                  boton="Guardar hito"
                  iniciales={{
                    titulo: h.titulo,
                    descripcion: h.descripcion,
                    fecha: h.fecha,
                    completado: h.completado,
                  }}
                  campos={[
                    ...campos,
                    {
                      clave: 'completado',
                      etiqueta: 'Registrar revisión del hito',
                      tipo: 'checkbox',
                    },
                  ]}
                  preparar={(v, r) =>
                    editarHitoSchema.parse({
                      ...r,
                      titulo: texto(v, 'titulo'),
                      descripcion: texto(v, 'descripcion'),
                      fecha: v.fecha,
                      completado: v.completado === true,
                      autorizoPublicacion: v.autorizo,
                    })
                  }
                />
              </details>
            ) : null}
          </article>
        )}
      </ListaGestion>
      {administrar ? (
        <details className="border-tinta mt-6 border p-5">
          <summary className="cursor-pointer font-semibold">Crear un hito</summary>
          <FormularioGestion
            ruta={`/${id}/hitos`}
            campos={campos}
            boton="Crear hito"
            preparar={(v, r) =>
              nuevoHitoSchema.parse({
                ...r,
                titulo: texto(v, 'titulo'),
                descripcion: texto(v, 'descripcion'),
                fecha: v.fecha,
                autorizoPublicacion: v.autorizo,
              })
            }
          />
        </details>
      ) : null}
    </section>
  );
}
