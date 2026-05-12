# 0006 — @xenova/transformers status

## Status

Accepted — 2026-05-11

## Context

v1 depends on `@xenova/transformers@^2.17.2` and uses it in:

- `SocialJusticeHub/server/nlp-service.ts`
- `SocialJusticeHub/server/services/embedding-service.ts`

The motivation was local (in-server) embeddings + classification —
running a transformer model server-side without a vendor API. The
upside: no embeddings cost per call, no third-party data sharing.
The downside: ~200 MB model artifact, cold-start cost on every
serverless invocation, and a heavy native-ish dep tree that
complicates the production deploy story.

v2 currently has zero consumers of embeddings or local NLP. The
mandato classifier (`apps/api/src/features/mandato/classifier.ts`)
goes through `AICompleter`, which is provider-pluggable (Groq today)
and does the classification with a chat-completion call instead.

## Decision

**Defer.** v2 will not depend on `@xenova/transformers`. If a future
phase needs embeddings (related-content surfaces, semantic search,
similar-proposal clustering), reach for a provider API
(Groq/OpenAI/Anthropic) first; only revisit local inference if that
path is materially insufficient.

## Consequences

- No 200 MB model artifact in the deploy bundle.
- The "related ensayos" / "similar proposals" features wait for an
  explicit phase that justifies them; when that phase runs, it
  evaluates provider-API embeddings vs. local inference on the same
  scorecard.
- v1's `nlp-service` / `embedding-service` stay in v1 git history.

## Cost budget (re-evaluation trigger)

Reopen this ADR when ALL of the following are true:

1. A concrete v2 feature names embeddings as the right primitive.
2. Provider-API embeddings have been priced for the expected call
   volume and the cost is non-prohibitive.
3. A privacy or latency requirement specifically rules out provider
   embeddings (e.g. user-content that can't leave our infrastructure).

## References

- v1 server: `SocialJusticeHub/server/nlp-service.ts`,
  `SocialJusticeHub/server/services/embedding-service.ts`
- v1 dep: `@xenova/transformers@^2.17.2`
- v2 alternative path: `AICompleter` (`apps/api/src/lib/ai-completer.ts`)
