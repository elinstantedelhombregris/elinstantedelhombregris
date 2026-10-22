/**
 * Los colores de «Papel y Tinta» (tailwind.config.ts) como números para three.
 * Se repiten acá porque el shader no lee clases de Tailwind; si cambia un token,
 * cambia en los dos lugares.
 */
export const PALETA = {
  papel: 0xf2efe7,
  papelPresionado: 0xece8dc,
  tinta: 0x16130e,
  tinta30: 0xb5b1a8,
  tinta50: 0x6b665c,
  oscuroBarra: 0x241f17,
  oscuroBorde: 0x3a362d,
  violeta: 0x5227cc,
  violetaClaro: 0x9d85e8,
  sello: 0xc23b22,
  selloClaro: 0xe8846f,
  ambarClaro: 0xa16c00,
  verde: 0x1a7a4a,
  cian: 0x0f6b8a,
} as const;

/** Un color de la paleta como componentes RGB en [0, 1], para atributos de vértice. */
export function rgb(hex: number): [number, number, number] {
  return [((hex >> 16) & 0xff) / 255, ((hex >> 8) & 0xff) / 255, (hex & 0xff) / 255];
}
