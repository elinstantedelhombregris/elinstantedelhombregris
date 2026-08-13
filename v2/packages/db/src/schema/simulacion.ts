/**
 * El esquema `simulacion`, entero, en un solo import.
 *
 * **Este archivo NO se re-exporta desde `schema/index.ts`, y eso es el diseño.**
 *
 * `client.ts` construye el cliente de Drizzle con el barril `index.js`, así que
 * lo que no esté ahí no existe para la API de consultas relacionales que sirve
 * la web. El corpus real no puede alcanzar una fila sintética por accidente
 * porque no tiene cómo nombrarla: para escribir en el ensayo hay que importar
 * este archivo con todas las letras, y el único que lo hace es
 * `repositories/simulacion.ts`.
 *
 * Hay guarda: `src/schema/__tests__/simulacion-aislamiento.test.ts` falla si el
 * barril del corpus real vuelve a exportar algo de acá, y si cualquier
 * repositorio que no sea el escritor lo importa.
 *
 * Para tirarlo todo:
 *
 * ```sh
 * pnpm --filter @v2/db simulacion:tirar --aplicar
 * ```
 *
 * o, a mano: `DROP SCHEMA simulacion CASCADE;`
 */
export {
  CLASE_POR_TIPO,
  CLASES_ENSAYADAS,
  COMANDO_PARA_TIRAR,
  DESENLACES,
  ESTADOS_DE_DIRECCION,
  ESTADOS_ENSAYADOS,
  MODOS,
  NOMBRE_DEL_ESQUEMA,
  ORIGENES_DE_TEMA,
  PRECISIONES,
  RADIOS_DE_ATENCION,
  ROLES_DE_UBICACION,
  SENSIBILIDADES,
  simulacion,
  TIPOS_CON_ALTURA,
  TIPOS_ENSAYADOS,
} from './simulacion-esquema.js';
export type { ClaseEnsayada, TipoEnsayado } from './simulacion-esquema.js';

export { simElencos, simFrases, simPersonas } from './simulacion-elenco.js';
export type {
  ElencoCongelado,
  FraseSintetica,
  NuevaFrase,
  NuevaPersona,
  NuevoElenco,
  PersonaSintetica,
} from './simulacion-elenco.js';

export { simCorridas, simEscenarios, simFunciones } from './simulacion-corrida.js';
export type {
  CorridaGuardada,
  EscenarioGuardado,
  FuncionGuardada,
  NuevaCorrida,
  NuevaFuncion,
  NuevoEscenario,
} from './simulacion-corrida.js';

export {
  simAdhesionesEnsayadas,
  simConfirmacionesEnsayadas,
  simEntrevistas,
  simRastroFuncion,
  simSenalesEnsayadas,
} from './simulacion-ensayo.js';
export type {
  AdhesionEnsayada,
  ConfirmacionEnsayada,
  Entrevista,
  EventoDeRastro,
  NuevaAdhesionEnsayada,
  NuevaConfirmacionEnsayada,
  NuevaEntrevista,
  NuevaSenalEnsayada,
  NuevoEventoDeRastro,
  SenalEnsayada,
} from './simulacion-ensayo.js';
