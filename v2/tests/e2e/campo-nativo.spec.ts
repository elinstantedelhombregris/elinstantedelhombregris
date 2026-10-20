import { expect, test } from '@playwright/test';

import { ficha } from '../../apps/web/src/pages/Fichas/__tests__/cuaderno-fixtures';

test('vinculación revocable y devolución visible sin publicar contra servicios reales', async ({
  page,
  context,
  baseURL,
}) => {
  const origen = new URL(baseURL ?? 'http://localhost:5173').origin;
  let revocado = false,
    retirada = false;
  const errores: string[] = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await context.route('**/*', async (route) => {
    const req = route.request(),
      u = new URL(req.url());
    if (u.origin !== origen) return route.abort();
    if (!u.pathname.startsWith('/api/')) return route.continue();
    let data: unknown;
    if (u.pathname === '/api/auth/me')
      data = {
        user: {
          id: 7,
          username: 'campo',
          email: 'campo@test.local',
          name: 'Campo',
          emailVerified: true,
          onboardingCompleted: true,
          esAdmin: false,
        },
      };
    else if (u.pathname === '/api/v1/contribuciones/contexto')
      data = { csrfToken: 'fixture', temas: [] };
    else if (u.pathname === '/api/campo/dispositivos' && req.method() === 'POST') {
      expect(req.headers()['x-csrf-token']).toBe('fixture');
      data = { id: 'telefono', token: 'a'.repeat(64) };
    } else if (u.pathname === '/api/campo/dispositivos/telefono' && req.method() === 'DELETE') {
      revocado = true;
      data = { id: 'telefono' };
    } else if (u.pathname === '/api/campo/dispositivos')
      data = [{ id: 'telefono', nombre: 'Teléfono de campo', expira: '2026-11-14', revocado }];
    else if (u.pathname === `/api/v1/fichas/${ficha.id}`) data = { ...ficha, puedoEditar: false };
    else if (u.pathname === `/api/fichas/${ficha.id}/resultados-campo`)
      data = {
        items: [
          {
            id: 91,
            titulo: retirada ? '' : 'Horarios que faltan',
            texto: retirada ? null : 'Conversamos en dos encuentros sobre los horarios escolares.',
            url: null,
            revisada: false,
            retirada,
            notaRevision: null,
            firmaRevision: null,
            tareaId: 31,
            tareaTitulo: 'Escuchar en la escuela',
            iniciativaSlug: 'escuela',
            resultadoEscucha: retirada
              ? null
              : {
                  desde: '2026-10-01',
                  hasta: '2026-10-02',
                  observaciones: 2,
                  ausencias: 'Faltan quienes trabajan de noche.',
                  limites: 'Dos encuentros no representan a todo el barrio.',
                  proximoPaso: 'Invitar también por la mañana.',
                },
          },
        ],
        siguiente: null,
      };
    else if (u.pathname.endsWith('/no-leidas')) data = { total: 0 };
    else
      return route.fulfill({
        status: 404,
        json: { error: { code: 'FIXTURE', message: 'Consulta no incluida en esta prueba.' } },
      });
    return route.fulfill({ json: { data } });
  });
  await page.goto('/campo');
  await page.getByText('Vincular la app nativa con mis tareas').click();
  await page.getByLabel('Nombre del teléfono').fill('Teléfono de campo');
  await page.getByRole('button', { name: 'Generar clave de campo' }).click();
  await expect(page.getByLabel('Clave de campo')).toHaveValue('a'.repeat(64));
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  }
  await page.getByRole('button', { name: 'Revocar Teléfono de campo' }).click();
  await expect(page.getByLabel('Clave de campo')).toHaveCount(0);
  await expect(page.getByText('Teléfono de campo · Revocado')).toBeVisible();
  await page.goto(`/fichas/${ficha.id}`);
  await expect(page.getByText('Horarios que faltan')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Ver tarea: Escuchar en la escuela' }),
  ).toHaveAttribute('href', '/iniciativas/escuela?seccion=tareas&tarea=31');
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await page
    .locator('#resultados-campo')
    .screenshot({ path: test.info().outputPath('devolucion-campo-movil.png') });
  retirada = true;
  await page.reload();
  await expect(page.getByText('Resultado retirado')).toBeVisible();
  await expect(page.getByText('Horarios que faltan')).toHaveCount(0);
  expect(errores).toEqual([]);
});
