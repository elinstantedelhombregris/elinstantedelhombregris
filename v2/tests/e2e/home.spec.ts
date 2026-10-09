import { expect, test } from '@playwright/test';

test.describe('public home', () => {
  test('renders the ¡BASTA! hero', async ({ page }) => {
    await page.goto('/');
    // El título es el de la landing «Papel y Tinta» (apps/web/index.html).
    await expect(page).toHaveTitle(/¡BASTA!/i);
    // El h1 es la idea de la landing: la ciudadanía diseña, el Estado administra,
    // la política ejecuta. «¡BASTA!» es el rótulo gigante de arriba, no el h1.
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/La ciudadanía diseña/i);
    // Los dos enlaces de la primera pantalla: la invitación a imaginar (que abre el
    // panel de aportes del mapa) y la explicación del ejercicio.
    await expect(
      page.getByRole('main').getByRole('link', { name: 'Imaginar mi Argentina' }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('main').getByRole('link', { name: /Cómo funciona el ejercicio/i }).first(),
    ).toBeVisible();
  });

  test('shows 404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText(/No encontramos esa página/i)).toBeVisible();
  });
});
