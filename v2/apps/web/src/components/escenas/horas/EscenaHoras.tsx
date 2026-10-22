import { useEffect, useId, useRef, useState } from 'react';
import { BufferAttribute, BufferGeometry, Color, Group, Points, ShaderMaterial } from 'three';

import { BarraDeEscena } from '../controles';
import { acercar, montarMotor, type Motor } from '../motor';
import { PALETA } from '../paleta';
import { seguirPuntero } from '../puntero';
import { escalaDePuntos } from '../puntos';

import {
  disposicionPara,
  horasEncendidas,
  posicionesDeHoras,
  TOTAL_DE_HORAS,
  umbralesDeHoras,
  type Disposicion,
} from './horas-geometria';

const FOV = 32;
const INCLINACION = -0.42;
const FRACCION_INICIAL = 50;

const numero = new Intl.NumberFormat('es-AR');

function crearMaterial() {
  const uniformes = {
    uFraccion: { value: 0 },
    uTiempo: { value: 0 },
    uMovimiento: { value: 1 },
    uEscala: { value: 1 },
    uApagada: { value: new Color(PALETA.tinta50) },
    uEncendida: { value: new Color(PALETA.violeta) },
  };
  const material = new ShaderMaterial({
    uniforms: uniformes,
    vertexShader: /* glsl */ `
      attribute float aUmbral;
      uniform float uFraccion;
      uniform float uTiempo;
      uniform float uMovimiento;
      uniform float uEscala;
      varying float vEncendida;
      void main() {
        float encendida = 1.0 - smoothstep(uFraccion - 0.006, uFraccion, aUmbral);
        vec3 p = position;
        p.z += encendida * (6.0 + 2.0 * sin(uTiempo * 1.1 + aUmbral * 900.0) * uMovimiento);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = max(1.0, (0.62 + 0.38 * encendida) * uEscala / -mv.z);
        vEncendida = encendida;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uApagada;
      uniform vec3 uEncendida;
      varying float vEncendida;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float alfa = mix(0.42, 1.0, vEncendida) * smoothstep(0.5, 0.3, d);
        gl_FragColor = vec4(mix(uApagada, uEncendida, vEncendida), alfa);
      }
    `,
    transparent: true,
    depthWrite: false,
  });
  return { material, uniformes };
}

/** Lo que el loop necesita leer de React sin re-montar la escena. */
interface Estado {
  objetivo: number;
  visible: number;
}

/**
 * «Ochenta y dos mil ochocientas horas»: una vida laboral, una hora por punto.
 * El lector decide qué fracción cuenta; las horas que cuentan se encienden en
 * violeta y se levantan del papel.
 */
export default function EscenaHoras() {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const motorRef = useRef<Motor | null>(null);
  const estadoRef = useRef<Estado>({ objetivo: FRACCION_INICIAL / 100, visible: 0 });
  const [porcentaje, setPorcentaje] = useState(FRACCION_INICIAL);
  const idControl = useId();

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;

    const { material, uniformes } = crearMaterial();
    const geometria = new BufferGeometry();
    geometria.setAttribute('aUmbral', new BufferAttribute(umbralesDeHoras(), 1));
    const puntos = new Points(geometria, material);
    puntos.frustumCulled = false;
    const grupo = new Group();
    grupo.add(puntos);
    grupo.rotation.x = INCLINACION;
    let actual: Disposicion | null = null;
    const { puntero, soltar } = seguirPuntero(contenedor);

    const { motor, desmontar } = montarMotor(contenedor, {
      fondo: PALETA.papel,
      fov: FOV,
      alRedimensionar: (m) => {
        const aspecto = m.ancho / m.alto;
        const siguiente = disposicionPara(aspecto);
        if (actual?.columnas !== siguiente.columnas) {
          actual = siguiente;
          geometria.setAttribute('position', new BufferAttribute(posicionesDeHoras(siguiente), 3));
          geometria.computeBoundingSphere();
        }
        // Alejar la cámara hasta que entren el ancho y el alto.
        const tangente = Math.tan((FOV * Math.PI) / 360);
        const porAlto = (siguiente.alto * 0.56) / tangente;
        const porAncho = (siguiente.ancho * 0.54) / (tangente * aspecto);
        // Mirar un poco por debajo del centro sube la grilla y la deja libre de la barra de abajo.
        const bajo = -siguiente.alto * (aspecto < 1 ? 0.12 : 0.06);
        m.camara.position.set(0, bajo, Math.max(porAlto, porAncho));
        m.camara.lookAt(0, bajo, 0);
        uniformes.uEscala.value = escalaDePuntos(m.alto, m.densidad, FOV);
      },
      alCuadro: (m, { dt, t }) => {
        const estado = estadoRef.current;
        estado.visible = acercar(estado.visible, estado.objetivo, dt, 2.2);
        uniformes.uFraccion.value = estado.visible;
        uniformes.uTiempo.value = m.quieto ? 0 : t;
        const deriva = m.quieto ? 0 : Math.sin(t * 0.12) * 0.05;
        grupo.rotation.y = acercar(grupo.rotation.y, puntero.x * 0.16 + deriva, dt, 3);
        grupo.rotation.x = acercar(grupo.rotation.x, INCLINACION + puntero.y * 0.08, dt, 3);
      },
    });
    uniformes.uMovimiento.value = motor.quieto ? 0 : 1;
    motor.escena.add(grupo);
    motorRef.current = motor;
    motor.pedirCuadro();

    return () => {
      soltar();
      motorRef.current = null;
      desmontar();
    };
  }, []);

  const cambiar = (valor: number) => {
    setPorcentaje(valor);
    estadoRef.current.objetivo = valor / 100;
    motorRef.current?.pedirCuadro();
  };

  const encendidas = horasEncendidas(porcentaje / 100);
  const texto = `${numero.format(encendidas)} de ${numero.format(TOTAL_DE_HORAS)} horas`;

  return (
    <div className="absolute inset-0">
      <div
        ref={contenedorRef}
        role="img"
        aria-label="Una grilla de 82.800 puntos, uno por cada hora de una vida laboral, agrupados en 45 bloques, uno por año. Las horas que cuentan se encienden en violeta."
        className="absolute inset-0"
      />
      <BarraDeEscena superficie="papel">
        <label htmlFor={idControl} className="shrink-0">
          ¿Cuántas cuentan?
        </label>
        <input
          id={idControl}
          type="range"
          min={0}
          max={100}
          step={1}
          value={porcentaje}
          aria-valuetext={`${String(porcentaje)} por ciento: ${texto}`}
          onChange={(e) => {
            cambiar(Number(e.target.value));
          }}
          className="accent-violeta min-w-[120px] flex-1"
        />
        <output htmlFor={idControl} className="text-tinta-75 w-full shrink-0 tabular-nums sm:w-auto">
          {texto}
        </output>
      </BarraDeEscena>
    </div>
  );
}
