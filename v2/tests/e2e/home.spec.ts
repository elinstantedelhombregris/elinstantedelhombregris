import { expect, test } from '@playwright/test';

test.describe('public home', () => {
  test('renders the ¡BASTA! hero', async ({ page }) => {
    await page.goto('/');
    // El título es el de la landing «Papel y Tinta» (apps/web/index.html). Esta
    // aserción esperaba «El Instante del Hombre Gris» y quedó vieja con ese
    // rediseño; no se vio durante seis semanas porque el job de e2e quedaba
    // «skipped» detrás de un lint en rojo.
    await expect(page).toHaveTitle(/¡BASTA!/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/¡BASTA!/i);
    // Los dos CTA de la landing. «Leer el manifiesto» y «Crear cuenta» eran los de
    // la versión anterior y ya no existen: hoy la primera acción es dejar una voz
    // en el mapa, no registrarse.
    await expect(page.getByRole('main').getByRole('link', { name: /Dejar mi voz en el mapa/i }).first()).toBeVisible();
    await expect(page.getByRole('main').getByRole('link', { name: /Entender la idea/i }).first()).toBeVisible();
  });

  test('shows 404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText(/No encontramos esa página/i)).toBeVisible();
  });
});
