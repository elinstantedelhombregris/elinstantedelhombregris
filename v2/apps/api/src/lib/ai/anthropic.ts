/**
 * Anthropic completion provider — lazy-loaded.
 *
 * The SDK only loads when this provider is actually constructed, so
 * environments that never use Anthropic don't pay for the bundle.
 */
import { logger } from '../logger.js';

import type { AICompleter, CompleteOptions, Completion, Message } from './types.js';

export class AnthropicCompleter implements AICompleter {
  constructor(
    private readonly apiKey: string,
    private readonly model = 'claude-haiku-4-5-20251001',
  ) {}

  async complete(messages: Message[], opts: CompleteOptions = {}): Promise<Completion> {
    // Dynamic import keeps the SDK out of bundles that don't use it.
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: this.apiKey });

    // Anthropic separates the system prompt from the user/assistant
    // turns. Pull it out, leaving only user/assistant.
    const systemTurns = messages.filter((m) => m.role === 'system').map((m) => m.content);
    const conv = messages.filter((m) => m.role !== 'system');

    try {
      const result = await client.messages.create({
        model: this.model,
        max_tokens: opts.maxTokens ?? 1024,
        temperature: opts.temperature ?? 0.3,
        ...(systemTurns.length > 0 ? { system: systemTurns.join('\n\n') } : {}),
        messages: conv.map((m) => ({
          role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
          content: m.content,
        })),
        ...(opts.stop ? { stop_sequences: opts.stop } : {}),
      });

      // Concatenate text blocks from the response (Anthropic returns an array).
      const content = result.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('');

      return {
        content,
        provider: 'anthropic',
        model: this.model,
        promptTokens: result.usage.input_tokens,
        completionTokens: result.usage.output_tokens,
      };
    } catch (err) {
      logger.error({ err }, 'Anthropic completion failed');
      throw err;
    }
  }
}
