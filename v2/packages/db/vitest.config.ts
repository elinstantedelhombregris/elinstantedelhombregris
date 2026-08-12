import { defineConfig } from 'vitest/config';

/**
 * **Los archivos de test de este paquete NO corren en paralelo.**
 *
 * Tres de las suites de `tests/` hablan con la MISMA base —la rama efímera de
 * `DATABASE_URL_DESCARTABLE`— y una de ellas cuenta filas que las otras
 * insertan: `migracion-0013.test.ts` afirma que hay 24 provincias mientras
 * `seed-callejero-idempotencia.test.ts` y `callejero-completitud.test.ts` tienen
 * su provincia de prueba adentro de la tabla. Con los archivos en paralelo, el
 * conteo da 25 o 26 según el momento, y el test se pone rojo por una razón que
 * no tiene nada que ver con lo que afirma.
 *
 * Cada suite limpia lo suyo en su `afterAll`, así que serializadas no se ven.
 * La alternativa —una base por archivo— es una rama de Neon por suite, y el
 * costo de arrancarlas es mayor que el minuto que se pierde acá.
 *
 * Un test que falla de a ratos es peor que un test que no existe: se aprende a
 * volver a correrlo hasta que pase, y ese hábito se lleva puesto el día que la
 * falla es de verdad.
 */
export default defineConfig({
  test: {
    fileParallelism: false,
  },
});
