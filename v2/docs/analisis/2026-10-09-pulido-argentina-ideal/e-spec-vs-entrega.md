# E · Spec contra entrega

> Informe de subagente (Sonnet), 2026-10-09, rama `codex/argentina-ideal`. Citas verificadas por muestreo; el resto es su lectura.

Leí los cuatro documentos (existen los cuatro; la revisión Hombre Gris solo está en esta rama), el diff de DEUDAS y los 5 commits. Contrasté con greps y no corrí nada. Rutas abreviadas: `web/` es `v2/apps/web/src/`.

## 1. Intención
- Que cualquiera, sin cuenta, tipo ni GPS, diga qué vida sería posible en una Argentina ideal. Un segundo público son los equipos que convocan campañas y devuelven.
- El bucle central es imaginar, revisar, publicar con consentimiento, recibir un recibo recuperable, pasar a una campaña o ficha, leer en Radiografía o Datos Abiertos y seguir desde Mi espacio.
- Aporte, campaña, ficha, análisis, acuerdo y acción son unidades distintas. Seguir no es votar y converger no es corroborar.
- La spec 2 reúne todo en el mapa: panel Imaginar más aporte directo, Home con el manifiesto y Radiografía con lentes.
- Es un ideal que orienta y no una promesa. Los ejemplos van identificados y el lanzamiento queda pendiente (equipo, fecha, pregunta).

## 2. Promesas vs. entrega
| Promesa (spec) | Estado | Evidencia |
|---|---|---|
| CTA principal a `/imaginar`, Home «Diseñemos…» (S1 Inicio) | Cambiada por S2; S1 sin actualizar | `web/pages/Home/sections/HeroBasta.tsx:41` apunta a `/el-mapa?participar=imaginar`. Contradice a S1, que dice «implementada». |
| Home: pasos, campañas, futuros, cifras; el cero explica la devolución | Parcial | `EntradaIdeal.tsx` sin «tres pasos». `CifrasStrip` e `IdeaEnTresLineas` sin uso. El vacío no explica devolución. «Cómo funciona» oculto bajo 961px (`HeroBasta.tsx:28`). |
| Imaginar: tipo confirmado, original y lectura separados, rechazar | Parcial | `ConversacionIdeal.tsx:122` fija `'sueño'`. En `Revision.tsx` la «lectura» son las respuestas concatenadas, sin ver el original ni rechazar. La IA pisa lo editado. Sin selector de fragmentos sobre 2000 caracteres. |
| Recibo: texto, campaña/edición, estado real, devolución prevista | Parcial | `Recibo.tsx` omite estado, tipo y campaña aunque `estado` llega (`lib/queries/participacion.ts:57`). Sin «imaginar otra»: tras `if (enviar.data)` (`ConversacionIdeal.tsx:168`) no hay reset. |
| Campaña nacional permanente MI ARGENTINA IDEAL con ediciones | No hecha | Es solo un título. El CTA principal publica con `campanaId: null`, o sea sin devolución. Plan E0 sin marcar: «equipo real/fecha» y «primera pregunta». |
| Campañas: rutas, estados, ediciones, contrato | Hecha | `app-routes.tsx:106-115`. `/devolucion` renderiza la misma página, sin ancla. |
| Administración con rol autorizado | No hecha | `api/.../campanas/routes.ts:57,105`: basta `authenticate` y mail verificado. |
| Mapa: Futuro como primera lectura, el mapa dibuja fichas | No hecha | `catalogo-modos.ts` conserva los 5 modos técnicos. Futuro es una sección bajo el mapa (`ElMapa.tsx:87`). «ficha» en `instrumento/`: 0 hallazgos. |
| Ficha: futuro primero, temas seleccionables, elegir aportes, `inspira` | Parcial | Temas son texto libre «separados por coma» (`FormularioFicha.tsx:112`), aunque existe `TemaDelAporte`. Sigue el campo de pegar ID. Relación por defecto `'describe'` (`:36`). |
| «Ver en Radiografía» y «Descargar» en ficha, territorio y campaña | Parcial | Faltan en fichas (0 hallazgos en `Fichas*.tsx`). |
| Radiografía: filtros en servidor, cobertura, «usar este patrón para formular un futuro» | Parcial | Filtros y `CabeceraProcedencia` están. Sin filtro de edición en la UI, una sola fecha, acciones tras un toggle. «Usar este patrón»: no encontrado. |
| Paquete público con manifiesto, diccionario y metodología | Parcial | `api/.../exportaciones/worker.ts:20`: LEEME, sin diccionario de campos. `DatosAbiertos.tsx:18` muestra claves crudas (`campana: <uuid>`). |
| Mi espacio, vínculo con la cuenta | Hecha | `MiEspacio.tsx`, `Recuperar.tsx`. «Mis datos» es un JSON síncrono (`mi-espacio/routes.ts:153`), no un enlace de corta duración. |
| Sin cuenta, gestionar desde el navegador | Parcial | No hay listado para anónimos. El recibo vive solo en memoria. |
| La idea con un caso; Biblioteca enlaza diseños | No hecha | Solo 3 párrafos en `CapituloMetodo.tsx`. Planes y Biblioteca sin cambios. |
| Sembrar como compromiso con fecha y cierre | Parcial | `Sembrar.tsx:36` es un bloque de enlaces. El contrato real vive en `Fichas/Pruebas.tsx`. |
| App móvil | Hecha en código | `mobile/src/app/imaginar.tsx`. Sin prueba física (D-103). |

