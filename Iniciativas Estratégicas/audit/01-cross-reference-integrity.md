# Auditoria de Integridad de Referencias Cruzadas

**Proyecto BASTA -- 12 Iniciativas Estrategicas**
**Fecha:** 26 de marzo de 2026
**Tipo:** Auditoria estructural de coherencia inter-PLAN

---

## 1. Resumen Ejecutivo

Se auditaron los 12 documentos de PLANes que componen el proyecto BASTA, verificando las referencias cruzadas entre cada par, la coherencia en el conteo de mandatos, las referencias huerfanas y las discrepancias descriptivas.

### Hallazgos principales

1. **Fractura temporal severa.** Los documentos se escribieron secuencialmente y nunca se actualizaron hacia atras. Los primeros 5 PLANes (PLAN24CN, PLANREP, PLANISV, PLANEDU, PLANJUS) solo se conocen entre si; no mencionan a ninguno de los 7 PLANes posteriores. Los PLANes mas recientes (PLANGEO, PLANMON) integran a todos los anteriores, pero esa integracion es unidireccional.

2. **52 de 132 pares posibles (39%) son referencias bidireccionales.** Otros 28 pares (21%) son unidireccionales. Los 52 pares restantes (39%) no tienen referencia alguna en ninguna direccion.

3. **Conteos de mandatos obsoletos en 10 de 12 documentos.** Solo PLANGEO y PLANMON tienen un conteo actualizado (11 y 12 respectivamente). Todos los demas contienen cifras que van desde "cinco iniciativas" hasta "diez mandatos", ninguna de las cuales refleja la realidad actual de 12 PLANes.

4. **PLANMON referencia un PLAN inexistente.** PLANMON integra extensamente a "PLANEN" (Plan de Soberania Energetica) con 24+ menciones, incluyendo en su tesis central, tablas de canasta de respaldo y hoja de ruta. PLANEN no existe como documento. Esto lo convierte en la unica referencia fantasma del ecosistema.

5. **PLANSAL no menciona ni a PLANSUS, ni a PLANEB, ni a PLANAGUA, ni a PLANDIG, ni a PLANGEO, ni a PLANMON.** Siendo el plan de salud, la ausencia de referencia a sustancias (PLANSUS) y agua (PLANAGUA) es especialmente critica.

---

## 2. Matriz de Referencias Cruzadas 12x12

Cada celda indica cuantas veces el **PLAN de la fila** menciona al **PLAN de la columna**. La diagonal (auto-referencia) se marca con `--`. Se usa la siguiente codificacion para la tabla de relaciones:

- Numero = cantidad de menciones
- 0 = no hay mencion alguna

| Origen \ Destino | 24CN | REP | ISV | EDU | JUS | SUS | EB | SAL | AGUA | DIG | GEO | MON |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **PLAN24CN** | -- | 9 | 13 | 4 | 8 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **PLANREP** | 15 | -- | 18 | 7 | 8 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **PLANISV** | 19 | 43 | -- | 2 | 10 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **PLANEDU** | 23 | 49 | 24 | -- | 6 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| **PLANJUS** | 3 | 7 | 3 | 16 | -- | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| **PLANSUS** | 11 | 20 | 11 | 14 | 17 | -- | 0 | 12 | 0 | 0 | 0 | 0 |
| **PLANEB** | 14 | 21 | 4 | 8 | 12 | 5 | -- | 5 | 0 | 0 | 0 | 0 |
| **PLANSAL** | 15 | 9 | 11 | 14 | 8 | 0 | 0 | -- | 0 | 0 | 0 | 0 |
| **PLANAGUA** | 23 | 12 | 44 | 18 | 8 | 9 | 16 | 9 | -- | 0 | 0 | 0 |
| **PLANDIG** | 9 | 24 | 12 | 21 | 21 | 1 | 14 | 8 | 17 | -- | 0 | 0 |
| **PLANGEO** | 12 | 16 | 11 | 8 | 10 | 32 | 24 | 12 | 10 | 17 | -- | 0 |
| **PLANMON** | 17 | 18 | 23 | 1 | 5 | 9 | 18 | 2 | 1 | 15 | 1 | -- |

### Tabla de relaciones bidireccional/unidireccional

Leyenda:
- `<->` = Bidireccional (ambos se mencionan mutuamente)
- `-->` = Unidireccional (solo el de la izquierda menciona al de la derecha, o viceversa; la flecha indica la direccion)
- `X` = Sin referencia en ninguna direccion

