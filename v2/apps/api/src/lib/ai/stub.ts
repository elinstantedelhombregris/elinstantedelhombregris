/**
 * StubCompleter — used in development when no AI key is configured
 * and in tests. Returns a deterministic fake completion so dependent
 * features can run end-to-end without burning API credits.
 */
import type { AICompleter, CompleteOptions, Completion, Message } from './types.js';

export class StubCompleter implements AICompleter {
  complete(messages: Message[], _opts: CompleteOptions = {}): Promise<Completion> {
    const userTurn = [...messages].reverse().find((m) => m.role === 'user');
    const echo = userTurn ? userTurn.content.slice(0, 200) : '(no user input)';
    return Promise.resolve({
      content: `[stub-completer] received: ${echo}`,
      provider: 'stub',
      model: 'stub',
    });
  }
}
