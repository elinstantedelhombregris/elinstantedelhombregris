# Pulido de «Argentina ideal» — análisis de copy, UX y diseño

> 2026-10-09 · rama `codex/argentina-ideal` (5 commits sobre `main`, 296 archivos) · revisión de solo lectura, nada se tocó.
> Siete revisiones en paralelo; los informes completos, con archivo:línea y texto de reemplazo propuesto, están al lado de este archivo (`a-` … `g-`), y una selección de capturas en `capturas/`. Lo marcado ✔ lo verifiqué contra el código o la captura; el resto es lectura de los informes, coherente entre sí. Rutas de código relativas a `v2/apps/web/src/` salvo indicación.

## Veredicto

La rama es ambiciosa y la ingeniería es seria: borradores locales, reintentos idempotentes, consentimiento explícito, sello EJEMPLO en flujo, la cabecera de procedencia que dice «a quien usó la plataforma, no a quien vive acá». El esqueleto del recorrido existe de punta a punta.

Lo que falla no es la estructura sino **la capa que toca a la persona**. Tres cosas se repiten en casi todos los archivos:

1. **Un mismo objeto tiene ocho nombres.** Aporte, voz, mirada, señal, reflexión, posibilidad, frase, sueño. Campaña es también convocatoria, pregunta, ronda, mesa y proceso. Ficha es futuro, diseño y borrador público. Nadie puede aprender un sistema que se nombra distinto en cada pantalla.
2. **Los títulos son aforismos y la jerga de la base sale a la pantalla.** «Una mirada abre una pregunta. Una pregunta puede cambiar un lugar.» como H1; al lado, `neighborhood`, `describe`, `2026-11-15`, `campana: <uuid>`, «contrato», «fase», «ámbito», «procedencia». Es la voz que el dueño ya rechazó, más la voz del desarrollador.
3. **Se armó un sistema de diseño paralelo.** `components/participacion/Elementos.tsx` reimplementa `BotonPapel` y `Kicker`; ~45 `border` sin color heredan el gris de Tailwind (`#E5E7EB`, invisible sobre papel) ✔; ingresar y registrarse pasaron al layout de papel con los inputs del tema oscuro ✔.

Y una de fondo, de encuadre: **el botón principal publica en una campaña que no existe.** La spec prometía una campaña nacional permanente «Mi Argentina ideal» con equipo y fecha de devolución; no se creó, el CTA publica con `campanaId: null`, y el Recibo igual dice que «podés seguir el trabajo que nazca de ella». Es la promesa que ¡BASTA! dice no hacer.

## Antes de mergear a `main` — bugs, no pulido

Un push a `main` despliega v2. Esto va primero, independiente del pulido:

| # | Qué | Dónde | Estado |
|---|---|---|---|
| 1 | El cron de exportaciones corre **cada minuto**. Vercel Hobby solo admite crons diarios (el deploy falla); en Pro son 1.440 invocaciones/día. | `v2/vercel.json:129` | ✔ |
| 2 | Campos de ingreso, registro y 2FA casi invisibles: `Input` oscuro (`border-white/10 bg-white/5`) sobre papel crudo. Regresión de esta rama. | `components/ui/input.tsx:13`, `layouts/papel-routes.ts:16-17` | ✔ |
| 3 | Tras publicar una voz en el mapa quedan tildados los consentimientos (`publicar`, `cede`, `casa`, `tipo`): la segunda sale con el permiso irrevocable ya marcado. | `ElMapa/sections/PanelSoltarVoz.tsx:108` | ✔ |
| 4 | Publicar desde Imaginar no borra el borrador: sigue en Mi espacio como pendiente. | `Imaginar/ConversacionIdeal.tsx:168` | ✔ |
| 5 | Cualquier cuenta con mail verificado crea campañas (solo `authenticate`), y las campañas y fichas salen en la Home sin curaduría. | `api/.../campanas/routes.ts:57,105`, `Home/sections/EntradaIdeal.tsx` | ✔ |
| 6 | La app móvil usa `EXPO_PUBLIC_BASTA_V2_URL`, que no figura en `.env.example`: un build sin ella deja las pantallas nuevas en error. | `apps/mobile/src/civic/ideal.ts:7` | ✔ |
| 7 | El panel Participar del mapa congela el lugar al montarse; si cambiás de provincia, manda la vieja. | `ElMapa/sections/ParticiparEnMapa.tsx:27` | informe C |
| 8 | Vincular un aporte en la ficha usa `<a href>`: recarga la página y pierde la ficha sin guardar. | `Fichas/FormularioFicha.tsx:217` | informe A |
| 9 | `Colaborar`: `aceptada` no se resetea; la segunda invitación no se puede aceptar. | `Colaborar.tsx:42` | informe A |
| 10 | Móvil: cualquier error (incluso sin red) en Mi espacio borra la sesión y muestra el login. | `apps/mobile/src/app/espacio-ideal.tsx:46` | informe D |
| 11 | Lo de ejemplo se detecta por slug fijo; la marca `demostracion_local` no se lee en ningún lado. Sembrado fuera de local, contaría como real en exportaciones. | `Campanas/presentacion.ts:3` | informe E |

