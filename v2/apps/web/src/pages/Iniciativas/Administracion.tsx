import { editarIniciativaSchema, equipoIniciativaSchema } from '@v2/shared';

import { AUTORIZACION, texto, ESTADOS_INICIATIVA } from './campos';
import { FormularioGestion } from './Formulario';
import { ListaGestion } from './Lista';

import type { MiembroIniciativa, PermisosIniciativa } from '@v2/shared';
import type { Iniciativa } from '~/lib/queries/iniciativas';

export function AdministracionIniciativa({ i, p }: { i: Iniciativa; p: PermisosIniciativa }) {
  return (
    <div className="space-y-8">
      {p.administrar ? (
        <details className="border-tinta border p-5">
          <summary className="cursor-pointer font-semibold">Editar propósito y estado</summary>
          <p className="mt-3 text-sm">
            Para completar la iniciativa, sus tareas deben estar realizadas y tener resultados
            revisados. Archivar conserva lo registrado.
          </p>
          <FormularioGestion
            ruta={`/${i.id}`}
            metodo="patch"
            revision={i.revision}
            boton="Guardar iniciativa"
            iniciales={{
              titulo: i.title,
              resumen: i.summary,
              documento: i.bodyMarkdown ?? '',
              estado: i.status,
            }}
            campos={[
              { clave: 'titulo', etiqueta: 'Nombre' },
              { clave: 'resumen', etiqueta: 'Propósito', tipo: 'textarea' },
              { clave: 'documento', etiqueta: 'Documento público', tipo: 'textarea' },
              { clave: 'estado', etiqueta: 'Estado', opciones: ESTADOS_INICIATIVA },
              AUTORIZACION,
            ]}
            preparar={(v, r) =>
              editarIniciativaSchema.parse({
                ...r,
                titulo: texto(v, 'titulo'),
                resumen: texto(v, 'resumen'),
                documento: texto(v, 'documento'),
                estado: v.estado,
                autorizoPublicacion: v.autorizo,
              })
            }
          />
        </details>
      ) : null}
      {p.administrar ? (
        <section>
          <h3 className="font-anton text-2xl">Equipo</h3>
          <ListaGestion<MiembroIniciativa> ruta={`/${i.id}/equipo`}>
            {(m) => (
              <p key={m.id}>
                @{m.usuario} ·{' '}
                {m.rol === 'owner'
                  ? 'Propietario'
                  : m.rol === 'admin'
                    ? 'Administración'
                    : 'Integrante'}
              </p>
            )}
          </ListaGestion>
        </section>
      ) : null}
      {p.propietario ? (
        <details className="border-tinta border p-5">
          <summary className="cursor-pointer font-semibold">Administrar roles y propiedad</summary>
          <p className="mt-3 text-sm">
            La propiedad se transfiere cuando la otra persona acepta. Para retirar a alguien,
            primero debe liberar sus tareas activas.
          </p>
          <FormularioGestion
            ruta={`/${i.id}/equipo`}
            revision={i.revision}
            boton="Registrar cambio de equipo"
            campos={[
              {
                clave: 'accion',
                etiqueta: 'Cambio',
                opciones: [
                  { valor: 'rol', etiqueta: 'Cambiar rol' },
                  { valor: 'retirar', etiqueta: 'Retirar integrante' },
                  { valor: 'proponer_traspaso', etiqueta: 'Proponer transferencia de propiedad' },
                  { valor: 'cancelar_traspaso', etiqueta: 'Cancelar propuesta de transferencia' },
                ],
              },
              { clave: 'usuario', etiqueta: 'Nombre de usuario, sin @' },
              {
                clave: 'rol',
                etiqueta: 'Rol, solo al cambiarlo',
                opciones: [
                  { valor: 'member', etiqueta: 'Integrante' },
                  { valor: 'admin', etiqueta: 'Administración' },
                ],
              },
            ]}
            preparar={(v, r) =>
              equipoIniciativaSchema.parse({
                ...r,
                accion: v.accion,
                ...(v.accion === 'cancelar_traspaso' ? {} : { usuario: texto(v, 'usuario') }),
                ...(v.accion === 'rol' ? { rol: v.rol } : {}),
              })
            }
          />
        </details>
      ) : null}
      {p.aceptarTraspaso ? (
        <section className="border-violeta border p-5">
          <h3 className="font-anton text-2xl">Te propusieron la propiedad de esta iniciativa</h3>
          <p>
            Aceptar te permite administrar el equipo y transferir la propiedad. La persona anterior
            conserva administración.
          </p>
          <FormularioGestion
            campos={[]}
            ruta={`/${i.id}/equipo`}
            revision={i.revision}
            boton="Acepto hacerme cargo de la iniciativa"
            preparar={(_v, r) => equipoIniciativaSchema.parse({ ...r, accion: 'aceptar_traspaso' })}
          />
        </section>
      ) : null}
    </div>
  );
}
