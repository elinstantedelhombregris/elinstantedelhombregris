# GUÍA DE NARRATIVA VISUAL Y SISTEMA DE DISEÑO: "EL RENACER DE ARGENTINA"

Esta guía establece los principios estéticos, narrativos y técnicos para el restyling cinemático de la plataforma ¡BASTA! / El Instante del Hombre Gris.

## 1. ARCO NARRATIVO: EL VIAJE DEL HÉROE

La experiencia de usuario no es una visita a una web, es una travesía emocional.

1.  **INICIO: EL LLAMADO (Call to Adventure)**
    *   **Emoción:** Urgencia, Épica, Posibilidad.
    *   **Mensaje:** "El mundo cruje, pero Argentina despierta. ¿Vienes?"
    *   **Estética:** "Cinematic Realism". Fotografía de alto impacto, gradientes profundos, tipografía editorial gigante.
    *   **Color:** Azul Acero Profundo (`#10131f` a `#2b2240`) con acentos dorados de esperanza.

2.  **LA VISIÓN: EL MAPA (The Blueprint)**
    *   **Emoción:** Claridad, Seguridad, Asombro Intelectual.
    *   **Mensaje:** "No es magia, es diseño. Tenemos un plan."
    *   **Estética:** "Lucid Data". Líneas finas, conexiones que se dibujan al hacer scroll, estética de plano arquitectónico holográfico.
    *   **Color:** Blanco brumoso (`var(--mist-white)`) con líneas de conexión en Azul Eléctrico (`#3b82f6`) y Violeta Iris (`#7c3aed`).

3.  **EL HOMBRE GRIS: EL ESPEJO (The Awakening)**
    *   **Emoción:** Misterio, Introspección, Revelación.
    *   **Mensaje:** "La profecía no habla de un salvador, habla de ti."
    *   **Estética:** "Mystic Minimal". Oscuridad elegante, efectos de vidrio (glassmorphism), partículas flotantes (estrellas/polvo).
    *   **Color:** Negro Espacial, Índigo Profundo, acentos en Plata y Turquesa Etéreo.

4.  **LA SEMILLA: EL ENTRENAMIENTO (The Training)**
    *   **Emoción:** Crecimiento, Vitalidad, Compromiso Tangible.
    *   **Mensaje:** "Tu despertar se convierte en acción diaria."
    *   **Estética:** "Organic Tech". Formas suaves, metáforas biológicas (raíces, brotes), luz natural simulada.
    *   **Color:** Verdes Bosque, Verdes Lima vibrantes, Tierras cálidos.

5.  **LA TRIBU: LA ASAMBLEA (The Assembly)**
    *   **Emoción:** Pertenencia, Energía Colectiva, Movimiento.
    *   **Mensaje:** "Mira lo que estamos construyendo juntos."
    *   **Estética:** "Modern Marketplace". Limpio, tarjetas funcionales, avatares, mapas de calor, sensación de "en vivo".
    *   **Color:** Blanco puro, gris suave, acentos multicolores para representar la diversidad.

---

## 2. SISTEMA DE DISEÑO: "CINE-WEB"

### Tipografía
*   **Titulares (Display):** Serif fuerte y elegante (e.g., 'Playfair Display' o similar, si no disponible, Sans con tracking ajustado) para momentos emotivos.
*   **Cuerpo:** Sans-serif ultra legible (Inter/System UI) con altura de línea generosa (1.6 - 1.8).
*   **Data/Etiquetas:** Monospaced o Sans Condensed en mayúsculas con tracking amplio (`tracking-widest`).

### Paleta de Colores Extendida (Tailwind Config Mental)
*   `hero-dark`: `from-[#0c0f19] via-[#161a26] to-[#241c36]`
*   `vision-light`: `from-white via-slate-50 to-blue-50`
*   `prophecy-void`: `from-slate-950 via-indigo-950 to-purple-950`
*   `seed-growth`: `from-emerald-950 via-green-900 to-teal-900` (Dark Mode version) o `from-emerald-50 to-teal-50` (Light Mode)

### Estrategia de Movimiento (Framer Motion)
1.  **Scroll-Triggered Reveals:** Nada es estático. Los textos suben (`y: 20 -> y: 0`, `opacity: 0 -> 1`) suavemente.
2.  **Parallax:** Fondos se mueven más lento que el contenido (`useScroll`, `useTransform`).
3.  **StaggerChildren:** Listas y tarjetas aparecen en cascada, no en bloque.
4.  **Micro-interacciones:** Hover states con `scale: 1.02` y `shadow-xl`.

---

## 3. IMPLEMENTACIÓN TÉCNICA (COMPONENTES CLAVE)

1.  **`HeroCinema`**: Componente de cabecera a pantalla completa con video/imagen de fondo, overlay de gradiente y texto animado.
2.  **`ScrollProgress`**: Barra de progreso o indicador lateral que muestra en qué etapa del "viaje" está el usuario.
3.  **`StoryBlock`**: Secciones de texto + imagen alternada con transiciones suaves.
4.  **`DataViz`**: Gráficos animados para La Visión y La Tribu.

---

Esta guía servirá como referencia constante durante la refactorización de las páginas.

