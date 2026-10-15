import { expect, test } from '@playwright/test';
import { envioCampoSchema } from '@v2/shared';

import {
  iniciativa,
  permisos,
  tarea,
} from '../../apps/web/src/pages/Iniciativas/__tests__/fixtures';

/** Todas las API son simuladas: nunca escribe contra el proxy del servidor de desarrollo. */
test('campo conserva borradores sin red y reconcilia un envío sin publicar las notas', async ({
  page,
  context,
  baseURL,
}) => {
  test.setTimeout(60_000);
  const origen = new URL(baseURL ?? 'http://localhost:5173').origin;
  const sobres: string[] = [];
  let usuarioId = 7;
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== origen) return route.abort();
    if (!url.pathname.startsWith('/api/')) return route.continue();
    if (route.request().method() === 'POST') {
      if (!url.pathname.endsWith('/campo'))
        throw new Error('Escritura inesperada en prueba de campo');
      const sobre = envioCampoSchema.parse(route.request().postDataJSON());
      sobres.push(JSON.stringify(sobre));
      if (sobres.length === 1) return route.abort('connectionreset');
      return route.fulfill({ json: { data: { id: 91 } } });
    }
    let data: unknown = {};
    if (url.pathname === '/api/auth/me')
      data = {
        user: {
          id: usuarioId,
          username: 'campo-fixture',
          email: 'fixture@example.test',
          name: 'Campo local',
          emailVerified: true,
          onboardingCompleted: true,
          esAdmin: false,
        },
      };
    else if (url.pathname === '/api/iniciativas/escuela') data = { iniciativa, permisos };
    else if (url.pathname === '/api/iniciativas/10/tareas')
      data = {
        items: [
          {
            ...tarea,
            estado: 'in_progress',
            puedoGestionar: true,
            puedoAceptar: false,
            revision: 3,
          },
        ],
        siguiente: null,
      };
    else if (url.pathname === '/api/v1/contribuciones/contexto')
      data = { csrfToken: 'fixture', temas: [] };
    else if (url.pathname === '/api/campo/dispositivos') data = [];
    else if (url.pathname.endsWith('/ficha')) data = null;
    else if (url.pathname.endsWith('/no-leidas')) data = { total: 0 };
    else if (url.pathname.includes('/exportaciones/'))
      data = { registros: [], siguiente: null, total: 0 };
    else if (url.pathname === '/api/open-data/provinces') data = { provinces: [] };
    return route.fulfill({ json: { data } });
  });
  await page.goto('/iniciativas/escuela?seccion=tareas&tarea=31');
  await page.getByRole('button', { name: 'Abrir cuaderno de campo' }).click();
  const campos = {
    'Notas privadas de campo': 'Nota privada que nunca entra al envío.',
    'Nombre del resultado': 'Horarios para escuchar',
    'Resumen público y método usado':
      'Conversamos en dos encuentros y registramos los límites del método.',
    'Inicio del período observado': '2026-10-01',
    'Fin del período observado': '2026-10-02',
    'Número de encuentros u observaciones': '2',
    'A quiénes faltó escuchar': 'Quienes trabajan por la noche.',
    'Límites del método y de la invitación': 'Dos encuentros no describen a toda la zona.',
    'Próximo paso de escucha': 'Invitar también por la mañana.',
  };
  for (const [etiqueta, valor] of Object.entries(campos))
    await page.getByLabel(etiqueta, { exact: true }).fill(valor);
  await page.getByRole('button', { name: 'Guardar borrador local' }).click();
  await expect(page.getByText(/Tenés cambios sin guardar/)).toHaveCount(0);
  await page.reload();
  await expect(page.getByLabel('Notas privadas de campo')).toHaveValue(
    campos['Notas privadas de campo'],
  );
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  }
  await context.setOffline(true);
  await page.getByLabel('Notas privadas de campo').fill('Nota privada escrita sin red.');
  await page.getByRole('button', { name: 'Guardar borrador local' }).click();
  await expect(page.getByText(/Tenés cambios sin guardar/)).toHaveCount(0);
  await page.getByLabel(/Realicé la escucha/).check();
  await page.getByLabel(/Revisé el resumen/).check();
  await page.getByRole('button', { name: 'Autorizar resumen y poner en cola' }).click();
  await expect(page.getByText(/Autorizado para enviar · tarea/)).toBeVisible();
  await page.getByRole('button', { name: 'Sincronizar resúmenes autorizados' }).click();
  await expect(page.getByText(/Pendiente de reintento · tarea/)).toBeVisible();
  await context.setOffline(false);
  // El primer envío que alcanza la API simula una recepción cuya respuesta se perdió.
  await page.getByRole('button', { name: 'Sincronizar resúmenes autorizados' }).click();
  await expect.poll(() => sobres.length).toBeGreaterThanOrEqual(1);
  await expect(page.getByText(/Pendiente de reintento · tarea/)).toBeVisible();
  await page.getByRole('button', { name: 'Sincronizar resúmenes autorizados' }).click();
  await expect(page.getByText(/Recibo de evidencia #91/)).toBeVisible();
  expect(sobres.length).toBeGreaterThanOrEqual(2);
  expect(new Set(sobres).size).toBe(1);
  expect(sobres.join()).not.toContain('Nota privada');
  usuarioId = 8;
  await page.reload();
  await expect(page.getByText(/No hay cuadernos para esta cuenta/)).toBeVisible();
  await expect(page.getByText(/Nota privada escrita/)).toHaveCount(0);
});