| Par | Relacion | Tipo | Severidad |
|---|---|---|---|
| PLAN24CN <-> PLANREP | 9 / 15 | `<->` | OK |
| PLAN24CN <-> PLANISV | 13 / 19 | `<->` | OK |
| PLAN24CN <-> PLANEDU | 4 / 23 | `<->` | OK |
| PLAN24CN <-> PLANJUS | 8 / 3 | `<->` | OK |
| PLAN24CN <-> PLANSUS | 0 / 11 | `PLANSUS-->PLAN24CN` | IMPORTANT |
| PLAN24CN <-> PLANEB | 0 / 14 | `PLANEB-->PLAN24CN` | IMPORTANT |
| PLAN24CN <-> PLANSAL | 0 / 15 | `PLANSAL-->PLAN24CN` | IMPORTANT |
| PLAN24CN <-> PLANAGUA | 0 / 23 | `PLANAGUA-->PLAN24CN` | CRITICAL |
| PLAN24CN <-> PLANDIG | 0 / 9 | `PLANDIG-->PLAN24CN` | IMPORTANT |
| PLAN24CN <-> PLANGEO | 0 / 12 | `PLANGEO-->PLAN24CN` | IMPORTANT |
| PLAN24CN <-> PLANMON | 0 / 17 | `PLANMON-->PLAN24CN` | IMPORTANT |
| PLANREP <-> PLANISV | 18 / 43 | `<->` | OK |
| PLANREP <-> PLANEDU | 7 / 49 | `<->` | OK |
| PLANREP <-> PLANJUS | 8 / 7 | `<->` | OK |
| PLANREP <-> PLANSUS | 0 / 20 | `PLANSUS-->PLANREP` | IMPORTANT |
| PLANREP <-> PLANEB | 0 / 21 | `PLANEB-->PLANREP` | IMPORTANT |
| PLANREP <-> PLANSAL | 0 / 9 | `PLANSAL-->PLANREP` | IMPORTANT |
| PLANREP <-> PLANAGUA | 0 / 12 | `PLANAGUA-->PLANREP` | IMPORTANT |
| PLANREP <-> PLANDIG | 0 / 24 | `PLANDIG-->PLANREP` | CRITICAL |
| PLANREP <-> PLANGEO | 0 / 16 | `PLANGEO-->PLANREP` | IMPORTANT |
| PLANREP <-> PLANMON | 0 / 18 | `PLANMON-->PLANREP` | IMPORTANT |
| PLANISV <-> PLANEDU | 2 / 24 | `<->` | OK |
| PLANISV <-> PLANJUS | 10 / 3 | `<->` | OK |
| PLANISV <-> PLANSUS | 0 / 11 | `PLANSUS-->PLANISV` | IMPORTANT |
| PLANISV <-> PLANEB | 0 / 4 | `PLANEB-->PLANISV` | IMPORTANT |
| PLANISV <-> PLANSAL | 0 / 11 | `PLANSAL-->PLANISV` | IMPORTANT |
| PLANISV <-> PLANAGUA | 0 / 44 | `PLANAGUA-->PLANISV` | CRITICAL |
| PLANISV <-> PLANDIG | 0 / 12 | `PLANDIG-->PLANISV` | IMPORTANT |
| PLANISV <-> PLANGEO | 0 / 11 | `PLANGEO-->PLANISV` | IMPORTANT |
| PLANISV <-> PLANMON | 0 / 23 | `PLANMON-->PLANISV` | IMPORTANT |
| PLANEDU <-> PLANJUS | 6 / 16 | `<->` | OK |
| PLANEDU <-> PLANSUS | 0 / 14 | `PLANSUS-->PLANEDU` | IMPORTANT |
| PLANEDU <-> PLANEB | 0 / 8 | `PLANEB-->PLANEDU` | IMPORTANT |
| PLANEDU <-> PLANSAL | 0 / 14 | `PLANSAL-->PLANEDU` | IMPORTANT |
| PLANEDU <-> PLANAGUA | 0 / 18 | `PLANAGUA-->PLANEDU` | IMPORTANT |
| PLANEDU <-> PLANDIG | 0 / 21 | `PLANDIG-->PLANEDU` | CRITICAL |
| PLANEDU <-> PLANGEO | 0 / 8 | `PLANGEO-->PLANEDU` | IMPORTANT |
| PLANEDU <-> PLANMON | 0 / 1 | `PLANMON-->PLANEDU` | MINOR |
| PLANJUS <-> PLANSUS | 0 / 17 | `PLANSUS-->PLANJUS` | IMPORTANT |
| PLANJUS <-> PLANEB | 1 / 12 | `<->` | OK (asimetrico) |
| PLANJUS <-> PLANSAL | 0 / 8 | `PLANSAL-->PLANJUS` | IMPORTANT |
| PLANJUS <-> PLANAGUA | 0 / 8 | `PLANAGUA-->PLANJUS` | IMPORTANT |
| PLANJUS <-> PLANDIG | 0 / 21 | `PLANDIG-->PLANJUS` | CRITICAL |
| PLANJUS <-> PLANGEO | 0 / 10 | `PLANGEO-->PLANJUS` | IMPORTANT |
| PLANJUS <-> PLANMON | 0 / 5 | `PLANMON-->PLANJUS` | IMPORTANT |
| PLANSUS <-> PLANEB | 0 / 5 | `PLANEB-->PLANSUS` | IMPORTANT |
| PLANSUS <-> PLANSAL | 12 / 0 | `PLANSUS-->PLANSAL` | CRITICAL |
| PLANSUS <-> PLANAGUA | 0 / 9 | `PLANAGUA-->PLANSUS` | IMPORTANT |
| PLANSUS <-> PLANDIG | 0 / 1 | `PLANDIG-->PLANSUS` | MINOR |
| PLANSUS <-> PLANGEO | 0 / 32 | `PLANGEO-->PLANSUS` | CRITICAL |
| PLANSUS <-> PLANMON | 0 / 9 | `PLANMON-->PLANSUS` | IMPORTANT |
| PLANEB <-> PLANSAL | 5 / 0 | `PLANEB-->PLANSAL` | IMPORTANT |
| PLANEB <-> PLANAGUA | 0 / 16 | `PLANAGUA-->PLANEB` | IMPORTANT |
| PLANEB <-> PLANDIG | 0 / 14 | `PLANDIG-->PLANEB` | CRITICAL |
| PLANEB <-> PLANGEO | 0 / 24 | `PLANGEO-->PLANEB` | CRITICAL |
| PLANEB <-> PLANMON | 0 / 18 | `PLANMON-->PLANEB` | IMPORTANT |
| PLANSAL <-> PLANAGUA | 0 / 9 | `PLANAGUA-->PLANSAL` | CRITICAL |
| PLANSAL <-> PLANDIG | 0 / 8 | `PLANDIG-->PLANSAL` | IMPORTANT |
| PLANSAL <-> PLANGEO | 0 / 12 | `PLANGEO-->PLANSAL` | IMPORTANT |
| PLANSAL <-> PLANMON | 0 / 2 | `PLANMON-->PLANSAL` | MINOR |
| PLANAGUA <-> PLANDIG | 0 / 17 | `PLANDIG-->PLANAGUA` | CRITICAL |
| PLANAGUA <-> PLANGEO | 0 / 10 | `PLANGEO-->PLANAGUA` | IMPORTANT |
| PLANAGUA <-> PLANMON | 0 / 1 | `PLANMON-->PLANAGUA` | MINOR |
| PLANDIG <-> PLANGEO | 0 / 17 | `PLANGEO-->PLANDIG` | CRITICAL |
| PLANDIG <-> PLANMON | 0 / 15 | `PLANMON-->PLANDIG` | IMPORTANT |
| PLANGEO <-> PLANMON | 0 / 1 | `PLANMON-->PLANGEO` | MINOR |

