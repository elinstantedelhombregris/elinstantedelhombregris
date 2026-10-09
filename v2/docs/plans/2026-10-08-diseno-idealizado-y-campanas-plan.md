# Plan de modificaciones de v2 para el diseño idealizado

Fecha: 8 de octubre de 2026. Estado: implementación realizada y verificada en local, revisión 4. La apertura de campañas reales y la validación en dispositivos físicos son operaciones de lanzamiento pendientes.

Base: [Propuesta de modificaciones de v2](../specs/2026-10-08-diseno-idealizado-y-campanas.md). El orden prioriza un aporte fiel con devolución; cada entrega agrega un recorrido utilizable. No hay fechas de publicación comprometidas.

## Entregas

| Entrega | Resultado visible                                                                              | Dependencias                              |
| ------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------- |
| E0      | Contratos, alcance y operaciones de reutilización comprobados                                  | Lectura y verificación de base            |
| E1      | Imaginar, recuperar aportes con cuenta, seguir una campaña y descargar registro público básico | E0                                        |
| E2      | Vincular aportes a futuros, recibir devolución, filtrar Radiografía y exportar                 | E1 y equipo de facilitación               |
| E3      | Examinar diferencias, responder afirmaciones y comparar diseños                                | E2 y criterios de análisis                |
| E4      | Probar una alternativa y conservar resultados                                                  | E3 o proceso humano explícito equivalente |
| E5      | App adaptada al trabajo recurrente probado                                                     | Contratos E1 y experiencia de E2 o E4     |

## E0 Preparar el alcance

- [x] Verificar en entorno de prueba creación, lectura y revisión de fichas; recibos, corrección y retiro de señales; búsqueda territorial y agregados. Registrar capacidades efectivas, no solo existencia de tablas.
- [x] Definir la matriz de acceso público, aporte anónimo, cuenta, facilitación, análisis e institución. Cuenta y firma pública permanecen separadas.
- [x] Cerrar consulta común y contratos de exportación pública, análisis guardado y descarga propia. Identificar límites de corpus y campos reservados.
- [x] Verificar cuenta, perfil y notificaciones existentes; diseñar control de autoría y conflicto al asociar múltiples navegadores.
- [x] Cerrar contrato de campaña, edición y contribución. Separar original autorizado, interpretación y señal derivada. Definir límites visibles y comportamiento de textos extensos.
- [x] Definir borrador local explícito, recuperación anónima, permisos de publicación y acceso del equipo. No publicar secretos de gestión.
- [x] Definir qué campos de campaña exige publicar y quién puede hacerlo.
- [ ] Fijar un equipo real y una fecha de devolución para el piloto de lanzamiento.
- [ ] Elegir la primera pregunta y territorios operativos. MI ARGENTINA IDEAL ofrece entrada nacional; la facilitación inicial se concentra donde existe equipo.
- [x] Revisar las tareas ya completadas en el plan de septiembre; conservar regresiones de privacidad y agregados como casos de aceptación.

**Salida:** una muestra autorizada puede publicarse, recuperarse y retirarse con una edición identificada en una base de test. El piloto tiene quién devuelva lo escuchado. Se puede explicar qué datos son públicos, propios o privados, quién los gestiona y qué puede recuperarse.

## E1 Entrada y campaña

### Datos y servicios

- [x] Añadir esquemas y repositorios de campañas, ediciones, alcance y contribuciones. Migraciones aditivas; no alterar datos históricos ni crear otra base.
- [x] Crear contratos Zod compartidos y permisos de administración. Revisar publicación y licencia en lecturas nuevas para no eludir la política de señales.
- [x] Implementar API de lectura y gestión de campañas. Cerrar transiciones con razón y registro; validar edición al enviar.
- [x] Resolver publicación y vínculo de campaña de manera atómica o recuperable. Reusar validación y servicio de señales; clave estable por intento y recibo del resultado real.
- [x] Resolver atribución privada de aportes con sesión, coherente con actor y `senales.userId`. Implementar vínculo explícito de aportes anteriores y tratamiento de conflictos sin duplicar participación.
- [x] Añadir repositorio de seguimientos y preferencias; no reusar adhesiones. Integrar consulta de datos propios y permisos por titular.
- [x] Crear exportador público básico y manifiesto desde las proyecciones elegibles; sustituir catálogo estático y licencias desalineadas. Completo y limitado son estados explícitos.
- [x] Implementar recuperación, corrección y retiro de la contribución y sus proyecciones. Conservar la distinción entre retirar publicación y borrar datos según la política definida.

