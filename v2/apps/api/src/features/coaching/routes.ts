/**
 * Coaching HTTP slice.
 *
 *   GET   /api/coaching/sessions                    (auth) — list
 *   POST  /api/coaching/sessions                    (auth) — start
 *   GET   /api/coaching/sessions/:id                (auth) — session + messages
 *   POST  /api/coaching/sessions/:id/messages       (auth) — send user msg
 *                                                            → AICompleter
 *                                                            → store reply
 */
import { CoachingRepository, getDb } from '@v2/db';
import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';

import { getAICompleter, type Message } from '../../lib/ai/index.js';
import { logger } from '../../lib/logger.js';
import { authenticate } from '../../middleware/auth.js';
import { HttpError } from '../../middleware/error-handler.js';

const router: RouterType = Router();

const startSchema = z.object({
  title: z.string().max(200).optional(),
});

const messageSchema = z.object({
  content: z.string().min(1).max(4000),
});

const SYSTEM_PROMPT = `Sos un coach reflexivo del movimiento ¡BASTA! en Argentina.
Tu rol es acompañar a la persona en pensar mejor su ciudadanía y su crecimiento personal.
Hablás en rioplatense (vos, mirá, dale) con calma y curiosidad genuina.
Hacés más preguntas que respuestas. Cuando das una respuesta, es concreta y accionable.
Nunca diagnosticás, nunca prescribís medicación. Si la persona necesita ayuda profesional, le decís que vea a alguien.
No emitís juicios políticos partidarios.`;

router.get('/sessions', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const repo = new CoachingRepository(getDb());
    const sessions = await repo.listSessions(req.user.id);
    res.json({ data: { sessions } });
  } catch (err) {
    next(err);
  }
});

router.post('/sessions', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const input = startSchema.parse(req.body);
    const repo = new CoachingRepository(getDb());
    const insertArgs: Parameters<typeof repo.startSession>[0] = { userId: req.user.id };
    if (input.title !== undefined) insertArgs.title = input.title;
    const session = await repo.startSession(insertArgs);
    res.status(201).json({ data: { session } });
  } catch (err) {
    next(err);
  }
});

router.get('/sessions/:id', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const idStr = req.params.id;
    if (typeof idStr !== 'string') throw new HttpError(400, 'INVALID_ID', 'Id requerido.');
    const id = Number.parseInt(idStr, 10);
    if (Number.isNaN(id)) throw new HttpError(400, 'INVALID_ID', 'Id inválido.');
    const repo = new CoachingRepository(getDb());
    const session = await repo.findSession(id);
    if (session?.userId !== req.user.id) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Sesión no encontrada.' } });
      return;
    }
    const messages = await repo.listMessages(id);
    res.json({ data: { session, messages } });
  } catch (err) {
    next(err);
  }
});

router.post('/sessions/:id/messages', authenticate, async (req, res, next) => {
  try {
    if (!req.user) throw new HttpError(401, 'UNAUTHENTICATED', 'No autenticado.');
    const idStr = req.params.id;
    if (typeof idStr !== 'string') throw new HttpError(400, 'INVALID_ID', 'Id requerido.');
    const id = Number.parseInt(idStr, 10);
    if (Number.isNaN(id)) throw new HttpError(400, 'INVALID_ID', 'Id inválido.');
    const { content } = messageSchema.parse(req.body);

    const repo = new CoachingRepository(getDb());
    const session = await repo.findSession(id);
    if (session?.userId !== req.user.id) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Sesión no encontrada.' } });
      return;
    }

    // Persist the user turn first.
    await repo.appendMessage({ sessionId: id, role: 'user', content });

    // Build the conversation for the AICompleter.
    const history = await repo.listMessages(id);
    const aiMessages: Message[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.map((m) => ({ role: m.role as Message['role'], content: m.content })),
    ];

    let assistantContent = '(no response)';
    let provider = 'stub';
    let promptTokens: number | undefined;
    let completionTokens: number | undefined;
    try {
      const completion = await getAICompleter().complete(aiMessages, { temperature: 0.6, maxTokens: 800 });
      assistantContent = completion.content;
      provider = completion.provider;
      promptTokens = completion.promptTokens;
      completionTokens = completion.completionTokens;
    } catch (aiErr) {
      logger.error({ err: aiErr, sessionId: id }, 'AICompleter failed in coaching');
      assistantContent = 'Tuve un problema técnico para responder. ¿Podés escribirlo de otra forma?';
    }

    const assistantInput: Parameters<typeof repo.appendMessage>[0] = {
      sessionId: id,
      role: 'assistant',
      content: assistantContent,
      provider,
    };
    if (promptTokens !== undefined) assistantInput.promptTokens = promptTokens;
    if (completionTokens !== undefined) assistantInput.completionTokens = completionTokens;
    const assistant = await repo.appendMessage(assistantInput);

    res.json({ data: { message: assistant } });
  } catch (err) {
    next(err);
  }
});

export { router as coachingRouter };