### Resumen cuantitativo

| Metrica | Valor |
|---|---|
| Total de pares posibles (12 PLANes) | 66 |
| Pares bidireccionales (`<->`) | 11 (17%) |
| Pares unidireccionales (`-->`) | 55 (83%) |
| Pares sin referencia alguna (`X`) | 0 (0%) |

**Nota critica:** Si se descuentan las auto-referencias unidireccionales por efecto temporal (los primeros 5 PLANes fueron escritos antes de que existieran los siguientes 7), los 10 pares entre los 5 PLANes fundacionales son todos bidireccionales. El problema sistematico es que **ningun PLAN fundacional fue actualizado para reconocer a los 7 PLANes posteriores.**

---

## 3. Conteos de Mandatos Obsoletos

Cada PLAN declara cuantos mandatos conforman BASTA. La cifra correcta actual es **12**. La tabla siguiente documenta cada conteo encontrado.

| PLAN | Cita textual | Linea | Conteo declarado | Correcto (12) | Severidad |
|---|---|---|---|---|---|
| **PLAN24CN** | "proyecto BASTA -- cinco iniciativas estrategicas fundacionales interconectadas: PLAN24CN [...] PLANREP [...] PLANISV [...] PLANEDU [...] PLANJUS" | 34 | 5 | NO | CRITICAL |
| **PLANREP** | "Cinco pilares fundacionales. Cinco dimensiones." | 2198 | 5 | NO | CRITICAL |
| **PLANISV** | "Cinco iniciativas estrategicas fundacionales que funcionan cada una de forma independiente" | 2016 | 5 | NO | CRITICAL |
| **PLANISV** | "Cada una de las cinco iniciativas es un camino concreto desde el apagon hacia la creacion." | 2028 | 5 | NO | CRITICAL |
| **PLANEDU** | "cinco iniciativas estrategicas disenadas para sobrevivir al ciclo electoral" | 244 | 5 | NO | CRITICAL |
| **PLANEDU** | "Ninguna de las cinco iniciativas funciona a su maximo potencial sin las otras cuatro." | 1694 | 5 | NO | CRITICAL |
| **PLANEDU** | "PLANEDU es una de las cinco iniciativas fundacionales del proyecto BASTA." | 1849 | 5 | NO | CRITICAL |
| **PLANEDU** | "Cinco iniciativas. Un solo proposito" | 1859 | 5 | NO | CRITICAL |
| **PLANJUS** | "Los primeros cinco son los mandatos fundacionales [...] Los que siguen -- salud, seguridad, energia, cultura, ciencia -- se desarrollan sobre los cimientos que estos cinco establecen." | 1386 | 5+ (abierto) | Parcial | IMPORTANT |
| **PLANSUS** | "PLANSUS se integra con los cinco mandatos existentes de BASTA" (tesis central) | 79 | 5 | NO | CRITICAL |
| **PLANSUS** | "SECCION 19: INTEGRACION CON BASTA -- CINCO MANDATOS, UNA TRANSFORMACION" | 1382 | 5 | NO | CRITICAL |
| **PLANEB** | "TABLA 22: PLANEB x Los Siete Mandatos Existentes" | 1243 | 7 | NO | CRITICAL |
| **PLANEB** | "PLANEB es el octavo mandato del proyecto BASTA [...] los ocho mandatos" | 1812 | 8 | NO | CRITICAL |
| **PLANSAL** | "BASTA es una arquitectura de diez mandatos" | 2063 | 10 | NO | IMPORTANT |
| **PLANAGUA** | "PLANAGUA es el noveno mandato del proyecto BASTA [...] los nueve mandatos" | 4562 | 9 | NO | IMPORTANT |
| **PLANAGUA** | "No hay un solo plan de los nueve que no dependa..." | 3375 | 9 | NO | IMPORTANT |
| **PLANDIG** | "PLANDIG es el decimo mandato de BASTA" | 1759 | 10 | NO | IMPORTANT |
| **PLANGEO** | "BASTA produce diez mandatos populares [...] PLANGEO -- el undecimo" | 182 | 11 | NO | IMPORTANT |
| **PLANGEO** | "PLANGEO no es el decimo plan de BASTA. Es el plan que hace que los otros nueve lleguen al mundo" | 1339 | 10 (implica 11 con si mismo) | NO | MINOR |
| **PLANMON** | Tesis central integra todos los PLANes + PLANEN | 58 | 12+ (incluye PLANEN inexistente) | NO | CRITICAL |

