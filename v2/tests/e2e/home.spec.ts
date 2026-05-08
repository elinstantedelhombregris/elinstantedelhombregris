import { expect, test } from '@playwright/test';

test.describe('public home', () => {
  test('renders the ¡BASTA! hero', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/El Instante del Hombre Gris/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/El Instante/i);
    await expect(page.getByRole('link', { name: /Leer el manifiesto/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Crear cuenta/i })).toBeVisible();
  });

  test('shows 404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText(/No encontramos esa página/i)).toBeVisible();
  });
});
