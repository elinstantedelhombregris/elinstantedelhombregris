import { objetivoFichaSchema, type FuenteFicha, type ObjetivoFicha } from '@v2/shared';
import { useState } from 'react';

import { BusquedaTerritorial } from '../../ElMapa/instrumento/BusquedaTerritorial';

import { CampoDato } from './CampoDato';

const CAMPOS = [
  ['titulo', 'Objetivo', 'texto'],
  ['resultado', 'Resultado deseado', 'largo'],
  ['horizonte', 'Fecha para revisar la meta', 'date'],
  ['ambito', 'Población y alcance afectados', 'largo'],
  ['indicador', 'Indicador con el que se comprobaría', 'texto'],
  ['unidad', 'Unidad de la base y la meta', 'texto'],
  ['metodo', 'Método de verificación', 'largo'],
  ['tareaPendiente', 'Tarea para establecer lo que falta', 'largo'],
  ['institucionPropuesta', 'Institución competente propuesta', 'texto'],
  ['principios', 'Principios que orientan el objetivo', 'largo'],
  ['gravedad', 'Gravedad documentada', 'largo'],
  ['desigualdad', 'Desigualdades a considerar', 'largo'],
  ['viabilidad', 'Viabilidad e incertidumbre', 'largo'],
] as const;
export function FormularioObjetivo({
  inicial,
  fuentes,
  guardar,
  cancelar,
}: {
  inicial: ObjetivoFicha;
  fuentes: FuenteFicha[];
  guardar: (o: ObjetivoFicha) => void;
  cancelar: () => void;
}) {
  const [v, setV] = useState(inicial);
  const [error, setError] = useState('');
  const [nombres, setNombres] = useState<Record<number, string>>({});
  return (
    <form
      className="border-tinta mt-5 border p-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const r = objetivoFichaSchema.safeParse(v);
        if (!r.success) {
          setError(
            r.error.issues.some((i) => i.code === 'custom')
              ? r.error.issues
                  .filter((i) => i.code === 'custom')
                  .map((i) => i.message)
                  .join(' · ')
              : 'Completá el objetivo, resultado, horizonte, alcance, indicador, unidad y método de verificación.',
          );
          return;
        }
        guardar(r.data);
      }}
    >
      <h3 className="font-anton text-2xl">Formular un objetivo verificable</h3>
      {CAMPOS.map(([k, etiqueta, tipo]) => (
        <CampoDato
          key={k}
          etiqueta={etiqueta}
          tipo={tipo}
          valor={v[k]}
          cambiar={(valor) => {
            setV({ ...v, [k]: valor });
          }}
        />
      ))}
      <div className="grid gap-4 sm:grid-cols-2">
        {(['lineaBase', 'meta'] as const).map((k) => (
          <CampoDato
            key={k}
            etiqueta={k === 'lineaBase' ? 'Línea de base' : 'Meta propuesta'}
            tipo="number"
            valor={v[k]}
            cambiar={(valor) => {
              setV({ ...v, [k]: valor === '' ? null : Number(valor) });
            }}
            ayuda="Dejá vacío si está pendiente; cero es un valor real."
          />
        ))}
      </div>
      <CampoDato
        etiqueta="Fecha de la línea de base"
        tipo="date"
        valor={v.fechaBase}
        cambiar={(fecha) => {
          setV({ ...v, fechaBase: fecha || null });
        }}
      />
      <fieldset className="mt-5">
        <legend className="font-semibold">Fuentes que sostienen este objetivo</legend>
        {fuentes.length ? (
          fuentes.map((f) => (
            <label key={f.id} className="mt-3 flex gap-3">
              <input
                type="checkbox"
                checked={v.fuenteIds.includes(f.id)}
                onChange={(e) => {
                  setV({
                    ...v,
                    fuenteIds: e.target.checked
                      ? [...v.fuenteIds, f.id]
                      : v.fuenteIds.filter((id) => id !== f.id),
                  });
                }}
              />
              {f.titulo}
            </label>
          ))
        ) : (
          <p className="mt-2 text-sm">
            Agregá primero una fuente o mantené pendiente la línea de base.
          </p>
        )}
      </fieldset>
      <CampoDato
        etiqueta="Escala de decisión"
        valor={v.escala}
        opciones={[
          ['comunitaria', 'Comunitaria'],
          ['municipal', 'Municipal'],
          ['provincial', 'Provincial'],
          ['nacional', 'Nacional'],
          ['entre_territorios', 'Entre territorios'],
        ]}
        cambiar={(valor) => {
          setV({ ...v, escala: objetivoFichaSchema.innerType().shape.escala.parse(valor) });
        }}
      />
      <CampoDato
        etiqueta="Validación de la competencia"
        valor={v.competencia}
        opciones={[
          ['por_validar', 'Competencia por validar'],
          ['documentada', 'Competencia documentada'],
        ]}
        cambiar={(valor) => {
          if (valor === 'por_validar' || valor === 'documentada')
            setV({ ...v, competencia: valor });
        }}
      />
      {v.competencia === 'documentada' ? (
        <CampoDato
          etiqueta="Fuente de la competencia institucional"
          valor={v.fuenteCompetencia}
          opciones={[['', 'Elegí una fuente'], ...fuentes.map((f) => [f.id, f.titulo] as const)]}
          cambiar={(valor) => {
            setV({ ...v, fuenteCompetencia: valor || null });
          }}
        />
      ) : null}
      <div className="mt-5">
        <BusquedaTerritorial
          superficie="papel"
          rotulo="Agregar un territorio al objetivo"
          onElegir={(l) => {
            setV({ ...v, territorios: [...new Set([...v.territorios, l.id])] });
            setNombres({ ...nombres, [l.id]: l.name });
          }}
        />
        <ul>
          {v.territorios.map((id) => (
            <li key={id}>
              {nombres[id] ?? `Territorio ${id}`}{' '}
              <button
                className="min-h-11 underline"
                type="button"
                onClick={() => {
                  setV({ ...v, territorios: v.territorios.filter((t) => t !== id) });
                }}
              >
                Quitar territorio {id}
              </button>
            </li>
          ))}
        </ul>
        {!v.territorios.length ? (
          <p className="mt-2 text-sm">Todo el país; el texto debe precisar a quiénes comprende.</p>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="mt-4">
          {error}
        </p>
      ) : null}
      <div className="mt-5 flex gap-5">
        <button className="min-h-11 underline" type="submit">
          Incorporar objetivo al borrador
        </button>
        <button className="min-h-11 underline" type="button" onClick={cancelar}>
          Cancelar objetivo
        </button>
      </div>
    </form>
  );
}