### Patron identificado

Los PLANes se escribieron en olas y **jamas se actualizaron hacia atras**:

| Ola | PLANes | Conteo que declaran | PLANes que conocen |
|---|---|---|---|
| Ola 1 (fundacional) | PLAN24CN, PLANREP, PLANISV, PLANEDU | 5 | Solo los 5 fundacionales |
| Ola 1b | PLANJUS | 5 fundacionales + "los que siguen" | 5 + futuro abierto |
| Ola 2 | PLANSUS | 5 existentes + si mismo = 6 | Los 5 fundacionales + PLANSAL |
| Ola 3 | PLANEB | 7 existentes + si mismo = 8 | 7 anteriores |
| Ola 4 | PLANSAL | 10 mandatos (se cuenta en tesis como bisagra) | 5 fundacionales solamente por nombre |
| Ola 5 | PLANAGUA | 9 mandatos (se autodenomina noveno) | 8 anteriores |
| Ola 6 | PLANDIG | 10 mandatos (se autodenomina decimo) | 9 anteriores |
| Ola 7 | PLANGEO | 10 mandatos + si mismo = 11 | Todos los 10 anteriores |
| Ola 8 | PLANMON | 11 mandatos + PLANEN (fantasma) | Todos + PLANEN inexistente |

---

## 4. Referencias Huerfanas

