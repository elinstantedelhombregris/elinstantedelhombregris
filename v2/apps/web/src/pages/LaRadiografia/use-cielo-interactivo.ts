import { useEffect, type MutableRefObject, type RefObject } from 'react';

import {
  golpearNodo,
  pintar,
  type CamaraDelCielo,
  type Escena,
  type NodoDibujable,
} from './constelacion-pintor';
import { disponerNodos, type LenteDelCielo } from './lentes';

export interface AjustesDelCielo {
  lente: LenteDelCielo;
  zoom: number;
  girando: boolean;
  centrar: number;
  elegir?: (id: string | null) => void;
  sobrevolar?: (id: string | null) => void;
  cambiarZoom?: (zoom: number) => void;
}

export function useCieloInteractivo(
  canvasRef: RefObject<HTMLCanvasElement>,
  escenaRef: MutableRefObject<Escena>,
  ajustesRef: MutableRefObject<AjustesDelCielo>,
  pintarYaRef: MutableRefObject<() => void>,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const quieto =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let giroY = 0.6;
    let giroX = -0.25;
    let vista = escenaRef.current;
    let ultimoCentro = ajustesRef.current.centrar;
    let recorrido = 0;
    let ultimo: { x: number; y: number } | null = null;
    let cuadro = 0;
    let sobrevolado: string | null = null;
    const camara: CamaraDelCielo = { zoom: 1, x: 0, y: 0 };
    const posiciones = new Map<string, NodoDibujable>();
    let ultimaEscena: Escena | null = null;
    let ultimaLente: LenteDelCielo | null = null;
    let destinos: NodoDibujable[] = [];
    const hit = (e: { clientX: number; clientY: number }) => {
      const caja = canvas.getBoundingClientRect();
      const plano = ajustesRef.current.lente !== 'vinculos';
      return golpearNodo(
        vista.nodos,
        plano ? 0 : giroY,
        plano ? 0 : giroX,
        caja,
        { x: e.clientX - caja.left, y: e.clientY - caja.top },
        camara,
      );
    };
    const presionar = (e: PointerEvent) => {
      ultimo = { x: e.clientX, y: e.clientY };
      recorrido = 0;
      canvas.setPointerCapture(e.pointerId);
    };
    const mover = (e: PointerEvent) => {
      if (ultimo) {
        const dx = e.clientX - ultimo.x;
        const dy = e.clientY - ultimo.y;
        recorrido += Math.abs(dx) + Math.abs(dy);
        if (ajustesRef.current.lente === 'vinculos') {
          giroY += dx * 0.006;
          giroX = Math.max(-1.2, Math.min(1.2, giroX + dy * 0.006));
        } else {
          camara.x += dx;
          camara.y += dy;
        }
        ultimo = { x: e.clientX, y: e.clientY };
      } else {
        const id = hit(e)?.id ?? null;
        if (id !== sobrevolado) {
          sobrevolado = id;
          ajustesRef.current.sobrevolar?.(id);
          canvas.style.cursor = id ? 'pointer' : 'grab';
        }
      }
    };
    const soltar = (e: PointerEvent) => {
      ultimo = null;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    };
    const elegir = (e: MouseEvent) => {
      if (recorrido > 6) return;
      const nodo = hit(e);
      escenaRef.current.onEnfocar(nodo?.nucleoId ?? null);
      ajustesRef.current.elegir?.(nodo?.id ?? null);
    };
    const salir = () => {
      sobrevolado = null;
      ajustesRef.current.sobrevolar?.(null);
    };
    const rueda = (e: WheelEvent) => {
      if (!e.ctrlKey || !ajustesRef.current.cambiarZoom) return;
      e.preventDefault();
      ajustesRef.current.cambiarZoom(
        Math.max(0.6, Math.min(2.8, ajustesRef.current.zoom - e.deltaY * 0.005)),
      );
    };
    const unCuadro = () => {
      const ajustes = ajustesRef.current;
      if (ultimoCentro !== ajustes.centrar) {
        ultimoCentro = ajustes.centrar;
        giroY = 0.6;
        giroX = -0.25;
        camara.x = 0;
        camara.y = 0;
      }
      camara.zoom = ajustes.zoom;
      if (ultimaEscena !== escenaRef.current || ultimaLente !== ajustes.lente) {
        ultimaEscena = escenaRef.current;
        ultimaLente = ajustes.lente;
        destinos = disponerNodos(ultimaEscena.nodos, ajustes.lente);
        const ids = new Set(destinos.map((d) => d.id));
        for (const id of posiciones.keys()) if (!ids.has(id)) posiciones.delete(id);
      }
      vista = {
        ...escenaRef.current,
        nodos: destinos.map((d) => {
          const p = posiciones.get(d.id) ?? d;
          const k = quieto ? 1 : 0.15;
          const actual = {
            ...d,
            x: p.x + (d.x - p.x) * k,
            y: p.y + (d.y - p.y) * k,
            z: p.z + (d.z - p.z) * k,
          };
          posiciones.set(d.id, actual);
          return actual;
        }),
      };
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      const plano = ajustes.lente !== 'vinculos';
      pintar(ctx, { width, height, dpr }, vista, plano ? 0 : giroY, plano ? 0 : giroX, camara);
    };
    canvas.addEventListener('pointerdown', presionar);
    canvas.addEventListener('pointermove', mover);
    canvas.addEventListener('pointerup', soltar);
    canvas.addEventListener('pointercancel', soltar);
    canvas.addEventListener('pointerleave', salir);
    canvas.addEventListener('click', elegir);
    canvas.addEventListener('wheel', rueda, { passive: false });
    pintarYaRef.current = unCuadro;
    unCuadro();
    const dibujar = () => {
      cuadro = requestAnimationFrame(dibujar);
      if (
        !ultimo &&
        !quieto &&
        ajustesRef.current.girando &&
        ajustesRef.current.lente === 'vinculos'
      )
        giroY += 0.0015;
      unCuadro();
    };
    cuadro = requestAnimationFrame(dibujar);
    return () => {
      cancelAnimationFrame(cuadro);
      pintarYaRef.current = () => undefined;
      canvas.removeEventListener('pointerdown', presionar);
      canvas.removeEventListener('pointermove', mover);
      canvas.removeEventListener('pointerup', soltar);
      canvas.removeEventListener('pointercancel', soltar);
      canvas.removeEventListener('pointerleave', salir);
      canvas.removeEventListener('click', elegir);
      canvas.removeEventListener('wheel', rueda);
    };
  }, [canvasRef, escenaRef, ajustesRef, pintarYaRef]);
}
