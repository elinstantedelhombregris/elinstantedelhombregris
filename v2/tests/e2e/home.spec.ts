import { expect, test } from '@playwright/test';

test.describe('public home', () => {
  test('renders the ¡BASTA! hero', async ({ page }) => {
    await page.goto('/');
    // El título es el de la landing «Papel y Tinta» (apps/web/index.html).
    await expect(page).toHaveTitle(/¡BASTA!/i);
    // El h1 es la idea de la landing: la ciudadanía diseña, el Estado administra,
    // la política ejecuta. «¡BASTA!» es el rótulo gigante de arriba, no el h1.
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/La ciudadanía diseña/i);
    // La pregunta y su campo viven en la portada: se escribe acá y «Seguir» abre
    // Imaginar. Al lado, la explicación del ejercicio.
    const campo = page
      .getByRole('main')
      .getByRole('textbox', { name: 'En tu Argentina ideal, ¿qué sería posible en tu vida?' });
    await expect(campo).toBeVisible();
    await expect(page.getByRole('main').getByRole('button', { name: 'Seguir' })).toBeVisible();
    await expect(
      page
        .getByRole('main')
        .getByRole('link', { name: /Cómo funciona/i })
        .first(),
    ).toBeVisible();
  });

  test('en el teléfono la pregunta y el campo están en la primera pantalla, y «Seguir» abre Imaginar', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const campo = page
      .getByRole('main')
      .getByRole('textbox', { name: 'En tu Argentina ideal, ¿qué sería posible en tu vida?' });
    await expect(campo).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    await page.getByRole('main').getByRole('button', { name: 'Seguir' }).click();
    await expect(page.getByText('Escribí aunque sea una frase para seguir.')).toBeVisible();
    await campo.fill('Que el tren vuelva a parar en mi pueblo.');
    await page.getByRole('main').getByRole('button', { name: 'Seguir' }).click();
    await expect(page).toHaveURL(/\/mi-argentina-ideal\/imaginar$/);
  });

  test('shows 404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText(/No encontramos esa página/i)).toBeVisible();
  });
});
