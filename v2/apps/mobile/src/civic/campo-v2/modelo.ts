import { envioCampoSchema, type CuadernoNativo, type TareaCampoNativa } from '@v2/shared';

export function nuevoCuaderno(
  id: string,
  usuarioId: number,
  origen: string,
  tarea: TareaCampoNativa,
): CuadernoNativo {
  return {
    id,
    usuarioId,
    origen,
    tarea,
    notas: '',
    campos: {
      titulo: '',
      texto: '',
      desde: '',
      hasta: '',
      observaciones: '',
      ausencias: '',
      limites: '',
      proximoPaso: '',
    },
    version: 0,
    estado: 'borrador',
    sobre: null,
    retiro: null,
    evidenciaId: null,
    intentos: 0,
    siguienteIntento: 0,
    mensaje: '',
  };
}
export function autorizar(c: CuadernoNativo, idLocal: string): CuadernoNativo {
  if (c.estado !== 'borrador') throw new Error('Volvé a revisar el resumen antes de autorizar.');
  const v = c.campos;
  const resultado = envioCampoSchema.safeParse({
    idLocal,
    usuarioId: c.usuarioId,
    revisionTarea: c.tarea.revision,
    declaroRealizada: true,
    autorizoPublicacion: true,
    titulo: v.titulo,
    texto: v.texto,
    url: null,
    resultadoEscucha: {
      desde: v.desde,
      hasta: v.hasta,
      observaciones: v.observaciones.trim() ? Number(v.observaciones) : null,
      ausencias: v.ausencias,
      limites: v.limites,
      proximoPaso: v.proximoPaso,
    },
  });
  if (!resultado.success)
    throw new Error(resultado.error.issues[0]?.message ?? 'Revisá el resumen.');
  const sobre = resultado.data;
  return {
    ...c,
    sobre,
    estado: 'pendiente',
    intentos: 0,
    siguienteIntento: 0,
    mensaje: 'Resumen autorizado. Pendiente de envío.',
  };
}
export function revisarConflicto(c: CuadernoNativo, tarea: TareaCampoNativa): CuadernoNativo {
  if (!['conflicto', 'borrador'].includes(c.estado) || c.retiro || c.tarea.id !== tarea.id)
    throw new Error('No se puede reemplazar este envío.');
  return {
    ...c,
    tarea,
    sobre: null,
    estado: 'borrador',
    intentos: 0,
    mensaje: 'Revisá el destino y los límites; la autorización anterior fue retirada.',
  };
}