## 3. Decisiones de la spec que la implementación contradice
- «Iniciar sesión no cambia nada»: cinco enlaces de ingreso pierden el contexto y caen en `/mi-espacio` (`Seguir.tsx:17`, `Fichas.tsx:203`, `Afirmaciones.tsx:91`, `ControlesAnalisis.tsx:196`, `Recibo.tsx:71`). Existe `volverTrasIngresar`.
- No etiquetar una aspiración como descripción: el selector de aportes en la ficha usa `describe` por defecto.
- El footer pasó de «Prototipo · todavía sin voces» a «Diseño abierto · revisión continua» (`PapelFooter.tsx:118`), sin equipo operativo.
- Copy suelto: `Seguir.tsx:38` dice «Seguir este proceso» también para territorios. `Fichas.tsx:102` muestra la relación cruda. `ProcesosPublicos.tsx:107` muestra la fecha ISO. Los mensajes zod genéricos («Acortá este campo…», `aportes.ts`) no nombran el campo.

## 4. Revisión Hombre Gris
El doc se declara «histórico, superseded» y no marca ninguna casilla.
- **A (contrato de voz, inventario de copy):** no hecho como paquete. Lo absorben las specs.
- **B3 (retirar el velo):** no. `DespertarVeil` sigue en `/la-idea` y `/cronica` (`RootLayout.tsx:39`) y `despertar()` sigue en `HeroBasta.tsx:41`.
- **B5 (Sembrar arriba en el menú móvil):** revertido. Sembrar salió de nav y footer. Su único enlace entrante es `QuienEstaDetras/.../CierreFirma.tsx:29`.
- **C (Home Llamado→Tribu):** reemplazado por otra composición. El contador de cabecera sí es honesto en cero.
- **D1:** «Como vos, hasta hoy» (`CapituloHombreGris.tsx:82`) y «Tu silencio también firma» (`la-idea-data.ts:66`) siguen. D2 parcial, con `CapituloMetodo` suavizado. D6 («primer gesto»): no encontrado.
- **E (3 etapas del form del mapa), F (búsqueda y temas de planes), H (5 lectores, antes/después):** no encontrados.
- **G:** hecho a su manera, en `ProcesosPublicos.tsx`.

