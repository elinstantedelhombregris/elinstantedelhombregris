/**
 * Genera los íconos PNG del Radar ¡BASTA! sin dependencias de imagen:
 * píxeles RGBA crudos → zlib deflate → chunks PNG a mano.
 *
 * Uso: npx tsx scripts/generate-radar-icons.ts
 * Salida: client/public/radar-icon-{192,512}.png + radar-icon-maskable-512.png
 */
import { deflateSync } from 'zlib';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

// ---------- Escritor PNG ----------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(width: number, height: number, rgba: Uint8Array): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // compression 0, filter 0, interlace 0
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filtro None
    rgba.subarray(y * stride, (y + 1) * stride).forEach((v, i) => {
      raw[y * (stride + 1) + 1 + i] = v;
    });
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------- Render del ícono ----------

type RGB = [number, number, number];
const VIOLET: RGB = [125, 91, 222]; // #7D5BDE
const VIOLET_LIGHT: RGB = [157, 133, 232]; // #9D85E8
const BG_CENTER: RGB = [26, 18, 51]; // #1a1233
const BG_EDGE: RGB = [10, 10, 10]; // #0a0a0a

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (edge: number, x: number) => clamp01(1 - Math.abs(x) / edge);

function mix(base: RGB, over: RGB, alpha: number): RGB {
  return [
    lerp(base[0], over[0], alpha),
    lerp(base[1], over[1], alpha),
    lerp(base[2], over[2], alpha),
  ];
}

/**
 * Dibuja el motivo radar: fondo radial oscuro, 4 anillos concéntricos violeta
 * que se desvanecen hacia afuera, punto central brillante con halo.
 * `scale` achica el motivo (zona segura maskable = 0.8).
 */
function renderIcon(size: number, scale: number): Uint8Array {
  const px = new Uint8Array(size * size * 4);
  const c = size / 2;
  const unit = (size / 2) * scale; // radio útil del motivo
  const rings = [0.32, 0.52, 0.72, 0.92]; // radios relativos
  const ringW = Math.max(size * 0.012, 1.6);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - c + 0.5;
      const dy = y - c + 0.5;
      const d = Math.sqrt(dx * dx + dy * dy);

      // Fondo: gradiente radial
      const t = clamp01(d / (size / 2));
      let color = mix(BG_CENTER, BG_EDGE, t * t) as RGB;

      // Anillos
      rings.forEach((rr, i) => {
        const ringAlpha = smooth(ringW, d - rr * unit) * (1 - i * 0.18);
        if (ringAlpha > 0) color = mix(color, VIOLET, ringAlpha * 0.9);
      });

      // Halo central + núcleo
      const halo = Math.exp(-(d * d) / (2 * (unit * 0.16) ** 2));
      if (halo > 0.01) color = mix(color, VIOLET_LIGHT, halo * 0.85);
      const core = Math.exp(-(d * d) / (2 * (unit * 0.055) ** 2));
      if (core > 0.01) color = mix(color, [245, 247, 250], core);

      const o = (y * size + x) * 4;
      px[o] = Math.round(color[0]);
      px[o + 1] = Math.round(color[1]);
      px[o + 2] = Math.round(color[2]);
      px[o + 3] = 255;
    }
  }
  return px;
}

const outDir = resolve(import.meta.dirname, '..', 'client', 'public');
const targets = [
  { file: 'radar-icon-192.png', size: 192, scale: 0.92 },
  { file: 'radar-icon-512.png', size: 512, scale: 0.92 },
  { file: 'radar-icon-maskable-512.png', size: 512, scale: 0.72 },
];

for (const { file, size, scale } of targets) {
  const png = encodePng(size, size, renderIcon(size, scale));
  writeFileSync(resolve(outDir, file), png);
  console.log(`✓ ${file} (${png.length} bytes)`);
}