## Los seis problemas de fondo

### 1. Vocabulario sin dueño
El síntoma más caro, porque contamina todo lo demás. Hace falta **un glosario cerrado en `lib/vocabulario.ts`** (ya existe y tiene `ESTADO_EN_CASTELLANO`, `PRECISION_EN_PALABRAS` está suelto en `Senal.tsx:40`) y un test que prohíba los sinónimos en los `.tsx`. Propuesta — **necesita tu decisión** (ver abajo):

| Concepto | Una sola palabra | Sale de la UI |
|---|---|---|
| Lo que alguien escribe y todavía no publicó | **borrador** | reflexión, posibilidad, relato |
| Lo que publicó | **aporte** | voz*, mirada, señal, frase, sueño, registro |
| Una pregunta abierta por un equipo, con reglas y fecha | **campaña** | convocatoria, pregunta, ronda, mesa, proceso |
| Lo que la campaña se compromete a hacer | **reglas de la campaña** | contrato |
| Etapa de una campaña | **etapa** (+ `FASES_ROTULO` en castellano) | fase |
| Propuesta que un grupo arma | **ficha** | futuro, diseño, borrador público |
| Dónde | **lugar** · «todo el país» | ámbito, alcance nacional |
| Lo que el equipo responde | **devolución** (es palabra nuestra; definirla una vez) | — |

\* «Voz» queda solo en la invitación de marca («Sumá tu voz»), nunca como cuenta ni como objeto.

### 2. Títulos-aforismo y voz de IA
H1 que no dicen qué es la página y cierres simétricos: `PortadaMapa.tsx:18`, `SeccionInstrumento.tsx:41`, `MiEspacio.tsx:38`, `Recibo.tsx:24`, `HombreGrisBand.tsx:12`, `CapituloMetodo.tsx:29`, `Pruebas.tsx:37` («El diseño aprende cuando toca la vida»), `DatosAbiertos.tsx:12`. Regla para el barrido: **el H1 nombra la página; la poesía, si la hay, va en la bajada y es una sola frase.** Los informes traen el reemplazo escrito para cada uno.

### 3. Jerga y valores crudos en pantalla
- Enum y datos sin traducir: `Precisión: neighborhood` (`ListaRegistros.tsx:48`), `describe`/`inspira` (`Fichas.tsx:101`), `web · asistido`, `Lugar 7000`, fechas ISO (`ProcesosPublicos.tsx:107`, `Pruebas.tsx`), `campana: <uuid>` (`DatosAbiertos.tsx:18`), `estado.replaceAll('_',' ')`.
- Voz de desarrollador: `pnpm radiografia:ejemplos` en un aviso, «El catálogo devuelve hasta 100», «número mágico», «Conservamos la forma del documento anterior», «fila vacía».
- Plurales rotos y ceros en dígitos (regresión de D-080): «1 aportes publicados», «1 filtros elegidos», «0 conversaciones», «0 últimas fichas de 0».

