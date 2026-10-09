import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

/**
 * El borde suave del papel. Es el color de TODO `border`, `border-t`, `divide-y`… que no
 * nombre uno (ver `borderColor.DEFAULT` abajo): sin esto Tailwind pinta esos bordes con su gris
 * de fábrica (#E5E7EB), 1,08:1 sobre papel, que no es de ningún sistema.
 */
const PAPEL_BORDE = '#D8D4C8';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        // «Papel y Tinta» — sistema de diseño definitivo (docs/design-system/tokens.css).
        papel: {
          DEFAULT: '#F2EFE7',
          crudo: '#FBFAF4',
          presionado: '#ECE8DC',
          mapa: '#E4E0D3',
          borde: PAPEL_BORDE,
        },
        tinta: {
          DEFAULT: '#16130E',
          90: '#33302A',
          75: '#4A463D',
          50: '#6B665C',
          30: '#B5B1A8',
        },
        oscuro: {
          texto: '#F2EFE7',
          secundario: '#C9C5BA',
          meta: '#8E8A82',
          tenue: '#5C594F',
          borde: '#3A362D',
          barra: '#241F17',
        },
        violeta: {
          DEFAULT: '#5227CC',
          hover: '#3D1BA3',
          claro: '#9D85E8', // violeta sobre fondo tinta
        },
        sello: '#C23B22', // basta · urgencia · sellos
        verde: '#1A7A4A', // compromiso · territorio
        ambar: '#A16C00', // necesidad · método
        cian: '#0F6B8A', // recurso
        // ¡BASTA! palette v1 — legado, se borra al terminar la migración papel.
        'iris-violet': '#7D5BDE',
        'mist-white': '#F5F7FA',
        'slate-ink': '#2F3545',
        // Semantic tokens (CSS variables defined in src/index.css).
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        border: 'hsl(var(--border) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
      },
      fontFamily: {
        // «Papel y Tinta» — Anton (display), Archivo (texto), Space Mono (kickers/meta).
        anton: ['Anton', 'ui-sans-serif', 'sans-serif'],
        archivo: ['Archivo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        space: ['"Space Mono"', 'ui-monospace', 'monospace'],
        // Legado v1 — se borra al terminar la migración papel.
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'ui-serif', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      // Un `border` sin color deja de heredar el gris de Tailwind y toma el borde suave del papel.
      // Los registros noche y los campos de formulario NO deben depender de este default: llevan
      // su color a la vista (`border-oscuro-borde`, `border-tinta`).
      borderColor: {
        DEFAULT: PAPEL_BORDE,
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'fade-up': 'fade-up 250ms ease-out',
      },
    },
  },
  plugins: [animate, typography],
};

export default config;
