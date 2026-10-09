/** ZIP clásico sin compresión, con descriptor de datos. Memoria: un fragmento y el índice de archivos. */
function crc32(c: number, data: Uint8Array) {
  for (const b of data) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return c;
}
function local(nombre: Buffer) {
  const b = Buffer.alloc(30 + nombre.length);
  b.writeUInt32LE(0x04034b50);
  b.writeUInt16LE(20, 4);
  b.writeUInt16LE(0x808, 6);
  b.writeUInt16LE(33, 12);
  b.writeUInt16LE(nombre.length, 26);
  nombre.copy(b, 30);
  return b;
}
interface Entrada {
  nombre: Buffer;
  crc: number;
  bytes: number;
  offset: number;
}
function descriptor(e: Entrada) {
  const b = Buffer.alloc(16);
  b.writeUInt32LE(0x08074b50);
  b.writeUInt32LE(e.crc, 4);
  b.writeUInt32LE(e.bytes, 8);
  b.writeUInt32LE(e.bytes, 12);
  return b;
}
function central(e: Entrada) {
  const b = Buffer.alloc(46 + e.nombre.length);
  b.writeUInt32LE(0x02014b50);
  b.writeUInt16LE(20, 4);
  b.writeUInt16LE(20, 6);
  b.writeUInt16LE(0x808, 8);
  b.writeUInt16LE(33, 14);
  b.writeUInt32LE(e.crc, 16);
  b.writeUInt32LE(e.bytes, 20);
  b.writeUInt32LE(e.bytes, 24);
  b.writeUInt16LE(e.nombre.length, 28);
  b.writeUInt32LE(e.offset, 42);
  e.nombre.copy(b, 46);
  return b;
}
export async function* zipPublico(partes: AsyncIterable<{ nombre: string; contenido: Buffer }>) {
  let actual: Entrada | null = null;
  let ultimoNombre = '';
  const entradas: Entrada[] = [];
  let offset = 0;
  for await (const p of partes) {
    if (ultimoNombre !== p.nombre) {
      if (actual) {
        actual.crc = (actual.crc ^ 0xffffffff) >>> 0;
        const d = descriptor(actual);
        yield d;
        offset += d.length;
        entradas.push(actual);
      }
      actual = { nombre: Buffer.from(p.nombre, 'utf8'), crc: 0xffffffff, bytes: 0, offset };
      ultimoNombre = p.nombre;
      const cabecera = local(actual.nombre);
      yield cabecera;
      offset += cabecera.length;
    }
    if (!actual) throw new Error('ARCHIVO_SIN_NOMBRE');
    actual.crc = crc32(actual.crc, p.contenido);
    actual.bytes += p.contenido.length;
    yield p.contenido;
    offset += p.contenido.length;
  }
  if (actual) {
    actual.crc = (actual.crc ^ 0xffffffff) >>> 0;
    const d = descriptor(actual);
    yield d;
    offset += d.length;
    entradas.push(actual);
  }
  const inicioCentral = offset;
  for (const e of entradas) {
    const b = central(e);
    yield b;
    offset += b.length;
  }
  const fin = Buffer.alloc(22);
  fin.writeUInt32LE(0x06054b50);
  fin.writeUInt16LE(entradas.length, 8);
  fin.writeUInt16LE(entradas.length, 10);
  fin.writeUInt32LE(offset - inicioCentral, 12);
  fin.writeUInt32LE(inicioCentral, 16);
  yield fin;
}