### Interfaz

- [x] Cambiar Home a invitación idealizada y ordenar las secciones propuestas. Conservar identidad Papel y Tinta.
- [x] Añadir Imaginar por texto con preguntas opcionales, revisión, selección de territorio y permisos. El MVP funciona sin IA y conserva formulario directo.
- [x] Compartir controles de ubicación, consentimiento y recibo con `PanelSoltarVoz`. El usuario confirma el tipo sugerido.
- [x] Añadir catálogo y detalle de campaña, con contexto, fases y devolución prevista. El participante puede aportar en alcance nacional sin GPS.
- [x] Añadir panel mínimo de gestión: crear borrador, seleccionar zonas y temas, revisar vista pública, publicar y pausar con motivo.
- [x] Añadir recibo con enlaces de lectura y controles de gestión disponibles; conservar texto ante error.
- [x] Crear Mi espacio con Mis aportes, Lo que sigo, Avisos y Cuenta y datos. Reutilizar login y registro. Conservar actividad histórica en una ubicación secundaria.
- [x] Añadir Guardar en mi espacio y Seguir al recibo; ofrecer asociación de antecedentes después de ingresar con vista previa.
- [x] Adaptar Datos Abiertos a Papel y Tinta, con formatos, alcance, licencias y acceso público sin cuenta. Añadir Descargar registro público en Radiografía.
- [x] Actualizar navegación, lazy loading y registro de rutas Papel y Tinta. Verificar rutas específicas antes de paramétricas y enlaces históricos.

**Archivos existentes principales:** `apps/web/src/pages/Home.tsx`, `Home/sections/HeroBasta.tsx`, `components/papel/PapelHeader.tsx`, `components/papel/papel-nav.ts`, `app-routes.tsx`, `app-pages.tsx`, `layouts/papel-routes.ts`, `pages/ElMapa/sections/PanelSoltarVoz.tsx`, `apps/api/src/features/senales/`, `packages/shared/src/validation/senal.ts`.

**Archivos nuevos previstos:** páginas y secciones de Imaginar y Campañas; queries de contribuciones y campañas; dominios API `contribuciones` y `campanas`; esquemas, repositorios y validaciones correspondientes. Nombrar y dividir archivos al implementar, respetando los límites de v2.

**Salida:** una persona abre un enlace, imagina, revisa y publica. El recibo permite recuperar el mismo aporte, corregirlo y retirarlo. Con cuenta puede verlo desde otro dispositivo, seguir la campaña y gestionar sus preferencias. Una descarga pública identifica alcance, omisiones y licencia sin pedir cuenta.

## E2 Futuros y devolución

