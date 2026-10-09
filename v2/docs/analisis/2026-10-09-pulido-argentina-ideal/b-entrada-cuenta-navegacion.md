# B · Entrada, cuenta y navegación

> Informe de subagente (Sonnet), 2026-10-09, rama `codex/argentina-ideal`. Citas verificadas por muestreo; el resto es su lectura.

# Revisión de entradas, cuenta y navegación de v2 (`codex/argentina-ideal`)

Lo hice solo leyendo código y la imagen `v2-home-integrada.jpg`. No corrí la app, así que lo visual está inferido de las clases CSS.

## 1. Recorrido (visitante nuevo)

1. `/` Home › `HeroBasta` ⚠. El eslogan y el CTA «Imaginar mi Argentina» se ven bien. Bajo 961px el párrafo y el link «Cómo funciona el ejercicio» están `hidden` (HeroBasta.tsx:23-27). Nunca dice qué es el sitio ni que no hace falta cuenta.
2. `/` Home › `VocesTicker`, `EntradaIdeal`, `HombreGrisBand`, `PlanesTeaser` ⚠. Son cuatro bloques abstractos. Campaña y ficha no se definen, «PLANes» aparece sin explicar, y con la base vacía §01 muestra dos vacíos poéticos sin salida.
3. `/la-idea` › `CapituloMetodo` ⚠. El texto nuevo contradice los roles y el ciclo viejos (hallazgo M7).
4. CTA → `/el-mapa?participar=imaginar#instrumento` › `ParticiparEnMapa` › `ConversacionIdeal` ⚠. Cae dentro de la página del mapa. La misma acción se llama de tres formas: «Imaginar mi Argentina», «Sumá tu mirada» e «Imaginar una vida». No revisé los internos.
5. `Imaginar/Recibo` ⚠. Para un anónimo, «Guardar en mi espacio» va a `/ingresar` (login), no al registro.
6. `/senal/:id` ⚠. La única vuelta es «← El mapa». No avisa «esto es tuyo» ni empuja a crear cuenta, aunque RetirarAporte.tsx:10 admite que la autoría vive en el navegador.
7. `/registrarse?volver=` ✘. Los campos son casi invisibles y no hay promesa ni reglas. El retorno a `/mi-espacio` sí funciona ✔.
8. `/mi-espacio` con cuenta recién creada ⚠. «Recuperar» queda al fondo de la pestaña 0, sin bienvenida y con el vacío sin botón.
9. Volver otro día, con cuenta ✔. El header dice «Mi espacio», o «Ingresar» con `volver` correcto, también por 2FA.
10. Volver otro día, sin cuenta ✘. Mi espacio solo muestra una nota y «Borradores». El aporte propio no aparece en ningún lado y no hay mails ni avisos externos.

## 2. Hallazgos

