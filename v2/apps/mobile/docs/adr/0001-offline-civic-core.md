# ADR 0001 — Núcleo cívico offline-first dentro de `juego`

## Estado

Aceptado.

## Decisión

`juego` conserva SQLite/Drizzle como fuente inmediata del dispositivo y suma un núcleo cívico versionado con outbox. El sitio existente no será la base de dominio del teléfono: recibirá eventos mediante una API v1 y publicará agregados derivados.

La UI y la lógica funcionan sin servidor. La sincronización es una capacidad adicional y observable, no un requisito para capturar.

## Motivos

- el juego existente ya tiene persistencia local, migraciones y reglas puras probadas;
- la base web actual fragmenta señales en varias tablas y no modela verificación o resolución;
- acoplar el teléfono a esas tablas haría permanente el modelo equivocado;
- un contrato versionado permite reemplazar el backend sin perder el trabajo del dispositivo.

## Consecuencias

- se agregan tablas locales sin destruir estrellas, brasas o expediciones existentes;
- toda mutación cívica autorizada para publicación encola un evento idempotente;
- la integración web se implementa detrás de `/api/v1/civic/*`;
- la primera entrega puede operar completamente local y demostrar el flujo antes de desplegar servidor.