### 4. Sistema de diseño paralelo
- `participacion/Elementos.tsx` (29 archivos lo importan) duplica el kit Papel con medidas propias (12 px contra 13 px), sin hover ni foco en los enlaces, con `disabled:opacity-50` que el sistema prohíbe.
- Bordes sin color → gris por defecto ✔. Campos de formulario y tarjetas «sin borde».
- Contraste: `text-red-400` en errores de auth (2,65:1), `oscuro-tenue` en footer y mapa (2,6:1, incluida la atribución OSM), texto de 9 px en el instrumento, `text-ambar` en el ticker (4,31:1).
- Token inexistente `border-tinta-25` (`ColaDeVerificacion.tsx:55`); el README del sistema cita `primitives/Glifos.tsx`, que no existe.

### 5. Botones mudos, acciones sin respuesta, contexto perdido
- Los botones principales se deshabilitan sin decir por qué (mínimos de 10, 15 y 30 caracteres invisibles; dos casillas obligatorias): Imaginar, Revisión, Devolución, Afirmaciones, Pruebas, y la app.
- Afirmaciones, Alternativas, Pruebas, Devolución y Seguir hacen la acción y no confirman nada.
- Cinco enlaces a «Ingresar» pierden dónde estabas y caen en Mi espacio (`Seguir.tsx:17`, `Fichas.tsx:203`, `Afirmaciones.tsx:91`, `ControlesAnalisis.tsx:196`, `Recibo.tsx:71`), aunque `lib/auth/volver.ts` está bien hecho y no se usa.
- Tras el recibo no hay forma de hacer un segundo aporte sin recargar.

### 6. Lo honesto está escondido
El proyecto tiene principios buenos y la UI los entierra:
- «Converger no es corroborar» va en 11–14 px, dentro de `<details>`, u oculto bajo 640 px. Los gráficos (`BarrasOpiniones`) muestran «60,0 %» con n=5, sin n visible ni un «qué no concluir» al lado.
- Se quitó la leyenda de la Radiografía (`ComoLeerElCielo.tsx` existe y no se usa ✔): «núcleo», tamaño y color quedaron sin definir.
- `PanelArea.tsx:111` dice «Celdas mudas. Nadie dijo nada ahí»: afirma silencio a partir de la ausencia de datos.
- La Home oculta bajo 961 px el único párrafo que dice qué es el sitio ✔, y en ningún lado dice «no hace falta cuenta».
- Imaginar no avisa que con cesión de texto las tres respuestas salen bajo CC BY, ni advierte sobre nombres y domicilios (la ficha sí).

## Cuenta y anonimato: la puerta invisible
Nada explica, antes del esfuerzo, qué puede hacer alguien sin cuenta. Y el anónimo que vuelve no ve sus propios aportes: «Recuperar» vive solo en la rama con sesión (`MiEspacio.tsx:61`). El registro no promete nada («Con una cuenta tus aportes te siguen a cualquier dispositivo…» es la frase que falta) y la regla de 12 caracteres aparece recién al fallar. Las páginas de recuperar contraseña, perfil, notificaciones y verificar email siguen con el chrome oscuro de v1.

## Profundidad — dónde se queda corto
- **Recibo:** no dice qué pasa ahora, no enlaza al mapa ni a la Radiografía, no trae la fecha real de devolución. Es el momento de mayor atención del usuario y lo desperdicia.
- **Ningún archivo nuevo enlaza a `/planes`, a la biblioteca ni a `/la-idea`.** Las campañas y fichas flotan sin el marco que les da sentido; los temas de una campaña no navegan.
- **Radiografía real casi vacía:** lo que enseña vive en el laboratorio, detrás de tres `<details>`. «La misma demanda escrita de tres maneras» debería ser la pieza principal.
- **Mandato vivo:** cuatro vacíos seguidos con «nadie/ninguna» y un top-3 numerado. Un embudo con denominadores reales (campañas abiertas → fichas con respuestas → pruebas → resultados) diría más.
- **Mi espacio:** es una lista de operaciones; falta un resumen («3 aportes, en Salta y Jujuy; la campaña del agua devuelve el 15 de noviembre»).
- **Datos abiertos:** falta diccionario de campos, cinco filas de muestra y «cómo citar».