| Sev | Tipo | Archivo:línea | Qué pasa | Propuesta |
|---|---|---|---|---|
| Alta | UX | MiEspacio.tsx:61-83 | El anónimo no ve sus aportes. «Recuperar» vive solo en la rama con sesión. | Lista de solo lectura «Guardados en este navegador» + «Creá tu cuenta para no perderlos». |
| Alta | UX/copy | MisAportes.tsx:43-46; MisProcesos.tsx:28-40 | El vacío no tiene botón. A quien no aportó le ofrece «Abrir una ficha» y «Gestionar mis campañas». | «Todavía no compartiste nada desde esta cuenta.» + botón «Imaginar mi Argentina». Esconder lo avanzado hasta el primer aporte. |
| Alta | diseño/a11y | ui/input.tsx:11 en Login.tsx:61-76, Register.tsx:55-75, TwoFactor:71 | `Input` oscuro (`border-white/10 bg-white/5`) sobre papel-crudo: 1.04:1. `Button` usa el violeta legado, 4.1:1. | Usar `CAMPO` (participacion/constantes.ts:1) y `BotonPapel`. |
| Alta | a11y | Login.tsx:80, Register.tsx:79, TwoFactor:86, ui/field-error.tsx:14; Login.tsx:89 | `text-red-400` da 2.65:1. `hover:text-foreground` deja el link casi blanco sobre crema. | `text-sello` (5.09:1); `hover:text-violeta`. |
| Alta | UX | Register.tsx:42-51 | La cuenta no tiene promesa. Pide nombre, usuario y email, y la regla de 12 caracteres solo aparece al fallar. | «Con una cuenta tus aportes te siguen a cualquier dispositivo. Para imaginar no hace falta, y tu nombre no se publica.» Pistas: «Mínimo 12 caracteres», «Para saludarte. No aparece junto a tus aportes.» |
| Alta | UX | PapelHeader.tsx:100; Seguir.tsx:17; Fichas.tsx:203; Fichas/Afirmaciones.tsx:91; ControlesAnalisis.tsx:196; volver.ts:5 | Ingresar desde una campaña, ficha o análisis termina en Mi espacio (`volver` fijo o ausente). | Helper `hrefIngresar()` con la ubicación actual. |
| Alta | copy | HeroBasta.tsx:23-27 | No dice qué es el sitio, «ejercicio» no está definido, y en móvil se oculta. | «¡BASTA! es un lugar para imaginar entre todos cómo podría ser la Argentina. Contás en una frase qué querrías que fuera posible en tu vida y se suma a lo que cuentan otras personas de tu zona.» Link: «Cómo funciona →». Bajo el botón: «No hace falta cuenta.» |
| Alta | copy/UX | EntradaIdeal.tsx:19-22,27,33,46,52,58,66,73 | Los títulos poéticos esconden qué es cada cosa. Vacíos y errores sin salida. «borrador en revisión» está hardcodeado y el dato no trae estado. | H3 «Campañas abiertas» / «Fichas en armado». Intro: «Una campaña es una pregunta abierta sobre un tema y un lugar. Una ficha es una idea que un grupo va armando.» Vacío: «Todavía no hay campañas abiertas. Mientras tanto, contá tu frase.» Error: «No pudimos cargar las campañas. Probá de nuevo en un rato.» Ficha: `{territorioNombre ?? 'Todo el país'} · actualizada {fecha}`. |
| Alta | IA | papel-nav.ts:15-21,69 | `/mandato-vivo` no recibe enlaces (solo `/apoyo`, v1). `/planes` y `/fichas` no tienen nav. `/sembrar` solo llega desde CierreFirma.tsx:29 y `SEMBRAR_HREF` está muerto. | Planes y Fichas como hijos en `SUBSECCIONES`. Decidir el destino de Mandato vivo y Sembrar. |
| Alta | IA/diseño | papel-routes.ts:5-47; Login.tsx:89; Cuenta.tsx:46; MiEspacio.tsx:232; PapelFooter | `/recuperar-contrasena`, `/mi-perfil`, `/notificaciones` y `/verificar-email` caen en el chrome v1 oscuro. El footer no enlaza `/politica-privacidad` ni `/apoyo`. | Pasarlas a `PAPEL_ROUTES`. Agregar «Privacidad» al footer. |
| Media | a11y | PapelFooter.tsx:46,63,74,89 | `text-oscuro-tenue` da 2.64:1 a 11px, incluidos los links. | `text-oscuro-meta` (5.39:1). |
| Media | copy | MisAportes.tsx:52,123 | Muestra valores crudos: `a.tipo`, `estado.replaceAll('_',' ')` y `precision` («100m», «neighborhood»). | `ESTADO_EN_CASTELLANO` (vocabulario.ts:252). Mover `PRECISION_EN_PALABRAS` (Senal.tsx:40) a `lib`. |
| Media | copy | EntradaIdeal.tsx:27,52; MiEspacio.tsx:114; MisProcesos.tsx:7,20; constantes.ts:5-9; Campanas.tsx:70,80 | Una cosa, muchos nombres. Campaña = convocatoria = pregunta = ronda = mesa = proceso. Ficha = futuro = diseño = posibilidad. | Fijar «campaña», «ficha» y «aporte». «Proceso» no sale a la UI. |
| Media | copy | MiEspacio.tsx:38-40,114,151,202; Cuenta.tsx:21 | Los títulos son aforismos que no dicen qué página es. | H1 «Mi espacio». Entrada: «Acá volvés a lo que compartiste, a lo que seguís y a lo que dejaste a medias.» H2 = nombre de pestaña. |
| Media | copy | HombreGrisBand.tsx:12,17; CapituloMetodo.tsx:29-33 | Cierres simétricos de IA: «La experiencia de una vida abre una pregunta. La escucha de otras vidas…» y «El ideal orienta; la experiencia nos enseña…». | «Es una persona común que trabaja, paga y espera, y un martes cualquiera se pregunta qué haría distinto si el país dependiera un poco de ella. ¿Y si fueras vos?» Segundo bloque: «Acá lo que cuenta cada persona se junta con lo de otras, por tema y lugar. Con eso se arman campañas y fichas.» Cortar la frase final del método. |
| Media | UX | MiEspacio.tsx:24-35,57 | Seis pestañas con `aria-pressed` y estado fuera de la URL. El anónimo ve las seis y solo una funciona. | `?pestana=`, `role="tablist"`. Anónimo: una nota, sin pestañas. |
| Media | copy | CapituloMetodo.tsx:73-76 vs la-idea-data.ts:19-34,44-50 | El texto habla de preguntas, respuestas y pruebas. Los chips siguen en «tu voz → el mandato → los planes». | CICLO: «tu frase → campañas → fichas → pruebas → revisión». |
| Media | IA | papel-nav.ts:19 y :46-48 | Radiografía está dos veces: top-level y dentro de Mapa (02.1). El comentario quedó obsoleto. | Eliminar `SECCIONES_MAPA`. |
| Media | a11y/diseño | PapelHeader.tsx:99-104,133-164 | «Ingresar» sin mayúsculas ni `aria-current`. El menú móvil tiene «Mi espacio» pero no «Ingresar». Sin Esc ni bloqueo de scroll. `text-tinta-30` en :160. | Mismo estilo que el resto. Móvil: «Ingresar» si no hay sesión. |
| Media | copy | MiEspacio.tsx:153,166,227; MisAportes.tsx:78; Cuenta.tsx:24,35; OpcionesCuenta.tsx:72-80; Recuperar.tsx:61; EditarAporte.tsx:40,98; RetirarAporte.tsx:10 | Jerga: «corte», «eludirlos», «contrato del registro», «fase/devolución», «credencial», «identificador», «CC BY 4.0». Nota de 80 palabras para cerrar cuenta. | Avisos vacío: «Cuando una campaña o ficha que seguís tenga novedades, las vas a ver acá.» Checkbox: «Dejo que cualquiera pueda leer y compartir este texto (licencia CC BY 4.0). Si no la tildás, queda reservado.» «Si borrás los datos de este navegador antes de crear tu cuenta, no vamos a poder devolverte este aporte.» Cierre de cuenta en tres viñetas. |
| Media | UX | Cuenta.tsx:30 | Dice «pendiente de verificar» sin acción. | Ocultarlo o agregar «Reenviar correo». |
| Media | UX | Senal.tsx:87-92,187-192; MisAportes.tsx:97-100 vs EditarAporte.tsx:59 | Hay dos editores del mismo aporte con textos distintos. `aceptaPublicar:true` es fijo y no hay confirmación de guardado. | Un solo componente y un banner: «Este aporte es tuyo. Podés corregirlo o retirarlo al final.» |
| Media | copy | Senal.tsx:65-69 | Dice «fila vacía». | «No encontramos esa voz. Puede que el link tenga un error o que quien la escribió la haya retirado.» |
| Media | a11y/copy | VocesTicker.tsx:19,23-25,32 | Filtra por string mágico. El marquee no se puede pausar. Con reduced-motion el texto queda recortado (index.css:265). `text-ambar` da 4.31:1. No tiene rótulo. | Rótulo «Lo que dice la gente». Vacío: «Todavía nadie compartió un texto.» |
| Media | UX | TwoFactorChallenge.tsx:74,51 | `inputMode="numeric"` impide tipear códigos de respaldo alfanuméricos. El error no tiene link. | `inputMode="text"` + «Volver a ingresar». |
| Media | copy | CtaBand.tsx:13; Manifiesto/CierreManifiesto.tsx:18; Cronica/CierreCronica.tsx:11; Bitacora/CierreBitacora.tsx:15; Entrenamientos/CierreEntrenamientos.tsx:18; Biblioteca/CierreBiblioteca.tsx:16; EnsayoDetail.tsx:116; BitacoraDetail.tsx:126; PracticaDetail.tsx:256 | La acción se llama de dos formas. Los cierres viejos («Soltar mi voz en el mapa →») van a `/el-mapa` sin `participar`. | Todos «Imaginar mi Argentina» → `IMAGINAR_HREF`. |
| Baja | copy | Login.tsx:48,85; Register.tsx:42; Login.tsx:53 | «Iniciá sesión», «Iniciar sesión», «Ingresar» y «Entrar» conviven. El servidor dice «Email o contraseña» y el campo dice «Email o usuario». «Crear una» no está subrayado. | «Ingresar» en todos lados. Link: «Crear mi cuenta». |
| Baja | PLAN | Bienvenida.tsx:23 («22 PLANes», ruta viva y huérfana); UnaRutaParaArgentina.tsx:15 y PlanesGrid.tsx:30 (código muerto) | Conteo hardcodeado. Además `PLAN_COUNT` se calcula en tres lugares: landing-data.ts:42, la-prueba-data.ts:9, la-idea-data.ts:71. | Una sola fuente. |
| Baja | diseño | Elementos.tsx:5-78; Cuenta.tsx:39-45; MiEspacio.tsx:119 | Reimplementa `BotonPapel` y `Kicker`. Botón armado a mano. `divide-y border` sin token. | `BotonPapel` y `border-papel-borde`. |
| Baja | a11y | index.html:8; App.tsx:24-30 | El mismo `<title>` en toda la app, sin skip-link. El fallback «Cargando — menos que un trámite.» usa `text-muted-foreground` (2.28:1). | Título por ruta y skip-link. |

