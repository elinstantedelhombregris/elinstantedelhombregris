# Ficha segura de puntos territoriales

## Decisión

Un marcador no es una ventana al registro original. Es una puerta hacia una **proyección operativa mínima**. El componente de mapa entrega un `pointId`; `buildSafeMapPointCard` reconstruye desde cero lo que puede verse y qué acción tiene sentido.

## Lista permitida

La ficha puede contener solamente:

- tipo: señal, necesidad o recurso;
- categoría cívica controlada;
- estado operativo expresado con una etiqueta humana;
- precisión territorial ya autorizada (`100m`, `500m`, barrio, ciudad o exacta si fue consentida);
- una o dos acciones derivadas del contexto.

No puede copiar título, relato, descripción, contacto, autoría, alias, etiqueta libre de lugar, coordenada, cantidad, evidencia ni identificadores territoriales. El `pointId` se conserva sólo para selección y navegación interna; no se imprime.

## Estados admisibles

| Tipo | Entra al mapa operativo | Queda fuera |
|---|---|---|
| Señal | `queued`, `synced`, `needs_review`, `corroborated` | borrador, insegura, retirada, vencida o desactualizada |
| Necesidad | `submitted`, `needs_review`, `corroborated`, `matched`, `in_progress`, `reopened` | borrador, resuelta, retirada o vencida |
| Recurso | `available`, con cantidad positiva o abierta | borrador, reservado, agotado, vencido o retirado |

## Matriz de acciones

| Contexto | Acción principal | Acción secundaria |
|---|---|---|
| Señal ajena pendiente y verificable | Abrir `/verificar` con esa señal primero | Abrir misión vinculada o listado de misiones |
| Señal propia, deliberativa o ya corroborada | Abrir misión vinculada o listado | Ninguna auto-verificación |
| Necesidad abierta | Conectar apoyo | Abrir misión vinculada; si no existe, ofrecer recurso |
| Recurso disponible | Buscar una necesidad | Abrir misión vinculada cuando exista |

Una misión sólo se considera vinculada si coincide el territorio; para observaciones también debe coincidir la campaña. Se prioriza `active`, luego `planning` y luego `paused`.

## Interacción equivalente

- Web: capa transparente de 40 px, cursor de enlace y evento de capa MapLibre.
- Nativo: cada `Marker` conserva un blanco táctil de 44 × 44 px.
- El marcador abierto recibe aro blanco en ambas plataformas.
- El lazo sigue siendo independiente: seleccionar un punto no altera el polígono ni funda una misión.

## Prueba de seguridad

`src/civic/map-point-action.test.ts` pasa deliberadamente un objeto con título, resumen, teléfono, coordenadas exactas y etiqueta de domicilio. La serialización de la ficha debe excluirlos. También prueba el prefijo de los tres tipos, las rutas resultantes, la prohibición de auto-verificación, la misión exacta y la prioridad de la señal elegida.

Esta prueba no sustituye una revisión de autorización del backend. Protege el límite local más propenso a regresiones: que una refactorización propague el registro completo hacia la interfaz del mapa.
