# Quién está detrás — la semilla y la mano que la plantó

**Fecha:** 2026-08-10
**Ruta:** `/quien-esta-detras`
**Sistema:** Papel y Tinta (§5 primitivas, §10 firma award)

## El problema

El sitio dice, en la portada y en el footer, **«sin líder, sin partido, sin excusas»**. `/la-idea`
tiene un capítulo entero titulado *Sin líder*, y adentro esta frase:

> «Si mañana desaparece el que escribió todo esto, no cambia nada. Esa es la idea.»

Pero detrás del sitio hay una persona con nombre, y no decirlo tiene su propio costo: en Argentina,
un proyecto que pide confianza y no dice quién lo firma se lee como sospechoso. La página tiene que
resolver las dos cosas a la vez — decir quién es, y decir por qué eso no lo convierte en dueño.

La figura que resuelve la tensión es **la semilla**, que ya es lengua nativa del proyecto
(`/sembrar`, «sembrar tu voz»): la semilla ya vivía en mucha gente, lo que faltaba era tierra
fértil. Juan no la inventó — le dio forma y le buscó tierra. Eso es una mano, no una autoridad.

## La columna vertebral del copy

Una sola imagen sostiene la página, y no es una metáfora prestada: es el oficio de Juan.

- **Al agua no se la arregla.** Se le mejoran las cualidades para que rinda más y se le sacan las
  impurezas que no le pertenecen. El agua es lo mejor que tenemos — la página nunca habla mal de
  ella. Es el método entero de ¡BASTA! contado con otro material.
- **A la plata tampoco.** Gris no es tibieza: gris es plata, y Argentina viene de *argentum*. Pulir
  plata es la misma operación que purificar agua — sacarle lo que no le pertenece hasta que vuelve
  a reflejar. Esa convergencia es lo que le da al nombre del sitio un dueño legítimo.
- **Mendoza es la tesis, no el domicilio.** Un desierto que se volvió tierra fértil no por
  abundancia sino porque alguien acordó cómo repartir el agua escasa, con reglas que se respetan
  hace siglos. Un país hecho de acuerdos que duran más que quienes los firmaron: ¡BASTA! contado
  como un hecho biográfico.
- **El pozo cierra el círculo.** «Un pozo tallado no en piedra, sino en tiempo, destinado a
  desbordarse» es la imagen fundacional del manifiesto — y es agua. Responde «¿por qué vos?» sin
  reclamar nada excepcional.

Agua · plata · tierra · semilla · pozo son un mismo campo, no cinco metáforas apiladas. Toda
reescritura futura debería quedarse adentro de él.

## Decisiones

**1. Entrada única: el footer.** El enlace vive en la franja inferior del `PapelFooter`, junto al
©. No entra a `PAPEL_NAV`, ni al header, ni al menú móvil, ni a la columna «Recorrido». Un solo
enlace en todo el sitio. Es una página disponible, no anunciada: si compitiera con la idea en el
header, contradiría lo que la página misma dice.

**2. Es página, no ventana.** URL propia, compartible, indexable. La discreción está en no
anunciarla, no en esconderla.

**3. El «no soy el líder» es un contrato, no una humildad.** Cinco cosas que Juan *no puede* hacer,
numeradas y selladas. Una lista de prohibiciones se puede verificar; una declaración de modestia no.

**4. Los dos nombres tienen su propia franja, en oscuro.** ¡BASTA! salió de una charla con un
amigo; «El instante del hombre gris» salió de una psicografía de Parravicini que habla de sangre en
la calle. Contar el segundo obliga a decir para qué sirve todo esto: para que esa sangre no pase.
Es el momento más grave de la página y por eso corta a fondo tinta.

**5. Sin cifras inventadas.** Regla de la casa. Lo que todavía no tiene número no lleva número:
lleva la palabra que falta, marcada para completar. Nunca un dato de relleno.

**6. Las fotos entran después sin mover nada.** `FotoPapel` reserva la proporción exacta desde el
día uno y dibuja un marco de expediente con el nombre del archivo que falta. Cuando la foto llega,
se cambia un `null` por una ruta y el layout no se corre un pixel.

## Estructura

| § | Sección | Fondo | Qué hace |
|---|---|---|---|
| 0 | `PortadaQuien` | papel | Rito de la tinta: «Alguien tuvo que / plantarla.» |
| 1 | `LaFicha` | papel | Retrato 4:5 + ficha de expediente. Última fila: `ACÁ — ningún cargo`. |
| 2 | `PorQueEmpece` | papel | Prosa en primera persona: las puertas, el concurso, la plataforma. Foto documental. |
| 3 | `DeDondeVengo` | papel crudo | Trayectoria como índice numerado `01–05`, no como CV. |
| 4 | `LosDosNombres` | **tinta** | La charla con el amigo · la psicografía · sin sangre. |
| 5 | `LaSemillaNoEsMia` | papel | Cinco prohibiciones con `Sello`, y la cita de `/la-idea`. |
| 6 | `QuienPaga` | papel | Tres columnas: de dónde sale · quién no lo financia · a dónde va. |
| 7 | `CierreFirma` | violeta | `BandaCta`: «No me sigas a mí.» → `/sembrar`. Firma manuscrita. |

## Contenido a completar

Todo el copy vive en `quien-data.ts` como constantes tipadas; el JSX no tiene texto. Queda marcado
con el centinela `PENDIENTE` lo que Juan tiene que confirmar:

- Año en que arrancó ¡BASTA!.
- Cifra de lo que cuesta sostener el sitio por mes.
- Las cuatro fotos: `retrato.jpg` (4:5), `documental-1.jpg` y `documental-2.jpg` (16:9),
  `firma.png` (PNG con fondo transparente), en `public/media/quien/`.

## Archivos

```
apps/web/src/pages/QuienEstaDetras.tsx              # ensambla las 8 franjas
apps/web/src/pages/QuienEstaDetras/quien-data.ts    # todo el copy + slots de foto
apps/web/src/pages/QuienEstaDetras/sections/*.tsx   # una franja por archivo
apps/web/src/components/papel/primitives/FotoPapel.tsx
apps/web/src/components/papel/PapelFooter.tsx       # + enlace en la franja inferior
apps/web/src/app-pages.tsx                          # lazy()
apps/web/src/app-routes.tsx                         # <Route>
apps/web/src/layouts/papel-routes.ts                # PAPEL_ROUTES
```

## Pruebas

- `FotoPapel`: con `src` renderiza `<img>` con alt; sin `src` renderiza el marco con el nombre del
  archivo y **conserva la proporción**.
- `PapelFooter`: existe el enlace a `/quien-esta-detras`, y `PAPEL_NAV_ALL` **no** lo contiene (la
  entrada es única — el test es la guardia de la decisión 1).
- `LaSemillaNoEsMia`: las cinco prohibiciones están, y está la cita de `/la-idea`.
- `esRutaPapel('/quien-esta-detras')` es `true`.
