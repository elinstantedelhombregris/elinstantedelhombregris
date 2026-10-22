import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DynamicDrawUsage,
  NormalBlending,
  Points,
  ShaderMaterial,
} from 'three';

/**
 * Un material de puntos redondos con color, opacidad y tamaño por vértice
 * (atributos `color`, `alfa` y `tam`). `tam` está en unidades de mundo: el
 * punto se achica con la distancia como cualquier objeto de la escena.
 *
 * `aditivo` es para luz sobre fondo oscuro (la confianza que viaja); sin él,
 * los puntos se superponen como tinta sobre papel.
 */
export interface MaterialDePuntos {
  material: ShaderMaterial;
  /** `uEscala` sale de `escalaDePuntos`; `uOpacidad` multiplica la `alfa` de cada punto. */
  uniformes: { uEscala: { value: number }; uOpacidad: { value: number } };
}

export function crearMaterialDePuntos({ aditivo }: { aditivo: boolean }): MaterialDePuntos {
  const uniformes = { uEscala: { value: 1 }, uOpacidad: { value: 1 } };
  const material = new ShaderMaterial({
    uniforms: uniformes,
    vertexShader: /* glsl */ `
      attribute vec3 color;
      attribute float alfa;
      attribute float tam;
      uniform float uEscala;
      uniform float uOpacidad;
      varying vec3 vColor;
      varying float vAlfa;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = max(1.0, tam * uEscala / -mv.z);
        vColor = color;
        vAlfa = alfa * uOpacidad;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlfa;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        gl_FragColor = vec4(vColor, vAlfa * smoothstep(0.5, 0.28, d));
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: aditivo ? AdditiveBlending : NormalBlending,
  });
  return { material, uniformes };
}

export interface Nube {
  puntos: Points;
  uniformes: MaterialDePuntos['uniformes'];
  /** Marcar después de escribir los arrays que la escena modifica cuadro a cuadro. */
  actualizar: () => void;
}

/**
 * Una nube de puntos sobre arrays que la escena ya tiene. Los arrays se usan
 * tal cual (no se copian): escribirlos y llamar `actualizar` alcanza.
 */
export function crearNube(
  datos: { posiciones: Float32Array; colores: Float32Array; alfas: Float32Array; tams: Float32Array },
  { aditivo }: { aditivo: boolean },
): Nube {
  const geometria = new BufferGeometry();
  const atributos = [
    ['position', new BufferAttribute(datos.posiciones, 3)],
    ['color', new BufferAttribute(datos.colores, 3)],
    ['alfa', new BufferAttribute(datos.alfas, 1)],
    ['tam', new BufferAttribute(datos.tams, 1)],
  ] as const;
  for (const [nombre, atributo] of atributos) {
    atributo.setUsage(DynamicDrawUsage);
    geometria.setAttribute(nombre, atributo);
  }
  const { material, uniformes } = crearMaterialDePuntos({ aditivo });
  const puntos = new Points(geometria, material);
  puntos.frustumCulled = false;
  return {
    puntos,
    uniformes,
    actualizar: () => {
      for (const [, atributo] of atributos) atributo.needsUpdate = true;
    },
  };
}

/**
 * El factor que convierte `tam` (mundo) en píxeles para una cámara en
 * perspectiva: a distancia 1, una unidad de mundo ocupa `alto / (2·tan(fov/2))`
 * píxeles CSS, multiplicados por la densidad del dispositivo.
 */
export function escalaDePuntos(altoCss: number, densidad: number, fovGrados: number): number {
  return (altoCss * densidad) / (2 * Math.tan((fovGrados * Math.PI) / 360));
}