## Contra la spec (informe E)
Lo que la spec prometía y no está: la campaña nacional permanente; «Futuro» como primera lectura del mapa (sigue con los cinco modos técnicos); rol para administrar campañas; original y lectura asistida separados en Revisión (hoy la «frase» es la concatenación de las tres respuestas, hasta 6.004 caracteres contra un tope de 2.000); temas seleccionables en la ficha (siguen como texto libre con comas aunque `TemaDelAporte` existe); «Ver en Radiografía» y «Descargar» en fichas. La revisión Hombre Gris del 7/10 quedó casi entera sin hacer (velo `DespertarVeil`, Sembrar en el menú, «Tu silencio también firma»). Sembrar y Mandato vivo quedaron huérfanos en la navegación.

## Coherencia con ¡BASTA!
Se sostiene en los avisos («No habla por todo el barrio, no es un acuerdo y no obliga a nadie»; «Que muchas señales digan lo mismo no prueba que sea cierto») y se cae en titulares y botones: «El futuro necesita tu letra», «Qué podés esperar» + «Fecha prevista», «Abrir una pregunta». Suena a mesa de entradas. Nada en Imaginar dice «diseño idealizado» ni «esto no es un pedido».

## App móvil (informe D)
Tiene un campo donde la web tiene tres preguntas, y no permite elegir lugar (todo cae en «Argentina» aunque las campañas son por zona). El glosario cruzado web↔app no coincide en 9 de 10 conceptos. Muestra errores crudos («Network request failed»), no tiene pantalla de éxito tras compartir y omite el aviso de publicación irrevocable que la web sí tiene. Conviene unificar el vocabulario en la web primero y después alinear la app.

## Guía PDF (informe F)
Maquetación prolija; texto denso, abstracto y con fórmulas de IA («no demuestra / no prueba» ~15 veces, títulos en tríada). **Las negritas no salen** ✔: los dos TTF de Archivo comparten nombre PostScript y el PDF embebe uno solo. Quedó desactualizada el mismo día (dice «no se cambiaron las páginas de la plataforma»; seis horas después se implementó todo). Usa «27 PLANes», que coincide con `PLAN_REGISTRY.yml` ✔ — al revés que la web, que todavía dice «22» en `Bienvenida.tsx:23`, `UnaRutaParaArgentina.tsx:15` y `PlanesGrid.tsx:30` ✔ (deuda previa a esta rama).

## Revisión visual (informe G)
23 rutas en 1440 y 390 px, con la API contra un Postgres local descartable y la demo curada (1 campaña, 1 ficha, 4 señales); sin sesión. Selección en `capturas/`.

- **Bien:** ninguna página scrollea horizontal en 390 px (las 23 dan `scrollWidth = 390`). La Home tiene jerarquía clara y una acción evidente en los dos tamaños. El registro noche/papel funciona; el sello EJEMPLO ya no pisa títulos.
- **Ingresar y registrarse:** los campos no se ven ✔ (`capturas/ingresar-390.jpg`) y el botón es un tercer dialecto (redondeado, violeta pastel, 4,1:1).
- **Tres dialectos de botón y cuatro anchos de columna.** Fichas (listado, detalle y nueva) quedó sin migrar a la plantilla: H1 chico, botón azul de letra normal, migas duplicadas.
- **El mapa:** el encuadre inicial corta Jujuy, Salta y Tierra del Fuego; en 390 la tarjeta «Registros sin punto» tapa medio mapa; la barra de modos mide 541 px sin aviso de que se desliza; el «4» aparece cinco veces.
- **El vacío vuelve a repetirse** (lo que D-080 había arreglado): el aviso de ejemplo/pausa sale 5+ veces en el detalle de campaña; la Radiografía muestra cuatro estados vacíos en una pantalla; Mandato y Fichas muestran «0 afirmaciones · 0 alternativas · 0 pruebas» en dígitos; el historial de una ficha muestra `vinculos, proximaTarea`.
- **Contraste:** el pie de todas las páginas (2,6:1 en 11 px); el kicker «UN EJEMPLO, NO EL PAÍS» del mandato de ejemplo (2,2:1); «Anónimo si querés · sin registro» en Sembrar (1,9:1).
- **Foco:** Imaginar enfoca el H2 al cargar y dibuja el anillo violeta: parece un error. La barra de progreso tiene 4 segmentos y dice «1 de 3».
- **Campaña en pausa:** muestra el formulario completo y habilitado con el botón apagado.

