import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

/**
 * Entrar con Google del lado del navegador, con la API interceptada (spec
 * 2026-10-27-ingreso-con-google.md). La dirección que se arma para Google y la vuelta las
 * prueba la integración contra un Google falso; acá se prueba lo que ve la persona: el botón,
 * el «Último paso» y el mensaje cuando vuelve sin entrar.
 */
async function simularApi(page: Page) {
  const altas: unknown[] = [];
  await page.context().route('**/api/**', async (route) => {
    const req = route.request();
    const ruta = new URL(req.url()).pathname;
    if (ruta === '/api/auth/me')
      return route.fulfill({
        status: 401,
        json: { error: { code: 'UNAUTHENTICATED', message: 'Sin sesión' } },
      });
    if (ruta === '/api/auth/proveedores')
      return route.fulfill({ json: { data: { google: true } } });
    if (ruta === '/api/auth/google/alta' && req.method() === 'GET')
      return route.fulfill({
        json: { data: { correo: 'ana.perez@gmail.com', sugerencia: 'ana_perez' } },
      });
    if (ruta === '/api/auth/google/alta' && req.method() === 'POST') {
      altas.push(req.postDataJSON());
      return route.fulfill({
        status: 201,
        json: {
          data: {
            user: { id: 9, username: 'ana_perez', email: 'ana.perez@gmail.com', name: 'Ana' },
            csrfToken: 'x',
            volver: '/campanas',
          },
        },
      });
    }
    return route.fulfill({ status: 404, json: { error: { code: 'NO', message: 'No está.' } } });
  });
  return altas;
}

const sinScrollHorizontal = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

test('el botón de Google va a la API con el retorno, en ingresar y en crear la cuenta', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await simularApi(page);
  await page.goto('/ingresar?volver=%2Fcampanas');
  await expect(page.getByRole('link', { name: 'Continuar con Google' })).toHaveAttribute(
    'href',
    '/api/auth/google?volver=%2Fcampanas',
  );
  await expect(page.getByText('o con tu correo')).toBeVisible();
  expect(await sinScrollHorizontal(page)).toBe(true);
  await page.goto('/registrarse?volver=%2Fcampanas');
  await expect(page.getByRole('link', { name: 'Continuar con Google' })).toBeVisible();
});

test('al volver de Google sin entrar, ingresar dice por qué', async ({ page }) => {
  await simularApi(page);
  await page.goto('/ingresar?error=google_sin_verificar');
  await expect(page.getByRole('alert')).toContainText('Google no tiene verificado el correo');
});

test('«Último paso»: el usuario sugerido, el nombre y la vuelta a donde estaba', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const altas = await simularApi(page);
  await page.goto('/registrarse/google?volver=%2Fcampanas');
  await expect(page.getByText('ana.perez@gmail.com')).toBeVisible();
  await expect(page.getByLabel('Usuario')).toHaveValue('ana_perez');
  await page.getByLabel('Nombre').fill('Ana');
  expect(await sinScrollHorizontal(page)).toBe(true);
  await page.getByRole('button', { name: 'Crear mi cuenta' }).click();
  await expect(page).toHaveURL(/\/campanas$/);
  expect(altas).toEqual([{ username: 'ana_perez', name: 'Ana' }]);
});
