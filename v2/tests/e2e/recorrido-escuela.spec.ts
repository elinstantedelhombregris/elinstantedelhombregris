import { expect, test } from '@playwright/test';

import {
  iniciativa,
  permisos,
  tarea,
} from '../../apps/web/src/pages/Iniciativas/__tests__/fixtures';

test('el ejemplo escolar completa el ciclo en móvil sin escrituras y conserva el desacuerdo', async ({
  page,
  context,
}) => {
  const escrituras: string[] = [];
  await context.route('**/api/**', async (route) => {
    if (route.request().method() !== 'GET') escrituras.push(route.request().url());
    return route.fulfill({
      status: 401,
      json: { error: { code: 'UNAUTHORIZED', message: 'Prueba aislada' } },
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/recorridos/llegar-a-tiempo-a-la-escuela');
  await expect(
    page.getByRole('heading', { name: 'Llegar a tiempo a la escuela', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: '4. Sumarse y vincular' }).click();
  await page.getByLabel('Ficha de ejemplo donde devolver los resultados').selectOption('escuela');
  await page.getByRole('button', { name: 'Simular vínculo con la ficha' }).click();
  await page.getByRole('button', { name: 'Simular ingreso al equipo' }).click();
  await page.getByRole('button', { name: 'Simular aceptación personal' }).click();
  await page.getByRole('button', { name: '5. Hacer y registrar' }).click();
  await page.getByRole('button', { name: 'Iniciar tarea de ejemplo' }).click();
  await page.getByRole('button', { name: 'Declarar registro realizado' }).click();
  await page.getByRole('button', { name: '6. Revisar el resultado' }).click();
  await page.getByRole('button', { name: 'Simular revisión de otra cuenta' }).click();
  await page.getByRole('button', { name: '7. Devolver y aprender' }).click();
  await page.getByRole('button', { name: 'Simular devolución a participantes' }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Ciclo de ejemplo completado' }),
  ).toBeVisible();
  await expect(page.getByText('Desacuerdo que se conserva:')).toBeVisible();
  expect(escrituras).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: '/private/tmp/escuela-movil.png', fullPage: true });
});

test('una persona sin cuenta descubre una tarea y el ingreso conserva su destino', async ({
  page,
  context,
}) => {
  await context.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    if (route.request().method() !== 'GET') throw new Error('Escritura inesperada');
    let data: unknown = {};
    if (url.pathname === '/api/auth/me')
      return route.fulfill({ status: 401, json: { error: { message: 'Sin sesión' } } });
    if (url.pathname === '/api/iniciativas/tareas-disponibles')
      data = {
        items: [
          {
            id: tarea.id,
            titulo: tarea.titulo,
            alcance: tarea.alcance,
            recursos: tarea.recursos,
            fecha: tarea.fecha,
            iniciativaSlug: iniciativa.slug,
            iniciativaTitulo: iniciativa.title,
            fichaId: null,
            fichaTitulo: null,
          },
        ],
        siguiente: null,
      };
    else if (url.pathname === '/api/iniciativas/escuela')
      data = {
        iniciativa,
        permisos: { ...permisos, miembro: false, administrar: false, propietario: false },
      };
    else if (url.pathname === '/api/iniciativas/10/tareas')
      data = { items: [{ ...tarea, puedoAceptar: false }], siguiente: null };
    else if (url.pathname.endsWith('/ficha')) data = null;
    return route.fulfill({ json: { data } });
  });
  await page.goto('/iniciativas');
  await page.getByRole('link', { name: 'Ver tarea y cómo sumarme' }).click();
  await expect(page).toHaveURL(/iniciativas\/escuela\?seccion=tareas&tarea=31/);
  await expect(
    page.getByRole('link', { name: 'Ingresá para sumarte a esta tarea' }),
  ).toHaveAttribute('href', /volver=%2Finiciativas%2Fescuela%3Fseccion%3Dtareas%26tarea%3D31/);
});

test('la administración elige una ficha sin pegar enlaces y una persona acepta la tarea', async ({
  page,
  context,
  baseURL,
}) => {
  const fichaId = '00000000-0000-4000-8000-000000000001';
  let revision = 1,
    vinculada = false,
    aceptada = false;
  const escrituras: string[] = [];
  await context.addCookies([
    { name: 'eihg_csrf', value: 'fixture', url: baseURL ?? 'http://localhost:5173' },
  ]);
  await context.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    if (route.request().method() !== 'GET') {
      escrituras.push(url.pathname);
      if (url.pathname.endsWith('/ficha')) {
        expect(route.request().postDataJSON()).toMatchObject({ fichaId, revision });
        vinculada = true;
      } else if (url.pathname.endsWith('/estado')) {
        expect(route.request().postDataJSON()).toMatchObject({ accion: 'aceptar', revision });
        aceptada = true;
      } else throw new Error('Escritura inesperada');
      revision++;
      return route.fulfill({ json: { data: { id: 31 } } });
    }
    let data: unknown = {};
    if (url.pathname === '/api/auth/me')
      data = {
        user: {
          id: 1,
          username: 'prueba',
          email: 'fixture@example.test',
          name: 'Prueba local',
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
            revision,
            puedoAceptar: !aceptada,
            puedoGestionar: aceptada,
            firma: aceptada ? 'Participante' : null,
          },
        ],
        siguiente: null,
      };
    else if (url.pathname.endsWith('/ficha'))
      data = vinculada ? { fichaId, titulo: 'Llegar a tiempo a la escuela' } : null;
    else if (url.pathname === '/api/v1/fichas/editables')
      data = {
        items: [
          { id: fichaId, titulo: 'Llegar a tiempo a la escuela', territorio: 'Zona de ejemplo' },
        ],
        siguiente: null,
      };
    else if (url.pathname.endsWith('/no-leidas')) data = { total: 0 };
    return route.fulfill({ json: { data } });
  });
  await page.goto('/iniciativas/escuela?seccion=tareas&tarea=31');
  await page.getByText('Elegir ficha de devolución', { exact: true }).click();
  await page.getByLabel('Ficha donde devolver los resultados').selectOption(fichaId);
  await page.getByLabel('Revisé la ficha elegida y quiero vincular esta tarea.').check();
  await page.getByRole('button', { name: 'Guardar destino' }).click();
  await expect(
    page.getByRole('link', { name: 'Llegar a tiempo a la escuela', exact: true }),
  ).toBeVisible();
  await page.getByLabel('Mi firma pública').fill('Participante');
  await page
    .getByLabel('Cómo me organizo para cumplir esta tarea')
    .fill('Puedo dedicar una hora a contrastar horarios.');
  // El destino cambió la revisión de la tarea: la aceptación requiere releerla.
  await page.getByRole('button', { name: 'Revisé la nueva versión' }).first().click();
  await page.getByRole('button', { name: 'Acepto hacerme cargo de esta tarea' }).click();
  await expect(page.getByText(/Responsable: Participante/)).toBeVisible();
  expect(escrituras).toEqual([
    '/api/iniciativas/10/tareas/31/ficha',
    '/api/iniciativas/10/tareas/31/estado',
  ]);
});
