/**
 * AICompleter factory.
 *
 * Picks a provider in this order:
 *   1. GROQ_API_KEY is set → GroqCompleter (default).
 *   2. ANTHROPIC_API_KEY is set → AnthropicCompleter.
 *   3. Neither → StubCompleter (dev/test).
 *
 * Override in tests via setAICompleter().
 */
import { logger } from '../logger.js';

import { AnthropicCompleter } from './anthropic.js';
import { GroqCompleter } from './groq.js';
import { StubCompleter } from './stub.js';

import type { AICompleter } from './types.js';

let cached: AICompleter | undefined;

export function getAICompleter(): AICompleter {
  if (cached) return cached;
  const groqKey = process.env.GROQ_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (groqKey) {
    cached = new GroqCompleter(groqKey);
    logger.info({ provider: 'groq' }, 'AICompleter ready');
  } else if (anthropicKey) {
    cached = new AnthropicCompleter(anthropicKey);
    logger.info({ provider: 'anthropic' }, 'AICompleter ready');
  } else {
    cached = new StubCompleter();
    logger.warn('No AI provider key set — using StubCompleter');
  }
  return cached;
}

/** Test-only: replace the cached completer. */
export function setAICompleter(completer: AICompleter): void {
  cached = completer;
}

export type { AICompleter, CompleteOptions, Completion, Message } from './types.js';
