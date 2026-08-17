# Enmienda a V1 — el ejemplo que no es el país

**Fecha:** 2026-08-16
**Enmienda:** `docs/specs/2026-08-02-el-vacio-como-pieza.md`, decisión **V1**
**Alcance:** `apps/web` (`/la-radiografia` y una ruta propia debajo). **Nada más.**
**Se apoya en:** `docs/specs/2026-08-12-la-radiografia.md` (R8, R9, §3.1, §6) · `docs/2026-08-16-la-radiografia-estado-y-ambicion.md` (§5) · `apps/mobile/docs/PRODUCT_CONSTITUTION.md` (reglas 5, 6, 11)
**Naturaleza:** enmienda a una decisión firmada. Necesita plan antes de tocar código.

> **Qué cambia.** V1 dice: «**No se siembra nada, en ningún lado.** Ni base, ni cliente, ni branch», y descarta los «sintéticos marcados». El 16 de agosto de 2026 se decidió construir tres escenarios de ejemplo en La Radiografía. Eso contradice la letra de V1 y se escribe acá, firmado, en vez de colarse por una excepción tácita.
>
> **Qué no cambia.** **La base sigue en cero.** `SELECT count(*) FROM senales` no se toca. El lado medido de la Simulación sigue vacío y ése era el punto de V1.

---

## 1 · Qué protegía V1, y sigue protegiendo

La Simulación es el argumento entero de la plataforma en un gesto: **arrastrás la cortina y ves de la nada al país**. El gesto no funciona por el lado derecho —cualquiera fabrica un lado derecho— sino porque el izquierdo está genuinamente vacío. Doce voces inventadas del lado medido no debilitan el gesto un poco: lo anulan, porque la comparación pasa a ser entre dos cosas fabricadas.

Eso no se toca. La base sigue en cero, el lado izquierdo sigue en cero, y esta enmienda no autoriza una sola fila.

Lo que V1 hizo mal fue el alcance de su propia palabra. Legisló «ni cliente» sobre una tabla de **cinco lentes** que el 2 de agosto era el sistema entero. La Radiografía se especificó el 12 de agosto y no está en esa tabla. V1 la reguló sin haberla visto.

## 2 · Por qué ahora, y no antes ni después

De las seis superficies, cinco contestan **dónde**, **cuándo** y **cuánto**. Nadie necesita verlas para entender qué prometen: «qué provincia habla más» se explica en cinco palabras y el vacío queda leyéndose como una promesa.

La Radiografía contesta **sobre qué, y estamos de acuerdo**. Eso no es una cantidad: es un concepto, y un concepto sin imagen no recluta a nadie. Su cielo vacío no dice «todavía nadie»; no dice nada, porque el lector no sabe qué habría visto. Es la única de las seis que **no se puede explicar sin ver**.

Y el bloqueo que la volvía prematura cayó. El 16/8 §5 decía «un ejemplo construido sobre el caño desconectado es un ejemplo de nada». `5358154b` y `0c39d557` repuntaron la página a `senales` con la cesión conectada: ya sabemos qué corpus está simulando el ejemplo.

## 3 · Qué se autoriza, exactamente

**Un ejemplo en el cliente, en su propia ruta**, `/la-radiografia/ejemplo`: unas 180 frases rioplatenses escritas a mano, con vectores precalculados y commiteados como artefacto. Incluye a propósito una provincia muda, un núcleo mixto y un falso amigo —dos frases que el coseno junta y una persona no—, porque un ejemplo que sólo muestra los aciertos del instrumento enseña a confiar en él y eso es peor que no tenerlo.

Se descarta, como en §5 del informe: **generar el ejemplo con el motor de la Simulación**. Nueve moldes producen nueve estrellas perfectas y una imagen que afirma que el país coincide de manera perfecta. Sería la única pieza del repo que miente con una imagen linda encima.

### 3.1 · Las cinco separaciones

No son principios. Son obligaciones, y cada una tiene una guarda que falla si alguien la rompe.