## Plan de pulido propuesto

| Ola | Qué | Por qué en este orden |
|---|---|---|
| 0 | Los 11 bugs de arriba | Bloquean el merge; algunos tocan consentimiento y deploy |
| 1 | Glosario cerrado + test anti-sinónimos | Sin esto, el barrido de copy se hace dos veces |
| 2 | Barrido de copy por área con los reemplazos de los informes A–C: H1 que nombran, jerga fuera, enums traducidos, plurales, ceros en palabras | Es el 60 % de la sensación de «falta pulido» |
| 3 | Sistema de diseño: `Elementos.tsx` → kit Papel, bordes con token, inputs de auth, contraste, chrome papel en las páginas de cuenta | Mecánico, de bajo riesgo, se ve en todas las pantallas |
| 4 | Flujo: botones con razón, feedback tras cada acción, `volver` en los cinco enlaces, Mi espacio para el anónimo, Recibo con «qué sigue» | Donde hoy se pierde gente |
| 5 | Profundidad: leyenda y avisos de la Radiografía visibles, gráficos con n, enlaces a PLANes, Mandato como embudo | Lo que convierte «funciona» en «se entiende» |
| 6 | App móvil alineada al glosario y al flujo web; PDF regenerado con fuentes y texto nuevos | Depende de 1–2 |

## Decisiones que son tuyas
1. **La palabra para lo publicado:** ¿«aporte» (ya está en Mi espacio, la API, la app y el PDF; se cuenta sin poesía) o «voz» (la de la marca y el ticker)? Recomiendo **aporte** como objeto y «voz» solo en la invitación.
2. **La campaña nacional «Mi Argentina ideal»:** ¿la creamos con equipo y fecha de devolución reales, o cambiamos el Recibo para que no prometa seguimiento cuando no hay campaña?
3. **Quién abre campañas:** ¿rol explícito, o cualquier cuenta verificada pero sin aparecer en la Home hasta que alguien la revise?
4. **El CTA principal:** ¿página propia `/imaginar` (más clara, la spec original) o panel dentro del mapa (la spec integrada, lo que hay hoy)?
5. **Sembrar y Mandato vivo:** ¿vuelven a la navegación o se retiran?
6. **El cron:** ¿cuál es el plan de Vercel? Define si basta con bajarlo a diario o hay que repensar la cola de exportaciones.

## Decisiones tomadas (9/10/2026)
1. **Aporte** es la única palabra para lo publicado; «voz» queda solo en la invitación de marca.
2. Se crea la campaña nacional **«Mi Argentina ideal»** con Juan Bravin como responsable. Edición 1 recibe aportes hasta el 28/2/2027; primera devolución el **15/3/2027**; después, una por trimestre. Todo aporte sin campaña elegida va a ella.
3. **Solo Juan Bravin abre campañas** (rol de administración explícito).
4. **Imaginar y el mapa se unen**: una sola entrada, dentro del mapa; `/imaginar` queda como redirección.
5. Plan de Vercel desconocido: el archivo de exportación se prepara al pedirlo y el cron queda diario, de respaldo.

Plan de ejecución: `v2/docs/plans/2026-10-09-pulido-argentina-ideal-plan.md`.
