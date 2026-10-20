import { CampanasRepository, ImpulsoRepository, UsersRepository, getDb } from '@v2/db';
import {
  crearCampanaSchema,
  editarCampanaSchema,
  cambiarCampanaSchema,
  devolucionCampanaSchema,
  contratoCampanaSchema,
} from '@v2/shared';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import {
  usuarioAutenticado,
  authenticate,
  esAdmin,
  optionalAuthenticate,
} from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';
import { avisarDecision, avisarQuePasoARevision } from '../impulso/avisos.js';

import { impulsoCampanasRouter } from './impulso-routes.js';
import { negarPaso } from './pasos.js';

import type { EstadoCampana } from '@v2/shared';

const router: RouterType = Router();
const idDe = (valor: unknown) => z.string().uuid().parse(valor);
/**
 * Los pasos que existen. Quién da cada uno lo decide `negarPaso` (`pasos.ts`), y
 * `reuniendo → por_revisar` no está porque lo da el sistema al llegar al umbral
 * (`ImpulsoRepository.acreditar`). El espejo web es `PASOS_CAMPANA`.
 */
const PASOS: Record<EstadoCampana, EstadoCampana[]> = {
  borrador: ['reuniendo', 'programada', 'abierta'],
  reuniendo: ['borrador'],
  por_revisar: ['abierta', 'programada', 'reuniendo'],
  programada: ['abierta', 'pausada'],
  abierta: ['pausada', 'en_devolucion'],
  pausada: ['abierta', 'en_devolucion'],
  en_devolucion: ['abierta', 'cerrada'],
  cerrada: [],
};
/** Una cuenta que no es de la administración tiene una sola campaña juntando gente o en revisión. */
const campanaActiva = () =>
  new HttpError(
    409,
    'CAMPANA_ACTIVA',
    'Ya tenés una campaña juntando gente o en revisión. Cuando se abra o la retires, podés presentar otra.',
  );
/** Quien impulsa responde públicamente por la devolución: hace falta el correo verificado. */
async function exigirCorreoVerificado(uid: number, mensaje: string): Promise<void> {
  const usuario = await new UsersRepository(getDb()).findById(uid);
  if (!usuario?.emailVerified) throw new HttpError(403, 'EMAIL_PENDIENTE', mensaje);
}

router.use(impulsoCampanasRouter);
router.get('/', optionalAuthenticate, async (req, res, next) => {
  try {
    const propias = req.query.mias === '1';
    if (propias && !req.user)
      throw new HttpError(401, 'SESION_REQUERIDA', 'Ingresá para ver tus campañas.');
    const lista = await new CampanasRepository(getDb()).listar(req.user?.id, propias);
    res.set('Cache-Control', 'no-store').json({
      data: lista.map((c) => ({ ...c, contrato: contratoCampanaSchema.parse(c.contrato) })),
    });
  } catch (e) {
    next(e);
  }
});
router.get('/:slug', optionalAuthenticate, async (req, res, next) => {
  try {
    const slug = z.string().min(1).max(120).parse(req.params.slug);
    const c = await new CampanasRepository(getDb()).porId(
      slug,
      req.user?.id,
      z.coerce.number().int().positive().optional().parse(req.query.edicion),
    );
    if (!c)
      throw new HttpError(404, 'CAMPANA_NO_ENCONTRADA', 'Todavía no encontramos esa campaña.');
    res.set('Cache-Control', 'no-store').json({
      data: { ...c, contrato: contratoCampanaSchema.parse(c.contrato) },
    });
  } catch (e) {
    next(e);
  }
});
/**
 * Proponer una campaña: nace en borrador. Desde el 20/10/2026 la propone cualquier cuenta con
 * el correo verificado, con una sola juntando gente o en revisión por vez; abrirla sigue
 * siendo de la administración (spec 2026-10-19-mi-argentina-ideal-la-pila.md §11).
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const v = crearCampanaSchema.parse(req.body);
    const usuario = usuarioAutenticado(req);
    if (!esAdmin(usuario.username)) {
      await exigirCorreoVerificado(
        usuario.id,
        'Verificá tu correo antes de proponer una campaña: quien la impulsa responde públicamente por su devolución.',
      );
      if ((await new ImpulsoRepository(getDb()).activasDe(usuario.id)) > 0) throw campanaActiva();
    }
    const repo = new CampanasRepository(getDb());
    if (!(await repo.territoriosValidos(v.contrato.territorios)))
      throw new HttpError(400, 'TERRITORIO_INVALIDO', 'Revisá los lugares elegidos.');
    res.status(201).json({ data: { id: await repo.crear(usuario.id, v.idLocal, v.contrato) } });
  } catch (e) {
    if (e instanceof Error && e.message === 'REINTENTO_DISTINTO') {
      next(
        new HttpError(
          409,
          'ENVIO_DISTINTO',
          'Ese envío ya tiene otras reglas de la campaña. Revisá el recibo antes de proponer otra campaña.',
        ),
      );
      return;
    }
    next(e);
  }
});
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const id = idDe(req.params.id);
    const v = editarCampanaSchema.parse(req.body);
    const usuario = usuarioAutenticado(req);
    const repo = new CampanasRepository(getDb());
    const c = await repo.porId(id, usuario.id);
    if (!c?.puedoEditarContrato)
      throw new HttpError(
        403,
        'SIN_PERMISO',
        'Solo el equipo convocante puede revisar esta campaña.',
      );
    // Cambiar las reglas la devuelve a borrador: en revisión, eso la sacaría de la revisión.
    if (c.estado === 'por_revisar' && !esAdmin(usuario.username))
      throw new HttpError(
        409,
        'EN_REVISION',
        'Tu campaña está en revisión. Esperá la respuesta de la coordinación antes de cambiar sus reglas.',
      );
    if (!(await repo.territoriosValidos(v.contrato.territorios)))
      throw new HttpError(400, 'TERRITORIO_INVALIDO', 'Revisá los lugares elegidos.');
    if (!(await repo.revisar(id, usuario.id, v.revision, v.contrato)))
      throw new HttpError(
        409,
        'REVISION_CAMBIADA',
        'La campaña cambió. Conservá tu texto y abrí la revisión actual.',
      );
    res.json({ data: { id } });
  } catch (e) {
    next(e);
  }
});
/**
 * Cambiar de estado. Qué pasos existen lo dice `PASOS`; quién da cada uno, `negarPaso`. Al
 * presentar una campaña que ya tiene la gente contada, pasa a revisión en el acto; cuando la
 * administración decide una propuesta ajena, quien la impulsa recibe un aviso.
 */
