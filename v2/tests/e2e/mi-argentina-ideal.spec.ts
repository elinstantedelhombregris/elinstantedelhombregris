import { expect, test } from '@playwright/test';

import type { Locator, Page } from '@playwright/test';
import type { TandaPila, TarjetaPila, VisionCampana } from '@v2/shared';

/**
 * Mi Argentina ideal de punta a punta: Ver → Imaginar → Mirar, con la API interceptada.
 * Nada sale del navegador: cada pedido lo contesta `simularApi` y queda anotado para
 * comprobar qué se mandó.
 */

const CAMPANA = 'e2d1c0b9-5a41-4f3e-9b7c-1a2b3c4d5e6f';
const PREGUNTA = 'En tu Argentina ideal, ¿qué sería posible en tu vida?';
const ESCRITO =
  'Que un turno en el hospital no tarde tres meses. Y que haya médicos en la salita del barrio.';

const TEMAS = [
  { clave: 'salud', etiqueta: 'Salud' },
  { clave: 'trabajo', etiqueta: 'Trabajo' },
  { clave: 'educación', etiqueta: 'Educación' },
  { clave: 'vivienda', etiqueta: 'Vivienda' },
];
const PROVINCIAS = [
  { id: 17, name: 'Salta', isoCode: 'AR-A' },
  { id: 2, name: 'Ciudad Autónoma de Buenos Aires', isoCode: 'AR-C' },
  { id: 14, name: 'Córdoba', isoCode: 'AR-X' },
];
const NACIONAL = {
  id: CAMPANA,
  slug: 'mi-argentina-ideal',
  revision: 1,
  estado: 'abierta',
  contrato: {
    titulo: 'Mi Argentina ideal',
    pregunta: PREGUNTA,
    responsable: 'Juan Bravin',
    fechaDevolucion: '2027-03-15',
  },
};
const RECIBO = {
  idPublico: '0f5f6b5a-1c2d-4e3f-8a9b-0c1d2e3f4a5b',
  estado: 'enviada',
  tipo: 'sueño',
  precisionPublicada: 'province',
  yaExistia: false,
  avisos: [],
  contexto: { campanaId: CAMPANA, edicion: 1 },
};

const REGIONES = ['NOA', 'NEA', 'Cuyo', 'Centro', 'Buenos Aires', 'Patagonia'] as const;
const VISION_EN_CERO: VisionCampana = {
  campana: {
    id: CAMPANA,
    slug: 'mi-argentina-ideal',
    titulo: 'Mi Argentina ideal',
    edicion: 1,
    recibeHasta: null,
    devolucion: null,
  },
  cifras: { personas: 0, opiniones: 0, provincias: 0 },
  enDiscusion: 0,
  une: [],
  primero: [],
  divide: [],
  temas: TEMAS.map((t) => ({ ...t, aporte: null })),
  regiones: REGIONES.map((region) => ({ region, personas: 0, cuentaEn: 0 })),
  provincias: [],
  recien: [],
  tuyo: null,
  miRegion: null,
  calculadaEn: '2026-10-20T12:00:00-03:00',
};

const idDe = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const tarjeta = (n: number): TarjetaPila => ({
  id: idDe(n),
  texto: `Que en mi pueblo haya ${String(n)} cosas que hoy no hay`,
  origen: null,
  provincia: { id: 17, nombre: 'Salta' },
  tema: { clave: 'salud', etiqueta: 'Salud' },
});
const tandaDe = (cuantas: number, yaAporto = true): TandaPila => ({
  tarjetas: Array.from({ length: cuantas }, (_, i) => tarjeta(i + 1)),
  estado: {
    provincia: { id: 17, nombre: 'Salta' },
    preguntarProvincia: false,
    yaAporto,
    paresComparados: [],
    acuerdos: [],
  },
});

interface Pedido {
  metodo: string;
  ruta: string;
  cuerpo: unknown;
}

