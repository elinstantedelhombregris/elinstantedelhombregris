import { derivado } from './procedencia.js';
import { retratoMedido, retratoSimulado } from './retrato.js';

import type {
  Diferencia,
  DiferenciaTerritorio,
  EntradaSimulacion,
  ResultadoSimulacion,
  Retrato,
} from './tipos.js';

/**
 * El orquestador de la Simulación — spec §5.1.
 *
 * Corre los dos lados y los resta. El lado del silencio se calcula sin mirar
 * las palancas, y esa asimetría es el corazón de S3: si las dos mitades
 * salieran del mismo modelo, la cortina no probaría nada.
 */
function restar(silencio: Retrato, voz: Retrato): Diferencia {
  const porTerritorio = new Map<string, DiferenciaTerritorio>();
  let ganan = 0;

  for (const [id, deVoz] of voz.porTerritorio) {
    const deSilencio = silencio.porTerritorio.get(id);
    const gana = deVoz.veredicto.hay && !(deSilencio?.veredicto.hay ?? false);
    if (gana) ganan += 1;

    porTerritorio.set(id, {
      territorioId: id,
      delta: derivado(
        deVoz.voces.valor - (deSilencio?.voces.valor ?? 0),
        'voces',
        'voces simuladas − voces medidas',
        ['voz.voces', 'silencio.voces'],
      ),
      ganaMandato: gana,
    });
  }

  return {
    porTerritorio,
    territoriosQueGananMandato: derivado(
      ganan,
      'territorios',
      'territorios con mandato en la voz y sin mandato en el silencio',
      ['voz.veredicto', 'silencio.veredicto'],
    ),
  };
}

export function simular(entrada: EntradaSimulacion): ResultadoSimulacion {
  const silencio = retratoMedido(entrada.base, entrada.territorios);
  const voz = retratoSimulado(entrada.palancas, entrada.base, entrada.territorios);
  return { silencio, voz, diferencia: restar(silencio, voz) };
}
