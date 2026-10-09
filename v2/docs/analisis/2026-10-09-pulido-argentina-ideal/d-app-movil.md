# D · App móvil

> Informe de subagente (Sonnet), 2026-10-09, rama `codex/argentina-ideal`. Citas verificadas por muestreo; el resto es su lectura.

## 1. Hallazgos

| Sev | Tipo | Archivo:línea | Qué pasa | Propuesta |
|---|---|---|---|---|
| Alta | UX | imaginar.tsx:177-200 | Con `envio` fijado, se ocultan tema y casillas y el texto no se edita. Si el servidor rechaza el envío (tema inválido, ronda cerrada), no hay salida salvo borrar desde Campañas. | Botón «Cambiar el texto o el tema» que descarte `envio` y genere un `idLocal` nuevo. |
| Alta | UX/copy | ideal.ts:84,101,132; imaginar.tsx:94,123; espacio-ideal.tsx:71 | Se muestra `e.message` crudo. Sin red salen «Network request failed», «Aborted» o «JSON Parse error». El `parse` de Zod sin `safeParse` muestra JSON. | `mensajeDeRed(e)` en ideal.ts: «No hay conexión. Tu texto sigue guardado en este teléfono; reintentá cuando tengas señal.» Para Zod, unir los mensajes de los issues, como hace la web. |
| Alta | UX | espacio-ideal.tsx:46 | Cualquier error, incluso sin red, llama a `limpiar()` y muestra el formulario de ingreso, como si la sesión se hubiera cerrado. No hay estado de carga. | Separar 401 de error de red. «Abriendo tu espacio…» / «No pudimos leer tu espacio. Reintentar». |
| Alta | UX | imaginar.tsx:175,276 | Tras compartir no hay pantalla de éxito. La nota queda al fondo, bajo la tarjeta de gestión. El contador sigue diciendo «privado hasta que elijas compartir». | Bloque superior «Tu voz quedó registrada» (como Recibo.tsx:23), scroll al tope y botones «Seguir esta campaña» / «Ver y gestionar mi aporte». |
| Alta | copy | imaginar.tsx:197,213 | Falta el aviso que sí tiene la web: va a un registro público descargable y las copias descargadas no se recuperan. Tampoco se menciona el identificador del dispositivo. El consentimiento es menos informado. | Mostrar `TEXTO_PUBLICACION_IRREVOCABLE` y `TEXTO_CONSENTIMIENTO_ACTOR` de `@v2/shared` (la app ya importa el paquete). |
| Alta | copy | campanas.tsx:47 | «El recibo conserva ese recorrido» es falso: el recibo vive en la copia que se borra. Sin cuenta, se pierde el acceso a corregir o retirar desde la app. | «Si ya lo compartiste, sigue publicado. Si borrás la copia, no podés corregirlo ni retirarlo desde esta app.» |
| Alta | paridad | imaginar.tsx (todo) | La web tiene 3 preguntas guiadas, revisión de la frase y elección de lugar. La app tiene un campo y ningún lugar: todo queda en «Argentina», aunque las campañas son «una zona, un tema». | Mínimo, un selector de provincia/localidad. Idealmente los 3 pasos. |
| Media | copy | imaginar.tsx:193 | «Revisé el texto y conserva lo que quiero decir» es agramatical. | «Esta frase refleja lo que quiero expresar.» (web) |
| Media | copy | ideal.ts:24,81; espacio-ideal.tsx:129,204,241-251; campanas.tsx:170; imaginar.tsx:209; Vincular:58 | Fugas: «v2», «sesión histórica de la app», «bitácora anterior/privada». Además «bitácora» es el blog en la web. | «La conexión todavía no está configurada en esta instalación» (como community-auth.ts:100). Rótulos «Ingresar», «Correo o usuario», «Contraseña», «Cerrar sesión». Borrar las frases con «bitácora». |
| Media | copy | campanas.tsx:77,103,107,116 | «Una devolución», «Proceso en otra fase», «Devolución: 2026-11-15» (fecha ISO), «Leer contrato…». | Usar `FASES_ROTULO` de la web. «Fecha prevista: 15 de noviembre de 2026». «Leer la convocatoria». CTA «Sumar mi mirada». |
| Media | copy (tics IA) | aportar.tsx:149; campanas.tsx:78,132; espacio-ideal.tsx:123,215; imaginar.tsx:121,245 | «Una vida imaginada abre un diseño», «sin perder su voz», «Continuidad sin perder la voz», «El segundo paso cuida tu cuenta», «El recibo identifica el aporte real», «cola de publicación automática». | aportar: «Imaginá tu Argentina ideal». imaginar:121: «Listo, tu aporte quedó compartido.» 2FA: «Ingresá el código de tu app de autenticación o uno de respaldo.» campanas:132: «Estos textos están solo en este teléfono. Nada se publica sin que lo mandes vos.» |
| Media | diseño | aportar.tsx:147 | `mx-5` dentro de un padding de 20 deja 40pt de margen y desalinea la tarjeta. Bajo el título «recurso concreto», «aporte» significa otra cosa. | Quitar `mx-5`. Dar a «Imaginar» una puerta propia (en la web es ítem de menú). |
| Media | UX | imaginar.tsx:131; espacio-ideal.tsx:112 | No usan KeyboardAvoidingView (aportar sí). El teclado tapa el ingreso y el 2FA. | KAV con padding en iOS. |
| Media | UX | imaginar.tsx:77,141 | No hay autoguardado. «Volver», el gesto atrás o el cierre del proceso pierden el texto sin avisar. | Guardar con debounce, o confirmar al salir. |
| Media | a11y | EleccionIdeal.tsx:13; Vincular:61 | Switch del sistema de unos 31pt, con color del sistema y texto no tocable. En Vincular la etiqueta es el texto entero (hasta 2000). | Pressable97 `min-h-11` con rol checkbox, como aportar.tsx:261. `numberOfLines={3}`. |
| Media | a11y/UX | TemaIdeal.tsx:15,22,25 | Muestra la clave, no la etiqueta («Tema opcional: salud»). Los chips compactos (~34pt) usan BotonTinta, sin estado seleccionado para el lector. La falla de carga es silenciosa. | `ChipTipo` con `accessibilityState.selected`. Mostrar la etiqueta. «No pudimos leer los temas. Podés seguir sin elegir uno.» (web) |
| Media | UX | imaginar.tsx:219-227 | El botón se deshabilita sin decir por qué. El mínimo de 10 caracteres no está en la web; el servidor pide 1. | Hint «Falta revisar el texto y autorizar» o sacar el mínimo. |
| Media | UX | imaginar.tsx:128,249 | `cerrado` es true mientras carga la campaña o si falla. Parpadea el botón «Guardar y comenzar una reflexión nacional» y se bloquea Compartir. | Distinguir cargando, error y cerrada. Etiqueta «Seguir sin campaña». |
| Media | paridad | espacio-ideal.tsx:144,155-196 | `{tipo} · {estado}` se ve crudo (con `_`). Hay secciones vacías sin mensaje. No se puede seguir ni dejar de seguir, y no aparecen «procesos que cuidás» ni análisis. | `estado.replaceAll('_',' ')` y fecha. Reusar las Notas vacías de la web. |
| Baja | UX | espacio-ideal.tsx:219 | `number-pad` impide el código de respaldo, que la web admite (hasta 20 caracteres). | Teclado por defecto. |
| Baja | diseño | imaginar.tsx:141 y siguientes | «Volver» es un botón ancho; las otras pantallas usan la flecha `←` de 44pt, `GranoPapel` y cabecera fija. Los inputs no tienen foco violeta ni `placeholderTextColor`. `router.back()` sin `canGoBack`. | Replicar el patrón de publicar.tsx:68-80 y `estiloInput`. |

