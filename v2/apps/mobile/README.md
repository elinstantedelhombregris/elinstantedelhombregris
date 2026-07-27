# ¡BASTA! — juego territorial offline-first

Aplicación Expo para transformar observaciones cotidianas en datos corroborables, necesidades estructuradas, recursos disponibles y acciones confirmadas. Conserva `El Cielo` como memoria personal y agrega `Territorio` y `Círculos` como capas operativas.

## Recorrido principal

`escuchar → custodiar necesidad o dibujar misión → recorrer cobertura → corroborar con procedencia → conectar → aceptar por ambos lados → actuar → confirmar → aprender`

- La app no sincroniza por defecto borradores, ubicación exacta ni fotos originales. Hoy SQLite/IndexedDB no tienen cifrado de aplicación: local no significa bóveda.
- Las entradas de La Escucha nacen privadas; su texto nunca se copia a la red.
- Una escucha que pide apoyo puede crear un pedido local con custodio,
  destinatario, vigencia y punto seguro. Puede registrar un grant local,
  revocable y con vencimiento para un círculo u organización concretos; no se
  envía al feed global ni se considera entregado sin canal autenticado.
- La publicación reduce precisión en cliente y servidor, elimina URI locales
  de evidencia y redacta teléfonos/correos antes del outbox.
- Cada aporte confirma un pin, conserva la precisión real del GPS y decide por
  registro cuánto se comparte y si aparece con nombre, alias o sin firma; la
  firma visible nunca se preselecciona desde el nombre privado del juego.
- El juego funciona sin cuenta y sin red.
- El lazo convierte una zona en celdas conocidas y desconocidas, rutas cortas y una condición de cierre; una visita sin hallazgo acredita cobertura mediante GPS sin fabricar una señal negativa ni conservar ese punto.
- Cada misión declara propósito, custodia, método, precisión, retención y destinatario de decisión antes de recolectar.
- Cada puente abre una sala protegida con razones visibles, consentimiento bilateral, retiro, entrega y confirmación independiente.
- Vincular una cuenta es opcional y habilita círculos, campañas y el intercambio redacted para corroborar y conectar entre teléfonos.
- La Radiografía recibe agregados con supresión de grupos pequeños, nunca filas cívicas.

El modelo operativo completo, la auditoría de recorridos y la gobernanza de
datos están en [docs/CIVIC_OPERATING_MODEL.md](docs/CIVIC_OPERATING_MODEL.md),
[docs/WORKFLOW_AUDIT.md](docs/WORKFLOW_AUDIT.md) y
[docs/DATA_GOVERNANCE_AUDIT.md](docs/DATA_GOVERNANCE_AUDIT.md). El contrato de
permisos privados está en
[docs/NEED_ACCESS_GRANTS.md](docs/NEED_ACCESS_GRANTS.md), y su ledger operativo
en [docs/CUSTODY_EXECUTION.md](docs/CUSTODY_EXECUTION.md). Los bloqueos que
impiden presentarla todavía como infraestructura nacional segura están en
[docs/NATIONAL_READINESS_GAPS.md](docs/NATIONAL_READINESS_GAPS.md). La arquitectura
del movimiento, constitución de producto, análisis de primeros principios,
modelo de datos y amenazas están en
[docs/LA_TRAMA_VIVA.md](docs/LA_TRAMA_VIVA.md),
[docs/PRODUCT_CONSTITUTION.md](docs/PRODUCT_CONSTITUTION.md),
[docs/FIRST_PRINCIPLES_OVERHAUL.md](docs/FIRST_PRINCIPLES_OVERHAUL.md),
[docs/DATA_ARCHITECTURE.md](docs/DATA_ARCHITECTURE.md) y
[docs/PRIVACY_THREAT_MODEL.md](docs/PRIVACY_THREAT_MODEL.md).

## Ejecutar

Requiere Node 22.13 o posterior.

```bash
npm install
npm run web -- --port 8082
```

Para conectar la API cívica del proyecto `SocialJusticeHub`:

```bash
cp .env.example .env.local
EXPO_PUBLIC_CIVIC_API_URL=http://localhost:5000 npm run web -- --port 8082
```

En un teléfono físico, la URL debe ser HTTPS; `localhost` apuntaría al teléfono. HTTP sólo se admite para loopback durante desarrollo local y falla cerrado antes de crear una credencial.

## Verificar

```bash
npm run check
npm test
npx expo-doctor
npx expo export --platform web --output-dir /tmp/basta-web-export
npx expo export --platform ios --output-dir /tmp/basta-ios-export
```

La guía demostrable y el gate de producción viven en [docs/PLAYABLE_RELEASE.md](docs/PLAYABLE_RELEASE.md).
