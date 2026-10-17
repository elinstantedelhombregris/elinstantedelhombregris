import { randomUUID } from 'node:crypto';

import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

test.use({ actionTimeout: 15_000 });

test.skip(
  process.env['ESCUELA_LOCAL_E2E'] !== '1',
  'Requiere pnpm dev:escuela; nunca escribe en una API remota.',
);

async function ingresar(page: Page, usuario: string, clave: string, volver: string) {
  await page.goto(`/ingresar?volver=${encodeURIComponent(volver)}`);
  await page.getByLabel('Email o usuario').fill(usuario);
  await page.getByLabel('Contraseña', { exact: true }).fill(clave);
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(encodeURI(volver.split('?')[0]!) + '(?:\\?|$)'));
  await expect(page.getByRole('button', { name: 'Tareas y escucha', exact: true })).toBeVisible();
}
async function enviar(page: Page, ruta: string, data: object) {
  const cookies = await page.context().cookies();
  const csrf = cookies.find((c) => c.name === 'eihg_csrf')?.value ?? '';
  return page.request.post('/api' + ruta, { data, headers: { 'X-CSRF-Token': csrf } });
}
async function paso(page: Page, accion: string) {
  const form = page
    .locator('form')
    .filter({ has: page.getByRole('button', { name: 'Registrar paso', exact: true }) });
  await page.getByText('Aceptar o registrar un paso', { exact: true }).click();
  await form.getByLabel(/^Paso/).selectOption(accion);
  await form
    .getByLabel('Qué cambia y por qué')
    .fill('Ensayo técnico: registro este paso con datos ficticios de la planilla.');
  await form.getByRole('button', { name: 'Registrar paso', exact: true }).click();
  await expect(
    page.getByText(
      accion === 'realizada' ? /^Ejecución declarada · versión/ : /^En curso · versión/,
    ),
  ).toBeVisible();
  await page.reload();
}

