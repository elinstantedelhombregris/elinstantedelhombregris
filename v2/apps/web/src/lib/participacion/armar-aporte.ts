import { CONTRATO_SENAL } from '@v2/shared';

import type { LugarMapa } from '~/pages/ElMapa/instrumento/BusquedaTerritorial';

export const PREGUNTAS_GUIADAS = [
  'En tu Argentina ideal, ¿qué sería posible en tu vida?',
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

/** El cuerpo de un aporte de las tres preguntas: siempre un `sueño`, sin respuesta sobre la casa. */
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
