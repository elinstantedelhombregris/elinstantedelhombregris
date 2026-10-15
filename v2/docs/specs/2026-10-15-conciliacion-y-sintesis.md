# Conciliación territorial y síntesis revisada

## Resultado

La herramienta compara los nomencladores oficiales del Censo 2022, la edición IGN conservada y el catálogo operativo, por nivel y código. Conserva originales, filas, categorías y pertenencias cruzadas. Un código coincidente es un candidato documental: no certifica igualdad de límites, vigencia ni universos. No reasigna señales ni distribuye porcentajes nacionales. Las categorías residuales (rural disperso, indeterminado, sin gobierno) permanecen identificadas; una localidad puede tener varias filas de pertenencia.

La visión compartida incorpora ediciones editoriales de objetivos seleccionados. Cada edición identifica alcance, método, ausencias, criterio, variantes, recursos, alternativas, tensiones, tareas, autor y próxima revisión. Se enlaza a las versiones exactas de las fichas. La revisión la realiza otra cuenta que pueda editar todas las fichas seleccionadas; se describe como revisión del equipo participante, nunca como auditoría independiente o mandato nacional.

Las ediciones guardadas no se editan: una corrección produce otra edición con referencia a la anterior. Solo autor/revisor pueden retirar una edición. Si una ficha cambia o se retira un apoyo, la lectura pública y la descarga ocultan todo texto editorial y derivado de esa edición. La referencia citable y el estado permanecen; no se prometen copias públicas inmutables de textos sensibles. Los archivos ya descargados no se pueden revocar.

## Implementación

1. Conservar cuatro XLSX oficiales, extraer códigos preservando ceros y relaciones, validar identidades y categorías, generar índice IGN de la misma versión.
2. Consulta paginada de conciliación, contadores completos por filtro y diferencias visibles; pantalla con fuentes, límites y ejemplos cotidianos.
3. Contrato, migración aditiva, repositorio y API de ediciones: creación idempotente, revisión separada, vigencia, retiro y lectura citable.
4. Pantallas de selección de objetivos, formulario editorial, lectura, revisión, nueva edición, descarga y ejemplo ficticio separado.
5. Pruebas de validación, Postgres real, componentes, navegador móvil/escritorio y verificación completa.

## Límites

No se considera completado el piloto con personas reales. El cruce de códigos no valida límites censales ni radios/áreas habitadas. La conciliación no altera el catálogo operativo. La edición editorial no calcula representatividad ni decide urgencia por popularidad. La aprobación exige una segunda cuenta, pero no demuestra independencia institucional. Ningún ejemplo se inserta en el corpus público.

## Trazabilidad territorial y primer escenario

Cada edición registra las versiones IGN y del nomenclador disponibles al crearla. Se calcula una huella de las unidades operativas citadas por las fichas, fuentes y objetivos: cambiar nombre, código, pertenencia o vigencia invalida la lectura. Esto conserva la precaución temporal sin presentar el catálogo operativo vivo como una edición histórica reconstruida.

Cada alternativa abre un modelo local de disponibilidad. Se comparan referencia y alternativa en un período común mediante horas de equipo disponibles, horas de equipo por actividad y plazas por actividad. Se documentan origen observado o supuesto, fecha y justificación; cada parámetro admite un rango. La capacidad es la parte entera de horas disponibles divididas por horas por actividad; las plazas son actividades por plazas de cada actividad. Se propagan extremos y se muestra sensibilidad al tiempo disponible con duración central fija. Los rangos no son intervalos de confianza y las plazas no son personas únicas.

No se asignan valores iniciales a alternativas reales. El ejemplo aislado incorpora parámetros inventados y rotulados. El cálculo no persiste ni altera reservas, no valida impacto o predice asistencia. Exige anotar límites y posibles perjudicados. Los efectos que no calcula (calidad, equidad, acceso, presupuesto) permanecen explícitos. Una decisión debe documentarse en la revisión de la alternativa.
