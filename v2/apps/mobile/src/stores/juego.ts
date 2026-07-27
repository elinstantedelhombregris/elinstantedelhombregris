/**
 * Store de orquestación del día — zustand. CERO lógica de juego acá:
 * las reglas viven en src/game y la persistencia en src/db/repos; este
 * módulo solo lee, deriva la foto de hoy y coordina la UI (banners,
 * celebraciones, la estrella recién nacida que el Cielo anima).
 *
 * Importante: nada de esto corre antes de que _layout haya migrado la DB —
 * las pantallas llaman refresh() recién montadas bajo el gate.
 */

import { create } from 'zustand';

import { GANANCIAS, MOTIVOS } from '@/game/brasas';
import { fechaLocalDeISO } from '@/game/dia';
import { pickEvento, shouldTrigger } from '@/game/eventos';
import type { EventoFugaz, RachaEstado } from '@/game/types';
import {
  CLAVES,
  brasasBalance,
  brasasTotalGanado,
  diaDeHoy,
  estrellasTodas,
  ganarBrasas,
  getSetting,
  hoyLocal,
  rachaActual,
  setSetting,
} from '@/db/repos';
import type { DayRow, StarRow } from '@/db/schema';

/** Claves de settings propias del loop diario (G3). */
export const CLAVES_DIA = {
  nocheCelebrada: 'noche_celebrada_fecha',
  x2: 'x2_fecha',
  desafioPagado: 'desafio_pagado_fecha',
  desafioAvisado: 'desafio_avisado_fecha',
  preguntaExtra: 'pregunta_extra_fecha',
  gpsPedido: 'gps_pedido',
} as const;

export interface JuegoState {
  fecha: string;
  luces: DayRow;
  rachaInfo: RachaEstado;
  brasas: number;
  totalGanado: number;
  estrellas: StarRow[];
  /** Evento fugaz activo hoy (determinístico por fecha, spec §3.4). */
  eventoHoy: EventoFugaz | null;
  /** true mientras el aviso de la fugaz no se haya mostrado hoy. */
  eventoSinVer: boolean;
  /** Las tres luces encendidas y todavía sin celebrar hoy. */
  nocheParaCelebrar: boolean;
  /** Desafío 24 h recién logrado (para avisar una sola vez). */
  desafioRecienLogrado: boolean;
  /** La estrella que el Cielo tiene que hacer nacer con bloom. */
  newStarId: string | null;

  refresh: () => void;
  marcarEventoVisto: () => void;
  celebrarNoche: () => void;
  setNewStar: (id: string) => void;
  clearNewStar: () => void;
}

/** x2 en día de brasas dobles; 1 el resto del año. */
export const multiplicadorDe = (evento: EventoFugaz | null): 1 | 2 =>
  evento === 'brasas-x2' ? 2 : 1;

const DIA_CERO: DayRow = {
  fecha: '',
  ver: false,
  encender: false,
  dar: false,
  nocheCompleta: false,
};

export const useJuego = create<JuegoState>((set, get) => ({
  fecha: '',
  luces: DIA_CERO,
  rachaInfo: { racha: 0, nubladasUsadasEstaSemana: 0, viva: true },
  brasas: 0,
  totalGanado: 0,
  estrellas: [],
  eventoHoy: null,
  eventoSinVer: false,
  nocheParaCelebrar: false,
  desafioRecienLogrado: false,
  newStarId: null,

  refresh: () => {
    const fecha = hoyLocal();
    const luces = diaDeHoy(fecha);
    const rachaInfo = rachaActual(fecha);
    const estrellas = estrellasTodas();

    // Evento fugaz del día: el motor decide, determinístico (máx. 1/día).
    const eventoHoy = shouldTrigger(fecha, false) ? pickEvento(fecha) : null;
    const eventoSinVer = eventoHoy !== null && getSetting(CLAVES.eventoVistoFecha) !== fecha;
    if (eventoHoy === 'brasas-x2' && getSetting(CLAVES_DIA.x2) !== fecha) {
      setSetting(CLAVES_DIA.x2, fecha); // persistido por si el día cruza sesiones
    }

    // Desafío 24 h: 3 estrellas capturadas hoy → +8, una sola vez.
    let desafioRecienLogrado = false;
    if (eventoHoy === 'desafio-24h') {
      const capturadasHoy = estrellas.filter(
        (s) => fechaLocalDeISO(s.createdAt) === fecha,
      ).length;
      if (capturadasHoy >= 3 && getSetting(CLAVES_DIA.desafioPagado) !== fecha) {
        ganarBrasas(GANANCIAS.desafio24h, MOTIVOS.desafio24h);
        setSetting(CLAVES_DIA.desafioPagado, fecha);
      }
      desafioRecienLogrado =
        getSetting(CLAVES_DIA.desafioPagado) === fecha &&
        getSetting(CLAVES_DIA.desafioAvisado) !== fecha;
    }

    set({
      fecha,
      luces,
      rachaInfo,
      estrellas,
      eventoHoy,
      eventoSinVer,
      desafioRecienLogrado,
      brasas: brasasBalance(),
      totalGanado: brasasTotalGanado(),
      nocheParaCelebrar:
        luces.nocheCompleta && getSetting(CLAVES_DIA.nocheCelebrada) !== fecha,
    });
  },

  marcarEventoVisto: () => {
    const { fecha, desafioRecienLogrado } = get();
    setSetting(CLAVES.eventoVistoFecha, fecha);
    if (desafioRecienLogrado) setSetting(CLAVES_DIA.desafioAvisado, fecha);
    set({ eventoSinVer: false, desafioRecienLogrado: false });
  },

  celebrarNoche: () => {
    setSetting(CLAVES_DIA.nocheCelebrada, get().fecha);
    set({ nocheParaCelebrar: false });
  },

  setNewStar: (id) => set({ newStarId: id }),
  clearNewStar: () => set({ newStarId: null }),
}));

/** Multiplicador vigente hoy, leído del estado (atajo para las pantallas). */
export const multiplicadorHoy = (): 1 | 2 =>
  multiplicadorDe(useJuego.getState().eventoHoy);