/** Contesta la API entera desde el navegador y devuelve lo que se pidió. */
async function simularApi(page: Page, tanda: TandaPila) {
  const pedidos: Pedido[] = [];
  const desconocidas = new Set<string>();
  await page.context().route('**/api/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const ruta = url.pathname;
    const metodo = req.method();
    const cuerpo: unknown = req.postData() ? req.postDataJSON() : undefined;
    pedidos.push({ metodo, ruta, cuerpo });
    const dar = (data: unknown, status = 200) => route.fulfill({ status, json: { data } });
    const negar = (status: number, code: string) =>
      route.fulfill({ status, json: { error: { code, message: 'Prueba aislada' } } });

    if (ruta === '/api/auth/me') return negar(401, 'UNAUTHORIZED');
    if (ruta === '/api/v1/contribuciones/contexto')
      return dar({ csrfToken: 'token-de-prueba', temas: TEMAS, proveedor: null });
    if (ruta.startsWith('/api/v1/campanas/mi-argentina-ideal')) return dar(NACIONAL);
    if (ruta === '/api/open-data/provinces') return dar({ provinces: PROVINCIAS });
    if (ruta === '/api/v1/vision' && metodo === 'GET') return dar(VISION_EN_CERO);
    if (ruta === '/api/v1/vision/parecidos') return dar([]);
    if (ruta === '/api/v1/contribuciones' && metodo === 'POST') return dar(RECIBO, 201);
    if (ruta === '/api/v1/pila/tandas') return dar(tanda);
    if (ruta.startsWith('/api/v1/pila/opiniones/'))
      return dar({ coinciden: 3, regionCompleta: null });
    if (ruta === '/api/v1/pila/duelos') return route.fulfill({ status: 204 });
    if (ruta.startsWith('/api/v1/pila/reportes/')) return dar({ recibido: true }, 202);
    desconocidas.add(`${metodo} ${ruta}`);
    return negar(404, 'NO_ENCONTRADO');
  });
  return {
    pedidos,
    desconocidas,
    deRuta: (prefijo: string) => pedidos.filter((p) => p.ruta.startsWith(prefijo)),
  };
}

/** `navigator.share` simulado: lo que se compartió queda en `window.__compartido`. */
async function simularCompartir(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true });
    Object.defineProperty(navigator, 'share', {
      value: (datos: ShareData) => {
        (window as unknown as { __compartido: unknown }).__compartido = {
          text: datos.text,
          archivos: datos.files?.length ?? 0,
        };
        return Promise.resolve();
      },
      configurable: true,
    });
  });
}

const sinScrollHorizontal = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

const papelito = (page: Page, n: number) =>
  page.getByRole('button', { name: new RegExp(`${String(n)} cosas que hoy no hay»\\. Enter`) });

/** Arrastra con el mouse: es el gesto del teléfono, con eventos de puntero reales. */
async function arrastrar(page: Page, tarjetaN: Locator, dx: number, dy: number) {
  const caja = await tarjetaN.boundingBox();
  if (!caja) throw new Error('La tarjeta no está en pantalla');
  const x = caja.x + caja.width / 2;
  const y = caja.y + caja.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx / 2, y + dy / 2, { steps: 6 });
  await page.mouse.move(x + dx, y + dy, { steps: 6 });
  await page.mouse.up();
}

