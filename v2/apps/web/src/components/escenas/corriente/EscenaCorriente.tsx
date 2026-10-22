import { useEffect, useRef, useState } from 'react';
import {
  BufferAttribute,
  BufferGeometry,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  Vector3,
} from 'three';

import { mulberry32 } from '../azar';
import { BarraDeEscena, BotonDeEscena } from '../controles';
import { grafoDeTriangulos } from '../grafo';
import { acercar, montarMotor, type Motor } from '../motor';
import { PALETA, rgb } from '../paleta';
import { seguirPuntero } from '../puntero';
import { crearNube, escalaDePuntos, type Nube } from '../puntos';

import {
  asentar,
  avanzar,
  CIUDADANOS,
  crearCorriente,
  PARTICULAS,
  type Corriente,
  type Destino,
} from './corriente-modelo';
import { Leyenda } from './Leyenda';

const FOV = 38;
const CENTRO_Y = 0.8;
const ALTERNAR_CADA_MS = 9000;
const ANILLO = 420;

const TINTA50 = rgb(PALETA.tinta50);
const PAPEL = rgb(PALETA.papel);
const BORDE = rgb(PALETA.oscuroBorde);
const AMBAR = rgb(PALETA.ambarClaro);

/** Los ciudadanos: su color y su tamaño dicen cuánta luz les queda. */
function nubeDeCiudadanos(c: Corriente): Nube {
  return crearNube(
    {
      posiciones: c.ciudadanos,
      colores: new Float32Array(CIUDADANOS * 3),
      alfas: new Float32Array(CIUDADANOS),
      tams: new Float32Array(CIUDADANOS),
    },
    { aditivo: false },
  );
}

function pintarCiudadanos(c: Corriente, nube: Nube) {
  const geometria = nube.puntos.geometry;
  const colores = geometria.getAttribute('color').array as Float32Array;
  const alfas = geometria.getAttribute('alfa').array as Float32Array;
  const tams = geometria.getAttribute('tam').array as Float32Array;
  for (let i = 0; i < CIUDADANOS; i++) {
    const luz = c.luz[i] ?? 0;
    for (let k = 0; k < 3; k++) colores[i * 3 + k] = (TINTA50[k] ?? 0) + ((PAPEL[k] ?? 0) - (TINTA50[k] ?? 0)) * luz;
    alfas[i] = 0.45 + 0.55 * luz;
    tams[i] = 0.2 + 0.26 * luz;
  }
  nube.actualizar();
}

/** El vacío: una esfera negra con un disco de materia que gira y no devuelve nada. */
function crearVacio() {
  const grupo = new Group();
  grupo.position.y = CENTRO_Y;
  const esfera = new Mesh(
    new SphereGeometry(0.95, 32, 16),
    new MeshBasicMaterial({ color: 0x050403, transparent: true }),
  );
  const azar = mulberry32(31);
  const posiciones = new Float32Array(ANILLO * 3);
  const colores = new Float32Array(ANILLO * 3);
  const alfas = new Float32Array(ANILLO);
  const tams = new Float32Array(ANILLO);
  const calor = rgb(PALETA.selloClaro);
  for (let k = 0; k < ANILLO; k++) {
    const angulo = azar() * Math.PI * 2;
    const radio = 1.15 + Math.pow(azar(), 1.8) * 1.3;
    posiciones.set([Math.cos(angulo) * radio, (azar() - 0.5) * 0.08, Math.sin(angulo) * radio], k * 3);
    colores.set(calor, k * 3);
    alfas[k] = 0.18 + 0.3 * azar();
    tams[k] = 0.12 + 0.1 * azar();
  }
  const disco = crearNube({ posiciones, colores, alfas, tams }, { aditivo: true });
  disco.puntos.rotation.x = 0.32;
  grupo.add(esfera, disco.puntos);
  return { grupo, esfera, disco };
}

/** El sistema: una red geodésica cuyas aristas se encienden cuando la confianza hace trabajo. */
function crearRed(c: Corriente) {
  const grupo = new Group();
  grupo.position.y = CENTRO_Y + 0.6;
  const { grafo } = c;
  const posiciones = new Float32Array(grafo.aristas.length * 3);
  grafo.aristas.forEach((v, k) => {
    posiciones.set(grafo.vertices.subarray(v * 3, v * 3 + 3), k * 3);
  });
  const geometria = new BufferGeometry();
  geometria.setAttribute('position', new BufferAttribute(posiciones, 3));
  const colores = new BufferAttribute(new Float32Array(grafo.aristas.length * 3), 3);
  geometria.setAttribute('color', colores);
  const material = new LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0 });
  const lineas = new LineSegments(geometria, material);
  const cantidad = grafo.vertices.length / 3;
  const nodos = crearNube(
    {
      posiciones: grafo.vertices,
      colores: new Float32Array(cantidad * 3).map((_, k) => PAPEL[k % 3] ?? 0),
      alfas: new Float32Array(cantidad).fill(0.85),
      tams: new Float32Array(cantidad).fill(0.26),
    },
    { aditivo: true },
  );
  grupo.add(lineas, nodos.puntos);
  const pintar = () => {
    const array = colores.array as Float32Array;
    for (let e = 0; e < grafo.aristas.length / 2; e++) {
      const calor = c.calorDeArista[e] ?? 0;
      for (let k = 0; k < 3; k++) {
        const tono = (BORDE[k] ?? 0) * 1.6 + ((AMBAR[k] ?? 0) * 1.5 - (BORDE[k] ?? 0) * 1.6) * calor;
        array[e * 6 + k] = tono;
        array[e * 6 + 3 + k] = tono;
      }
    }
    colores.needsUpdate = true;
  };
  return { grupo, material, nodos, pintar };
}