- [x] Cambiar orden y preguntas del formulario de ficha: futuro primero, situación después, siguiente investigación visible.
- [x] Añadir relación `inspira` a los contratos y lecturas de fichas; conservar las relaciones históricas.
- [x] Vincular aportes desde recibo, campaña y mapa mediante selección; mantener acceso directo por enlace como opción avanzada.
- [x] Relacionar fichas y campañas sin copiar señales ni reutilizar consentimientos. Definir permisos para quien administra esa relación.
- [x] Incorporar Futuro al instrumento con panel y lista accesible. Mantener los modos analíticos como representaciones secundarias.
- [x] Compartir alcance territorial y filtros en URL sin datos privados. Diferenciar ubicación de la señal y ámbito de la ficha.
- [x] Extender consulta y filtros de Radiografía a campaña, edición, territorio, tema y período antes del agrupamiento. Mantener grafo semántico y lista accesible.
- [x] Separar total elegible, seleccionado, analizado y mostrado; declarar recorte de 500 y pasar cálculo pesado fuera del request cuando corresponda.
- [x] Implementar exportación de vista con corte y parámetros, paquete público ampliado y consulta guardada privada. No exportar vectores ni respuestas individuales por defecto.
- [x] Incorporar descarga privada de datos propios con autorización y archivos de vigencia corta; distinguir borradores locales de contenido sincronizado.
- [x] Integrar eventos de devolución, revisión y fases con inbox, preferencias, deduplicación y reintentos. Mantener fuente consultable aunque falle aviso.
- [x] Publicar una devolución humana versionada con patrones provisionales, diferencias, fuentes y ausencias. Habilitar correcciones de sus participantes.
- [x] Incorporar futuros y campañas reales a Home. Revisar textos de La idea y enlaces de biblioteca.

**Archivos existentes principales:** `pages/Fichas.tsx`, `pages/Fichas/FormularioFicha.tsx`, `lib/queries/fichas.ts`, `features/fichas/routes.ts`, `schema/fichas.ts`, `repositories/fichas.ts`, `validation/fichas.ts`, `pages/ElMapa.tsx`, `pages/ElMapa/instrumento/`, `pages/LaIdea/sections/`.

**Salida:** el participante encuentra su aporte en una ficha con origen visible y recibe una devolución corregible en su espacio. Otra persona abre el análisis compartido y obtiene el subconjunto exportable anunciado. Retirar una fuente no deja su texto disponible en esa devolución ni en una copia histórica pública.

## E3 Alternativas y acuerdos

- [x] Añadir alternativas a fichas con funcionamiento, supuestos, dependencias, responsables y prueba propuesta. Mantener diferencias abiertas.
- [x] Incorporar permisos de edición y facilitación; conservar control de revisión y recuperación ante conflictos.
- [x] Crear afirmaciones versionadas y respuestas explícitas. Registrar exposición, paso y faltantes separados. No reutilizar adhesiones como respuestas.
- [x] Evaluar motor Polis frente a una adaptación propia con datos sintéticos aislados y revisión humana; seleccionar después de comprobar contratos y estabilidad.
- [x] Añadir interpretación asistida y conexiones semánticas solo con autorización y corrección. Registrar versión, fuentes y decisiones editoriales.
- [x] Publicar hallazgos con alcance, cobertura y objeciones. Permitir estructura insuficiente; no forzar grupos ni consenso.
- [x] Crear Caminos cuando permita comparar alternativas. Actualizar Radiografía y Mandato para mostrar resultados del proceso realmente disponible.

**Salida:** dos personas pueden reconocer el propósito compartido y explicar una diferencia de diseño. El apoyo por grupos se lee con denominadores y no se presenta como representación nacional.

## E4 Prueba y aprendizaje

- [x] Verificar qué operaciones de iniciativas, tareas e hitos se pueden reutilizar con permisos y responsables efectivos.
- [x] Conectar una alternativa con una prueba acordada: equipo, alcance, presupuesto con supuestos, plazo, evidencia y criterios de pausa.
- [x] Distinguir acción aceptada, implementación, resultado observado y verificación. Incorporar Seguimiento cuando exista ese circuito.
- [x] Publicar resultado y aprendizaje, incluido fracaso, con correcciones y nueva pregunta. Permitir revisión de personas afectadas.
- [x] Actualizar Sembrar como compromiso concreto posterior, con contrato de fecha y cierre. Conservar semillas históricas y evitar migraciones automáticas de significado.

**Salida:** un tercero puede reconstruir qué se quiso probar, quién aceptó hacerlo, qué ocurrió y qué se aprendió.

## E5 Adaptación móvil

