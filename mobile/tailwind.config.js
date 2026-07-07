/**
 * Sistema visual "plata editorial" — espejo de SocialJusticeHub/client/src/lib/design-tokens.ts.
 * UN acento (violeta iris) para acción, UN gradiente plata para identidad, UNA card de vidrio.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        fondo: '#0a0a0a',
        accent: {
          DEFAULT: '#7D5BDE',
          hover: '#8D6FE4',
          text: '#9D85E8',
        },
        plata: '#F5F7FA',
        senal: {
          dream: '#3b82f6',
          need: '#f59e0b',
          basta: '#ef4444',
          value: '#ec4899',
          compromiso: '#10b981',
          recurso: '#14b8a6',
        },
      },
      fontFamily: {
        sans: ['Inter_400Regular'],
        'sans-medium': ['Inter_500Medium'],
        'sans-semibold': ['Inter_600SemiBold'],
        'sans-bold': ['Inter_700Bold'],
        serif: ['PlayfairDisplay_600SemiBold'],
        'serif-italic': ['PlayfairDisplay_500Medium_Italic'],
        mono: ['JetBrainsMono_500Medium'],
      },
    },
  },
  plugins: [],
};
