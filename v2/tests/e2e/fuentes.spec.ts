import { expect, test } from '@playwright/test';

test('fuentes citables, geografía con versión y entrada para imaginar', async ({
  page,
  context,
  baseURL,
}) => {
  const origen = new URL(baseURL ?? 'http://localhost:5173').origin;
  const errores: string[] = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await context.route('**/*', async (route) => {
    const u = new URL(route.request().url());
    if (u.origin !== origen) return route.abort();
    if (!u.pathname.startsWith('/api/')) return route.continue();
    if (u.pathname === '/api/auth/me')
      return route.fulfill({
        status: 401,
        json: { error: { code: 'UNAUTHORIZED', message: 'Sin sesión en esta prueba.' } },
      });
    return route.fulfill({
      status: 404,
      json: { error: { code: 'FIXTURE', message: 'Consulta no incluida en la prueba.' } },
    });
  });
  await page.goto('/fuentes');
  await expect(page.getByRole('heading', { level: 1, name: 'Fuentes y geografía' })).toBeVisible();
  await expect(page.getByText('83,9 %', { exact: true })).toBeVisible();
  await page.getByText('Comprobar el original y citar esta selección').click();
  const edicion = page.getByRole('link', { name: 'Enlace a esta edición' });
  await expect(edicion).toHaveAttribute('href', '/fuentes?version=indec-cnphv2022-20240927-r1');
  await edicion.click();
  await expect(page.getByText('83,9 %', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Descargar provincias', exact: true }),
  ).toHaveAttribute('href', /\/geo\/versiones\/ign-\d{8}-[a-f0-9]{12}\/provincias.geojson/);
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: '/private/tmp/fuentes-movil.png' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('link', { name: 'Sumate', exact: true }).first().click();
  // «Sumate» lleva a Imaginar, en Mi Argentina ideal: el mapa ya no abre un panel para eso.
  await expect(page).toHaveURL(/\/mi-argentina-ideal\/imaginar/);
  await page.goto('/el-mapa');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Cómo está hoy lo que imaginamos' }),
  ).toBeAttached();
  await page.goto('/fuentes?version=no-existe');
  await expect(
    page.getByRole('alert').filter({ hasText: 'Esta edición del catálogo no está disponible' }),
  ).toBeVisible();
  expect(errores).toEqual([]);
});