## 2. Glosario cruzado

| Concepto | Web | App | ¿Coinciden? |
|---|---|---|---|
| Enviar | «Compartir mi Argentina ideal» (Revision:129) | «Compartir mi posibilidad» (imaginar:219) | No |
| Lo enviado | voz / aporte / posibilidad | posibilidad / aporte / relato / reflexión | Parcial (la web también mezcla) |
| Confirmar frase | «Esta frase refleja lo que quiero expresar» | «Revisé el texto y conserva…» | No |
| Publicar | «Quiero publicar esta voz» + aviso | «Autorizo compartir este aporte…» | No |
| Tras enviar | «Tu voz quedó registrada», «Ver y gestionar mi aporte» | «Ver mi recibo» | No |
| Participar en una campaña | «Sumar mi mirada» (TarjetaCampana) | «Imaginar en esta campaña» | No |
| Estado de la campaña | `FASES_ROTULO` (constantes.ts) | «Recibe aportes» / «Proceso en otra fase» | No |
| Borradores | Mi espacio > «Mis borradores», «Borrar del dispositivo» | Dentro de Campañas, «Borrar copia local» | No |
| Avisos | «Avisos», «Marcar como leído» | «Lo que cambió», «Ver novedad», «Marcar leído» | No |
| Mi espacio, Retomar, «Guardar en este dispositivo», «Vincular la selección» | igual | igual | Sí |

## 3. Lo que funciona
- Persistencia local antes de enviar, reintento del mismo envío (idempotente) y aviso claro de que guardar no publica.
- Reutiliza los componentes `papel` (PapelCard, Kicker, TituloAnton) y el voseo es consistente.
- Los diálogos destructivos tienen botón «Conservar» y explican qué no se deshace; `accessibilityRole="alert"` en los errores.
- No se guarda JWT en el almacenamiento local, y se compara la cuenta antes de reintentar el envío.

## 4. Fuera de tu área
- ideal.ts:7: usa `EXPO_PUBLIC_BASTA_V2_URL`, que no está en `.env.example`, README ni `app.json`. El resto de la app usa `EXPO_PUBLIC_CIVIC_API_URL`. Un build sin esa variable deja todas las pantallas nuevas en error.
- A verificar: `openBrowserAsync` ("Ver mi recibo", «Abrir y gestionar mi aporte») probablemente no comparte cookies con la app en iOS. La página abierta no reconocería la autoría.
- La web también filtra jerga: Revision.tsx:87 «Ámbito elegido», Recibo.tsx:35 «Ámbito:», CampanaDetail «Esta fase no recibe aportes», MisAportes:84 «según el contrato del registro». Conviene unificar en la web antes de alinear la app.
- Las campañas de ejemplo (`demo-local-aprender-mendoza`) se ven en la app como campañas reales; la web las marca «Ejemplo local» (presentacion.ts).
- Ruido de diff: aportar.tsx y _layout.tsx traen reformateo masivo sin relación con la función (~170 líneas).
