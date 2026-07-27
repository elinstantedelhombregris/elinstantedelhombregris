/**
 * Some Chromium WebViews return `null` from getShaderPrecisionFormat even for
 * valid enum pairs. CanvasKit 0.41 assumes the browser follows the WebGL spec
 * and immediately reads `rangeMin`, which crashes before Skia can render.
 *
 * Keep the workaround at the browser boundary: valid results pass through
 * untouched and only the invalid `null` result receives conservative values.
 */

interface ShaderPrecisionFormatLike {
  readonly rangeMin: number;
  readonly rangeMax: number;
  readonly precision: number;
}

interface WebGLPrototypeLike {
  getShaderPrecisionFormat?: (
    shaderType: number,
    precisionType: number,
  ) => ShaderPrecisionFormatLike | null;
}

const PARCHE_APLICADO = Symbol.for('basta.skia.webgl-precision-format');
const PRECISION_DESCONOCIDA: ShaderPrecisionFormatLike = Object.freeze({
  rangeMin: 0,
  rangeMax: 0,
  precision: 0,
});

function prototiposWebGLDelNavegador(): WebGLPrototypeLike[] {
  const prototipos: WebGLPrototypeLike[] = [];

  if (typeof WebGLRenderingContext !== 'undefined') {
    prototipos.push(WebGLRenderingContext.prototype);
  }
  if (typeof WebGL2RenderingContext !== 'undefined') {
    prototipos.push(WebGL2RenderingContext.prototype);
  }

  return prototipos;
}

export function asegurarPrecisionWebGLParaCanvasKit(
  prototipos: readonly WebGLPrototypeLike[] = prototiposWebGLDelNavegador(),
) {
  for (const prototipo of new Set(prototipos)) {
    const estado = prototipo as WebGLPrototypeLike & Record<PropertyKey, unknown>;
    const original = prototipo.getShaderPrecisionFormat;

    if (!original || estado[PARCHE_APLICADO]) continue;

    prototipo.getShaderPrecisionFormat = function (shaderType, precisionType) {
      return original.call(this, shaderType, precisionType) ?? PRECISION_DESCONOCIDA;
    };
    Object.defineProperty(prototipo, PARCHE_APLICADO, { value: true });
  }
}