## 3. Patrones transversales

- **Títulos-aforismo.** Pasa en `Campanas.tsx:70`, `GestionCampanas.tsx:19`, `Colaborar.tsx:35`, `DatosAbiertos.tsx:12` y Mi espacio. El H1 debería nombrar la página y el aforismo ir en la entrada.
- **Vocabulario sin cerrar.** Un mismo objeto tiene hasta siete nombres (aporte, voz, mirada, señal, reflexión, posibilidad, futuro). Además la jerga de contrato asoma en pantalla (contrato, fase, devolución, corte).
- **Cuenta como puerta invisible.** Nada explica anónimo vs cuenta antes del esfuerzo. Lo único es «Anónimo si querés» en el footer (PapelFooter.tsx:15). `volver` es correcto en `volver.ts`, pero se usa mal en cinco lugares.
- **Primitivas.** Auth usa shadcn oscuro sobre papel, y `participacion/Elementos` duplica el kit. Los bordes salen del gris por defecto.
- **Puertas viejas sin reubicar.** Mandato, Planes y Sembrar cayeron del nav sin reemplazo, y las páginas de la cuenta mezclan chrome v1 y papel.

## 4. Profundidad

1. **Home §01.** Con base real vacía es una pared de vacíos. Mostrar el ciclo en tres pasos con un ejemplo explícito, o un aporte real aprobado.
2. **Mi espacio.** Hoy es una lista de operaciones. Falta un resumen (cuántos aportes, dónde, qué pasó con las campañas que seguís) y mover «Recuperar» arriba cuando hay algo para recuperar.
3. **Alta de cuenta.** Sin bienvenida ni verificación, y `/bienvenida` quedó huérfana. Una pantalla de «Ya tenés cuenta; esto es lo próximo» cierra el viaje.
4. **Volver sin mail.** El Recibo no ofrece «Copiar enlace a mi aporte» ni descarga, y no hay otra forma de retomar.
5. **PlanesTeaser.** `slice(0,3)` muestra los tres primeros por orden, y el código (PLANSUS) funciona de H3 con el título en 10px. Invertirlo y elegir los tres a propósito.

