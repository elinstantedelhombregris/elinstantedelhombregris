# Una bienvenida, 50 instantes

Al abrir la portada aparece un documento de Papel y Tinta con el Hombre Gris,
basado en el retrato provisto por el autor, y una de 50 citas de la plataforma.
Cada cita enlaza a su texto completo. Dos composiciones —pliego y contratapa—
mantienen el retrato a la izquierda y la cita a la derecha en escritorio. En
pantallas pequeñas se apilan para conservar la lectura y los controles accesibles.
La variante de retrato en franja superior se retira de la colección.

La interacción de partículas responde de manera continua al mouse y al tacto.
El campo se recompone sin rebote y recupera más del 95 % de la forma unos 400 ms
después del gesto. Se mantiene la salida estática y se respeta movimiento reducido.

La cruz, Escape y «Seguir mi camino» cierran el documento sobre la landing real.
No hay segundo slide ni recarga que pueda volver a abrirlo. «Leer el texto» lleva
directamente a la fuente. «Otro instante» permite recorrer la colección.

Cada navegador recorre una mezcla de las 50 citas sin repeticiones. La posición
se guarda entre visitas y recargas; «Otro instante» avanza ese mismo ciclo.
Solo después de mostrar las 50 se vuelve a mezclar, evitando repetir la última
cita al comenzar el ciclo nuevo. Las pestañas comparten el progreso con Web Locks.
La selección inicial se consume una sola vez por documento, incluso con StrictMode,
y el diálogo espera esa selección antes de mostrarse. Si el navegador bloquea el
almacenamiento, el ciclo continúa en memoria durante la carga actual.

Plan de publicación:

1. Incorporar el retrato, campo amortiguado y citas en componentes tipados de v2.
2. Verificar navegación, foco, las 50 citas, recuperación y liberación del motor.
3. Ejecutar la verificación del monorepo con bases locales descartables.
4. Commit y push del cambio a GitHub; verificar el despliegue automático de Vercel
   y el comportamiento en el dominio canónico.