test.describe('Mi Argentina ideal', () => {
  test('a 390 px: imaginar, publicar, compartir y mirar con gestos', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await simularCompartir(page);
    const api = await simularApi(page, tandaDe(6));

    // Ver, la portada, en cero: lleva a Imaginar.
    await page.goto('/mi-argentina-ideal');
    const momentos = page.getByRole('navigation', { name: 'Momentos de Mi Argentina ideal' });
    await momentos.getByRole('link', { name: 'Imaginar' }).click();
    await expect(page).toHaveURL(/\/mi-argentina-ideal\/imaginar/);

    // Una punta, escribir y seguir.
    await expect(page.getByRole('heading', { level: 1, name: PREGUNTA })).toBeVisible();
    await page.getByRole('button', { name: 'tu salud' }).click();
    await page.getByLabel('Lo que imaginás').fill(ESCRITO);
    await page.getByRole('button', { name: 'Seguir' }).click();

    // La línea, el tema sugerido y la provincia.
    await expect(page.getByRole('heading', { name: 'Tu aporte, en una frase' })).toBeVisible();
    await expect(page.getByLabel('Tu aporte')).not.toHaveValue('');
    // El tema llega como pregunta, sin marcar: la persona lo confirma.
    await expect(page.getByText('¿Es sobre salud?')).toBeVisible();
    const salud = page.getByRole('button', { name: 'Salud' });
    await expect(salud).toHaveAttribute('aria-pressed', 'false');
    await salud.click();
    await expect(salud).toHaveAttribute('aria-pressed', 'true');
    await page.getByLabel('¿De qué provincia sos?').selectOption({ label: 'Salta' });
    await page.getByRole('button', { name: 'Seguir' }).click();

    // Quién puede leerlo, y publicar.
    await expect(page.getByRole('heading', { name: 'Así lo van a ver' })).toBeVisible();
    await expect(page.getByText(/Tu aporte va a entrar en la campaña nacional/)).toBeVisible();
    await page
      .getByLabel('Que cualquiera lo pueda leer y citar, sin tu nombre. Entra a Mirar.')
      .check();
    await page.getByLabel(/Publicá mi aporte en Mi Argentina ideal/).check();
    expect(await sinScrollHorizontal(page)).toBe(true);
    await page.getByRole('button', { name: 'Publicar mi aporte' }).click();

    // Listo: compartir y pasar a Mirar.
    await page.getByRole('button', { name: 'Compartir mi aporte' }).click();
    await expect
      .poll(() =>
        page.evaluate(() => (window as unknown as { __compartido?: unknown }).__compartido),
      )
      .toBeTruthy();
    const publicado = api.deRuta('/api/v1/contribuciones').filter((p) => p.metodo === 'POST');
    expect(publicado).toHaveLength(1);
    expect(publicado[0]?.cuerpo).toMatchObject({
      campanaId: CAMPANA,
      senal: { cedeLicencia: true, provinceId: 17 },
    });
    await page.getByRole('link', { name: 'Ahora mirá lo que imaginan otros →' }).click();
    await expect(page).toHaveURL(/\/mi-argentina-ideal\/mirar/);

    // Seis papelitos: a la derecha, a la izquierda, abajo y otra vez a la derecha.
    await arrastrar(page, papelito(page, 1), 200, 0);
    await arrastrar(page, papelito(page, 2), -200, 0);
    await arrastrar(page, papelito(page, 3), 0, 200);
    await arrastrar(page, papelito(page, 4), 200, 0);
    await expect
      .poll(() => api.deRuta('/api/v1/pila/opiniones/').map((p) => p.cuerpo))
      .toEqual([
        { valor: 'acuerdo', provinciaId: 17 },
        { valor: 'desacuerdo', provinciaId: 17 },
        { valor: 'paso', provinciaId: 17 },
        { valor: 'acuerdo', provinciaId: 17 },
      ]);

    // El duelo entre los dos que quiso.
    await expect(page.getByRole('heading', { name: '¿Cuál va primero?' })).toBeVisible();
    expect(await sinScrollHorizontal(page)).toBe(true);
    await page.getByRole('button', { name: /^Elegir primero: «.*1 cosas/ }).click();
    await expect
      .poll(() => api.deRuta('/api/v1/pila/duelos').map((p) => p.cuerpo))
      .toEqual([{ a: idDe(1), b: idDe(4), primero: idDe(1) }]);

    // Reportar la quinta: pasa a la siguiente sin contestarla.
    await papelito(page, 5).click();
    const hoja = page.getByRole('dialog');
    await hoja.getByRole('button', { name: 'Reportar este aporte' }).click();
    await hoja.getByLabel('Insulta a alguien').check();
    await hoja.getByRole('button', { name: 'Enviar reporte' }).click();
    await expect(hoja.getByText('Gracias. Lo vamos a tener en cuenta.')).toBeVisible();
    await expect(papelito(page, 6)).toBeVisible();
    expect(api.deRuta('/api/v1/pila/reportes/').map((p) => p.cuerpo)).toEqual([
      { motivo: 'insulta' },
    ]);

    // La última, y el fin de la tanda.
    await arrastrar(page, papelito(page, 6), -200, 0);
    await expect(page.getByRole('heading', { name: /^Listo\. Miraste/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ver cómo se va armando →' })).toBeVisible();
    expect(api.deRuta('/api/v1/pila/tandas')).toHaveLength(1);
    expect(await sinScrollHorizontal(page)).toBe(true);
    expect(
      [...api.desconocidas].filter((r) => r.includes('/pila/') || r.includes('/vision')),
    ).toEqual([]);
  });

  test('a 1440 px, el mismo recorrido con el teclado solo', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await simularCompartir(page);
    const api = await simularApi(page, tandaDe(6));
    const enter = async (objetivo: Locator) => {
      await objetivo.focus();
      await page.keyboard.press('Enter');
    };

    await page.goto('/mi-argentina-ideal/imaginar');
    await expect(page.getByRole('heading', { level: 1, name: PREGUNTA })).toBeVisible();
    await page.getByLabel('Lo que imaginás').focus();
    await page.keyboard.type(ESCRITO);
    await enter(page.getByRole('button', { name: 'Seguir' }));

    await expect(page.getByRole('heading', { name: 'Tu aporte, en una frase' })).toBeVisible();
    const provincia = page.getByLabel('¿De qué provincia sos?');
    await expect(provincia.getByRole('option', { name: 'Salta' })).toBeAttached();
    await provincia.focus();
    await provincia.selectOption({ label: 'Salta' });
    await enter(page.getByRole('button', { name: 'Seguir' }));

    await expect(page.getByRole('heading', { name: 'Así lo van a ver' })).toBeVisible();
    await expect(page.getByText(/Tu aporte va a entrar en la campaña nacional/)).toBeVisible();
    await page
      .getByLabel('Que cualquiera lo pueda leer y citar, sin tu nombre. Entra a Mirar.')
      .focus();
    await page.keyboard.press('Space');
    await page.getByLabel(/Publicá mi aporte en Mi Argentina ideal/).focus();
    await page.keyboard.press('Space');
    await enter(page.getByRole('button', { name: 'Publicar mi aporte' }));

    await enter(page.getByRole('link', { name: 'Ahora mirá lo que imaginan otros →' }));
    await expect(page).toHaveURL(/\/mi-argentina-ideal\/mirar/);

    // Las flechas contestan: derecha también, izquierda no, abajo paso.
    for (const [n, tecla] of [
      [1, 'ArrowRight'],
      [2, 'ArrowLeft'],
      [3, 'ArrowDown'],
      [4, 'ArrowRight'],
    ] as const) {
      await papelito(page, n).focus();
      await page.keyboard.press(tecla);
      await expect(papelito(page, n)).toHaveCount(0);
    }
    expect(
      api.deRuta('/api/v1/pila/opiniones/').map((p) => (p.cuerpo as { valor: string }).valor),
    ).toEqual(['acuerdo', 'desacuerdo', 'paso', 'acuerdo']);

    // En el duelo, la barra espaciadora es «por igual».
    await expect(page.getByRole('heading', { name: '¿Cuál va primero?' })).toBeVisible();
    await page.locator('[data-foco]').filter({ hasText: '¿Cuál va primero?' }).focus();
    await page.keyboard.press('Space');
    await expect
      .poll(() => api.deRuta('/api/v1/pila/duelos').map((p) => p.cuerpo))
      .toEqual([{ a: idDe(1), b: idDe(4), primero: null }]);

    // Enter abre el aporte; desde ahí se reporta.
    await papelito(page, 5).focus();
    await page.keyboard.press('Enter');
    const hoja = page.getByRole('dialog');
    await enter(hoja.getByRole('button', { name: 'Reportar este aporte' }));
    await hoja.getByLabel('Insulta a alguien').focus();
    await page.keyboard.press('Space');
    await enter(hoja.getByRole('button', { name: 'Enviar reporte' }));
    await expect(papelito(page, 6)).toBeVisible();

    await papelito(page, 6).focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('heading', { name: /^Listo\. Miraste/ })).toBeVisible();
    expect(await sinScrollHorizontal(page)).toBe(true);
  });

  test('Mirar vacío invita a escribir el propio', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await simularApi(page, tandaDe(0, false));
    await page.goto('/mi-argentina-ideal/mirar');
    await expect(
      page.getByRole('heading', {
        name: 'Todavía nadie más publicó su aporte en Mi Argentina ideal.',
      }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Escribir el mío' })).toBeVisible();
    expect(await sinScrollHorizontal(page)).toBe(true);
  });
});
