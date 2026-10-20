import { CONTRATO_SENAL, PREGUNTA_MI_ARGENTINA_IDEAL } from '@v2/shared';

import type { LugarMapa } from '~/pages/ElMapa/instrumento/BusquedaTerritorial';

export const PREGUNTAS_GUIADAS = [
  PREGUNTA_MI_ARGENTINA_IDEAL,
  '¿Por qué eso es importante para vos?',
  '¿Qué tendría que funcionar para hacerlo posible?',
] as const;

interface Entrada {
  idLocal: string;
  texto: string;
  cedeLicencia: boolean;
  tema: string;
  lugar: LugarMapa | null;
  cuentaEsperada: number | null;
  /** La campaña en la que entra; `null` publica sin campaña. */
  destino: { id: string; revision: number } | null;
  /** Las respuestas que se comparten como origen del texto, ya filtradas. */
  fragmentos: { pregunta: string; respuesta: string }[];
}

/**
 * El cuerpo de un aporte de las tres preguntas del panel viejo del mapa: siempre un
 * `sueño`, sin respuesta sobre la casa. Lo usa `ConversacionIdeal` hasta que la
 * entrega 3 lo borre; lo nuevo es `armarAporteIdeal`.
 */
export function armarAporteGuiado(e: Entrada) {
  return {
    senal: {
      contrato: CONTRATO_SENAL,
      idLocal: e.idLocal,
      tipo: 'sueño',
      texto: e.texto.trim(),
      cedeLicencia: e.cedeLicencia,
      sinTema: !e.tema.trim(),
      casa: 'sinRespuesta',
      tema: e.tema.trim() || null,
      ...(e.lugar
        ? {
            provinceId: e.lugar.provinceId,
            ...(['locality', 'settlement'].includes(e.lugar.level) ? { cityId: e.lugar.id } : {}),
          }
        : {}),
    },
    cuentaEsperada: e.cuentaEsperada,
    campanaId: e.destino?.id ?? null,
    edicion: e.destino?.revision ?? null,
    fragmentos: e.fragmentos,
    interpretacionConfirmada: true,
    aceptaPublicar: true,
  };
}

export interface EntradaIdeal {
  idLocal: string;
  /** Lo que ven los demás: hasta `LARGO_LINEA` letras. Es el texto del aporte. */
  linea: string;
  /** Lo que la persona escribió completo en la primera pantalla. */
  texto: string;
  /** La elección de quién puede leerlo: `true` es «que cualquiera lo pueda leer y citar». */
  cedeLicencia: boolean;
  /** La clave del tema que la persona confirmó, o `null` si lo dejó abierto. */
  tema: string | null;
  /** La provincia elegida; `null` es «Prefiero no decirlo». */
  provinciaId: number | null;
  cuentaEsperada: number | null;
  /** La campaña en la que entra; `null` publica sin campaña. */
  destino: { id: string; revision: number } | null;
  /** La pregunta que se contestó. Por defecto, la de Mi Argentina ideal. */
  pregunta?: string;
}

const juntar = (s: string) => s.trim().replace(/\s+/g, ' ');

/**
 * El cuerpo de un aporte de Imaginar (spec §3, P2): un `sueño` cuyo texto es la
 * versión corta que ven los demás. Si la persona escribió más, lo completo va como
 * fragmento —`{ pregunta, respuesta }`, que existe para mostrar de dónde salió un
 * aporte—; si lo escrito y lo publicado son lo mismo, no se repite.
 */
export function armarAporteIdeal(e: EntradaIdeal) {
  const linea = e.linea.trim();
  const texto = e.texto.trim();
  const tema = e.tema?.trim() ?? '';
  return {
    senal: {
      contrato: CONTRATO_SENAL,
      idLocal: e.idLocal,
      tipo: 'sueño',
      texto: linea,
      cedeLicencia: e.cedeLicencia,
      sinTema: !tema,
      casa: 'sinRespuesta',
      tema: tema || null,
      ...(e.provinciaId !== null ? { provinceId: e.provinciaId } : {}),
    },
    cuentaEsperada: e.cuentaEsperada,
    campanaId: e.destino?.id ?? null,
    edicion: e.destino?.revision ?? null,
    fragmentos:
      texto && juntar(texto) !== juntar(linea)
        ? [{ pregunta: e.pregunta ?? PREGUNTA_MI_ARGENTINA_IDEAL, respuesta: texto }]
        : [],
    interpretacionConfirmada: true,
    aceptaPublicar: true,
  };
}
