# Overhaul desde primeros principios

## La unidad de valor

La app no existe para producir formularios, puntos ni publicaciones. Existe
para reducir una incertidumbre territorial y transformar una necesidad real
en una respuesta confirmada.

La cadena mínima de utilidad es:

`realidad situada → dato comprensible → procedencia → segunda mirada → responsable → acción → resultado confirmado`

Un registro que no puede responder qué, dónde, cuándo, cómo se sabe, quién lo
custodia y qué decisión puede mover sigue siendo una anécdota digital. Puede
ser valiosa en la bitácora, pero todavía no es infraestructura cívica.

## Cinco separaciones fundamentales

1. **Lugar del asunto ≠ posición del teléfono.** El GPS es una propuesta de
   pin, no la verdad. La persona debe verlo, corregirlo y nombrarlo.
2. **Error de medición ≠ precisión compartida.** `horizontalAccuracyM`
   describe lo que sabemos; `sharedPrecision` describe lo que autorizamos.
3. **Responsable interno ≠ identidad visible.** Toda entidad tiene un dueño
   seudónimo auditable, pero puede aparecer sin firma, con alias o con nombre
   declarado según el registro.
4. **Firma ≠ contacto.** Nombrarse nunca habilita teléfono, correo o domicilio.
   El contacto necesita un relay protegido y consentimiento bilateral.
5. **Captura ≠ éxito.** Una estrella puede recordar cualquier experiencia;
   la recompensa cívica debe reconocer cobertura válida, corroboración y
   resultados, no volumen.

## Qué cambió en esta iteración

- Selector universal de lugar con GPS como punto de partida y pin editable.
- Nombre humano del lugar; se eliminaron los defaults ficticios “Mi zona” y
  “Mi barrio” de las nuevas capturas.
- Recibo por registro con fuente, error GPS, precisión pública, audiencia,
  sensibilidad y firma elegida.
- Tres modos de presentación: sin firma visible, alias o nombre declarado.
- La firma nominal es opt-in por registro y nunca reutiliza silenciosamente el
  nombre privado configurado para las chispas.
- El punto exacto continúa local; el outbox recibe sólo la proyección reducida.
- El consentimiento de ubicación gobierna el payload, y cliente más servidor
  eliminan contacto embebido y vuelven a reducir la coordenada pública.
- `Aportar`, `La Escucha`, expediciones y revisión de borradores usan el mismo
  contrato de ubicación y autoría.
- Las campañas crean primero un borrador, lo enlazan con la celda/territorio y
  recién después publican; el servidor ya no recibe una observación sin el
  territorio que localmente sí tenía.
- La Radiografía agrupa por celda geográfica, no por etiqueta libre.
- El servidor valida pares, rangos y finitud, impone la grilla pública y sólo
  distribuye registros de audiencia colectiva; los demás modos fallan cerrados.
- Un pin manual puede informar un hecho, pero no paga cobertura de campo. Una
  celda recorrida exige GPS actual con error suficiente.
- El mapa conserva la incertidumbre visual y el matching calcula intervalos de
  distancia, no trata el centro de una zona reducida como verdad exacta.
- En misiones, la economía base se divide en `+1` por captura honesta y `+2`
  por celda válida. Corroboración útil y resultado confirmado tienen premios
  idempotentes; revelar nombre o mayor precisión nunca paga.
- Cada intento cívico tiene una identidad durable: estrella, entrada,
  observación, necesidad y recompensas usan claves recuperables. Un corte o
  doble toque completa lo faltante, no fabrica otra realidad ni otro premio.
- Cada publicación y corrección deja un recibo append-only de campos efectivos,
  audiencia, precisión, firma, propósito, política y fecha, asentado antes del
  outbox con la misma clave idempotente.
- `Mis datos` permite corregir el pasaporte geográfico o retirar un aporte con
  confirmación. El retiro agrega una revocación que cita los recibos previos,
  mantiene la historia local y lo saca del feed y de los agregados.
- `escucha-v1` tiene lectura territorial protegida: el servidor agrupa por
  grilla pública, aplica k a la celda y nuevamente a cada faceta, y no devuelve
  punto, celda, etiqueta, id, actor ni relato.

## Límites que no conviene fingir resueltos

La ubicación exacta sensible todavía no puede sincronizarse: falta una bóveda
cifrada con ACL y retención. El feed amplio ya exige audiencia colectiva, pero
`circle` y `counterpart` no pueden habilitarse hasta guardar un destinatario y
validar membresía. Las necesidades de personas u hogares deben seguir fuera de
ese feed general. La firma libre es declarada, no una identidad verificada. El
contacto seguro después de una conexión aún requiere relay. La captura cívica
ya tiene recuperación e idempotencia local por intento, pero todavía no es una
transacción SQLite única entre todas sus tablas. El snapshot durable repara
escrituras parciales; una futura transacción reducirá aún más esa ventana sin
cambiar las claves de dominio.

Por eso el orden recomendado es:

### P0 — seguridad y operación territorial

- scope inmutable `aggregate_only | circle | campaign | public_map | match_parties`;
- vigencia/retención ejecutable por entidad y revocación remota con acuse;
- ACL persistida para `circle` y grants dirigidos para `counterpart`;
- conversión de escucha en necesidad operativa dentro de círculo/custodia;
- relay mínimo, reportar, bloquear y retirarse;
- privacidad del perfil de cuenta independiente de vincular el dispositivo.

### P1 — medición honesta

- visita de celda separada de hallazgo positivo, incluida ausencia;
- múltiples observaciones por celda y activos estables por lugar;
- misión map-first con ruta, ubicación actual y feedback espacial;
- segunda mirada georreferenciada con distancia y error de medición;
- matching que use incertidumbre, no trate puntos reducidos como exactos.

### P2 — infraestructura nacional

- lugares administrativos canónicos y PostGIS;
- consultas por bounding box, tiempo, estado y campaña;
- mapas offline territoriales;
- identidad organizacional y representación verificable;
- libro público de respuestas, seguimiento a 7/30 días y evaluación de impacto.

## Regla política

Todo dato operativo debe tener alguien que responda por él. Eso no concede a
todo el mundo el derecho a conocer su nombre, contacto o domicilio. La
privacidad útil no es anonimato universal: es control situado, comprensible y
revocable.