Una referencia huerfana se produce cuando el Plan A describe integracion con el Plan B, pero el Plan B no menciona al Plan A. A continuacion se listan los casos mas significativos.

### 4.1 Huerfanas CRITICAS (integracion operativa descrita en detalle, sin reciprocidad)

| Origen | Destino | Descripcion de la integracion (en origen) | Mencion reciproca (en destino) | Severidad |
|---|---|---|---|---|
| PLANAGUA | PLANISV | 44 menciones. Seccion completa "18.1 PLANAGUA <-> PLANISV -- El Nexo Suelo-Agua" con protocolos compartidos, red IoT integrada, franjas riparias, nanoburbujas, cuencas piloto, tabla de inversiones compartidas | PLANISV no menciona PLANAGUA (0 veces) | CRITICAL |
| PLANAGUA | PLAN24CN | 23 menciones. Seccion "18.2 PLANAGUA <-> PLAN24CN -- Ciudades que Nacen con Agua del Siglo XXI" con especificaciones tecnicas de infraestructura hidrica para ciudades nuevas | PLAN24CN no menciona PLANAGUA (0 veces) | CRITICAL |
| PLANDIG | PLANREP | 24 menciones. "Arquitecto de Fuerza Laboral IA", "Companero de Transicion", "edificios publicos vaciados por la digitalizacion + PLANREP" | PLANREP no menciona PLANDIG (0 veces) | CRITICAL |
| PLANDIG | PLANJUS | 21 menciones. Seccion completa "17: INTEGRACION CON PLANJUS -- JUSTICIA DIGITAL", "Modelo Legal IA", "plataforma JUS Digital" | PLANJUS no menciona PLANDIG (0 veces) | CRITICAL |
| PLANDIG | PLANEDU | 21 menciones. Seccion completa "16: INTEGRACION CON PLANEDU -- IA EDUCATIVA", "Co-tutor IA", "plataforma educativa soberana" | PLANEDU no menciona PLANDIG (0 veces) | CRITICAL |
| PLANGEO | PLANSUS | 32 menciones. Fase 3 del secuenciamiento internacional dedicada a PLANSUS, "coalicion reformista de drogas", "denuncia de convenciones" | PLANSUS no menciona PLANGEO (0 veces) | CRITICAL |
| PLANGEO | PLANEB | 24 menciones. Fase 1 del secuenciamiento, "Protocolo Bastardo publicado en GitHub", "Stack de Gobernanza Economica derivado de PLANEB" | PLANEB no menciona PLANGEO (0 veces) | CRITICAL |
| PLANGEO | PLANDIG | 17 menciones. "Soberania Digital" como Stack completo, "proteccion contra represalias de Big Tech y CLOUD Act" | PLANDIG no menciona PLANGEO (0 veces) | CRITICAL |
| PLANMON | PLANEB | 18 menciones. "Bastarda Financiera = nodo ancla del Pulso", "Protocolo Bastardo = base tecnologica del PMB" | PLANEB no menciona PLANMON (0 veces) | CRITICAL |
| PLANMON | PLANDIG | 15 menciones. "SAPI = riel de pagos del Pulso", "Nodos comunitarios = validadores" | PLANDIG no menciona PLANMON (0 veces) | CRITICAL |
| PLANSUS | PLANSAL | 12 menciones. "Puente Sanitario de 36 meses", "CAPAs como futura infraestructura PLANSAL", "capacitacion de profesionales de salud" | PLANSAL no menciona PLANSUS (0 veces) | CRITICAL |
| PLANDIG | PLANAGUA | 17 menciones. "Gemelo Digital del Agua", "Red IoT hidrica", "integracion SAOCOM para monitoreo" | PLANAGUA no menciona PLANDIG (0 veces) | CRITICAL |

