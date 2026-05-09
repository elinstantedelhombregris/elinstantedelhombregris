/**
 * Pulse-signal classifier.
 *
 * Takes a raw citizen statement and asks the AICompleter to label it
 * with a theme cluster, a sentiment in [-1, 1], and up to 5 topic tags.
 * Returns a Zod-validated object the cron can write back to the
 * pulse_signals row.
 *
 * The model is asked for strict JSON. We coerce defensively: theme
 * defaults to 'sin_clasificar' if blank, sentiment is clamped, topics
 * are deduped and capped.
 */
import { z } from 'zod';

import { getAICompleter } from '../../lib/ai/index.js';
import { logger } from '../../lib/logger.js';

import type { Message } from '../../lib/ai/index.js';

export interface SignalClassification {
  theme: string;
  sentiment: number;
  topics: string[];
}

const SYSTEM_PROMPT = `Sos un clasificador NLP para señales ciudadanas argentinas.
Para cada texto, devolvés UN ÚNICO objeto JSON con exactamente estos campos:
  - theme: tema cluster en español rioplatense, ≤ 30 caracteres, snake_case
    (p.ej. "salud_publica", "inflacion", "transporte").
  - sentiment: número entre -1 (muy negativo) y +1 (muy positivo).
  - topics: array de hasta 5 etiquetas cortas en español (1-2 palabras cada una).

No agregues comentarios, ni explicaciones, ni markdown. Solo el objeto JSON.`;

const ResponseSchema = z.object({
  theme: z.string().trim().min(1).max(60).default('sin_clasificar'),
  sentiment: z.number().min(-1).max(1).default(0),
  topics: z.array(z.string().trim().min(1).max(40)).default([]),
});

function extractJson(content: string): unknown {
  // Models sometimes wrap JSON in fences. Strip them.
  const trimmed = content.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(trimmed);
  const jsonText = fenced?.[1]?.trim() ?? trimmed;
  try {
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}

export async function classifySignal(body: string): Promise<SignalClassification> {
  const messages: Message[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: body },
  ];

  let raw: string;
  try {
    const completion = await getAICompleter().complete(messages, { temperature: 0.2, maxTokens: 200 });
    raw = completion.content;
  } catch (err) {
    logger.warn({ err }, 'classifier: AICompleter failed; falling back to default classification');
    return { theme: 'sin_clasificar', sentiment: 0, topics: [] };
  }

  const parsed = extractJson(raw);
  if (parsed === null) {
    logger.warn({ raw }, 'classifier: response was not valid JSON; falling back to default');
    return { theme: 'sin_clasificar', sentiment: 0, topics: [] };
  }

  const safe = ResponseSchema.safeParse(parsed);
  if (!safe.success) {
    logger.warn({ parsed, issues: safe.error.issues }, 'classifier: response failed schema validation');
    return { theme: 'sin_clasificar', sentiment: 0, topics: [] };
  }

  return {
    theme: safe.data.theme.toLowerCase().replace(/\s+/g, '_'),
    sentiment: Math.max(-1, Math.min(1, safe.data.sentiment)),
    topics: Array.from(new Set(safe.data.topics.map((t) => t.toLowerCase()))).slice(0, 5),
  };
}
