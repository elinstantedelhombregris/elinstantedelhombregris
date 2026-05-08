/**
 * AICompleter — provider-agnostic LLM completion interface.
 *
 * Domain code (mandato signal classifier, coaching service) depends on
 * this interface. Concrete providers (Groq, Anthropic) implement it.
 * Tests can swap a stub via setAICompleter().
 */

export type Role = 'system' | 'user' | 'assistant';

export interface Message {
  role: Role;
  content: string;
}

export interface CompleteOptions {
  /** Hard cap. Provider may return fewer. */
  maxTokens?: number;
  /** 0..1; lower = more deterministic. Default 0.3 for classification work. */
  temperature?: number;
  /** Stop sequences. */
  stop?: string[];
  signal?: AbortSignal;
}

export interface Completion {
  content: string;
  /** Provider identifier ('groq', 'anthropic', 'stub'). Useful for logging. */
  provider: string;
  /** Model id used. */
  model: string;
  /** Best-effort token usage; some providers may not report. */
  promptTokens?: number;
  completionTokens?: number;
}

export interface AICompleter {
  complete(messages: Message[], opts?: CompleteOptions): Promise<Completion>;
}
