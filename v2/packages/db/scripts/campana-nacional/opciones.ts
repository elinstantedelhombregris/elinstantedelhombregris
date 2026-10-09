/**
 * La línea de comandos de la siembra de la campaña nacional, sin efectos.
 *
 * Todo lo que decide si el script puede tocar una base está acá y es una
 * función de cadenas: se afirma sin Postgres. La regla es la del precedente
 * (`preparar-demo-campanas.ts`) pero al revés de lo que hace `migrate.ts`: acá
 * no se lee `v2/.env`, y entonces el único destino posible es el que el
 * operador escribió en `--url`.
 */
import { esBaseLocal } from '../../tests/helpers/neon-local.js';

export const AYUDA = `Uso:
  pnpm --filter @v2/db db:seed-campana-nacional \\
    --url=<postgres://…> --owner-username=<usuario> [--aplicar] [--produccion]

  --url=             Base a la que se conecta. Obligatoria. No se lee ningún .env.
  --owner-username=  Cuenta que abre y responde por la campaña. Obligatoria.
                     Tiene que estar activa y con el correo verificado.
  --aplicar          Escribe. Sin esto es una corrida en seco: solo lee y cuenta lo que haría.
  --produccion       Obligatoria si el host no es de esta máquina (127.0.0.1, localhost).
`;

/** Un error de uso: el mensaje se le muestra tal cual a quien corrió el script. */
export class ErrorDeUso extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorDeUso';
  }
}

export interface Opciones {
  url: URL;
  username: string;
  aplicar: boolean;
  produccion: boolean;
}

const BANDERAS = new Set(['--aplicar', '--produccion']);

export function leerOpciones(argv: readonly string[]): Opciones {
  let urlCruda: string | undefined;
  let username: string | undefined;
  let aplicar = false;
  let produccion = false;
  for (const arg of argv) {
    if (arg.startsWith('--url=')) urlCruda = arg.slice('--url='.length);
    else if (arg.startsWith('--owner-username=')) username = arg.slice('--owner-username='.length);
    else if (BANDERAS.has(arg)) {
      if (arg === '--aplicar') aplicar = true;
      else produccion = true;
    } else {
      // Nunca se imprime el argumento entero: podría ser una `--url` mal escrita con la clave adentro.
      throw new ErrorDeUso(
        `No entiendo la opción «${arg.split('=')[0] ?? ''}». Se escribe --url=…, --owner-username=…, --aplicar o --produccion.`,
      );
    }
  }
  if (!urlCruda) throw new ErrorDeUso('Falta --url=<postgres://…>. Este script no lee ningún .env.');
  if (!username?.trim()) throw new ErrorDeUso('Falta --owner-username=<usuario>.');
  let url: URL;
  try {
    url = new URL(urlCruda);
  } catch {
    throw new ErrorDeUso('--url no tiene forma de URL de Postgres.');
  }
  if (url.protocol !== 'postgres:' && url.protocol !== 'postgresql:') {
    throw new ErrorDeUso('--url tiene que empezar con postgres:// o postgresql://.');
  }
  return { url, username: username.trim(), aplicar, produccion };
}

export type Destino = { tipo: 'local' } | { tipo: 'remoto' };

/** Local si el host es de esta máquina. Un host remoto sin `--produccion` no se toca, ni para leer. */
export function elegirDestino(url: URL, produccion: boolean): Destino {
  if (esBaseLocal(url.href)) return { tipo: 'local' };
  if (!produccion) {
    throw new ErrorDeUso(
      `El host «${url.hostname}» no es de esta máquina. Para conectarte a una base remota agregá --produccion; ` +
        'con eso este script lee y, si agregás --aplicar, también escribe.',
    );
  }
  return { tipo: 'remoto' };
}

/** Host y nombre de la base, y nada más: ni usuario, ni clave, ni parámetros. */
export function describirDestino(url: URL): { host: string; base: string } {
  return { host: url.hostname, base: decodeURIComponent(url.pathname.replace(/^\//, '')) };
}
