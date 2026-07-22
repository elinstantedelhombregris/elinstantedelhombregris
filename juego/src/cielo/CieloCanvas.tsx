/**
 * El Cielo — UN solo Canvas Skia, presupuesto 60fps / ≤300 estrellas (spec §5).
 *
 * Capas, de atrás hacia adelante:
 *  (a) fondo: gradiente radial índigo de medianoche (paleta activa);
 *  (a2) vía plateada: banda diagonal de glow + polvo denso (atmosfera.ts);
 *  (a3) nebulosas: dos acentos de color enormes y tenues;
 *  (b) campo estelar con jerarquía (grilla con jitter, baldes Points) y
 *      unas pocas destacadas con glow propio;
 *  (c) polvo estelar (LOD): las estrellas más viejas que las 300 nítidas se
 *      agregan en grumos de glow difuso;
 *  (d) LAS ESTRELLAS: dos Atlas (comunes + fundadoras con destello en cruz),
 *      posiciones espirales determinísticas, color por tipo de señal,
 *      titilado por-estrella desde UN reloj (buffer de colores en worklet —
 *      cero estado React por estrella);
 *  (e) nacimiento: la estrella nueva florece (curva bloom) guiada por el reloj;
 *  (f) Estrella Guía al centro: plata ardiente con pulso y destello en cruz
 *      cuando la racha vive, gris apagada cuando espera el rito;
 *  (g) resplandor del horizonte + (h) viñeta: profundidad, foco al centro.
 *
 * Todo deriva de arrays + el reloj: nada re-renderiza React por frame.
 * Este módulo es el ÚNICO que importa Skia — en web se carga diferido
 * detrás de CanvasKit (ver SkyView.web.tsx).
 */

import {
  Atlas,
  BlurMask,
  Canvas,
  Circle,
  Group,
  LinearGradient,
  Points,
  RadialGradient,
  Rect,
  useClock,
  useColorBuffer,
  useRSXformBuffer,
  useTexture,
  vec,
} from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';

import type { TipoEstrella } from '@/game/types';
import { PLATA } from '@/theme/tokens';
import {
  ANGULO_VIA,
  NEBULOSAS,
  campoEstelar,
  cuantizarCampo,
  estrellasDestacadas,
  puntosVia,
} from './atmosfera';
import {
  COLOR_ESTRELLA,
  MAX_ESTRELLAS_NITIDAS,
  faseTitilado,
  grumosDePolvo,
  hexARgb,
  posicionEstrella,
  radioDelCielo,
  tamanoEstrella,
  velocidadTitilado,
} from './posiciones';

/** Lo mínimo que el Cielo necesita saber de una estrella (StarRow califica). */
export interface EstrellaCielo {
  id: string;
  tipo: TipoEstrella;
  fundadora: boolean;
  nocturna: boolean;
  fugaz: boolean;
}

/** Fondo default del Cielo — idéntico a la paleta "Noche Pura" (Papel y Tinta spec §7). */
const FONDO_DEFAULT: readonly [string, string] = ['#1A1626', '#0B0908'];

