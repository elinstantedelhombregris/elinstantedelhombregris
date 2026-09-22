import { and, eq } from 'drizzle-orm';

import { senales } from '../schema/senales.js';

import type { Db } from '../client.js';

export class GestionSenalesRepository {
  constructor(private readonly db: Db) {}
  async esPropia(id: string, actorId: number | null): Promise<boolean> {
    if (actorId === null) return false;
    const [fila] = await this.db
      .select({ id: senales.idPublico })
      .from(senales)
      .where(and(eq(senales.idPublico, id), eq(senales.actorId, actorId)))
      .limit(1);
    return Boolean(fila);
  }
  /** Identidad comprobada en el UPDATE. Sin actor nunca equivale a autoría. */
  async retirarPropia(id: string, actorId: number): Promise<boolean> {
    const filas = await this.db
      .update(senales)
      .set({
        estado: 'retirada',
        texto: '',
        titulo: null,
        firma: null,
        estadoDesde: new Date(),
        actualizadaEn: new Date(),
      })
      .where(and(eq(senales.idPublico, id), eq(senales.actorId, actorId)))
      .returning({ id: senales.idPublico });
    return filas.length === 1;
  }
}
