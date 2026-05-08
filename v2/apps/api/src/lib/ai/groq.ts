/**
 * Groq completion provider.
 *
 * Uses fetch directly — no SDK. Groq's chat-completions endpoint is
 * OpenAI-compatible.
 */
import { logger } from '../logger.js';

import type { AICompleter, CompleteOptions, Completion, Message } from './types.js';

const GROQ_BASE = 'https://api.groq.com/openai/v1';

interface GroqChoice {
  message: { role: string; content: string };
  finish_reason: string;
}

interface GroqResponse {
  choices?: GroqChoice[];
  usage?: { prompt_tokens?: number; completion_tokens?: number };
  error?: { message: string; type?: string };
}

export class GroqCompleter implements AICompleter {
  constructor(
    private readonly apiKey: string,
    private readonly model = 'llama-3.3-70b-versatile',
  ) {}

  async complete(messages: Message[], opts: CompleteOptions = {}): Promise<Completion> {
    const body: Record<string, unknown> = {
      model: this.model,
      messages,
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.maxTokens ?? 1024,
    };
    if (opts.stop) body.stop = opts.stop;

    const init: RequestInit = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    };
    if (opts.signal) init.signal = opts.signal;

    const res = await fetch(`${GROQ_BASE}/chat/completions`, init);
    const json = (await res.json()) as GroqResponse;

    if (!res.ok || json.error) {
      const message = json.error?.message ?? `Groq returned ${String(res.status)}`;
      logger.error({ status: res.status, error: json.error }, 'Groq completion failed');
      throw new Error(`Groq: ${message}`);
    }

    const choice = json.choices?.[0];
    if (!choice) {
      throw new Error('Groq returned no choices');
    }

    const completion: Completion = {
      content: choice.message.content,
      provider: 'groq',
      model: this.model,
    };
    if (json.usage?.prompt_tokens !== undefined) completion.promptTokens = json.usage.prompt_tokens;
    if (json.usage?.completion_tokens !== undefined) completion.completionTokens = json.usage.completion_tokens;
    return completion;
  }
}
