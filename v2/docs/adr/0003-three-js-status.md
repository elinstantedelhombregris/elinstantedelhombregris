# 0003 — Three.js status

## Status

Accepted — 2026-05-11

## Context

v1 (`SocialJusticeHub/`) shipped four React components built on `three`,
`@react-three/fiber`, `@react-three/drei`, and `three-mesh-bvh`:

- `client/src/components/NeuralNetwork3D.tsx`
- `client/src/components/EnergyFlow.tsx`
- `client/src/components/PersonNode.tsx`
- `client/src/components/ConceptParticleSystem.tsx`

…plus their usage in `client/src/pages/Resources.tsx`. All four are
ambient/decorative — animated 3D backgrounds in onboarding-style
screens. None of them carry data, none participate in a core flow
(quiz, mandato, propuesta, civic assessment).

The bundle cost is significant. A minimal `three` + `react-three/fiber`
import is ≈700 KB gzipped; `drei` and BVH push that higher. v1 paid this
cost on a code path that delivered no civic value.

## Decision

**Defer.** No `three`, `@react-three/*`, or `three-mesh-bvh` dependency
is added to v2 in this phase or any subsequent phase until a concrete
civic data-visualization use-case requires it.

## Consequences

- The four v1 components are not ported. If a v2 page needs ambient
  motion, use CSS, SVG, or canvas-2D (or Framer Motion, which we
  already depend on).
- If a future phase needs 3D for actual data visualization (e.g. a
  national territorial 3D map with elevation, a network-of-issues
  graph), revisit this ADR. The bundle cost will be evaluated against
  the civic value at that point.
- v1 components remain in git history; if porting becomes necessary,
  the code is reachable but will be re-written for the v2 stack
  (strict TS, no `any`, file size caps) rather than copy-pasted.

## Cost budget (re-evaluation trigger)

Reopen this ADR when ALL of the following are true:

1. A concrete v2 page requirement names 3D as the right primitive.
2. The data being visualized cannot be served by SVG/canvas-2D at the
   target fidelity.
3. The bundle-cost budget for that page is willing to absorb ≥600 KB
   gz on top of the base bundle.

## References

- v1 components: `SocialJusticeHub/client/src/components/{NeuralNetwork3D,EnergyFlow,PersonNode,ConceptParticleSystem}.tsx`
- v1 consumer: `SocialJusticeHub/client/src/pages/Resources.tsx`
- v1 deps: `three@^0.168.0`, `@react-three/fiber@^8.17.6`, `@react-three/drei@^9.114.0`, `three-mesh-bvh@^0.8.0`
- Related: `v2/CLAUDE.md` — "Heavy deps require an ADR before install."
