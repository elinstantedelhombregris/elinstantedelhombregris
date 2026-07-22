#!/usr/bin/env node
/**
 * Genera assets/grano-64.png — el ruido 64×64 que `GranoPapel` tilea en
 * nativo (spec §3.9: react-native-svg no implementa <feTurbulence>, así
 * que el registro papel en iOS/Android usa este PNG en vez del data-uri
 * SVG que se usa en web).
 *
 * Sin dependencias nuevas: arma el PNG a mano (IHDR + IDAT vía zlib +
 * IEND, con CRC-32 propio para no atarse a la versión de Node) a partir
 * de ruido gris parejo, determinístico (semilla fija → el archivo no
 * cambia de una corrida a otra).
 *
 * Uso: node scripts/generar-grano.mjs
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const LADO = 64;
const SEMILLA = 0x9e3779b9; // constante de golden-ratio, solo como arranque fijo
const SALIDA = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'assets',
  'grano-64.png',
);

/** mulberry32 — PRNG chico y determinístico, sin libs. */
function mulberry32(semilla) {
  let a = semilla;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CRC_TABLE = (() => {
  const tabla = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    tabla[n] = c >>> 0;
  }
  return tabla;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(tipo, datos) {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length, 0);
  const tipoBuf = Buffer.from(tipo, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([tipoBuf, datos])), 0);
  return Buffer.concat([largo, tipoBuf, datos, crc]);
}

function generarPng() {
  const rand = mulberry32(SEMILLA);

  // IHDR: 64×64, 8 bits, escala de grises (color type 0), sin interlace.
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(LADO, 0);
  ihdr.writeUInt32BE(LADO, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(0, 9); // color type: grayscale
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  // Cada fila: 1 byte de filtro (0 = None) + 64 bytes de gris parejo.
  const crudo = Buffer.alloc(LADO * (LADO + 1));
  let cursor = 0;
  for (let y = 0; y < LADO; y++) {
    crudo[cursor++] = 0; // filtro None
    for (let x = 0; x < LADO; x++) {
      crudo[cursor++] = Math.floor(rand() * 256);
    }
  }

  const idatDatos = deflateSync(crudo);

  const firma = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    firma,
    chunk('IHDR', ihdr),
    chunk('IDAT', idatDatos),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

writeFileSync(SALIDA, generarPng());
console.log(`grano-64.png generado en ${SALIDA}`);
