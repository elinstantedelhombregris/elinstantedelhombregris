import { createContext } from 'react';

/**
 * Hay aportes publicados que todavía juntan opiniones. Lo dice `Vision` y lo leen los vacíos:
 * con la base en cero lo que falta son aportes; con aportes esperando, lo que falta es que
 * alguien opine, y mandar a escribir agranda la pila sin acercar ningún resultado (D-171).
 */
export const HayAportesEsperando = createContext(false);

export const MIRAR_HREF = '/mi-argentina-ideal/mirar';