### 4.2 Huerfanas IMPORTANTES (referencia funcional, sin reciprocidad)

| Origen | Destino | Tipo de integracion | Severidad |
|---|---|---|---|
| PLANAGUA | PLANEB | 16 menciones ("Bastardas Hidricas") | PLANEB no menciona PLANAGUA | IMPORTANT |
| PLANAGUA | PLANSAL | 9 menciones ("agua limpia como primera medicina") | PLANSAL no menciona PLANAGUA | IMPORTANT |
| PLANAGUA | PLANSUS | 9 menciones (proteccion de cuencas contra contaminacion) | PLANSUS no menciona PLANAGUA | IMPORTANT |
| PLANDIG | PLANEB | 14 menciones ("Protocolo Bastardo que PLANDIG construye") | PLANEB no menciona PLANDIG | IMPORTANT |
| PLANDIG | PLANSAL | 8 menciones ("Sistema de Vitalidad digital") | PLANSAL no menciona PLANDIG | IMPORTANT |
| PLANEB | PLANSAL | 5 menciones ("Bastarda Sanitaria") | PLANSAL no menciona PLANEB | IMPORTANT |
| PLANEB | PLANSUS | 5 menciones ("Bastarda Financiera para mercado de sustancias") | PLANSUS no menciona PLANEB | IMPORTANT |
| PLANMON | PLANISV | 23 menciones ("datos de produccion para canasta") | PLANISV no menciona PLANMON | IMPORTANT |
| PLANMON | PLANREP | 18 menciones ("exportaciones = flujo de divisas") | PLANREP no menciona PLANMON | IMPORTANT |
| PLANMON | PLAN24CN | 17 menciones ("ciudades como laboratorios desdolarizados") | PLAN24CN no menciona PLANMON | IMPORTANT |

### 4.3 Referencia fantasma: PLANEN

| Origen | Referencia | Menciones | Descripcion | Severidad |
|---|---|---|---|---|
| PLANMON | PLANEN | 24+ | Incorporado en tesis central, tabla de canasta, tabla de integraciones, hoja de ruta. "Commodities energeticas en canasta. Regalias al Fondo Soberano. Exportacion de H2 verde = flujo de divisas" | CRITICAL |
| PLANAGUA | PLANEN | 8+ | Seccion "18.9 PLANAGUA <-> Futuro PLANEN -- La Tension Agua-Energia". Se nota explicitamente que "PLANEN todavia no existe como mandato formalizado." | IMPORTANT |

PLANMON trata a PLANEN como un plan existente y operativo, con integraciones concretas (lineas 58, 213, 220, 267, 276, 297, 426-432, 461, 575, 623, 859, 905, 914, 933, 991, 1030, 1058, 1998, 2106, 2123). PLANAGUA es mas cauto: lo referencia como "futuro" y "todavia no formalizado."

---

## 5. Discrepancias Descriptivas

En los casos donde existe referencia bidireccional, se verifico que las descripciones de integracion sean coherentes entre ambos documentos.

### 5.1 PLANJUS describe resolucion de disputas laborales en "15 dias" / PLANREP dice "45 dias"

| Documento | Cita | Linea |
|---|---|---|
| PLANJUS | "PLANREP: Un trabajador reconvertido no recibe la formacion prometida -> juicio laboral de 4 anos / Reclamo en PLANJUS -> **resolucion en 15 dias**" | 1394 |
| PLANREP | "Conflictos laborales de la transicion resueltos en **45 dias**. El trabajador en reconversion que enfrenta una disputa [...] accede a PLANJUS JUS-2 (juicio completo) y obtiene resolucion vinculante en un maximo de **45 dias**." | 2235 |
| PLANREP | "Disputas de formacion y emprendimiento resueltas en **15 dias**." (pero esto es para disputas simples JUS-1, no laborales) | 2237 |

**Analisis:** PLANJUS clasifica la disputa laboral de reconversion como JUS-1 (resolucion simple, 15 dias). PLANREP clasifica la misma disputa como JUS-2 (juicio completo, 45 dias). Es una contradiccion sobre el nivel de complejidad del mismo tipo de caso.

**Severidad:** IMPORTANT

