/**
 * El esquema de color de los controles nativos (casillas, radios, deslizadores, listas,
 * barras de scroll). El navegador los dibuja según `color-scheme`, y `html` es `dark` por el v1.
 *
 * - `.papel-root` declara `light` (index.css): todo lo que es papel dibuja sus controles claros.
 * - Un registro de noche dentro del papel declara `REGISTRO_DE_NOCHE` en su contenedor.
 * - Y un papel dentro de ese registro de noche (el panel de aportes del mapa, los controles de
 *   La Radiografía) declara `ISLA_DE_PAPEL`: sin eso hereda `dark` y una casilla SIN marcar
 *   parece marcada.
 *
 * Son cadenas completas, escritas acá, para que Tailwind las encuentre al armar la hoja.
 */
export const REGISTRO_DE_NOCHE = '[color-scheme:dark] accent-violeta-claro';
export const ISLA_DE_PAPEL = '[color-scheme:light] accent-violeta';
