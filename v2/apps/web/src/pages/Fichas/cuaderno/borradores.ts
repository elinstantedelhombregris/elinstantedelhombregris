import type { FuenteFicha, ObjetivoFicha } from '@v2/shared';

export function nuevaFuente(territorioId: number | null): FuenteFicha {
  return {
    id: crypto.randomUUID(),
    titulo: '',
    institucion: '',
    url: '',
    referencia: '',
    obtenida: '',
    unidad: '',
    universo: '',
    territorioId,
    metodo: '',
    licencia: '',
    frecuencia: '',
    limites: '',
    estado: 'no_disponible',
    valor: null,
  };
}

export function nuevoObjetivo(territorioId: number | null): ObjetivoFicha {
  return {
    id: crypto.randomUUID(),
    titulo: '',
    resultado: '',
    horizonte: '',
    territorios: territorioId ? [territorioId] : [],
    ambito: '',
    indicador: '',
    unidad: '',
    lineaBase: null,
    fechaBase: null,
    meta: null,
    tareaPendiente: '',
    fuenteIds: [],
    metodo: '',
    escala: 'comunitaria',
    institucionPropuesta: '',
    competencia: 'por_validar',
    fuenteCompetencia: null,
    principios: '',
    gravedad: '',
    desigualdad: '',
    viabilidad: '',
  };
}