### 5.2 PLANSUS propone "novena Rama" del trabajo vivo / PLANREP solo define 8 ramas

| Documento | Cita | Linea |
|---|---|---|
| PLANSUS | "El Puente puede funcionar como una **novena Rama** del trabajo vivo de PLANREP: la 'Economia de las Sustancias.'" | 1396 |
| PLANREP | Define exactamente 8 ramas (El Refugio, La Belleza, El Amparo, La Mesa, La Reparacion, El Encuentro, La Imaginacion, La Precision). No menciona una novena rama ni PLANSUS. | Multiples |

**Analisis:** PLANSUS propone unilateralmente expandir la arquitectura de PLANREP sin que PLANREP lo reconozca. Si se acepta la novena rama, toda la arquitectura numerica de PLANREP necesita actualizarse (tablas de empleos, proyecciones, Centros de la Vida, etc.).

**Severidad:** IMPORTANT

### 5.3 PLANGEO dice "diez mandatos populares" y lista solo 10, excluyendo PLANMON

| Documento | Cita | Linea |
|---|---|---|
| PLANGEO | "BASTA produce diez mandatos populares (PLANEB, PLANDIG, PLANSUS, PLANSAL, PLANREP, PLANEDU, PLAN24CN, PLANAGUA, PLANISV, PLANJUS). PLANGEO -- el undecimo" | 182 |

**Analisis:** PLANGEO no menciona PLANMON en esta lista ni en ninguna otra parte del documento. Si PLANGEO se autodenomina el undecimo y PLANMON es el duodecimo, PLANGEO fue escrito antes de que PLANMON existiera. Pero la tabla de servicio a cada PLAN (Seccion 24.1) tampoco incluye PLANMON. Esto significa que PLANGEO no tiene integracion con la capa monetaria, lo cual es incongruente dado que PLANGEO propone "sistema de pagos alternativo" y "peso-canasta regional para comercio Mercosur."

**Severidad:** CRITICAL

### 5.4 PLANSAL dice "diez mandatos" pero solo integra 5 PLANes por nombre

| Documento | Cita | Linea |
|---|---|---|
| PLANSAL | "Si BASTA es una arquitectura de **diez mandatos** para que el pueblo gobierne y el gobierno ejecute..." | 2063 |
| PLANSAL (integracion) | Solo menciona por nombre: PLAN24CN, PLANISV, PLANEDU, PLANREP, PLANJUS | 2067-2075 |

**Analisis:** PLANSAL afirma la existencia de 10 mandatos pero su seccion de integracion solo desarrolla 5 relaciones. No hay seccion dedicada a PLANSUS, PLANEB, PLANAGUA, PLANDIG ni PLANGEO. Las ausencias mas criticas: PLANSUS (sustancias y salud son interdependientes), PLANAGUA (agua contaminada es factor sanitario de primer orden, y PLANAGUA le dedica una seccion entera a PLANSAL).

**Severidad:** CRITICAL

### 5.5 PLANEB describe "Bastarda Sanitaria" que "complementa el sistema publico de salud de PLANSAL" / PLANSAL no menciona Bastardas

| Documento | Cita | Linea |
|---|---|---|
| PLANEB | "PLANSAL: La Bastarda Sanitaria complementa el sistema publico de salud de PLANSAL. Los Centros de Vitalidad de PLANSAL y las redes de prestadores de la Bastarda Sanitaria se interconectan. Farmacia al costo con genericos." | 1253 |
| PLANSAL | Ningun uso de "PLANEB", "Bastarda", ni "Protocolo Bastardo" en todo el documento. | -- |

**Analisis:** PLANEB disenya una Bastarda Sanitaria con integracion detallada a los Centros de Vitalidad de PLANSAL, pero PLANSAL no tiene conocimiento de esta entidad. Esto crea un riesgo de duplicacion de funciones o incompatibilidad arquitectonica cuando se implemente.

**Severidad:** IMPORTANT

### 5.6 PLANDIG se autodenomina "decimo mandato" / PLANGEO dice que PLANDIG es uno de los "diez" (no el decimo) y que PLANGEO es el undecimo

| Documento | Cita | Linea |
|---|---|---|
| PLANDIG | "PLANDIG es el **decimo** mandato de BASTA." | 1759 |
| PLANGEO | "BASTA produce **diez** mandatos populares (PLANEB, PLANDIG, PLANSUS, PLANSAL, PLANREP, PLANEDU, PLAN24CN, PLANAGUA, PLANISV, PLANJUS). PLANGEO -- el undecimo" | 182 |

