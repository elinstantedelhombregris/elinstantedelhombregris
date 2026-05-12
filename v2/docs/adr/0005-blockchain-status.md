# 0005 — Blockchain / on-chain attestation status

## Status

Accepted — 2026-05-11

## Context

v1 depends on both `ethers@^6.13.4` and `web3@^4.12.1`, and ships
`SocialJusticeHub/server/blockchain-service.ts` (481 LOC) for
aspirational "civic NFT" / on-chain attestation experiments
(timestamping civic actions, proof-of-engagement tokens, etc.). No v1
user flow actually surfaces an on-chain transaction; the service
exists as a placeholder for a model that was never validated by user
behavior.

Two competing libraries (`ethers` and `web3`) for the same job is
itself a smell — duplicated abstractions, doubled audit surface, and
twice the maintenance burden. The trust property the chain would
provide (tamper-evidence of civic actions) is already served by:

- The Postgres audit log (`daily_activity`).
- Cryptographic signatures on outbound emails / receipts (future).
- Public-records integration when civic actions warrant external
  proof.

None of those require a chain.

## Decision

**Drop.** v2 will not depend on `ethers`, `web3`, or any other
on-chain library. The blockchain service is not ported.

## Consequences

- No wallet integration, no on-chain identity, no NFT issuance in v2.
- Future "verifiable civic action" features will be built on
  existing primitives (signed receipts, public-record exports)
  rather than reaching for a chain.
- Removes two heavy deps and ~480 LOC of service code that produced
  no v1 user value.

## Cost budget (removal plan)

Nothing to remove in v2. The v1 service stays put in v1's repo until
v1 is retired.

## References

- v1 server: `SocialJusticeHub/server/blockchain-service.ts` (481 LOC)
- v1 deps: `ethers@^6.13.4`, `web3@^4.12.1`
- Trust primitives kept: `daily_activity`, future signed receipts.