/**
 * «La física de la confianza»: la misma confianza, hacia una persona (un
 * vacío) o hacia un sistema (un circuito que la usa y la devuelve).
 */
export default function EscenaCorriente() {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const motorRef = useRef<Motor | null>(null);
  const destinoRef = useRef<Destino>('persona');
  const [destino, setDestino] = useState<Destino>('persona');
  const [tocado, setTocado] = useState(false);

  useEffect(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;
    const geodesica = new IcosahedronGeometry(3.6, 1);
    const corriente = crearCorriente(grafoDeTriangulos(geodesica.getAttribute('position').array));
    geodesica.dispose();

    const mundo = new Group();
    const ciudadanos = nubeDeCiudadanos(corriente);
    const vacio = crearVacio();
    const red = crearRed(corriente);
    const confianza = crearNube(
      {
        posiciones: corriente.posiciones,
        colores: corriente.colores,
        alfas: corriente.alfas,
        tams: new Float32Array(PARTICULAS).fill(0.2),
      },
      { aditivo: true },
    );
    mundo.add(ciudadanos.puntos, vacio.grupo, red.grupo, confianza.puntos);
    const nubes = [ciudadanos, vacio.disco, red.nodos, confianza];

    const redMundo = new Float32Array(corriente.grafo.vertices.length);
    const v = new Vector3();
    const ubicarRed = () => {
      red.grupo.updateMatrix();
      for (let k = 0; k < redMundo.length; k += 3) {
        v.fromArray(corriente.grafo.vertices, k).applyMatrix4(red.grupo.matrix).toArray(redMundo, k);
      }
    };
    let mezcla = 0;
    const { puntero, soltar } = seguirPuntero(contenedor);

    const { motor, desmontar } = montarMotor(contenedor, {
      fondo: PALETA.tinta,
      fov: FOV,
      alRedimensionar: (m) => {
        const lejos = m.ancho / m.alto < 0.9 ? 1.4 : 1;
        m.camara.position.set(0, 11.5 * lejos, 23 * lejos);
        m.camara.lookAt(0, 0.2, 0);
        const escala = escalaDePuntos(m.alto, m.densidad, FOV);
        for (const nube of nubes) nube.uniformes.uEscala.value = escala;
      },
      alCuadro: (m, { dt, t }) => {
        const actual = destinoRef.current;
        mezcla = m.quieto ? (actual === 'sistema' ? 1 : 0) : acercar(mezcla, actual === 'sistema' ? 1 : 0, dt, 1.6);
        if (!m.quieto) {
          red.grupo.rotation.y = t * 0.18;
          red.grupo.rotation.x = Math.sin(t * 0.13) * 0.25;
          vacio.disco.puntos.rotation.y = t * 1.4;
        }
        ubicarRed();
        if (m.quieto) asentar(corriente, actual, redMundo);
        else avanzar(corriente, dt, actual, redMundo);

        vacio.esfera.scale.setScalar(Math.max(0.001, 1 - mezcla));
        vacio.esfera.material.opacity = 1 - mezcla;
        vacio.disco.uniformes.uOpacidad.value = 1 - mezcla;
        red.material.opacity = mezcla;
        red.nodos.uniformes.uOpacidad.value = mezcla;
        red.pintar();
        pintarCiudadanos(corriente, ciudadanos);
        confianza.actualizar();

        const giro = m.quieto ? 0.5 : t * 0.035;
        mundo.rotation.y = acercar(mundo.rotation.y, giro + puntero.x * 0.25, dt, 2.5);
        mundo.rotation.x = acercar(mundo.rotation.x, puntero.y * 0.08, dt, 2.5);
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

  // Hasta que el lector elige, la escena alterna sola para mostrar los dos destinos.
  useEffect(() => {
    if (tocado || motorRef.current?.quieto !== false) return;
    const id = window.setInterval(() => {
      setDestino((d) => {
        const siguiente = d === 'persona' ? 'sistema' : 'persona';
        destinoRef.current = siguiente;
        return siguiente;
      });
    }, ALTERNAR_CADA_MS);
    return () => {
      window.clearInterval(id);
    };
  }, [tocado]);

  const elegir = (d: Destino) => {
    setTocado(true);
    setDestino(d);
    destinoRef.current = d;
    motorRef.current?.pedirCuadro();
  };

  return (
    <div className="absolute inset-0">
      <div
        ref={contenedorRef}
        role="img"
        aria-label={
          destino === 'persona'
            ? 'Noventa ciudadanos en círculo mandan su confianza hacia un vacío en el centro. La confianza cae en espiral, desaparece, y una parte sale como calor hacia arriba. Los ciudadanos se van apagando.'
            : 'Noventa ciudadanos en círculo mandan su confianza a una red en el centro. La confianza recorre la red, la enciende y vuelve más clara a quien la dio. Los ciudadanos se iluminan.'
        }
        className="absolute inset-0"
      />
      <Leyenda />
      <BarraDeEscena superficie="noche">
        <BotonDeEscena
          superficie="noche"
          presionado={destino === 'persona'}
          onClick={() => {
            elegir('persona');
          }}
        >
          A una persona
        </BotonDeEscena>
        <BotonDeEscena
          superficie="noche"
          presionado={destino === 'sistema'}
          onClick={() => {
            elegir('sistema');
          }}
        >
          A un sistema
        </BotonDeEscena>
      </BarraDeEscena>
    </div>
  );
}
