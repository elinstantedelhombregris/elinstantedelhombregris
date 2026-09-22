import { useEffect, useState } from 'react';

import { MODOS, type Modo } from './catalogo-modos';

export interface Exploracion {
  modo: Modo;
  rango: '7d' | '30d' | 'todo';
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
  const nombre = q.get('nombre');
  if (nombre) resultado.lugarNombre = nombre.slice(0, 150);
  for (const campo of ['tipo', 'estado', 'tema'] as const) {
    const valor = q.get(campo);
    if (valor) resultado[campo] = valor.slice(0, 100);
  }
  return resultado;
}

export function urlExploracion(estado: Exploracion): string {
  const q = new URLSearchParams();
  q.set('lente', estado.modo);
  q.set('periodo', estado.rango);
  if (estado.lugarId) q.set('lugar', String(estado.lugarId));
  if (estado.lugarNombre) q.set('nombre', estado.lugarNombre);
  for (const campo of ['tipo', 'estado', 'tema'] as const) {
    if (estado[campo]) q.set(campo, estado[campo]);
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
    window.history.pushState(null, '', urlExploracion(siguiente) + window.location.hash);
    setEstado(siguiente);
  };
  return [estado, cambiar] as const;
}
