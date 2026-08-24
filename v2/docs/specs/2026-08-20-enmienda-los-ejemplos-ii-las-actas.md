# Enmienda a los ejemplos, II — las actas de mandato

**Fecha:** 2026-08-20
**Enmienda:** `docs/specs/2026-08-16-enmienda-v1-los-ejemplos.md`, §5, cláusula «Un segundo ejemplo»
**Alcance:** `apps/web` (`/mandato-vivo/ejemplo` y el link que lo alcanza desde `/mandato-vivo`). **Nada más.**
**Se apoya en:** `docs/specs/2026-08-11-b-la-senal.md` (§2.1–§2.4: las clases y qué se hace con cada una) · `docs/DEUDAS.md` D-074 (los relojes) · `docs/demos/2026-08-20-la-simulacion-completa.html` (donde estas actas nacieron y pasaron revisión adversarial) · `apps/mobile/docs/PRODUCT_CONSTITUTION.md` (reglas 5, 6, 7, 11)
**Naturaleza:** enmienda a una decisión firmada. La decisión de producto la tomó el dueño del proyecto el 20 de agosto de 2026, en sus palabras («ok, implementalo y muestramelo en la web que está en producción»), después de ver las actas en el demo de `docs/demos/`.

> **Qué cambia.** La enmienda del 16/8 dice: «**Un segundo ejemplo.** Esta enmienda autoriza uno. El siguiente necesita su propia enmienda, y el argumento “ya hicimos uno” no va a alcanzar.» Tenía razón: no alcanzó. Ésta es la enmienda propia que esa cláusula exige, y autoriza **un** segundo ejemplo — las cinco actas de mandato — con su propia ruta, su propio sello y sus propias guardas.
>
> **Qué no cambia.** La base sigue en cero. El lado medido de La Simulación sigue en cero. E1–E5 del 16/8 rigen acá con la misma letra.

---

## 1 · Por qué este ejemplo, y por qué alcanza el argumento

El argumento del 16/8 §2 para autorizar el primero fue: La Radiografía es la única superficie que **no se puede explicar sin ver**. El mandato tiene una versión más débil pero real del mismo problema: `/mandato-vivo` muestra **el documento** (qué produce el sistema), pero no muestra **la conversión** — cómo una clase de señal se vuelve un tipo de exigencia distinto. Eso es un concepto, no una cantidad: «lo que se corrobora repara, lo que se delibera marca agenda, lo que se promete se sigue, lo que se pregunta se contesta» no recluta a nadie como frase; como cinco actas con lugar, plazo y comprobación, sí.

Y hay un argumento que el primero no tenía: **estas actas ya existen y ya pasaron revisión adversarial** (tres lentes con refutadores, 20/8) en el demo de `docs/demos/`. Lo que se autoriza no es escribir un ejemplo nuevo: es mover al cliente uno ya revisado, con las correcciones de canon adentro (el reloj de un compromiso marca *vencido* y *desactualizada*, jamás manda a revisión ni acusa; el piso se evalúa por territorio; los conteos son de personas distintas).

## 2 · Qué se autoriza, exactamente

**Un ejemplo en el cliente, en su propia ruta**, `/mandato-vivo/ejemplo`: cinco actas de mandato inventadas, una por clase de señal (dos de hecho —reparación y provisión—, una de deseo —agenda—, una de acto —cumplimiento—, una de pregunta —información—). Texto escrito a mano, números inventados y declarados, ningún dato de la base.

Las obligaciones E1–E5 del 16/8 §3.1 rigen idénticas, con estas concreciones:

| # | Acá significa |
|---|---|
| **E1** | La página y su contenido no importan el cliente de Drizzle ni `~/lib/api`, y no hacen ningún pedido de red propio. Guarda: test que escanea el fuente de los archivos del ejemplo. |
| **E2** | Ninguna cifra de las actas entra al contador de la cabecera, al documento del mandato ni a ningún agregado. Son texto estático. |
| **E3** | Ninguna acta aparece en `/el-mapa` ni en ninguna de sus lentes. |
| **E4** | Nada de esto sale por `open-data`, el feed ni la API. |
| **E5** | El modo es excluyente: `/mandato-vivo` muestra el documento real (con sus regímenes de honestidad); `/mandato-vivo/ejemplo` muestra sólo lo inventado. Nunca en el mismo scroll. |

**El riesgo del 16/8 §4 se responde igual y con una capa más:** la URL lo dice, el `<title>` dice «Ejemplo» primero, el encabezado abre con «Nadie dijo ninguna de estas cosas», y — porque las actas son tarjetas HTML recortables una por una — **cada tarjeta lleva su propio sello visible «ejemplo inventado»**, adentro del área que se captura. El residual queda escrito igual que entonces: esto reduce el riesgo, no lo elimina.

## 3 · Qué sigue prohibido

- Todo lo del 16/8 §5 que no toca esta enmienda: sembrar, branches de demo, alimentar el lado medido, contar o exportar el ejemplo, flags de demo.
- **Un tercer ejemplo.** Necesita su propia enmienda, y el argumento «ya hicimos dos» va a alcanzar todavía menos.
- Generar actas con un modelo o con el motor de la Simulación. Éstas están escritas a mano y así se quedan.
- Interactividad que simule medición (palancas, contadores vivos): eso vive en el demo de `docs/demos/`, fuera de la app. En el cliente las actas son **texto que enseña**, no un instrumento que aparenta medir.

## 4 · Cómo se sabe que esto se rompió

Las guardas de §2, más la misma sexta del 16/8: si una captura de un acta aparece publicada como mandato real del país, la enmienda falló y hay que revisarla, no defenderla.
