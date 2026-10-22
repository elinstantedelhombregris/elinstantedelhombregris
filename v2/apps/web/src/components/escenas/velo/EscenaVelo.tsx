import { useEffect, useRef, useState } from 'react';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  ShaderMaterial,
} from 'three';

import { mulberry32 } from '../azar';
import { BarraDeEscena, BotonDeEscena } from '../controles';
import { grafoDeTriangulos } from '../grafo';
import { acercar, montarMotor, type Motor } from '../motor';
import { PALETA, rgb } from '../paleta';
import { seguirPuntero } from '../puntero';
import { crearNube, escalaDePuntos } from '../puntos';

import { asentarVelo, avanzarVelo, crearVelo, cuantoSalieron } from './velo-modelo';

const FOV = 40;
const ESTRELLAS = 2600;

/**
 * El velo: una malla geodésica. Cada arista sabe hacia dónde se va cuando el
 * velo se corre (`aDir`, la dirección de su punto medio) y con qué rapidez.
 */
function crearVelo3D() {
  const geodesica = new IcosahedronGeometry(5.2, 3);
  const grafo = grafoDeTriangulos(geodesica.getAttribute('position').array);
  geodesica.dispose();
  const segmentos = grafo.aristas.length / 2;
  const posiciones = new Float32Array(segmentos * 6);
  const direcciones = new Float32Array(segmentos * 6);
  const rapideces = new Float32Array(segmentos * 2);
  const azar = mulberry32(5);
  for (let e = 0; e < segmentos; e++) {
    const a = grafo.aristas[e * 2] ?? 0;
    const b = grafo.aristas[e * 2 + 1] ?? 0;
    const pa = grafo.vertices.subarray(a * 3, a * 3 + 3);
    const pb = grafo.vertices.subarray(b * 3, b * 3 + 3);
    posiciones.set(pa, e * 6);
    posiciones.set(pb, e * 6 + 3);
    const mx = ((pa[0] ?? 0) + (pb[0] ?? 0)) / 2;
    const my = ((pa[1] ?? 0) + (pb[1] ?? 0)) / 2;
    const mz = ((pa[2] ?? 0) + (pb[2] ?? 0)) / 2;
    const l = Math.hypot(mx, my, mz) || 1;
    const dir = [mx / l, my / l, mz / l];
    direcciones.set(dir, e * 6);
    direcciones.set(dir, e * 6 + 3);
    const rapidez = 0.4 + azar() * 1.2;
    rapideces[e * 2] = rapidez;
    rapideces[e * 2 + 1] = rapidez;
  }
  const geometria = new BufferGeometry();
  geometria.setAttribute('position', new BufferAttribute(posiciones, 3));
  geometria.setAttribute('aDir', new BufferAttribute(direcciones, 3));
  geometria.setAttribute('aRapidez', new BufferAttribute(rapideces, 1));
  const uniformes = {
    uRotura: { value: 0 },
    uTiempo: { value: 0 },
    uColor: { value: new Color(PALETA.papel) },
  };
  const material = new ShaderMaterial({
    uniforms: uniformes,
    vertexShader: /* glsl */ `
      attribute vec3 aDir;
      attribute float aRapidez;
      uniform float uRotura;
      uniform float uTiempo;
      varying float vAlfa;
      void main() {
        vec3 p = position * (1.0 + 0.015 * sin(uTiempo * 0.7 + position.y * 0.9));
        p += aDir * uRotura * uRotura * aRapidez * 24.0;
        vAlfa = 0.34 * (1.0 - smoothstep(0.05, 0.8, uRotura));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vAlfa;
      void main() {
        gl_FragColor = vec4(uColor, vAlfa);
      }
    `,
    transparent: true,
    depthWrite: false,
  });
  const lineas = new LineSegments(geometria, material);
  lineas.frustumCulled = false;
  return { lineas, uniformes };
}

/** La pista: un aro fino, inclinado como la carrera. */
function crearPista() {
  const puntos = new Float32Array(128 * 3);
  for (let k = 0; k < 128; k++) {
    const a = (k / 128) * Math.PI * 2;
    puntos.set([Math.cos(a) * 3, 0, Math.sin(a) * 3], k * 3);
  }
  const geometria = new BufferGeometry();
  geometria.setAttribute('position', new BufferAttribute(puntos, 3));
  const material = new LineBasicMaterial({ color: PALETA.tinta50, transparent: true, opacity: 0.6 });
  const aro = new LineLoop(geometria, material);
  aro.rotation.x = 0.38;
  return { aro, material };
}