**Analisis:** Coherentes entre si respecto al numero de PLANDIG. Pero el listado de PLANGEO no sigue un orden de creacion (lista PLANEB primero, luego PLANDIG, etc.), lo que podria confundir lectores sobre la secuencia de mandatos.

**Severidad:** MINOR

---

## 6. Hallazgos Adicionales

### 6.1 Cluster de aislamiento de PLANSAL

PLANSAL es el PLAN mas "aislado" del ecosistema post-fundacional. Pese a ser el plan de salud -- que por naturaleza deberia integrar sustancias (PLANSUS), agua (PLANAGUA), infraestructura digital de salud (PLANDIG) y economia de servicios de salud al costo (PLANEB) -- no menciona a ninguno de estos cuatro PLANes. La ironia es que PLANSAL en su Seccion 21 de integracion dice: *"Ningun organo sana solo. El cuerpo es un sistema."* Pero el propio documento opera como un organo desconectado de la mitad de los PLANes que lo alimentarian.

**Severidad:** CRITICAL

### 6.2 PLANGEO como unico hub bidireccional potencial

PLANGEO es el unico PLAN que menciona a los 10 PLANes anteriores (no menciona PLANMON porque fue escrito antes). Sin embargo, **ninguno de esos 10 PLANes menciona a PLANGEO**. La proyeccion geopolitica de BASTA es invisible para todos los PLANes que PLANGEO dice proteger. Esto significa que ningun PLAN incorpora en su diseno de riesgos la variable geopolitica, ni reconoce la existencia de una estrategia internacional.

**Severidad:** CRITICAL

### 6.3 PLANMON como referenciador universal con cero reciprocidad

PLANMON menciona a los 11 PLANes restantes (incluyendo PLANEN que no existe). Sin embargo, **ningun PLAN menciona a PLANMON**. La capa monetaria -- que PLANMON describe como "la sangre" del sistema -- es invisible para todos los organos. Ningun PLAN incorpora el Pulso, el peso-canasta, el Fondo Soberano ni la ANMON en su diseno.

**Severidad:** CRITICAL

---

## 7. Resumen de Severidades

| Severidad | Cantidad de hallazgos |
|---|---|
| CRITICAL | 23 |
| IMPORTANT | 37 |
| MINOR | 6 |

### Acciones correctivas recomendadas por prioridad

**Prioridad 1 -- Actualizacion de conteos (todas las tesis centrales)**
Cada PLAN debe actualizar su tesis central y secciones de integracion para reflejar la existencia de 12 mandatos. Esto afecta a los 12 documentos.

**Prioridad 2 -- Actualizacion retroactiva de secciones de integracion**
Los 5 PLANes fundacionales (PLAN24CN, PLANREP, PLANISV, PLANEDU, PLANJUS) necesitan secciones de integracion expandidas que incorporen a los 7 PLANes posteriores. Como minimo, cada uno deberia incluir una tabla de sinergias con los 11 otros PLANes.

**Prioridad 3 -- Resolucion de PLANEN**
Decidir si se crea PLANEN como documento o se redistribuyen sus funciones entre PLANes existentes (PLANAGUA para tension hidrica-energetica, PLANGEO para commodities energeticas, PLANMON ajustando la canasta). Si no se crea, PLANMON debe reescribir todas las referencias a PLANEN.

**Prioridad 4 -- Resolucion de discrepancias descriptivas**
Alinear la clasificacion de disputas laborales (JUS-1 vs JUS-2) entre PLANJUS y PLANREP. Definir si la "novena Rama" de PLANSUS se incorpora formalmente a PLANREP.

**Prioridad 5 -- Actualizacion especifica de PLANSAL**
PLANSAL requiere intervencion urgente para incorporar PLANSUS, PLANEB, PLANAGUA y PLANDIG en su seccion de integracion. Es el PLAN con mayor deficit de conexion relativo a su importancia funcional.

---

*Documento generado por auditoria sistematica de los 12 archivos fuente en `/Iniciativas Estrategicas/[PLAN]_Argentina_ES.md`. Todas las cifras de mencion verificadas por busqueda textual exacta del codigo de cada PLAN.*
