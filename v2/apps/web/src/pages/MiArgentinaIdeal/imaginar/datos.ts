import { useQuery } from '@tanstack/react-query';
import { LARGO_LINEA, NOMBRE_DEL_DATO, buscarDatosPersonales, sugerirTema } from '@v2/shared';

import { api } from '~/lib/api';
import { useProvincias } from '~/lib/queries/open-data';

/**
 * Lo que la persona va armando en Imaginar. Vive en memoria (spec §3, P6): guardar
 * en el dispositivo es una acción explícita, con «Guardar borrador».
 */
export interface AporteEnCurso {
  /** Lo que escribió completo en la primera pantalla. */
  texto: string;
  /** La versión corta, la que ven los demás. */
  linea: string;
  /** Si ya la editó, volver a la primera pantalla no la pisa con otra sugerencia. */
  lineaTocada: boolean;
  /** La clave del tema que confirmó; `null` lo deja abierto. */
  tema: string | null;
  /** `''` sin elegir, `'ninguna'` es «Prefiero no decirlo», si no el id de la provincia. */
  provincia: string;
  /** La elección de quién puede leerlo, sin opción marcada de antemano (P1). */
  lectura: 'libre' | 'reservado' | null;
  acepta: boolean;
}

export const APORTE_VACIO: AporteEnCurso = {
  texto: '',
  linea: '',
  lineaTocada: false,
  tema: null,
  provincia: '',
  lectura: null,
  acepta: false,
};

/** Menos que esto no alcanza para una frase. */
export const LARGO_MINIMO = 6;
export const LARGO_TEXTO = 2000;
export const SIN_PROVINCIA = 'ninguna';

export function provinciaIdDe(provincia: string): number | null {
  const id = Number(provincia);
  return provincia !== SIN_PROVINCIA && Number.isSafeInteger(id) && id > 0 ? id : null;
}

export interface TemaDeContexto {
  clave: string;
  etiqueta: string;
}

/** Los 13 temas del registro. Comparte la consulta con `TemaDelAporte`. */
export function useTemas() {
  return useQuery({
    queryKey: ['participacion-temas'],
    queryFn: () => api.get<{ temas?: TemaDeContexto[] }>('/api/v1/contribuciones/contexto'),
    select: (d) => d.temas ?? [],
  });
}

const sinTildes = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/**
 * El tema que sugieren las palabras, entre los del registro. El léxico de
 * `sugerirTema` usa claves sin tildes («educacion») y el registro las tiene con
 * tilde («educación»): se comparan sin tildes y se devuelve el del registro.
 */
export function temaSugeridoDe(
  texto: string,
  temas: readonly TemaDeContexto[],
): TemaDeContexto | null {
  const porClave = new Map(temas.map((t) => [sinTildes(t.clave), t]));
  const clave = sugerirTema(texto, [...porClave.keys()]);
  return clave === null ? null : (porClave.get(clave) ?? null);
}

/** El nombre de la provincia elegida, para el papelito; `null` si prefirió no decirlo. */
export function useNombreDeProvincia(provincia: string): string | null {
  const provincias = useProvincias();
  const id = provinciaIdDe(provincia);
  if (id === null) return null;
  return provincias.data?.find((p) => p.id === id)?.name ?? null;
}

export function useEtiquetaDeTema(clave: string | null): string | null {
  const temas = useTemas();
  if (clave === null) return null;
  return temas.data?.find((t) => t.clave === clave)?.etiqueta ?? null;
}

export interface ProblemaDeLinea {
  /** Dónde está lo que hay que arreglar: ahí va el foco. */
  en: 'linea' | 'provincia';
  mensaje: string;
}

/** Por qué todavía no se puede seguir desde la segunda pantalla, o `null` si se puede. */
export function problemaDeLinea(a: AporteEnCurso): ProblemaDeLinea | null {
  const linea = a.linea.trim();
  const enLaLinea = (mensaje: string): ProblemaDeLinea => ({ en: 'linea', mensaje });
  if (linea.length < LARGO_MINIMO)
    return enLaLinea('Tu aporte quedó muy corto. Escribí aunque sea una frase.');
  if (linea.length > LARGO_LINEA)
    return enLaLinea(
      `Pasa de ${LARGO_LINEA} letras. Achicalo un poco para que entre en la tarjeta.`,
    );
  const [enLinea] = buscarDatosPersonales(linea);
  if (enLinea)
    return enLaLinea(
      `Sacá ${NOMBRE_DEL_DATO[enLinea.tipo]} antes de seguir: el aporte se ve en público.`,
    );
  const [enTexto] = buscarDatosPersonales(a.texto);
  if (enTexto)
    return enLaLinea(
      `Lo que escribiste primero tiene ${NOMBRE_DEL_DATO[enTexto.tipo]}, y también se publica. Volvé y sacalo ahí.`,
    );
  if (!a.provincia)
    return { en: 'provincia', mensaje: 'Elegí tu provincia, o «Prefiero no decirlo».' };
  return null;
}
