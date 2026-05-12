# 0004 — AR.js status

## Status

Accepted — 2026-05-11

## Context

v1 carries `@ar-js-org/ar.js@^3.4.5` as a production dependency, and
`SocialJusticeHub/server/ar-service.ts` (489 LOC) exposes a small AR
scene CRUD on top of it. v1's `routes.ts` registers the AR routes but
no v1 page surfaces them in a flow.

`ar.js` is effectively unmaintained — its core fork has gone years
between meaningful updates, marker-based tracking (Hiro, Kanji) is
the supported path, and the WebAR landscape has moved on (8thWall,
WebXR for capable devices). The codebase paid the maintenance and
audit cost for a stack that never reached a user-visible flow.

## Decision

**Drop.** v2 will not depend on `@ar-js-org/ar.js`. The server-side
AR service is not ported. No AR-related schema is added.

## Consequences

- No `ar_scenes` / `ar_markers` tables in v2. The corresponding v1
  schema (if any) was already excluded from the `v2/packages/db/`
  consolidation.
- `SocialJusticeHub/server/ar-service.ts` remains in v1 git history.
  If a future phase needs AR, it'll be re-architected on a maintained
  stack (likely WebXR) rather than `ar.js`.
- Removes one heavy production dep that bundlers/audit tools flag.

## Cost budget (removal plan)

Nothing to remove in v2 (the dep was never added). The v1 codebase
keeps shipping the AR service until v1 is retired; no extraction
or deprecation work is in this phase.

## References

- v1 server: `SocialJusticeHub/server/ar-service.ts` (489 LOC)
- v1 dep: `@ar-js-org/ar.js@^3.4.5`
- Project state: no v2 page or schema references AR.