test('recorrido real: ficha, aceptación, ejecución, evidencia, revisión y devolución', async ({
  browser,
  baseURL,
}, testInfo) => {
  test.setTimeout(120_000);
  if (baseURL !== 'http://127.0.0.1:4179')
    throw new Error('La prueba sólo admite la web del ensayo local.');
  const coordContext = await browser.newContext({ baseURL });
  const participaContext = await browser.newContext({ baseURL });
  const revisaContext = await browser.newContext({ baseURL });
  for (const contexto of [coordContext, participaContext, revisaContext])
    contexto.setDefaultTimeout(15_000);
  try {
    const coord = await coordContext.newPage();
    const participa = await participaContext.newPage();
    const revisa = await revisaContext.newPage();
    const resp = await coord.request.get('/api/local/escuela');
    expect(resp.status()).toBe(200);
    expect(resp.headers()['cache-control']).toBe('no-store');
    const { data: e } = (await resp.json()) as {
      data: {
        tipo: string;
        fichaId: string;
        campanaId: string;
        iniciativaId: number;
        iniciativaSlug: string;
        tareaId: number;
        cierre: string;
        clave: string;
      };
    };
    expect(e.tipo).toBe('escuela_local');
    const iniciativa = '/iniciativas/' + e.iniciativaSlug;
    await coord.goto('/recorridos/llegar-a-tiempo-a-la-escuela');
    await expect(coord.getByRole('region', { name: 'Práctica con API local' })).toBeVisible();
    await ingresar(coord, 'escuela_coordina', e.clave, iniciativa);
    // Sólo esta tarea de verificación se consume. La tarea de práctica queda disponible.
    const nueva = await enviar(coord, `/iniciativas/${e.iniciativaId}/tareas`, {
      idLocal: randomUUID(),
      titulo: `Verificación técnica escolar ${Date.now()}`,
      alcance:
        'Calcular las cinco combinaciones ficticias de la planilla; registrar qué queda sin comprobar y conservar la objeción sobre cuidados.',
      fecha: e.cierre,
      hitoId: null,
      escucha: null,
      recursos: 'Planilla ficticia incluida en la guía del recorrido escolar.',
      autorizoPublicacion: true,
    });
    expect(nueva.status(), await nueva.text()).toBe(201);
    const tid = ((await nueva.json()) as { data: { id: number } }).data.id;
    const destino = `${iniciativa}?seccion=tareas&tarea=${tid}`;
    await coord.goto(destino);
    await coord.getByText('Elegir ficha de devolución', { exact: true }).click();
    await coord.getByLabel('Buscar entre tus fichas editables').fill('Llegar a tiempo');
    await coord.getByRole('button', { name: 'Buscar fichas', exact: true }).click();
    await coord.getByLabel('Ficha donde devolver los resultados').selectOption(e.fichaId);
    await coord.getByLabel('Revisé la ficha elegida y quiero vincular esta tarea.').check();
    await coord.getByRole('button', { name: 'Guardar destino', exact: true }).click();
    await expect(coord.getByText('Los resultados vuelven a')).toBeVisible();

    await ingresar(participa, 'escuela_participa', e.clave, destino);
    const sumarse = participa.getByRole('button', { name: 'Sumarme al equipo', exact: true });
    const ingresoParticipante = await sumarse.isVisible();
    if (ingresoParticipante) {
      await sumarse.click();
      await expect(
        participa.getByText('Ya integrás esta iniciativa. Podés aceptar una tarea disponible.'),
      ).toBeVisible();
    }
    await expect(
      participa.getByText('Responsable: pendiente de aceptación', { exact: false }),
    ).toBeVisible();
    await participa
      .getByLabel('Mi firma pública', { exact: true })
      .fill('Participante · verificación técnica');
    await participa
      .getByLabel('Cómo me organizo para cumplir esta tarea')
      .fill('Dedico quince minutos al cálculo de la planilla ficticia y registro los límites.');
    await participa.getByRole('button', { name: 'Acepto hacerme cargo de esta tarea' }).click();
    await expect(
      participa.getByText('Responsable: Participante · verificación técnica', { exact: false }),
    ).toBeVisible();
    await paso(participa, 'iniciar');
    await paso(participa, 'realizada');
    await participa.getByRole('button', { name: 'Ver evidencia y resultados' }).click();
    await participa.getByText('Registrar evidencia del resultado', { exact: true }).click();
    const titulo = `Cálculo ficticio verificado · tarea ${tid}`;
    await participa.getByLabel('Nombre de la evidencia').fill(titulo);
    await participa
      .getByLabel('Resultado observado y cómo se obtuvo')
      .fill(
        'Ensayo técnico, no observación real: A 07:50, B 08:05, C 07:50, D 08:05, E 07:50. Dos combinaciones inventadas superan las 08:00. No conocemos puntualidad real ni otros turnos. Sigue pendiente la objeción sobre trabajo y cuidados.',
      );
    await participa.getByLabel(/Autorizo/).check();
    await participa.getByRole('button', { name: 'Publicar evidencia', exact: true }).click();
    await expect(participa.getByRole('heading', { name: titulo, exact: true })).toBeVisible();
    const resultadoHttp = participa.waitForResponse((r) =>
      r.url().endsWith(`/api/fichas/${e.fichaId}/resultados-campo`),
    );
    await participa.goto(`/fichas/${e.fichaId}#resultados-campo`);
    expect((await resultadoHttp).status()).toBe(200);
    const resultado = participa.locator('#resultados-campo article').filter({ hasText: titulo });
    await expect(resultado).toContainText('Pendiente de revisión independiente');

    await ingresar(revisa, 'escuela_revisa', e.clave, destino);
    const sumarseRevision = revisa.getByRole('button', { name: 'Sumarme al equipo', exact: true });
    const ingresoRevision = await sumarseRevision.isVisible();
    if (ingresoRevision) {
      await sumarseRevision.click();
      await expect(
        revisa.getByText('Ya integrás esta iniciativa. Podés aceptar una tarea disponible.'),
      ).toBeVisible();
    }
    await revisa.getByRole('button', { name: 'Ver evidencia y resultados' }).click();
    await revisa.getByText('Revisar o retirar evidencia', { exact: true }).click();
    await revisa.getByLabel(/^Decisión/).selectOption('revisar');
    await revisa.getByLabel('Firma pública para revisar').fill('Revisión · verificación técnica');
    await revisa
      .getByLabel('Fundamento y límites de la decisión')
      .fill(
        'Contrasté las cinco sumas de la planilla ficticia. Esto verifica un cálculo, no mejoras de puntualidad. Debemos escuchar otros turnos y responder sobre trabajo y cuidados.',
      );
    await revisa.getByRole('button', { name: 'Registrar decisión', exact: true }).click();
    await expect(
      revisa.getByText('Revisión registrada por Revisión · verificación técnica.'),
    ).toBeVisible();
    await participa.reload();
    await expect(resultado).toContainText('Revisado por otra persona');
    await expect(resultado).toContainText('no mejoras de puntualidad');
    await expect(
      participa
        .locator('#conversacion p')
        .filter({ hasText: 'Objeción ficticia: cambiar el ingreso' }),
    ).toBeVisible();
    await participa.screenshot({
      path: testInfo.outputPath('ficha-con-resultado.png'),
      fullPage: true,
    });

    await coord.goto(`/campanas/${e.campanaId}#devolucion`);
    await coord
      .getByLabel('Lectura del equipo', { exact: true })
      .fill(
        `Devolución del ensayo técnico de la tarea ${tid}: se comprobaron las cinco sumas ficticias y su retorno a la ficha, con revisión desde otra cuenta. No se eligió cambiar el ingreso escolar; antes hay que responder a la objeción sobre trabajo y cuidados.`,
      );
    await coord
      .getByLabel('Qué falta y hasta dónde llega esta lectura', { exact: true })
      .fill(
        'No hubo participantes reales ni observación de transporte. Falta un piloto con familias, personal escolar y transporte; no se probó una mejora de puntualidad.',
      );
    await coord.getByRole('button', { name: 'Publicar devolución', exact: true }).click();
    await expect(
      coord.getByText('Publicamos la devolución. Ya la puede leer cualquiera en esta página.'),
    ).toBeVisible();

    const sinConsumir = await coord.request.get(
      `/api/iniciativas/${e.iniciativaId}/tareas?tareaId=${e.tareaId}`,
    );
    const pendiente = (await sinConsumir.json()).data.items[0] as {
      estado: string;
      fichaId: string | null;
      firma: string | null;
    };
    expect(pendiente).toMatchObject({ estado: 'todo', fichaId: null, firma: null });
    if (ingresoParticipante)
      expect((await enviar(participa, `/iniciativas/${e.iniciativaId}/leave`, {})).status()).toBe(
        200,
      );
    if (ingresoRevision)
      expect((await enviar(revisa, `/iniciativas/${e.iniciativaId}/leave`, {})).status()).toBe(200);
    await testInfo.attach('objetos-locales', {
      body: JSON.stringify({ ficha: e.fichaId, tareaVerificada: tid, tareaPractica: e.tareaId }),
      contentType: 'application/json',
    });
  } finally {
    await Promise.all([coordContext.close(), participaContext.close(), revisaContext.close()]);
  }
});
