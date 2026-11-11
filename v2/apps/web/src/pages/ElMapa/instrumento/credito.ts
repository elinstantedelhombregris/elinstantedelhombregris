/**
 * El estilo que se publica y a quién hay que nombrar por usarlo.
 *
 * Van juntos a propósito. El pie del mapa decía «Protomaps» mientras las teselas
 * seguían saliendo de Carto (D-160): el crédito se había escrito para el estilo
 * de teselas propias, que está listo y sin publicar (D-051), y nadie lo ató al
 * que de verdad se sirve. Los datos son de OpenStreetMap y la ODbL obliga a
 * decirlo; Carto pide su línea como condición de uso de su mapa base.
 *
 * El día que `oscuro-propio.json` pase a ser el estilo publicado, se cambian las
 * dos constantes juntas: las teselas las arma Protomaps y la línea es la suya.
 * `__tests__/estilo-oscuro.test.ts` falla si una cambia sin la otra.
 */
export const ESTILO_DEL_MAPA = '/maps/oscuro.json';

export const CREDITO_DEL_MAPA = 'Mapa © OpenStreetMap contributors · © CARTO';
