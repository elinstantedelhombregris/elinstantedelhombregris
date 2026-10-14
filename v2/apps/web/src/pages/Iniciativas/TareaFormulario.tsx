import { editarTareaSchema, nuevaTareaSchema } from '@v2/shared';
import { useState } from 'react';

import { BusquedaTerritorial, type LugarMapa } from '../ElMapa/instrumento/BusquedaTerritorial';

import { AUTORIZACION, texto } from './campos';
import { FormularioGestion } from './Formulario';

import type { CampoGestion } from './campos';
import type { TareaIniciativa } from '@v2/shared';

const CAMPOS: CampoGestion[] = [
  { clave: 'titulo', etiqueta: 'Objetivo de la tarea' },
  { clave: 'alcance', etiqueta: 'Qué se hará y a qué escala', tipo: 'textarea' },
  { clave: 'fecha', etiqueta: 'Fecha prevista de revisión', tipo: 'date' },
  {
    clave: 'hitoId',
    etiqueta: 'Número del hito, si corresponde',
    tipo: 'number',
    ayuda: 'Lo encontrás en la pestaña Hitos. Dejalo vacío si todavía no tiene uno.',
  },
  {
    clave: 'recursos',
    etiqueta: 'Recursos disponibles y pendientes',
    tipo: 'textarea',
    ayuda: 'Describir recursos no crea una reserva. Acordala en Capacidades.',
  },
];
const ESCUCHA: CampoGestion[] = [
  {
    clave: 'zona',
    etiqueta: 'Zona pública del relevamiento',
    ayuda: 'Usá barrios, corredores o lugares públicos; evitá domicilios y rutinas personales.',
  },
  {
    clave: 'metodo',
    etiqueta: 'Método',
    opciones: [
      { valor: 'conversacion', etiqueta: 'Conversaciones' },
      { valor: 'recorrido', etiqueta: 'Recorrido de observación' },
      { valor: 'encuesta', etiqueta: 'Encuesta' },
      { valor: 'fuentes', etiqueta: 'Revisión de fuentes' },
    ],
  },
  {
    clave: 'canal',
    etiqueta: 'Procedencia de la escucha',
    opciones: [
      { valor: 'presencial', etiqueta: 'Presencial' },
      { valor: 'digital', etiqueta: 'Digital' },
      { valor: 'mixta', etiqueta: 'Mixta' },
    ],
  },
  {
    clave: 'convocatoria',
    etiqueta: 'Cómo se convocará y a quiénes puede dejar afuera',
    tipo: 'textarea',
  },
  {
    clave: 'unidad',
    etiqueta: 'Unidad de relevamiento',
    ayuda: 'Ej.: tres encuentros en la zona escolar. Conservá la misma definición para comparar.',
  },
  {
    clave: 'versionUnidad',
    etiqueta: 'Versión de esa unidad',
    ayuda: 'Cambiá la versión si cambia la zona, el método o el alcance.',
  },
];
export function TareaFormulario({
  id,
  tarea,
  escucha = false,
}: {
  id: number;
  tarea?: TareaIniciativa;
  escucha?: boolean;
}) {
  const [lugar, setLugar] = useState<LugarMapa | null>(null);
  const [territorioId, setTerritorioId] = useState<number | null>(
    tarea?.escucha?.territorioId ?? null,
  );
  return (
    <div className="mt-4">
      {escucha ? (
        <>
          <p>Elegí el territorio del asunto. El alcance preciso se describe como zona pública.</p>
          <BusquedaTerritorial
            superficie="papel"
            onElegir={(l) => {
              setLugar(l);
              setTerritorioId(l.id);
            }}
          />
          <p className="my-3">
            {lugar
              ? lugar.name
              : territorioId
                ? 'Territorio conservado de la tarea.'
                : 'Sin territorio de catálogo seleccionado.'}{' '}
            <button
              type="button"
              className="underline"
              onClick={() => {
                setLugar(null);
                setTerritorioId(null);
              }}
            >
              Quitar selección
            </button>
          </p>
        </>
      ) : null}
      <FormularioGestion
        ruta={`/${id}/tareas${tarea ? `/${tarea.id}` : ''}`}
        metodo={tarea ? 'patch' : 'post'}
        {...(tarea ? { revision: tarea.revision } : {})}
        boton={tarea ? 'Guardar tarea' : 'Crear tarea'}
        iniciales={{
          titulo: tarea?.titulo ?? '',
          alcance: tarea?.alcance ?? '',
          fecha: tarea?.fecha ?? '',
          hitoId: tarea?.hitoId ? String(tarea.hitoId) : '',
          recursos: tarea?.recursos ?? '',
          zona: tarea?.escucha?.zona ?? '',
          metodo: tarea?.escucha?.metodo ?? 'conversacion',
          canal: tarea?.escucha?.canal ?? 'presencial',
          convocatoria: tarea?.escucha?.convocatoria ?? '',
          unidad: tarea?.escucha?.unidad ?? '',
          versionUnidad: tarea?.escucha?.versionUnidad ?? '1',
        }}
        campos={[...CAMPOS, ...(escucha ? ESCUCHA : []), AUTORIZACION]}
        preparar={(v, r) => {
          const contenido = {
            ...r,
            titulo: texto(v, 'titulo'),
            alcance: texto(v, 'alcance'),
            fecha: v.fecha,
            hitoId: texto(v, 'hitoId') ? Number(v.hitoId) : null,
            recursos: texto(v, 'recursos'),
            autorizoPublicacion: v.autorizo,
            escucha: escucha
              ? {
                  territorioId,
                  zona: texto(v, 'zona'),
                  metodo: v.metodo,
                  canal: v.canal,
                  convocatoria: texto(v, 'convocatoria'),
                  unidad: texto(v, 'unidad'),
                  versionUnidad: texto(v, 'versionUnidad'),
                }
              : null,
          };
          return tarea ? editarTareaSchema.parse(contenido) : nuevaTareaSchema.parse(contenido);
        }}
      />
    </div>
  );
}
