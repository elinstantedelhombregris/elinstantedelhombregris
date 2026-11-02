import { expect, test } from '@playwright/test';

test.describe('public home', () => {
  test('renders the ¡BASTA! hero', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Cerrar e ir a la landing' })
      .click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
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
    await expect(
      page.getByRole('main').getByRole('button', { name: 'Seguir', exact: true }),
    ).toBeVisible();
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
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /Seguir mi camino/i })
      .click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const campo = page
      .getByRole('main')
      .getByRole('textbox', { name: 'En tu Argentina ideal, ¿qué sería posible en tu vida?' });
    await expect(campo).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    await page.getByRole('main').getByRole('button', { name: 'Seguir', exact: true }).click();
    await expect(page.getByText('Escribí aunque sea una frase para seguir.')).toBeVisible();
    await campo.fill('Que el tren vuelva a parar en mi pueblo.');
    await page.getByRole('main').getByRole('button', { name: 'Seguir', exact: true }).click();
    await expect(page).toHaveURL(/\/mi-argentina-ideal\/imaginar$/);
  });

  test('la bienvenida enlaza una cita real y Escape deja la portada disponible', async ({
    page,
  }) => {
    await page.goto('/');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.pt-edition')).toHaveText(/\d{2} \/ 50/);
    const portrait = await dialog.locator('.pt-figure').boundingBox();
    const message = await dialog.locator('.pt-message').boundingBox();
    expect(portrait).not.toBeNull();
    expect(message).not.toBeNull();
    if (!portrait || !message) throw new Error('La bienvenida no mostró el retrato y la cita.');
    expect(portrait.x + portrait.width).toBeLessThanOrEqual(message.x + 1);
    await expect(dialog.locator('blockquote')).toHaveCSS('font-family', /Anton/);
    await expect(dialog.getByRole('link', { name: /Leer el texto/i })).toHaveAttribute(
      'href',
      /^\/(manifiesto$|bitacora\/|ensayos\/)/,
    );
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/La ciudadanía diseña/i);
    await page
      .getByRole('main')
      .getByRole('link', { name: /Cómo funciona/i })
      .click();
    await expect(page).toHaveURL(/\/la-idea$/);
    await page.getByRole('link', { name: '¡BASTA! — inicio', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/La ciudadanía diseña/i);
    await expect(dialog).toHaveCount(0);
  });

  test('shows 404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText(/No encontramos esa página/i)).toBeVisible();
  });
});