## 5. Deudas nuevas
| Id | Qué | ¿Afecta la experiencia? |
|---|---|---|
| D-097 | Convergencia de v1 mide coincidencia temática | No (v1 archivado) |
| D-098 | PLANPREGUNTA cita un relato de 2040 como precedente | No en este flujo; sí en Biblioteca |
| D-099 | Datos Abiertos pendiente, licencias desalineadas (resuelta) | Sí |
| D-100 | Autoría anónima sin recuperación (resuelta) | Sí |
| D-101 | Radiografía recortaba a 500 sin decirlo (resuelta) | Sí |
| D-102 | Cálculos grandes sin trabajos (abierta, parcial) | Sí: opiniones «insuficientes» sobre 400 cuentas |
| D-103 | Móvil sin prueba física (abierta) | Sí |
| D-104 | Fixtures repetidos (resuelta) | Sí: 20 campañas duplicadas |

El índice quedó desordenado (102, 103, 104, 99…). Faltan entradas para el cron por minuto, la gestión sin rol y Sembrar huérfano.

## 6. Coherencia con ¡BASTA!
Se sostiene en los avisos y flaquea en el titular y los botones.

A favor:
- «No habla por todo el barrio, no es un acuerdo y no obliga a nadie» (`Fichas.tsx:51`).
- «Que muchas señales digan lo mismo no prueba que sea cierto ni que exista acuerdo» (`LaRadiografia.tsx:96`).
- «todavía no constituye un acuerdo ni una promesa de nadie» (`Recibo.tsx:~29`).

En contra:
- «El futuro necesita tu letra» (`CtaBand.tsx:10`).
- «Podés seguir el trabajo que nazca de ella» (`Recibo.tsx:30`).
- «Qué podés esperar» + «Fecha prevista» (`CampanaDetail.tsx`) y «Abrir una pregunta» (`Campanas.tsx:42`) suenan a mesa de entradas.

La pregunta de entrada es sobre «tu vida» y no sobre el diseño del sistema. Solo la tercera toca condiciones y se puede saltear. Nada en Imaginar dice «diseño idealizado» o «esto no es un pedido».

## 7. Riesgo de engaño
- El CTA principal publica en un «registro» sin equipo que devuelva, y el recibo dice «una forma de volver».
- Cualquier cuenta con mail verificado abre campañas, y cualquier cuenta crea fichas públicas. Ambas aparecen en Home (`EntradaIdeal.tsx`, `slice(0,3)`) y en Mandato sin curación. La advertencia «sin acreditación» va en letra chica.
- Imaginar no advierte sobre nombres ni domicilios (la ficha sí). Con cesión de texto, las tres respuestas concatenadas salen bajo CC BY.
- «Indicador de apoyo distribuido: 0,512» (`Afirmaciones.tsx:127`) lee como medida. «Prueba» es ambiguo entre ensayo y evidencia.
- El sello EJEMPLO depende de un slug fijo (`presentacion.ts:3`) y de un prefijo textual. El marcador `demostracion_local` no se lee en ningún lado (0 hallazgos). Si esos datos se sembraran fuera del entorno local, exportaciones y conteos los tratarían como reales.

## Roto o frágil
- No hay forma de hacer un segundo aporte tras el recibo sin recargar la página.
- `vercel.json` agenda el cron de exportaciones cada minuto, que Vercel Hobby no admite. Como un push a `main` despliega solo, hay riesgo de deploy o de descargas que nunca salen de «solicitado».
- Archivos sin seguimiento en el árbol: `v2/captura-tmp.mjs` y `v2/apps/api/captura-local.tmp.ts`.
- `atarACuenta` sigue sin llamadores.
- `ConversacionIdeal.tsx` tiene 337 líneas, sobre el tope de 300.
- `ProcesosPublicos` hace una consulta por tarjeta.
- El título de `ParticiparEnMapa` queda desactualizado si se cambia de lugar.