Antes de editar la app, leer sus instrucciones propias. La entrega requiere una necesidad observada de uso frecuente o de campo.

- [x] Compartir contratos de campaña, edición, contribución y titularidad con la app existente. La sesión permite continuidad; los borradores privados no se sincronizan por defecto.
- [x] Añadir seguimiento de campañas y entrada idealizada; preservar escucha y bitácora privadas.
- [x] Preparar captura asistida con revisión y autorización de su autor, diferenciada del aporte de quien facilita.
- [x] Integrar envíos pendientes y recuperación de recibos. Campaña cerrada o edición cambiada conserva borrador y explica la siguiente elección.
- [x] Verificar qué canales se sincronizan hoy y conectar solo los autorizados. Una actualización no publica relatos privados anteriores.
- [ ] Probar dispositivos modestos, reinicio durante envío, conexión intermitente, corrección y retiro entre superficies.

**Salida:** facilitadores completan una tarea real que mejora con la app y el registro público mantiene los mismos permisos y significado que la web.

## Verificación por entrega

No repetir una batería completa sin cambios que lo justifiquen. En cada implementación ejecutar pruebas de la operación modificada y los controles requeridos de v2.

| Área                     | Casos necesarios                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Escritura                | Doble tap, HTTP perdido, reintento, edición de campaña cambiada y cierre                                                                    |
| Permisos                 | Lectura pública, actor anónimo, cuenta, roles y descarga; texto reservado y acceso cruzado                                                  |
| Identidad y continuidad  | Login tras aporte, selección de antecedentes, otro navegador, cookie perdida, conflicto de actor y cuenta, cierre de sesión y retiro        |
| Seguimientos y avisos    | Seguir sin apoyar, dejar de seguir, deduplicación, preferencias, falla de aviso con devolución disponible                                   |
| Exportaciones            | Más registros que límites de vista, corte consistente, excluidos, licencia por texto, CSV seguro, archivo privado vencido y fuente retirada |
| Fidelidad                | Negaciones, múltiples ideas, interpretación rechazada y resumen corregido                                                                   |
| Retiro                   | Mapa, recibo, campaña, ficha, devolución, exportación y trabajo pendiente                                                                   |
| Fichas                   | Fuente no disponible, edición concurrente, historial sin copias públicas de textos retirados                                                |
| Mapa                     | Consulta parcial, error, filtros comunes, lista accesible y ubicación aproximada                                                            |
| Interfaz                 | Teclado, foco, errores, ampliación de texto, móvil 360 y 390, tablet 768 y escritorio 1440                                                  |
| Móvil cuando corresponda | Offline, reinicio, permisos, sincronización, cambio de edición y dispositivos reales                                                        |

Cada endpoint nuevo lleva integración; cada componente no trivial lleva una prueba relevante. Antes de commit o PR: `pnpm verify`, conforme a `v2/CLAUDE.md`. Los tests que escriben requieren una base descartable explícita. No se escriben ejemplos en el registro de producción.

## Primer trabajo a implementar

E0 y E1. La demostración de salida conecta campaña de prueba, aporte revisado, recibo, cuenta, seguimiento y descarga pública básica. No se considera completo si el aporte solo se ve en el navegador original o la descarga copia una vista recortada como si fuera el registro entero. Después de comprobarlo, una campaña real puede abrirse cuando su equipo y devolución estén preparados.

## Estado de la entrega de software

El recorrido implementado es Imaginar → campaña → aporte revisado → ficha → respuestas explícitas y alternativas → prueba y resultado. Mi espacio incluye autoría, recuperación voluntaria, publicaciones y procesos propios, seguimientos, avisos, preferencias, descarga privada y cierre de cuenta. Los textos reservados pueden gestionarse con su credencial original; hechos, acciones y voces con adhesiones conservan su enunciado y requieren un aporte nuevo para cambiarlo.