/** Los destinos posibles: un cielo que solo se ve cuando el velo ya no está. */
function crearCielo() {
  const azar = mulberry32(1923);
  const posiciones = new Float32Array(ESTRELLAS * 3);
  const colores = new Float32Array(ESTRELLAS * 3);
  const alfas = new Float32Array(ESTRELLAS);
  const tams = new Float32Array(ESTRELLAS);
  const papel = rgb(PALETA.papel);
  for (let k = 0; k < ESTRELLAS; k++) {
    const z = azar() * 2 - 1;
    const phi = azar() * Math.PI * 2;
    const r = 80 + azar() * 70;
    const s = Math.sqrt(1 - z * z);
    posiciones.set([Math.cos(phi) * s * r, z * r, Math.sin(phi) * s * r], k * 3);
    colores.set(papel, k * 3);
    alfas[k] = 0.15 + azar() * 0.45;
    tams[k] = 0.5 + azar() * 0.7;
  }
  return crearNube({ posiciones, colores, alfas, tams }, { aditivo: true });
}

/**
 * «Correr el velo»: la carrera de ratas adentro de una malla, y lo que pasa
 * con cada corredor cuando la malla se corre.
 */
export default function EscenaVelo() {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const motorRef = useRef<Motor | null>(null);
  const libresRef = useRef(false);
  const cambioRef = useRef(0);
  const [libres, setLibres] = useState(false);

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;
    const modelo = crearVelo();
    const velo = crearVelo3D();
    const pista = crearPista();
    const cielo = crearCielo();
    const corredores = crearNube(
      { posiciones: modelo.posiciones, colores: modelo.colores, alfas: modelo.alfas, tams: modelo.tams },
      { aditivo: true },
    );
    const mundo = new Group();
    mundo.add(velo.lineas, pista.aro, cielo.puntos, corredores.puntos);
    const nubes = [cielo, corredores];
    const { puntero, soltar } = seguirPuntero(contenedor);
    let rotura = 0;
    let lejos = 1;

    const { motor, desmontar } = montarMotor(contenedor, {
      fondo: PALETA.tinta,
      fov: FOV,
      alRedimensionar: (m) => {
        lejos = m.ancho / m.alto < 0.9 ? 1.5 : 1;
        const escala = escalaDePuntos(m.alto, m.densidad, FOV);
        for (const nube of nubes) nube.uniformes.uEscala.value = escala;
      },
      alCuadro: (m, { dt, t }) => {
        const sueltos = libresRef.current;
        if (m.quieto) {
          asentarVelo(modelo, 12, sueltos);
          rotura = sueltos ? 1 : 0;
        } else {
          cambioRef.current += dt;
          avanzarVelo(modelo, dt, t, sueltos, cambioRef.current);
          rotura = acercar(rotura, sueltos ? 1 : 0, dt, 1.1);
        }
        const cuanto = cuantoSalieron(modelo);
        const s = cuanto * cuanto * (3 - 2 * cuanto);
        velo.uniformes.uRotura.value = rotura;
        velo.uniformes.uTiempo.value = m.quieto ? 0 : t;
        pista.material.opacity = 0.6 * (1 - s);
        cielo.uniformes.uOpacidad.value = s;
        corredores.actualizar();

        const distancia = (18 + 20 * s) * lejos;
        m.camara.position.set(0, 3.5 + 7 * s, distancia);
        m.camara.lookAt(0, 0, 0);
        const giro = m.quieto ? 0.4 : t * 0.05;
        mundo.rotation.y = acercar(mundo.rotation.y, giro + puntero.x * 0.3, dt, 2.5);
        mundo.rotation.x = acercar(mundo.rotation.x, puntero.y * 0.12, dt, 2.5);
      },
    });
    motor.escena.add(mundo);
    motorRef.current = motor;
    motor.pedirCuadro();

    return () => {
      soltar();
      motorRef.current = null;
      desmontar();
    };
  }, []);

  const alternar = () => {
    const siguiente = !libresRef.current;
    libresRef.current = siguiente;
    cambioRef.current = 0;
    setLibres(siguiente);
    motorRef.current?.pedirCuadro();
  };

  return (
    <div className="absolute inset-0">
      <div
        ref={contenedorRef}
        role="img"
        aria-label={
          libres
            ? 'La malla se rompió y se dispersó. Cada corredor salió de la pista hacia una órbita propia, con su radio, su inclinación y su color, en un cielo lleno de destinos.'
            : 'Una malla esférica, como un velo, encierra una pista circular. Setecientos corredores grises dan vueltas por la misma pista, todos en la misma dirección.'
        }
        className="absolute inset-0"
      />
      <BarraDeEscena superficie="noche">
        <BotonDeEscena superficie="noche" onClick={alternar}>
          {libres ? 'Volver a la pista' : 'Correr el velo'}
        </BotonDeEscena>
        <span aria-live="polite" className="text-oscuro-meta">
          {libres ? 'Cada uno, su órbita.' : 'Una sola pista para todos.'}
        </span>
      </BarraDeEscena>
    </div>
  );
}

