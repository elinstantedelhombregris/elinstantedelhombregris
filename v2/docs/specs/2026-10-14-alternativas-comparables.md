# Alternativas comparables y revisiones trazables

La ficha conserva sus alternativas originales. Cada alternativa puede detallar beneficiarios, personas afectadas, capacidades necesarias, costo con moneda/período y fuente, plazo, efectos adversos, incertidumbre y referencias editoriales. Datos desconocidos se expresan como pendientes; cero es un costo estimado válido, no ausencia de dato. Mantener la situación actual puede registrarse explícitamente como referencia y no se preselecciona como solución.

El lector elige al menos dos propuestas para compararlas por las mismas dimensiones, sin puntuación única ni recomendación automática. Una revisión crea otra alternativa y señala la anterior, la objeción que motivó el cambio y la explicación del cambio. El servidor exige que ambas referencias pertenezcan a la ficha y que la objeción siga activa. El original permanece intacto. Si se retira la objeción, se oculta la explicación asociada y se indica revisión pendiente; no se reproduce el texto retirado.

1. [x] Extender el contrato JSON existente sin romper propuestas anteriores.
2. [x] Validar referencias, preservar originales e idempotencia; lectura con retiro de referencias.
3. [x] Completar formulario, comparación y propuesta de revisión con objeción elegida.
4. [x] Pruebas de API, componentes y verificación completa.

Verificado con API y Postgres local: original intacto, referencias de la misma ficha, reintento idéntico, conflicto con cuerpo distinto y ocultación del fundamento al retirar la objeción. Comparación y revisión comprobadas en 360, 390, 768 y 1440 píxeles; todas las escrituras del navegador fueron simuladas.
