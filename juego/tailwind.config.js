/**
 * Sistema visual del juego.
 *
 * En migración: «plata editorial» (acento violeta, plata, vidrio) convive
 * con «Papel y Tinta» (docs/superpowers/specs/2026-07-21-juego-papel-y-tinta.md)
 * hasta la limpieza final (Task PT8). Los tokens viejos NO se borran acá.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        fondo: '#0a0a0a',
        accent: { DEFAULT: '#7D5BDE', hover: '#8D6FE4', text: '#9D85E8' },
        plata: '#F5F7FA',
        brasa: '#F59E0B',
        // Señales — registro PAPEL (spec §2). El cielo nocturno usa
        // COLOR_ESTRELLA (src/cielo/posiciones.ts), no este bloque.
        senal: {
          dream: '#5227CC',
          need: '#A16C00',
          basta: '#C23B22',
          value: '#16130E',
          compromiso: '#1A7A4A',
          recurso: '#0F6B8A',
        },
        // Papel y Tinta (spec §2) — registro claro (papel) y oscuro (noche).
        papel: { DEFAULT: '#F2EFE7', crudo: '#FBFAF4', presionado: '#ECE8DC', mapa: '#E4E0D3' },
        tinta: { DEFAULT: '#16130E', 90: '#33302A', 75: '#4A463D', 50: '#7A756A', 30: '#B5B1A8' },
        oscuro: { texto: '#F2EFE7', secundario: '#C9C5BA', meta: '#8E8A82', tenue: '#5C594F', borde: '#3A362D', barra: '#241F17' },
        violeta: { DEFAULT: '#5227CC', hover: '#3D1BA3', claro: '#9D85E8' },
        sello: '#C23B22',
        verde: '#1A7A4A',
        ambar: '#A16C00',
        cian: '#0F6B8A',
        bordeSuave: '#D8D4C8',
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        'sans-medium': ['Inter_500Medium'],
        'sans-semibold': ['Inter_600SemiBold'],
        'sans-bold': ['Inter_700Bold'],
        serif: ['PlayfairDisplay_600SemiBold'],
        'serif-italic': ['PlayfairDisplay_500Medium_Italic'],
        mono: ['JetBrainsMono_500Medium'],
        // Papel y Tinta (spec §2).
        anton: ['Anton_400Regular'],
        archivo: ['Archivo_400Regular'],
        'archivo-medium': ['Archivo_500Medium'],
        'archivo-bold': ['Archivo_700Bold'],
        'archivo-italic': ['Archivo_400Regular_Italic'],
        space: ['SpaceMono_400Regular'],
        'space-bold': ['SpaceMono_700Bold'],
      },
    },
  },
  plugins: [],
};