## 5. Lo que funciona

- `volver.ts` valida origen, `//` y rutas de auth, y el `volver` se propaga por 2FA (Login.tsx:35).
- El header no inventa cifras: tres estados y ninguna cifra fabricada (PapelHeader.tsx:37-43).
- EntradaIdeal distingue «error» de «vacío» y no confunde fallo con falta de datos.
- Voseo limpio en todo el alcance. Lo único es «aquí» en Borradores.tsx:61, que debería ser «acá».
- Retirar aporte y cerrar cuenta piden confirmación; «Descargar mis datos» está disponible.

## 6. Fuera de tu área

- `Imaginar/Recibo.tsx:35-44`: el mapa de precisión no tiene `exact` y lo rotula «ubicación protegida».
- Dos URLs distintas para participar en una campaña: `Campanas/presentacion.ts:12` (`/el-mapa?...participar`) vs `app-routes.tsx:110-112` (`/imaginar?campana=`).
- `GestionCampanas.tsx:26-27`: el texto del link es una oración suelta («Volveremos a este recorrido…»). `Colaborar.tsx:41` habla de «fragmento privado».
- Código muerto tras la reescritura del Home: `CifrasStrip.tsx`, `IdeaEnTresLineas.tsx`, `landing-data.ts:16-60` (`TRES_LINEAS`, `TALLIES`) y el test de `CifrasStrip`.
- `index.html:10-11`: la meta description sigue siendo el hero viejo. `despertar.ts:3-9` cita CTAs que ya no existen.
- En la imagen de preview, el ticker muestra «[Ejemplo local]». Conviene verificar que esos fixtures no lleguen a producción (D-002).
