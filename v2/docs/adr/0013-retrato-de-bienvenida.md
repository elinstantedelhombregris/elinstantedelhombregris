# ADR 0013 — Retrato de partículas en la bienvenida

Estado: aceptada, 02/11/2026. Amplía el alcance de ADR 0011 a la bienvenida
solicitada explícitamente por el autor, aprobada en el prototipo de 33 instantes.

La portada incorpora un documento modal de Papel y Tinta con una cita literal y
el retrato del autor como Hombre Gris. Se reutiliza `three` 0.186.1, ya instalado;
no se agregan dependencias ni otro motor de animación de interfaz.

La bienvenida y su renderizador se cargan por separado con `import()`; el motor
no forma parte del paquete inicial ni se descarga desde servicios externos.
El retrato WebP pesa aproximadamente 55 KB. El campo físico pequeño desplaza
las partículas en una sola llamada de dibujo, con recuperación amortiguada.

La entrada puede mostrarse una vez por carga del documento, solamente en la
portada. Al cerrar o leer la cita se desmonta y permanece cerrada durante la
navegación interna. La cruz, Escape y «Seguir mi camino» revelan la portada real,
sin recargarla, sin segundo slide y sin volver a abrir el popup.

Se usa `<dialog>` nativo para foco, Escape y contenido de fondo inerte. Sin WebGL
queda el retrato estático y todos los enlaces siguen disponibles. Con movimiento
reducido se dibuja quieto; con pestaña oculta o retrato fuera de pantalla no se
dibuja. Al desmontar se liberan observadores, eventos, texturas y contexto WebGL.

La colección actual contiene 50 citas y conserva únicamente las composiciones
Pliego y Contratapa, ambas con el retrato a la izquierda en escritorio. Cada cita
conserva fuente, URL y énfasis verificados contra los MDX. Los
controles de comparación del prototipo no pasan a la interfaz pública.

Referencia técnica: [Bruno Imbrizi / Codrops](https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/).
El shader y el campo de resortes se adaptaron para este retrato; no se reutilizan
las imágenes del tutorial.