/** rgba() desde hex + alpha — para gradientes de glow sin BlurMask. */
const conAlpha = (hex: string, a: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export interface CieloProps {
  /** En orden cronológico ascendente (como devuelve estrellasTodas). */
  estrellas: EstrellaCielo[];
  /** La Estrella Guía arde (racha viva) o espera el rito (apagada). */
  rachaViva: boolean;
  /** Si está, esa estrella nace con bloom en lugar de aparecer de golpe. */
  nuevaEstrellaId?: string | null;
  /**
   * [centro, borde] del gradiente radial de fondo — la paleta activa
   * (spec §3.3). Sin prop, el negro de siempre.
   */
  paleta?: readonly [string, string];
}

// Sprite de estrella: núcleo r=16 dentro de un tile de 64 (halo hasta el borde).
const TILE = 64;
const NUCLEO = 16;
// Sprite de fundadora: mismo núcleo, tile 128 con destello en cruz.
const TILE_F = 128;

/** Fracción vertical del centro de la galaxia (deja lugar al dock abajo). */
const CENTRO_Y = 0.42;

interface CapaAtlas {
  n: number;
  xs: number[];
  ys: number[];
  escalas: number[]; // tamaño visual / NUCLEO
  rs: number[];
  gs: number[];
  bs: number[];
  fases: number[];
  vels: number[];
}

const capaVacia = (): CapaAtlas => ({
  n: 0, xs: [], ys: [], escalas: [], rs: [], gs: [], bs: [], fases: [], vels: [],
});

/** La estrella recién nacida, ya resuelta a posición/tamaño/color. */
interface EstrellaNueva {
  x: number;
  y: number;
  tam: number;
  color: string;
  fundadora: boolean;
}

/** Sprite blanco: el Atlas lo tiñe por instancia (modulate). */
const SpriteEstrella = () => (
  <Group>
    <Circle cx={TILE / 2} cy={TILE / 2} r={NUCLEO * 1.7} color="white" opacity={0.4}>
      <BlurMask blur={12} style="normal" />
    </Circle>
    <Circle cx={TILE / 2} cy={TILE / 2} r={NUCLEO} color="white">
      <BlurMask blur={3} style="normal" />
    </Circle>
  </Group>
);

/** Sprite de fundadora: núcleo + destello sutil de 4 puntas. */
const SpriteFundadora = () => {
  const c = TILE_F / 2;
  const brazo = 56;
  return (
    <Group>
      {/* brazos de la cruz: líneas finas difuminadas */}
      <Group opacity={0.5}>
        <Rect x={c - brazo} y={c - 1.5} width={brazo * 2} height={3} color="white">
          <BlurMask blur={4} style="normal" />
        </Rect>
        <Rect x={c - 1.5} y={c - brazo} width={3} height={brazo * 2} color="white">
          <BlurMask blur={4} style="normal" />
        </Rect>
      </Group>
      <Circle cx={c} cy={c} r={NUCLEO * 1.8} color="white" opacity={0.45}>
        <BlurMask blur={14} style="normal" />
      </Circle>
      <Circle cx={c} cy={c} r={NUCLEO} color="white">
        <BlurMask blur={3} style="normal" />
      </Circle>
    </Group>
  );
};

export function CieloCanvas({
  estrellas,
  rachaViva,
  nuevaEstrellaId,
  paleta = FONDO_DEFAULT,
}: CieloProps) {
  const { width: w, height: h } = useWindowDimensions();
  const cx = w / 2;
  const cy = h * CENTRO_Y;
  const clock = useClock();

  // ---------------------------------------------------------------------------
  // Datos derivados (solo cambian cuando cambian las estrellas o la pantalla)
  // ---------------------------------------------------------------------------

  const { comunes, fundadoras, grumos, nueva } = useMemo(() => {
    const total = estrellas.length;
    const corte = Math.max(0, total - MAX_ESTRELLAS_NITIDAS);
    const radioDisponible = Math.max(
      80,
      Math.min(w / 2 - 16, cy - 96, h - 232 - cy),
    );
    const escalaCielo = Math.min(1, radioDisponible / Math.max(1, radioDelCielo(total)));

    const capaComunes = capaVacia();
    const capaFundadoras = capaVacia();
    // En un holder: TS no sigue asignaciones a `let` dentro del forEach.
    const holder: { nueva: EstrellaNueva | null } = { nueva: null };

    const posViejas: { x: number; y: number }[] = [];
    estrellas.forEach((e, i) => {
      const p = posicionEstrella(i, e.id);
      const x = cx + p.x * escalaCielo;
      const y = cy + p.y * escalaCielo;
      if (i < corte) {
        posViejas.push({ x: x - cx, y: y - cy });
        return;
      }
      const tam = tamanoEstrella(e);
      const color = COLOR_ESTRELLA[e.tipo];
      if (nuevaEstrellaId && e.id === nuevaEstrellaId) {
        holder.nueva = { x, y, tam, color, fundadora: e.fundadora };
        return; // nace aparte, con bloom; el Atlas la toma al próximo render
      }
      const capa = e.fundadora ? capaFundadoras : capaComunes;
      const [r, g, b] = hexARgb(color);
      capa.xs.push(x);
      capa.ys.push(y);
      capa.escalas.push(tam / NUCLEO);
      capa.rs.push(r);
      capa.gs.push(g);
      capa.bs.push(b);
      capa.fases.push(faseTitilado(e.id));
      capa.vels.push(velocidadTitilado(e.id));
      capa.n += 1;
    });
    capaComunes.n = capaComunes.xs.length;
    capaFundadoras.n = capaFundadoras.xs.length;

    return {
      comunes: capaComunes,
      fundadoras: capaFundadoras,
      grumos: grumosDePolvo(posViejas).map((g) => ({ ...g, x: cx + g.x, y: cy + g.y })),
      nueva: holder.nueva,
    };
  }, [estrellas, nuevaEstrellaId, w, h, cx, cy]);

  // Atmósfera estática (ver atmosfera.ts): campo estelar cuantizado en
  // baldes Points, destacadas, y la vía plateada en dos densidades.
  const atmosfera = useMemo(() => {
    const campo = cuantizarCampo(campoEstelar('el-cielo-basta', w, h)).map((b) => ({
      ...b,
      vecs: b.puntos.map((p) => vec(p.x, p.y)),
    }));
    const brillantes = estrellasDestacadas('el-cielo-basta', w, h);
    const diag = Math.sqrt(w * w + h * h);
    const via = puntosVia('el-cielo-basta', diag * 1.3, Math.max(70, diag * 0.09));
    const viaTenue = via.filter((p) => p.opacidad < 0.14).map((p) => vec(p.x, p.y));
    const viaViva = via.filter((p) => p.opacidad >= 0.14).map((p) => vec(p.x, p.y));
    return { campo, brillantes, viaTenue, viaViva, diag };
  }, [w, h]);

  // ---------------------------------------------------------------------------
  // Texturas (una vez) y buffers animados por el reloj
  // ---------------------------------------------------------------------------

  const texturaComun = useTexture(<SpriteEstrella />, { width: TILE, height: TILE });
  const texturaFundadora = useTexture(<SpriteFundadora />, {
    width: TILE_F,
    height: TILE_F,
  });

  const spritesComunes = useMemo(
    () =>
      Array.from({ length: comunes.n }, () => ({
        x: 0, y: 0, width: TILE, height: TILE,
      })),
    [comunes.n],
  );
  const spritesFundadoras = useMemo(
    () =>
      Array.from({ length: fundadoras.n }, () => ({
        x: 0, y: 0, width: TILE_F, height: TILE_F,
      })),
    [fundadoras.n],
  );

  const transformsComunes = useRSXformBuffer(comunes.n, (val, i) => {
    'worklet';
    const s = comunes.escalas[i]!;
    val.set(s, 0, comunes.xs[i]! - (TILE / 2) * s, comunes.ys[i]! - (TILE / 2) * s);
  });
  const transformsFundadoras = useRSXformBuffer(fundadoras.n, (val, i) => {
    'worklet';
    const s = fundadoras.escalas[i]!;
    val.set(
      s, 0,
      fundadoras.xs[i]! - (TILE_F / 2) * s,
      fundadoras.ys[i]! - (TILE_F / 2) * s,
    );
  });

  // EL TITILADO: un solo reloj → seno con fase propia por estrella (0.65–1.0).
  const coloresComunes = useColorBuffer(comunes.n, (c, i) => {
    'worklet';
    const t = clock.value / 1000;
    const a = 0.65 + 0.175 * (1 + Math.sin(t * comunes.vels[i]! + comunes.fases[i]!));
    c[0] = comunes.rs[i]!;
    c[1] = comunes.gs[i]!;
    c[2] = comunes.bs[i]!;
    c[3] = a;
  });
  const coloresFundadoras = useColorBuffer(fundadoras.n, (c, i) => {
    'worklet';
    const t = clock.value / 1000;
    const a = 0.7 + 0.15 * (1 + Math.sin(t * fundadoras.vels[i]! + fundadoras.fases[i]!));
    c[0] = fundadoras.rs[i]!;
    c[1] = fundadoras.gs[i]!;
    c[2] = fundadoras.bs[i]!;
    c[3] = a;
  });

  // ---------------------------------------------------------------------------
  // Estrella Guía: pulso suave cuando arde; gris quieta cuando espera el rito
  // ---------------------------------------------------------------------------

  const pulso = useDerivedValue(() => {
    if (!rachaViva) return 1;
    return 1 + 0.06 * Math.sin((clock.value / 1000) * 1.6);
  });
  const guiaHalo = useDerivedValue(() => 26 * pulso.value);
  const guiaBrillo = useDerivedValue(() => 13 * pulso.value);
  const guiaNucleo = useDerivedValue(() => 6 * pulso.value);
  const guiaHaloOp = useDerivedValue(() => {
    if (!rachaViva) return 0.08;
    return 0.3 + 0.08 * Math.sin((clock.value / 1000) * 1.6);
  });
  const colorGuia = rachaViva ? PLATA : '#64748b';
  const colorNucleoGuia = rachaViva ? '#ffffff' : '#94a3b8';

  // ---------------------------------------------------------------------------
  // Nacimiento: bloom guiado por el reloj (0 → 1.12 → 1, como el variant)
  // ---------------------------------------------------------------------------

  const nacimientoInicio = useSharedValue(-1);
  useEffect(() => {
    nacimientoInicio.value = -1;
  }, [nuevaEstrellaId, nacimientoInicio]);

  const nacimientoP = useDerivedValue(() => {
    if (nacimientoInicio.value < 0) nacimientoInicio.value = clock.value;
    return Math.min(1, (clock.value - nacimientoInicio.value) / 900);
  });
  const bloomEscala = useDerivedValue(() => {
    const p = nacimientoP.value;
    return p < 0.6 ? (p / 0.6) * 1.12 : 1.12 - 0.12 * ((p - 0.6) / 0.4);
  });
  const nuevaDatos: EstrellaNueva | null = nueva;
  const nuevaR = useDerivedValue(() =>
    nuevaDatos ? Math.max(0.01, nuevaDatos.tam * bloomEscala.value) : 0.01,
  );
  // Destello del nacimiento: halo grande que respira y se asienta.
  const nuevaHaloR = useDerivedValue(() =>
    nuevaDatos ? Math.max(0.01, nuevaDatos.tam * 5 * nacimientoP.value + 2) : 0.01,
  );
  const nuevaHaloOp = useDerivedValue(() =>
    nuevaDatos ? 0.65 * Math.sin(Math.PI * nacimientoP.value) + 0.12 : 0,
  );

  return (
    <Canvas style={{ position: 'absolute', top: 0, left: 0, width: w, height: h }}>
      {/* (a) Fondo hondo — la paleta activa tiñe la noche */}
      <Rect x={0} y={0} width={w} height={h}>
        <RadialGradient
          c={vec(cx, cy)}
          r={Math.max(w, h) * 0.85}
          colors={[paleta[0], paleta[1]]}
        />
      </Rect>

      {/* (a2) La vía plateada: banda diagonal de glow + polvo denso */}
      <Group
        transform={[{ rotate: ANGULO_VIA }]}
        origin={vec(cx, cy)}
      >
        <Rect
          x={cx - atmosfera.diag * 0.7}
          y={cy - atmosfera.diag * 0.11}
          width={atmosfera.diag * 1.4}
          height={atmosfera.diag * 0.22}
        >
          <LinearGradient
            start={vec(cx, cy - atmosfera.diag * 0.11)}
            end={vec(cx, cy + atmosfera.diag * 0.11)}
            colors={[
              'rgba(245, 247, 250, 0)',
              'rgba(215, 224, 245, 0.05)',
              'rgba(245, 247, 250, 0.09)',
              'rgba(215, 224, 245, 0.05)',
              'rgba(245, 247, 250, 0)',
            ]}
          />
        </Rect>
        <Group transform={[{ translateX: cx }, { translateY: cy }]}>
          <Points
            points={atmosfera.viaTenue}
            mode="points"
            color="rgba(245, 247, 250, 0.08)"
            style="stroke"
            strokeWidth={1}
            strokeCap="round"
          />
          <Points
            points={atmosfera.viaViva}
            mode="points"
            color="rgba(245, 247, 250, 0.2)"
            style="stroke"
            strokeWidth={1.3}
            strokeCap="round"
          />
        </Group>
      </Group>

      {/* (a3) Nebulosas: dos acentos enormes y tenues, glow por gradiente */}
      {NEBULOSAS.map((n, i) => {
        const r = n.fr * Math.max(w, h);
        return (
          <Circle key={`nebulosa-${i}`} cx={n.fx * w} cy={n.fy * h} r={r}>
            <RadialGradient
              c={vec(n.fx * w, n.fy * h)}
              r={r}
              colors={[conAlpha(n.color, n.opacidad), conAlpha(n.color, 0)]}
            />
          </Circle>
        );
      })}

      {/* (b) Campo estelar con jerarquía: baldes por tinte × brillo */}
      {atmosfera.campo.map((b, i) => (
        <Points
          key={`campo-${i}`}
          points={b.vecs}
          mode="points"
          color={conAlpha(b.color, b.opacidad)}
          style="stroke"
          strokeWidth={b.radio * 2}
          strokeCap="round"
        />
      ))}

      {/* (b2) Destacadas: pocas estrellas de campo con glow propio */}
      {atmosfera.brillantes.map((e, i) => (
        <Group key={`destacada-${i}`}>
          <Circle cx={e.x} cy={e.y} r={e.radio * 4}>
            <RadialGradient
              c={vec(e.x, e.y)}
              r={e.radio * 4}
              colors={[conAlpha(e.tinte, e.opacidad * 0.35), conAlpha(e.tinte, 0)]}
            />
          </Circle>
          <Circle cx={e.x} cy={e.y} r={e.radio} color={conAlpha(e.tinte, e.opacidad)} />
        </Group>
      ))}

      {/* (c) Polvo estelar: las viejas, agregadas en glow (LOD >300) */}
      {grumos.map((g, i) => (
        <Circle
          key={`grumo-${i}`}
          cx={g.x}
          cy={g.y}
          r={g.radio}
          color={PLATA}
          opacity={Math.min(0.14, 0.05 + g.cantidad * 0.0008)}
        >
          <BlurMask blur={16} style="normal" />
        </Circle>
      ))}

      {/* (d) LAS ESTRELLAS */}
      {comunes.n > 0 && (
        <Atlas
          image={texturaComun}
          sprites={spritesComunes}
          transforms={transformsComunes}
          colors={coloresComunes}
          colorBlendMode="modulate"
        />
      )}
      {fundadoras.n > 0 && (
        <Atlas
          image={texturaFundadora}
          sprites={spritesFundadoras}
          transforms={transformsFundadoras}
          colors={coloresFundadoras}
          colorBlendMode="modulate"
        />
      )}

      {/* (e) La que acaba de nacer */}
      {nuevaDatos && (
        <Group>
          <Circle cx={nuevaDatos.x} cy={nuevaDatos.y} r={nuevaHaloR} color={nuevaDatos.color} opacity={nuevaHaloOp}>
            <BlurMask blur={10} style="normal" />
          </Circle>
          <Circle cx={nuevaDatos.x} cy={nuevaDatos.y} r={nuevaR} color={nuevaDatos.color}>
            <BlurMask blur={1.5} style="normal" />
          </Circle>
        </Group>
      )}

      {/* (f) Estrella Guía: halo + destello en cruz + núcleo (estrella, no globo) */}
      <Group>
        <Circle cx={cx} cy={cy} r={guiaHalo} color={colorGuia} opacity={guiaHaloOp}>
          <BlurMask blur={18} style="normal" />
        </Circle>
        <Group opacity={rachaViva ? 0.5 : 0.14}>
          <Rect x={cx - 46} y={cy - 0.8} width={92} height={1.6}>
            <LinearGradient
              start={vec(cx - 46, cy)}
              end={vec(cx + 46, cy)}
              colors={[
                conAlpha(colorGuia, 0),
                conAlpha(colorGuia, 0.9),
                conAlpha(colorGuia, 0),
              ]}
            />
          </Rect>
          <Rect x={cx - 0.8} y={cy - 46} width={1.6} height={92}>
            <LinearGradient
              start={vec(cx, cy - 46)}
              end={vec(cx, cy + 46)}
              colors={[
                conAlpha(colorGuia, 0),
                conAlpha(colorGuia, 0.9),
                conAlpha(colorGuia, 0),
              ]}
            />
          </Rect>
        </Group>
        <Circle
          cx={cx}
          cy={cy}
          r={guiaBrillo}
          color={colorGuia}
          opacity={rachaViva ? 0.5 : 0.18}
        >
          <BlurMask blur={8} style="normal" />
        </Circle>
        <Circle cx={cx} cy={cy} r={guiaNucleo} color={colorNucleoGuia}>
          <BlurMask blur={1} style="normal" />
        </Circle>
      </Group>

      {/* (g) Resplandor del horizonte: la ciudad respira abajo, apenas */}
      <Rect x={0} y={h * 0.62} width={w} height={h * 0.38}>
        <LinearGradient
          start={vec(0, h * 0.62)}
          end={vec(0, h)}
          colors={[
            'rgba(151, 135, 255, 0)',
            'rgba(151, 135, 255, 0.028)',
            'rgba(196, 200, 235, 0.06)',
          ]}
          positions={[0, 0.55, 1]}
        />
      </Rect>

      {/* (h) Viñeta: oscurece las esquinas, el centro manda */}
      <Rect x={0} y={0} width={w} height={h}>
        <RadialGradient
          c={vec(cx, cy * 1.08)}
          r={Math.max(w, h) * 0.92}
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.42)']}
          positions={[0, 0.55, 1]}
        />
      </Rect>
    </Canvas>
  );
}

export default CieloCanvas;
