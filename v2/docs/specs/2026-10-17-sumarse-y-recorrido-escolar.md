# Sumarse a tareas y recorrer un caso completo

Fecha: 17/10/2026. Alcance: v2 web y API; sin migración ni datos ficticios en producción.

## Problema y evidencia

La entrada de iniciativas prioriza crear/administrar. Una persona que quiere ayudar debe encontrar primero una iniciativa. El vínculo tarea–ficha exige pegar un enlace. El recibo, las campañas, las fichas y el campo ya conservan procedencia, permisos, versiones y estados distintos, pero su continuidad todavía requiere decisiones manuales.

El inventario del 15/10 documentó cero registros en el corpus participativo. No demuestra el estado actual ni valida utilidad. La inspección de código identifica fricciones; el ejemplo escolar será una demostración, no un resultado de campo.

## Cambio mínimo

1. Catálogo público paginado de tareas sin responsable, en iniciativas abiertas/en curso, excluyendo PLANes y tareas derivadas de pruebas. Buscar por título, alcance o iniciativa y filtrar por ficha desde su contexto. Mostrar alcance, recursos, fecha de revisión y ficha, sin inventar duración o ubicación.
2. `/iniciativas` abre el catálogo; la creación sigue disponible en `/iniciativas/nueva`. Leer no requiere cuenta. El enlace mantiene la tarea después del ingreso. Sumarse al equipo y aceptar personalmente siguen siendo decisiones separadas. La aceptación conserva firma, nota, revisión e idempotencia actuales.
3. Selector paginado de fichas editables: autor o colaboración editorial aceptada y vigente. La búsqueda conserva la selección; cambiar de cuenta no reutiliza permisos. Guardar exige revisar el destino y vuelve a validar permisos, revisión y ausencia de evidencia. Retirar el vínculo es explícito.
4. Recorrido escolar público y aislado: aspiración → escucha → alternativas y desacuerdo → tarea y ficha → ejecución declarada → revisión → devolución. Permite ensayar un vínculo y una aceptación sin APIs de escritura. Los responsables y números son ficticios. Accesos desde mapa, campañas, fichas e iniciativas.
5. Protocolo de piloto con roles, materiales primarios, criterios previos y comparación con la organización habitual. Su ejecución depende de participantes y compromisos reales; no se contabiliza como realizada.

## Responsabilidades

El coordinador abre la campaña y responde por la devolución. El equipo editor interpreta y mantiene las objeciones. La administración crea tareas y elige la ficha que puede editar. Cada participante acepta su propia responsabilidad. Otra cuenta habilitada revisa la evidencia; esa separación no certifica independencia personal. La institución sólo asume una decisión si la acepta expresamente.

## Verificación

Integración con Postgres descartable: elegibilidad y paginación del catálogo; permisos del selector; permiso revocado entre lectura y escritura; aceptación concurrente y conservación del destino. Componentes: estados vacío/error, contexto al ingresar, selección sin enlaces, revisión cambiada y simulación aislada. Navegador: recorrido escolar y catálogo en móvil. `pnpm verify` antes de commit.

## Checklist de entrega

1. [x] Catálogo público y entrada centrada en sumarse; contexto de tarea conservado al ingresar.
2. [x] Selector de fichas editables; búsqueda, paginación, retiro explícito y conservación de selección ante cambios de revisión.
3. [x] Recorrido escolar aislado, enlazado desde mapa, campañas, fichas e iniciativas.
4. [x] Protocolo y evaluación en `../demos/2026-10-17-piloto-recorrido-escolar.md`.
5. [x] Cerrar verificación completa, revisión de diferencias y entrega.

La implementación de esta entrega no necesita una nueva migración. Publicación de web/API y ejecución con participantes se registran por separado de las comprobaciones locales.

## Resultado de verificación local

`pnpm verify` terminó con código 0 el 17/10/2026: lint, tipos, 3.428 pruebas aprobadas, corpus y compilación. Las integraciones usaron PostgreSQL temporal local; hubo 20 omisiones previstas por sus condiciones de entorno. Las tres pruebas de Chromium del recorrido, ingreso con retorno a tarea y selección/aceptación aprobaron con API interceptada; el ejemplo se revisó también a 390 px sin desbordamiento horizontal. Los tipos de las pruebas de navegador aprobaron.

Se mitigaron dos fallos HTTP en suites anteriores usando el helper persistente existente, sin cambiar aserciones ni añadir reintentos; D-129 conserva el registro y sigue abierta. No se ejecutó un piloto humano ni se publicó esta revisión en producción.
