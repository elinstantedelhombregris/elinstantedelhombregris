import { expect, test } from '@playwright/test';

test('informe espacial íntegro, filtros y lectura en móvil', async ({ page, context, baseURL }) => {
  const origen = new URL(baseURL ?? 'http://localhost:5173').origin;
  const errores: string[] = [];
  page.on('pageerror', e => errores.push(e.message));
  await context.route('**/*', async route => {
    const u = new URL(route.request().url());
    if (u.origin !== origen) return route.abort();
    if (!u.pathname.startsWith('/api/')) return route.continue();
    return route.fulfill({ status: 401, json: { error: { code: 'UNAUTHORIZED', message: 'Sin sesión en esta prueba.' } } });
  });
  await page.goto('/validacion-espacial');
  await expect(page.getByRole('heading', { name: '11 polígonos necesitan corrección' })).toBeVisible();
  await expect(page.getByText('Buenos Aires (06)', { exact: true })).toBeVisible();
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  await page.getByLabel('Tipo de control').selectOption('solapamiento');
  await page.getByRole('combobox', { name: 'Capa', exact: true }).selectOption('municipios');
  await expect(page.getByRole('button', { name: 'Siguiente', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click();
  await page.getByLabel('Nombre o código').fill('no-existe');
  await expect(page.getByText(/Esto no significa que se hayan comprobado/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Anterior', exact: true })).toBeDisabled();
  await page.getByText('Método, exclusiones y archivos', { exact: true }).click();
  const download = page.getByRole('link', { name: 'Descargar informe completo (JSON)' });
  await expect(download).toHaveAttribute('href', /\/geo\/validaciones\/ign-.*\.json$/);
  await page.getByLabel('Nombre o código').fill('');
  await page.getByRole('combobox', { name: 'Capa', exact: true }).selectOption('');
  await page.getByLabel('Tipo de control').selectOption('geometria_invalida');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { window.scrollTo(0,0); });
  await page.screenshot({ path: '/private/tmp/validacion-espacial-movil.png' });
  expect(errores).toEqual([]);
});

test('un informe alterado se rechaza sin mostrar resultados', async ({ page, context }) => {
  await context.route('**/api/**', route => route.fulfill({ status: 401, json: { error: { code: 'UNAUTHORIZED', message: 'Prueba' } } }));
  await context.route('**/geo/validaciones/**/*.json', route => route.fulfill({ status: 200, json: { estado: 'sin_hallazgos_en_estos_controles' } }));
  await page.goto('/validacion-espacial');
  await expect(page.getByRole('alert').filter({ hasText: 'La huella del informe no coincide' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '11 polígonos necesitan corrección' })).not.toBeVisible();
});
