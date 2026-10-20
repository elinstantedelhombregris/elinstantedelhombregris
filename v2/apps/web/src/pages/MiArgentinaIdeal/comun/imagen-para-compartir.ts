/**
 * La imagen para compartir: un papelito de 1080 × 1350 dibujado en el navegador,
 * con lo que la persona escribió y nada más. Sirve para un aporte y para la página
 * de una campaña que junta gente (spec §3 y §11).
 *
 * Los colores van en hexadecimal a propósito: la imagen sale igual de día y de noche,
 * porque se comparte fuera del sitio.
 */
const PAPEL = '#F2EFE7';
const CRUDO = '#FBFAF4';
const BORDE = '#D8D4C8';
const TINTA = '#16130E';
const TINTA_50 = '#6B665C';
const VIOLETA = '#5227CC';

/** Parte un texto en renglones que entran en `ancho`. Una palabra más larga que el ancho va sola. */
export function partirEnRenglones(
  texto: string,
  medir: (s: string) => number,
  ancho: number,
): string[] {
  const palabras = texto.split(/\s+/).filter(Boolean);
  const renglones: string[] = [];
  let actual = '';
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (!actual || medir(prueba) <= ancho) actual = prueba;
    else {
      renglones.push(actual);
      actual = p;
    }
  }
  if (actual) renglones.push(actual);
  return renglones;
}

export interface ContenidoDeImagen {
  /** «Alguien de Salta imagina», «Una campaña quiere abrir»… */
  kicker: string;
  /** El texto grande, sin comillas: las pone el dibujo. */
  texto: string;
  /** Al pie del papelito: el tema o el estado. */
  pie: string;
  /** El llamado de abajo. */
  llamado: string;
  /** La línea que explica el llamado. */
  bajada: string;
}

export const DIRECCION_DEL_SITIO = 'elinstantedelhombregris.com';

/** Dibuja la imagen en `lienzo`. Espera las tipografías si el navegador las tiene cargadas. */
export async function dibujarPapelito(
  lienzo: HTMLCanvasElement,
  c: ContenidoDeImagen,
): Promise<void> {
  const W = 1080;
  const H = 1350;
  lienzo.width = W;
  lienzo.height = H;
  try {
    await Promise.all([
      document.fonts.load('80px Anton'),
      document.fonts.load('600 60px Archivo'),
      document.fonts.load('700 30px "Space Mono"'),
    ]);
  } catch {
    // Sin tipografías propias se dibuja con las del sistema.
  }
  const ctx = lienzo.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = PAPEL;
  ctx.fillRect(0, 0, W, H);

  ctx.font = '600 64px Archivo, sans-serif';
  const renglones = partirEnRenglones(`«${c.texto}»`, (s) => ctx.measureText(s).width, 760).slice(
    0,
    8,
  );
  const alto = 250 + renglones.length * 82;
  const arriba = 90 + Math.max(0, (1010 - alto) / 2);
  ctx.save();
  ctx.translate(W / 2, arriba + alto / 2);
  ctx.rotate(-0.012);
  ctx.fillStyle = CRUDO;
  ctx.fillRect(-430, -alto / 2, 860, alto);
  ctx.strokeStyle = BORDE;
  ctx.lineWidth = 3;
  ctx.strokeRect(-430, -alto / 2, 860, alto);
  ctx.restore();

  ctx.fillStyle = TINTA_50;
  ctx.font = '700 30px "Space Mono", monospace';
  ctx.fillText(c.kicker.toUpperCase(), 160, arriba + 90);
  ctx.fillStyle = TINTA;
  ctx.font = '600 64px Archivo, sans-serif';
  renglones.forEach((r, i) => {
    ctx.fillText(r, 160, arriba + 190 + i * 82);
  });
  const pieY = arriba + 190 + renglones.length * 82 + 10;
  ctx.fillStyle = VIOLETA;
  ctx.fillRect(160, pieY - 18, 14, 14);
  ctx.fillStyle = TINTA_50;
  ctx.font = '700 28px "Space Mono", monospace';
  ctx.fillText(c.pie.toUpperCase(), 188, pieY - 4);

  ctx.fillStyle = TINTA;
  ctx.font = '86px Anton, Impact, sans-serif';
  ctx.fillText(c.llamado.toUpperCase(), 120, 1200);
  ctx.font = '700 30px "Space Mono", monospace';
  ctx.fillText(c.bajada.toUpperCase(), 120, 1250);
  ctx.fillStyle = TINTA_50;
  ctx.fillText(DIRECCION_DEL_SITIO, 120, 1295);
  ctx.font = '64px Anton, Impact, sans-serif';
  const basta = 'BASTA';
  const x = W - 120 - ctx.measureText(`¡${basta}!`).width;
  ctx.fillStyle = VIOLETA;
  ctx.fillText('¡', x, 1200);
  const xb = x + ctx.measureText('¡').width;
  ctx.fillStyle = TINTA;
  ctx.fillText(basta, xb, 1200);
  ctx.fillStyle = VIOLETA;
  ctx.fillText('!', xb + ctx.measureText(basta).width, 1200);
}
