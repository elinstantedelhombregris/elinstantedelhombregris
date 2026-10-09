import { useEffect, useState } from 'react';

import { MODOS, type Modo } from './catalogo-modos';

export interface Exploracion {
  modo: Modo;
  rango: '7d' | '30d' | 'todo';
  campana?: string;
  edicion?: number;
  lugarId?: number;
  lugarNombre?: string;
  tipo?: string;
  estado?: string;
  tema?: string;
}

export function leerExploracion(search: string): Exploracion {
  const q = new URLSearchParams(search);
  const modo = MODOS.find((m) => m.id === q.get('lente'))?.id ?? 'mapa';
  const periodo = q.get('periodo');
  const lugar = Number(q.get('lugar'));
  const resultado: Exploracion = {
    modo,
    rango: periodo === '7d' || periodo === '30d' ? periodo : 'todo',
  };
  if (Number.isSafeInteger(lugar) && lugar > 0) resultado.lugarId = lugar;
  const campana = q.get('campana');
  if (campana && /^[0-9a-f-]{36}$/i.test(campana)) resultado.campana = campana;
  const edicion = Number(q.get('edicion'));
  if (resultado.campana && Number.isSafeInteger(edicion) && edicion > 0)
    resultado.edicion = edicion;
  const nombre = q.get('nombre');
  if (nombre) resultado.lugarNombre = nombre.slice(0, 150);
  for (const campo of ['tipo', 'estado', 'tema'] as const) {
    const valor = q.get(campo);
    if (valor) resultado[campo] = valor.slice(0, 100);
  }
  return resultado;
}

/**
 * Lo que pide el panel de aportes. No es parte de la exploración —no cambia qué
 * se ve en el mapa— pero viaja en la misma dirección, y reescribirla sin esto
 * cerraba el panel o lo dejaba sin su campaña, su edición o su borrador cada
 * vez que se elegía un lugar. `campana` puede ser un slug, que la exploración
 * (que filtra por id) no entiende; por eso se conserva tal cual venía.
 */
const PARAMETROS_DE_APORTE = ['participar', 'campana', 'edicion', 'borrador'] as const;

/**
 * La dirección de una exploración. `actual` es la búsqueda vigente: de ahí se
 * conservan los parámetros del panel de aportes que la exploración no maneja.
 */
export function urlExploracion(estado: Exploracion, actual = ''): string {
  const q = new URLSearchParams();
  q.set('lente', estado.modo);
  q.set('periodo', estado.rango);
  if (estado.campana) q.set('campana', estado.campana);
  if (estado.edicion) q.set('edicion', String(estado.edicion));
  if (estado.lugarId) q.set('lugar', String(estado.lugarId));
  if (estado.lugarNombre) q.set('nombre', estado.lugarNombre);
  for (const campo of ['tipo', 'estado', 'tema'] as const) {
    if (estado[campo]) q.set(campo, estado[campo]);
  }
  const vigente = new URLSearchParams(actual);
  for (const clave of PARAMETROS_DE_APORTE) {
    const valor = vigente.get(clave);
    if (valor !== null && !q.has(clave)) q.set(clave, valor);
  }
  return `/el-mapa?${q.toString()}`;
}

export function useExploracion() {
  const [estado, setEstado] = useState(() => leerExploracion(window.location.search));
  useEffect(() => {
    const restaurar = () => {
      setEstado(leerExploracion(window.location.search));
    };
    window.addEventListener('popstate', restaurar);
    return () => {
      window.removeEventListener('popstate', restaurar);
    };
  }, []);
  const cambiar = (siguiente: Exploracion) => {
    window.history.pushState(
      null,
      '',
      urlExploracion(siguiente, window.location.search) + window.location.hash,
    );
    setEstado(siguiente);
  };
  return [estado, cambiar] as const;
}