| # | Obligación | Guarda |
|---|---|---|
| **E1** | **No toca la base.** Ni escritura, ni migración, ni un valor nuevo de `fuente` en `analisis_vectores`. El artefacto es un archivo del bundle. | Un test que falla si la ruta del ejemplo alcanza el cliente de Drizzle o pega contra `/api`. |
| **E2** | **No entra a ningún conteo.** Ni el contador de la cabecera, ni `analizadas`/`sinVector`, ni cobertura, ni la métrica norte. | Un test que corre la página real con el ejemplo cargado y verifica que ninguno de esos números se movió. |
| **E3** | **No aparece en el mapa.** Ni en las cinco lentes, ni en la Simulación, ni un punto. | Un test que verifica que ninguna señal del artefacto sale por `/api/map/signals` ni entra al estado del instrumento. |
| **E4** | **No se exporta en el volcado.** Ni en `open-data`, ni en el feed, ni en la API abierta, ni adentro del sha256 que hace citable al registro. | Un test sobre el volcado que falla si aparece un id del artefacto. |
| **E5** | **No se mezcla jamás con el corpus real.** El modo es excluyente: o mirás el ejemplo o mirás el país. Nunca un núcleo con una frase inventada y una real adentro. | Un test que verifica que el estado de la vista tiene un solo origen, y que ningún núcleo mezcla procedencias. |

**V1 queda enmendada así:** no se siembra la base, ni un branch, ni el cliente del país. Se autoriza **un** artefacto de ejemplo en el cliente, en ruta propia, bajo E1–E5. Las decisiones **V2, V3, V4 y V5 no se tocan** — en particular V4: el ejemplo no es un flag que alguien tenga que acordarse de bajar, es una ruta que puede seguir existiendo el día que haya diez mil voces reales.

## 4 · El riesgo, y lo que hace

No es teórico y no es que alguien se confunda navegando. Es que **alguien saque una captura del ejemplo y la publique como si fuera el país**. Las frases están escritas a mano por nosotros, en rioplatense, para que se lean como reales. Se van a leer como reales, porque ése es el trabajo que tienen.

Un aviso al costado de la constelación no sirve: se recorta. Entonces:

1. **El sello vive adentro del canvas, no alrededor.** Como `SelloSintetico` en la Simulación: permanente, sin forma de cerrarse, y dentro del área que se captura. Cualquier recorte que muestre estrellas muestra el sello.
2. **La frase está en el mismo registro** que la que ya usa la Simulación —*«Nadie dijo ninguna de estas cosas»*— y no en un tono de nota al pie.
3. **La lámina compartible de la spec (§10, rebanada 6) no aplica al ejemplo.** No fabricamos la imagen que después nos van a devolver como evidencia.
4. **El `<title>`, la URL y el encabezado lo dicen** antes que la imagen cargue.

Y lo residual queda escrito: **esto reduce el riesgo, no lo elimina.** Alguien decidido puede recortar el sello. La respuesta a eso no es técnica —es que el sello sea lo bastante grande como para que recortarlo sea un acto deliberado y no un descuido, y que la diferencia se pueda demostrar después.

## 5 · Qué sigue prohibido, con nombre y apellido

- **Sembrar `senales`, `actores`, `adhesiones` o `analisis_vectores`.** Ni una fila, ni «unas pocas para que se vea algo». Es la parte de V1 que sobrevive entera.
- **Un branch de Neon con datos de demostración.** Sigue descartado por V1.
- **Alimentar el lado medido de la Simulación** con nada que salga del ejemplo. El lado izquierdo es cero hasta que hable una persona.
- **Mostrar el ejemplo en `/el-mapa`**, en cualquiera de sus cinco lentes.
- **Contar el ejemplo** en el contador de la cabecera, en `FeedVoces`, en `PapelFooter`, en cobertura o en la métrica norte.
- **Exportarlo** por `open-data`, por el feed del registro público o por la API abierta.
- **Un segundo ejemplo.** Esta enmienda autoriza uno. El siguiente necesita su propia enmienda, y el argumento «ya hicimos uno» no va a alcanzar.
- **Ejemplos en las otras cinco superficies.** No los necesitan: se explican sin verse. Ése fue el argumento de §2 y corta para los dos lados.
- **Sintéticos generados por el motor de la Simulación** dentro de La Radiografía. Nueve moldes, coseno ≈ 1, consenso fabricado.
- **Un flag de demo** que haya que acordarse de apagar. V4 sigue en pie.

## 6 · Cómo se sabe que esto se rompió

Las cinco guardas de §3.1, más una sexta que no mira código: **si una captura del ejemplo aparece publicada como dato del país, la enmienda falló** y hay que revisarla, no defenderla. Queda anotado acá para que el día que pase no sea una discusión sobre si estaba previsto.
