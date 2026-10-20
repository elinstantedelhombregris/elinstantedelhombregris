import { readFile } from 'node:fs/promises';

import { expect, test } from '@playwright/test';

import { edicion as fixture } from '../../apps/web/src/pages/SintesisNacional/__tests__/fixtures';

import type { ContenidoSintesisNacional, EdicionSintesisNacional } from '@v2/shared';

const auth = (id: number) => ({
  id,
  username: id === 4 ? 'equipo' : 'revisora',
  email: 'fixture@test.local',
  name: 'Fixture',
  location: null,
  bio: null,
  avatarUrl: null,
  emailVerified: true,
  onboardingCompleted: true,
  createdAt: '2026-10-15',
  esAdmin: false,
});
test('conciliación legible, errores recuperables y ejemplo exploratorio', async ({
  page,
  context,
  baseURL,
}) => {
  const origen = new URL(baseURL ?? 'http://localhost:5173').origin;
  let falla = false;
  const errores: string[] = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await context.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (u.origin !== origen) return route.abort();
    if (!u.pathname.startsWith('/api/')) return route.continue();
    if (u.pathname === '/api/auth/me')
      return route.fulfill({
        status: 401,
        json: { error: { code: 'SIN_SESION', message: 'Sin sesión' } },
      });
    if (u.pathname === '/api/v1/conciliacion')
      return route.fulfill(
        falla
          ? {
              status: 503,
              json: { error: { code: 'FALLO', message: 'No se pudo consultar el catálogo' } },
            }
          : {
              json: {
                data: {
                  fecha: '2026-10-15T12:00:00Z',
                  versionCenso: 'indec-c2022-codigos-20261015-r1',
                  versionGeo: 'ign-20260922-eff8b13b48b0',
                  total: 1,
                  conDiferencias: 1,
                  sinCodigoSinAsignar: 10,
                  filtradas: 1,
                  siguiente: null,
                  fuentes: [],
                  filas: [
                    {
                      clave: '149998',
                      codigo: '149998',
                      censo: { nombre: 'Indeterminado', fila: 2, residual: true },
                      geometria: null,
                      operativo: null,
                      incidencias: ['Categoría residual: no es un gobierno local identificable'],
                    },
                  ],
                },
              },
            },
      );
    return route.fulfill({
      status: 404,
      json: { error: { code: 'FIXTURE', message: 'Fuera de esta prueba' } },
    });
  });
  await page.goto('/conciliacion-territorial');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Conciliación territorial y censal' }),
  ).toBeVisible();
  await expect(
    page.getByText('Categoría residual: no es un gobierno local identificable', { exact: true }),
  ).toBeVisible();
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  }
  falla = true;
  await page.getByRole('combobox', { name: 'Unidad', exact: true }).selectOption('department');
  await expect(page.getByRole('alert').filter({ hasText: 'No pudimos completar' })).toBeVisible();
  falla = false;
  await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
  await expect(page.getByText(/1 registros en este alcance/)).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: test.info().outputPath('conciliacion-movil.png') });
  await page.goto('/sintesis-nacional/ejemplo');
  await page.getByRole('button', { name: 'Conseguir un turno' }).click();
  await expect(page.getByText(/Distinguir acceso a internet/)).toBeVisible();
  await page.getByText('Explorar disponibilidad para esta alternativa', { exact: true }).click();
  await page.getByRole('button', { name: 'Comparar capacidad y sensibilidad' }).click();
  await expect(
    page.getByText('6–6 actividades; 36–36 plazas posibles.', { exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
  expect(errores).toEqual([]);
});

test('preparar, revisar con otra cuenta, descargar y retirar una edición', async ({
  page,
  context,
  baseURL,
}) => {
  const origen = new URL(baseURL ?? 'http://localhost:5173').origin;
  let usuario = 4;
  let actual: EdicionSintesisNacional = {
    ...fixture,
    estado: 'pendiente',
    revisadaEn: null,
    revisor: null,
  };
  const errores: string[] = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await context.route('**/*', async (route) => {
    const u = new URL(route.request().url());
    if (u.origin !== origen) return route.abort();
    if (!u.pathname.startsWith('/api/')) return route.continue();
    if (u.pathname === '/api/auth/me')
      return route.fulfill({ json: { data: { user: auth(usuario) } } });
    if (u.pathname === '/api/v1/fichas/vision')
      return route.fulfill({
        json: {
          data: {
            fichas: [
              {
                id: fixture.apoyos[0]?.fichaId,
                titulo: 'Agua en casa',
                revision: 2,
                objetivos: [fixture.apoyos[0]?.objetivo],
              },
            ],
            total: 1,
            territorios: 1,
            objetivos: 1,
            siguiente: null,
            fecha: '2026-10-15',
          },
        },
      });
    if (u.pathname === '/api/v1/sintesis-nacional' && route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as { contenido: ContenidoSintesisNacional };
      actual = { ...actual, contenido: body.contenido };
      return route.fulfill({ status: 201, json: { data: { id: actual.id } } });
    }
    if (u.pathname === `/api/v1/sintesis-nacional/${actual.id}/acciones`) {
      const body = route.request().postDataJSON() as { accion: string };
      actual =
        body.accion === 'revisar'
          ? {
              ...actual,
              estado: 'revisada',
              revisadaEn: '2026-10-15T14:00:00Z',
              revisor: 'revisora',
            }
          : { ...actual, estado: 'retirada', contenido: null, apoyos: [] };
      return route.fulfill({ json: { data: { aplicada: true } } });
    }
    if (u.pathname === `/api/v1/sintesis-nacional/${actual.id}`)
      return route.fulfill({
        json: {
          data: {
            ...actual,
            puedoRevisar: usuario === 5 && actual.estado === 'pendiente',
            puedoRetirar: actual.estado !== 'retirada',
            puedoDerivar: usuario === 4,
          },
        },
      });
    return route.fulfill({
      status: 404,
      json: { error: { code: 'FIXTURE', message: 'Fuera de esta prueba' } },
    });
  });
  await page.goto('/sintesis-nacional/nueva');
  await page
    .getByLabel('Título', { exact: true })
    .fill('Agua continua para las zonas participantes');
  for (const label of [
    'A quiénes comprende',
    'Por qué elegiste estos objetivos',
    'Cómo se elaboró',
    'Quiénes y qué faltan',
  ])
    await page
      .getByLabel(label, { exact: false })
      .fill('Selección de equipos participantes con ausencias documentadas.');
  await page.getByLabel('Fecha de próxima revisión', { exact: true }).fill('2099-01-01');
  await page.getByRole('checkbox', { name: 'Reducir los cortes de agua' }).check();
  for (const label of [
    'Diferencias entre territorios',
    'Recursos disponibles y limitantes',
    'Alternativas consideradas',
    'Disensos, tensiones y posibles perjudicados',
    'Próxima tarea, responsables propuestos y revisión',
  ])
    await page
      .getByLabel(label, { exact: true })
      .fill('Descripción revisable de la situación y los pasos pendientes.');
  await page.getByRole('button', { name: 'Guardar edición para revisión' }).click();
  await expect(page).toHaveURL(new RegExp(fixture.id));
  await expect(page.getByText('Pendiente de otra revisión', { exact: true })).toBeVisible();
  expect(await page.getByRole('button', { name: 'Confirmar revisión del equipo' }).count()).toBe(0);
  usuario = 5;
  await page.reload();
  await page.getByRole('button', { name: 'Confirmar revisión del equipo' }).click();
  await expect(
    page.getByText('Revisada por el equipo participante', { exact: true }),
  ).toBeVisible();
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: test.info().outputPath('sintesis-movil.png') });
  const descarga = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar edición citable (JSON)' }).click();
  const archivo = await (await descarga).path();
  if (!archivo) throw new Error('No se descargó la edición');
  const contenido = JSON.parse(await readFile(archivo, 'utf8')) as {
    id: string;
    estado: string;
    cita: string;
  };
  expect(contenido).toMatchObject({ id: fixture.id, estado: 'revisada' });
  expect(contenido.cita).toContain(`/sintesis-nacional/${fixture.id}`);
  await page.getByText('Retirar esta edición', { exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar retiro', exact: true }).click();
  await expect(page.getByText('Edición retirada', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Agua continua para las zonas participantes' }),
  ).toHaveCount(0);
  expect(errores).toEqual([]);
});