router.post('/:id/estado', authenticate, async (req, res, next) => {
  try {
    const id = idDe(req.params.id);
    const v = cambiarCampanaSchema.parse(req.body);
    const usuario = usuarioAutenticado(req);
    const admin = esAdmin(usuario.username);
    const repo = new CampanasRepository(getDb());
    const impulso = new ImpulsoRepository(getDb());
    const c = await repo.paraCambiar(id);
    if (!c)
      throw new HttpError(403, 'SIN_PERMISO', 'Esta etapa la cuida quien impulsa la campaña.');
    if (!PASOS[c.estado].includes(v.estado))
      throw new HttpError(409, 'FASE_INVALIDA', 'Ese paso no sigue el recorrido de esta campaña.');
    const impulsa = c.creadorId === usuario.id;
    const negativa = negarPaso({ desde: c.estado, hacia: v.estado, admin, impulsa });
    if (negativa) throw new HttpError(negativa.status, negativa.code, negativa.message);
    if (v.estado === 'abierta' || v.estado === 'programada' || v.estado === 'reuniendo') {
      await exigirCorreoVerificado(
        usuario.id,
        'Verificá tu correo antes de convocar públicamente.',
      );
      if (c.fechaDevolucion < new Date().toISOString().slice(0, 10))
        throw new HttpError(
          400,
          'FECHA_VENCIDA',
          'Elegí una fecha de devolución que todavía podamos cumplir.',
        );
    }
    const presenta = c.estado === 'borrador' && v.estado === 'reuniendo';
    if (presenta && !admin && (await impulso.activasDe(usuario.id)) > 0) throw campanaActiva();
    if (v.estado === 'cerrada' && c.devoluciones === 0)
      throw new HttpError(
        409,
        'DEVOLUCION_PENDIENTE',
        'Antes de cerrar, devolvé lo que aprendieron o explicá públicamente por qué no pudo hacerse.',
      );
    const cambiada = new HttpError(
      409,
      'REVISION_CAMBIADA',
      'La campaña cambió mientras la revisabas.',
    );
    if (impulsa) {
      if (!(await repo.cambiarEstado(id, usuario.id, v.revision, v.estado, v.motivo)))
        throw cambiada;
      // Vuelve a presentarse con la gente ya contada: no espera a la persona siguiente.
      const lista = presenta ? await impulso.revisarSiLlego(id) : null;
      if (lista) await avisarQuePasoARevision(impulso, lista);
    } else {
      const decidida = await repo.decidirPropuesta(id, v.revision, v.estado, v.motivo);
      if (!decidida) throw cambiada;
      await avisarDecision(impulso, { id, ...decidida }, v.estado);
    }
    res.json({ data: { id } });
  } catch (e) {
    next(e);
  }
});
router.post('/:id/devoluciones', authenticate, async (req, res, next) => {
  try {
    const id = idDe(req.params.id);
    const v = devolucionCampanaSchema.parse(req.body);
    const repo = new CampanasRepository(getDb());
    const c = await repo.porId(id, usuarioAutenticado(req).id);
    if (!c?.puedoEditar)
      throw new HttpError(403, 'SIN_PERMISO', 'La devolución la publica el equipo responsable.');
    if (
      !(await repo.devolver(
        id,
        usuarioAutenticado(req).id,
        v.idLocal,
        v.revision,
        v.texto,
        v.limites,
        v.senales,
      ))
    )
      throw new HttpError(
        409,
        'REVISION_CAMBIADA',
        'No pudimos registrar o recuperar este intento. Revisá la edición y sus fuentes; una devolución ya registrada solo admite el mismo contenido.',
      );
    res.status(201).json({ data: { publicada: true, id: v.idLocal } });
  } catch (e) {
    next(e);
  }
});
export { router as campanasRouter };
