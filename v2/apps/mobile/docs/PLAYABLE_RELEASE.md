# Primera versión jugable territorial

## Qué demuestra

Esta versión preserva `El Cielo` como memoria personal y agrega `Territorio` como espacio operativo. El recorrido demostrable es:

`dibujar zona → crear misión → tomar ruta → capturar → corroborar → conectar → aceptar por ambos lados → entregar → confirmar`

Incluye:

- campañas fundadoras de luminarias y ollas comunitarias;
- captura privada por defecto y publicación granular posterior;
- ubicación pública reducida por campaña;
- cola durable e idempotente cuando no hay red o API;
- pasaporte de datos y malla de cobertura con denominador planificado;
- rutas locales de tres celdas que privilegian cobertura sobre volumen;
- validación geográfica local antes de completar una celda, sin bloquear la captura si falla el GPS;
- calidad visible y verificación con procedencia por una identidad distinta de la autora;
- ofertas de recursos con categoría, cantidad y radio;
- propuestas de afinidad explicables, nunca automáticas;
- doble aceptación y confirmación de recepción;
- salas protegidas por puente, retiro sin exposición y seguimiento 7/30;
- mapa oscuro con lazo irregular en web y nativo;
- alternativa accesible para convertir el área visible en una operación sin gesto de lazo;
- territorios GeoJSON y misiones versionadas guardados localmente;
- identidad seudónima de dispositivo con secreto de 256 bits en Keychain/Keystore;
- círculos, campañas, cobertura, invitaciones, moderación y bandeja de red;
- vinculación opcional a una cuenta sin subir la bitácora privada;
- API append-only con autorización por actor y doble aceptación real;
- feed incremental redacted para corroboración y puentes entre teléfonos vinculados;
- estados de aceptación, entrega y confirmación impuestos y persistidos por el servidor;
- agregados públicos con supresión de grupos pequeños para La Radiografía.

## Ejecutar

```bash
npm install
npm run web -- --port 8082
```

Para un teléfono, abrir el QR con Expo Go. La compilación usa Expo SDK 57 y Node 22.13 o posterior.

## Sincronización

Sin configuración, la app es completamente funcional en modo offline-first. Para conectar un receptor de eventos:

```bash
EXPO_PUBLIC_CIVIC_API_URL=https://api.example.org npm run web -- --port 8082
```

El cliente se enrola en `POST /api/v1/civic/devices/enroll` y envía eventos individuales autenticados a `POST /api/v1/civic/events` con `Idempotency-Key`. Nunca incluye coordenadas exactas, contacto ni URI locales de fotografías. Un replay idéntico recibe acuse sin duplicar; un conflicto real queda en `dead_letter` para revisión. Después de vincular una cuenta, `GET /api/v1/civic/feed` trae señales redacted y sólo los puentes donde el dispositivo representa a una parte.

Para probar web local contra `SocialJusticeHub`, permitir `http://localhost:8082` en `CORS_ORIGIN`, aplicar `migrations/20260713_civic_event_core.sql` y usar:

```bash
EXPO_PUBLIC_CIVIC_API_URL=http://localhost:5000 npm run web -- --port 8082
```

## Verificación antes de entregar

```bash
npm run check
npm test
npx expo-doctor
npx expo export --platform web --output-dir /tmp/basta-web-export
npx expo export --platform ios --output-dir /tmp/basta-ios-export
```

## Frontera de producción

La arquitectura v1 ya persiste eventos idempotentes, aplica políticas de actor y produce agregados suprimidos. Antes de abrir una campaña real todavía corresponde hacer un piloto territorial acotado, revisar el modelo de retención con las comunidades participantes, configurar observabilidad sin payloads y realizar una prueba de recuperación/rotación de credenciales.