Las campañas conservan ediciones publicadas mientras se prepara otra, tienen invitaciones revocables de edición y una devolución que sus participantes pueden cuestionar. Se filtran por territorio, tema y fase; duplicar una campaña prepara un contrato nuevo, sin copiar aportes ni participantes. Publicar exige declarar el uso de los datos, el método de lectura y una devolución prevista. Los reintentos de devolución recuperan la publicación original sin duplicar avisos. Seguir no vota ni concede representación. Una cuenta diferente puede revisar un resultado; esto no acredita independencia civil ni auditoría.

El análisis de opiniones usa una adaptación propia y exploratoria: PCA centrada, imputación para proyectar, K=2 determinista y controles de tamaño y separación. No se presenta como la implementación oficial de Polis. Nunca cuenta faltantes como acuerdo y permite declarar estructura insuficiente. Radiografía permite escoger una ficha y examinar esta lectura, separada de los filtros y del grafo semántico. El Mandato Vivo muestra campañas, devoluciones, alternativas y pruebas públicas; la cantidad de aportes no transforma un registro en mandato.

La descarga pública reúne todas las páginas del alcance elegido y genera CSV, JSONL o GeoJSON dentro de un ZIP con metadatos, licencias, exclusiones y sumas de verificación por fragmento. Los trabajos y partes se conservan en Postgres: admiten recuperación, cancelación y vencimiento, y el navegador recibe el ZIP por flujo. La vista de análisis agrega su grafo y procedencia actuales; no reconstruye una pantalla pasada ni entrega matrices individuales o vectores privados. El corte fija creación; las revisiones y permisos se evalúan durante la preparación y la entrega. La operación requiere el worker por cron protegido o CLI, según [el procedimiento de exportaciones](../operations/exportaciones-publicas.md).

La app existente suma campañas, entrada idealizada, captura asistida, borradores y recibos persistidos, cuenta de v2 mediante cookies, segundo factor, renovación de sesión, recuperación elegida y gestión del aporte. No convierte la bitácora anterior en publicaciones. La configuración `EXPO_PUBLIC_BASTA_V2_URL` debe señalar el origen público compartido de la web y su API de v2, distinto del servicio histórico.

Las migraciones 0025–0030 son aditivas y se probaron en Postgres local descartable. El despliegue debe aplicar esas migraciones por el procedimiento del proyecto; no usar `db:push`. No se crearon campañas reales ni se asignó responsabilidad institucional a personas por defecto.

La primera pregunta nacional ya está en el producto. Elegir un equipo real, su zona operativa y fecha de devolución permanece como decisión de lanzamiento. Las comprobaciones físicas de campo y los límites de cálculo se registran en D-102 y D-103.

## Verificación de la entrega

- `pnpm verify`: lint, tipos, 2.477 pruebas aprobadas, comprobación del corpus de entrenamientos y compilación. Permanecen 20 pruebas de integración omitidas que ya existían; las nuevas rutas se probaron contra Postgres local real.
- App: `pnpm check`, 257 pruebas en 49 archivos y exportación Expo para Android, iOS y web aprobados. Exportar no equivale a probar en un teléfono físico ni publicar en las tiendas.
- `pnpm api:bundle`: API y tres cron empaquetados, incluido el worker de exportaciones. Las migraciones aditivas 0025–0030 se comprobaron sólo en las bases locales de prueba.
- Navegador local: publicación de un aporte sintético, recibo, lecturas públicas, opiniones con estado insuficiente y exportación de solicitado a disponible. Imaginar se revisó a 360, 390, 768 y 1440 píxeles, sin desborde horizontal. Los bytes del ZIP, CRC32, permisos, vencimiento, reintentos y retiro durante la transmisión se verificaron mediante integración.

La vista local usa datos de prueba. Esta entrega no acredita un despliegue, una campaña ciudadana abierta ni representatividad de una muestra. Antes del lanzamiento deben aplicarse las migraciones en v2, configurar el worker según el host y comprobar descargas grandes en ese entorno, además del piloto y la prueba física móvil.
