import {
  Color,
  ColorManagement,
  LinearSRGBColorSpace,
  Mesh,
  PerspectiveCamera,
  Points,
  LineSegments,
  Scene,
  WebGLRenderer,
} from 'three';

import type {
  BufferGeometry,
  Material} from 'three';

/*
 * Los hex de la paleta pasan tal cual al framebuffer. Con la gestión de color
 * prendida, three los convierte a lineal al asignarlos y los shaders propios
 * (que no incluyen `colorspace_fragment`) los dejarían oscuros: el violeta de
 * la escena no sería el violeta del sitio. Solo las escenas usan three, así que
 * apagarlo acá no toca a nadie más.
 */
ColorManagement.enabled = false;

export interface Cuadro {
  /** Segundos desde el cuadro anterior, acotado para que una pestaña dormida no salte. */
  dt: number;
  /** Segundos de animación acumulados (no corre mientras la escena está pausada). */
  t: number;
}

export interface Motor {
  readonly renderer: WebGLRenderer;
  readonly escena: Scene;
  readonly camara: PerspectiveCamera;
  readonly lienzo: HTMLCanvasElement;
  /** Ancho y alto en píxeles CSS del contenedor. */
  ancho: number;
  alto: number;
  /** Píxeles de dispositivo por píxel CSS (acotado a 2). */
  densidad: number;
  /** `prefers-reduced-motion`: la escena se dibuja quieta y solo cambia cuando se la toca. */
  readonly quieto: boolean;
  /** Pide un cuadro aunque la escena esté quieta (después de un cambio del lector). */
  pedirCuadro: () => void;
}

export interface OpcionesDelMotor {
  fondo: number;
  fov?: number;
  /** Avanza la escena. Con `quieto`, se llama con un `dt` largo para que todo llegue a su lugar. */
  alCuadro: (motor: Motor, cuadro: Cuadro) => void;
  alRedimensionar?: (motor: Motor) => void;
}

export interface MotorMontado {
  motor: Motor;
  desmontar: () => void;
}

const DT_MAXIMO = 1 / 20;
/** Lo que avanza un cuadro «quieto»: suficiente para que cualquier transición termine. */
const DT_QUIETO = 30;

function preferirQuieto(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Monta un lienzo WebGL dentro de `contenedor` y lo mantiene vivo: lo
 * redimensiona con el contenedor, corre la animación solo mientras la escena
 * está a la vista y la pestaña visible, y al desmontar libera geometrías,
 * materiales y el contexto (los navegadores dan pocos contextos por página).
 */
export function montarMotor(contenedor: HTMLElement, opciones: OpcionesDelMotor): MotorMontado {
  const renderer = new WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.outputColorSpace = LinearSRGBColorSpace;
  renderer.setClearColor(new Color(opciones.fondo), 1);
  const lienzo = renderer.domElement;
  lienzo.style.display = 'block';
  lienzo.style.width = '100%';
  lienzo.style.height = '100%';
  lienzo.setAttribute('aria-hidden', 'true');
  contenedor.appendChild(lienzo);

  const escena = new Scene();
  escena.background = new Color(opciones.fondo);
  const camara = new PerspectiveCamera(opciones.fov ?? 40, 1, 0.1, 2000);

  let visible = false;
  let pestanaVisible = document.visibilityState !== 'hidden';
  let rafId: number | null = null;
  let anterior: number | null = null;
  let t = 0;

  const motor: Motor = {
    renderer,
    escena,
    camara,
    lienzo,
    ancho: 1,
    alto: 1,
    densidad: 1,
    quieto: preferirQuieto(),
    pedirCuadro: () => {
      if (motor.quieto) dibujarQuieto();
    },
  };

  function dibujarQuieto() {
    t += DT_QUIETO;
    opciones.alCuadro(motor, { dt: DT_QUIETO, t });
    renderer.render(escena, camara);
  }

  function cuadro(ahora: number) {
    rafId = null;
    const dt = anterior === null ? 1 / 60 : Math.min((ahora - anterior) / 1000, DT_MAXIMO);
    anterior = ahora;
    t += dt;
    opciones.alCuadro(motor, { dt, t });
    renderer.render(escena, camara);
    programar();
  }

  function programar() {
    if (motor.quieto || !visible || !pestanaVisible || rafId !== null) return;
    rafId = requestAnimationFrame(cuadro);
  }

  function detener() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    anterior = null;
  }

  function redimensionar() {
    const caja = contenedor.getBoundingClientRect();
    motor.ancho = Math.max(1, Math.round(caja.width));
    motor.alto = Math.max(1, Math.round(caja.height));
    motor.densidad = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(motor.densidad);
    renderer.setSize(motor.ancho, motor.alto, false);
    camara.aspect = motor.ancho / motor.alto;
    camara.updateProjectionMatrix();
    opciones.alRedimensionar?.(motor);
    if (motor.quieto) dibujarQuieto();
    else renderer.render(escena, camara);
  }

  const observadorDeTamano = new ResizeObserver(redimensionar);
  observadorDeTamano.observe(contenedor);

  const observadorDeVista = new IntersectionObserver(
    ([entrada]) => {
      visible = entrada?.isIntersecting ?? false;
      if (visible) programar();
      else detener();
    },
    { threshold: 0.01 },
  );
  observadorDeVista.observe(contenedor);

  const alCambiarPestana = () => {
    pestanaVisible = document.visibilityState !== 'hidden';
    if (pestanaVisible) programar();
    else detener();
  };
  document.addEventListener('visibilitychange', alCambiarPestana);

  redimensionar();

  return {
    motor,
    desmontar: () => {
      detener();
      observadorDeTamano.disconnect();
      observadorDeVista.disconnect();
      document.removeEventListener('visibilitychange', alCambiarPestana);
      liberar(escena);
      renderer.dispose();
      renderer.forceContextLoss();
      lienzo.remove();
    },
  };
}

function liberar(escena: Scene) {
  escena.traverse((objeto) => {
    if (objeto instanceof Mesh || objeto instanceof Points || objeto instanceof LineSegments) {
      (objeto.geometry as BufferGeometry).dispose();
      const material = objeto.material as Material | Material[];
      const materiales = Array.isArray(material) ? material : [material];
      for (const material of materiales) material.dispose();
    }
  });
}

/** Acerca `actual` a `objetivo` a un ritmo que no depende de los cuadros por segundo. */
export function acercar(actual: number, objetivo: number, dt: number, rapidez: number): number {
  return objetivo + (actual - objetivo) * Math.exp(-rapidez * dt);
}
