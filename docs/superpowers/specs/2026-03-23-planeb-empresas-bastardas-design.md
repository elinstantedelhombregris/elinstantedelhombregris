# PLANEB — Empresas Bastardas y Soberanía Económica Popular — Design Spec

**Date**: 2026-03-23
**Status**: Implemented — v1.1
**Mandate**: 8th BASTA Popular Mandate
**Document**: `Iniciativas Estratégicas/PLANEB_Argentina_ES.md` (1,815 lines, 23 sections)

## 1. Problem Statement

Markets for essential services in Argentina (insurance, banking, telecom, energy, healthcare) are characterized by opacity, excessive extraction, and information asymmetry. Citizens cannot determine what a service actually costs to provide, making informed choice impossible. Existing regulatory frameworks attempt to limit abuse but cannot create transparency — only competition from a radically transparent entity can.

The BASTA framework has governance mandates for justice, education, health, labor, agriculture, cities, and drug policy — but lacks a mandate for citizens to directly create transparent market alternatives when incumbents fail them.

## 2. Core Concept: Empresa Bastarda

A **Empresa Bastarda** is:
- A **Fideicomiso de Propósito Perpetuo** (Perpetual Purpose Trust) under Argentine law
- Governed as a **DAO** (hybrid: blockchain backbone + traditional UX)
- **Zero ownership** — no shareholders, no state patron, no cooperative member-owners
- Operated **at-cost** with dynamic pricing (actual costs ÷ users)
- **Radically transparent** — every peso in, every peso out, publicly auditable
- A **price anchor** that forces market health by providing a reference benchmark

"Bastarda" = no formal father/owner. The entity exists for its purpose, serves its users, is owned by nobody.

## 3. The Three Axioms

1. **Axioma de la Referencia**: Every essential market deserves a transparent, at-cost reference entity. Not to replace competition, but to inform it.
2. **Axioma de la Transparencia**: Every financial flow is publicly auditable in real-time. Open-source code, open books, blockchain-verified treasury.
3. **Axioma de la Integración**: Bastardas weave into existing markets. Private companies matching transparency standards can interoperate. The goal is market health, not capture.

## 4. Governance Architecture: La Constitución Bastarda

### Four Layers

| Layer | Role | Composition | Selection |
|-------|------|-------------|-----------|
| **Asamblea de Usuarios** | Supreme authority. Sets purpose, approves constitution, annual review | All active users | Self-enrolled |
| **Panel Ciudadano** | Strategic oversight, policy, cost validation, disputes | 15 citizens (5 rotate yearly) | Sorteo democrático |
| **Consejo Técnico** | Operations, technical decisions, execution | 7 professionals | Hired by Panel, reviewed annually |
| **Auditoría Permanente** | Independent verification, fraud detection, transparency | 3 auditors (financial + tech + community) | Rotational sorteo + certification |

### Hybrid DAO Mechanics
- **On-chain**: Treasury (smart contracts), voting records, audit trail, contribution tracking
- **Off-chain**: User interfaces, operational tools, customer service, claims processing
- **Bridge**: Cryptographic proofs link off-chain actions to on-chain records

### Key Rules
- **Regla de Tres Rechazos**: If Consejo Técnico rejects Panel recommendation 3 times → binding (from PLANJUS)
- **Transparencia Total**: Monthly financials in human-readable + machine-auditable format
- **Techo Salarial**: Max salary ≤ 8× min salary within entity
- **Rotación Obligatoria**: No Panel member serves > 2 consecutive terms (24 months)

## 5. Economic Model: Modelo Económico Bastardo

### Dynamic Mutual Pool
- Users pay actual monthly cost = (claims + operations + reserve contribution) ÷ total users
- **Fee contract with cap (techo)**: maximum monthly fee contracted at enrollment
- Good months → fee drops below cap. Catastrophe months → fee rises toward cap.

### Reserve Architecture
1. **Reserva Operativa** (10% of monthly costs): Month-to-month fluctuation buffer
2. **Fondo de Catástrofe** (accumulated surplus): Sector-specific shock absorption. Target: 6 months average claims.
3. **Fondo de Solidaridad Bastarda** (2% cross-network contribution): Inter-Bastarda mutual aid

### Worker Compensation
- Base salary at median market rate
- Contribution Index amplification (PLANREP model)
- Techo Salarial: 8:1 ratio
- All salaries published on transparency dashboard

### Market Synergy (Weave, Not Destroy)
- **Benchmarking**: Private companies can justify pricing against Bastarda's published costs
- **Infrastructure sharing**: Open-source protocol available to any company
- **Reinsurance/risk pooling**: Cross-sector partnerships with traditional players
- **Talent pipeline**: Bastarda-trained workers flow into broader market

## 6. El Protocolo Bastardo — Shared Infrastructure

The protocol is the DNA shared by all Bastardas.

### Five Layers
1. **Identity & Membership**: Decentralized identity (DID), privacy-preserving (ZKP for sensitive data), one identity across all Bastardas
2. **Treasury Management**: Smart contracts for collection/disbursement/reserves, multi-sig for large transactions, public dashboard
3. **Governance Tooling**: On-chain voting (one-user-one-vote, non-transferable), verifiable random sorteo engine, proposal system, Kleros-inspired dispute resolution
4. **Transparency Engine**: Open-source codebase, public API for financial data, auto-generated reports, independent audit hooks
5. **Sector Adapters**: Pluggable modules for domain-specific logic

### Sector Adapter Catalog

| Adapter | Key Components |
|---------|---------------|
| **Aseguradora** (Insurance) | Open-source actuarial engine, claims pipeline, coverage templates, reinsurance bridge, SSN compliance |
| **Financiera** (Banking) | Peer-to-pool lending, savings pools, payment rails (DEBIN/QR), open credit scoring, BCRA compliance |
| **Conectada** (Telecom) | MVNO model → own infra, usage billing, quality dashboard, community coverage, ENACOM compliance |
| **Energética** (Energy) | Distributed renewable aggregation, net metering, P2P trading, community solar, ENRE compliance |
| **Sanitaria** (Healthcare) | Open provider network, prepaid health pool, prevention incentives, telemedicine, PLANSAL bridge |
| **Alimentaria** (Food) | Producer direct (PLANISV farms), shared logistics, blockchain traceability, dynamic basket pricing |
| **Móvil** (Transport) | Cooperative ride-pool, shared EV fleet, open routing algorithm, public transit bridge |
| **Educativa** (Education) | Open course marketplace, blockchain credentials, peer tutoring, PLANEDU bridge |
| **Habitacional** (Housing) | Community land trust, construction pool, rent-to-own, shared maintenance, PLAN24CN bridge |
| **Del Adiós** (End-of-Life) | Prepaid dignity fund, provider network, ecological options, grief support |

### Generic Adapter Template
For any new sector:
1. Define value chain (what does this cost to provide?)
2. Define risk model (what can go wrong? how are costs shared?)
3. Define quality metrics (how do users know it's good?)
4. Define regulatory interface (permits, licenses, compliance)
5. Map synergies (which other Bastardas share infrastructure/reserves?)

## 7. La Bastarda Aseguradora — Flagship Deep Dive

### Why Insurance First
- Mandatory product (auto liability) = guaranteed demand
- High volume, well-understood risk models
- Clear regulatory framework (SSN)
- Visibly extractive (20-35% of premiums → profit/overhead, not claims)

### Launch Phases

| Phase | Timeline | Product | Target Users |
|-------|----------|---------|-------------|
| **La Semilla** | Months 1-6 | Legal constitution, platform dev, SSN licensing | Founding petition signatories |
| **Auto Simple** | Months 7-18 | Third-party liability auto | 10,000 |
| **Expansión** | Months 19-36 | Comprehensive auto + home + micro-insurance | 50,000 |
| **Espectro Completo** | Months 37-60 | Health + life + commercial | 200,000+ |

### Pricing Example (Auto Insurance)

**Traditional insurer (opaque)**:
- Claims: ~50% of premium
- Operations: ~20%
- Reserves: ~10%
- Profit + marketing + exec: ~20% ← extraction

**La Bastarda (transparent)**:
- Claims: ~50% (same risk pool)
- Operations: ~14% (leaner, open-source, no marketing)
- Reserves: ~10% (same prudence)
- Profit: 0%
- **Result: ~26% less than traditional**
- Good months: further reduction. Bad months: rises toward cap (still below traditional).

### Risk Defense (6 Layers)
1. Reserva Operativa (monthly buffer)
2. Fondo de Catástrofe (accumulated surplus)
3. Dynamic fee increase toward cap
4. Fondo de Solidaridad Bastarda (cross-network)
5. Traditional reinsurance (Swiss Re, Munich Re)
6. Asamblea Extraordinaria (user vote on extreme measures)

## 8. La Cascada — How Bastardas Are Born

### Petition-to-Launch Pipeline
1. **La Petición**: Citizen proposes + 25,000 committed users sign
2. **El Estudio**: 90-day feasibility study (3 experts + 3 sorteo citizens)
3. **La Constitución**: Fideicomiso formed, Panel selected, Consejo hired, seed crowdfunded
4. **La Prueba**: 6-month pilot with founding users
5. **La Apertura**: Public launch, organic growth
6. **La Maduración**: 50K self-sustaining → 100K contributing to Solidaridad → 200K+ market reference

### Cascade Acceleration
Each success compounds: protocol matures, legal precedent set, user trust built, cross-sector synergies unlock, surplus seeds new Bastardas.

## 9. BASTA Integration

| PLAN | Synergy with PLANEB |
|------|-------------------|
| **PLANREP** | Workers from Centros de la Vida staff Bastardas. Contribution Index applies. Fideicomiso architecture shared. |
| **PLANSAL** | Bastarda Sanitaria bridges public health gaps. |
| **PLANSUS** | Bastarda Financiera handles substance business banking (BCRA safe harbor). |
| **PLANEDU** | Bastarda Educativa provides lifelong learning. Graduates build Bastarda tech. |
| **PLANJUS** | Three-level dispute resolution. Kleros-inspired on-chain arbitration. |
| **PLAN24CN** | New cities = Bastarda-native from inception. |
| **PLANISV** | Bastarda Alimentaria distributes regenerative products. |

**Meta-role**: PLANEB provides the economic execution layer for all mandates.

## 10. Legal Framework: La Ley Bastarda

- **Phase A** (now): Operate under existing fideicomiso law (CCyC Art. 1666-1707). DAO as internal governance tooling.
- **Phase B** (concurrent): Draft "Ley de Entidades de Propósito Perpetuo y Gobernanza Descentralizada" — legal personhood for DAOs, perpetual duration, tax exemption (no income to tax), regulatory fast-track, anti-takeover protection, on-chain governance recognition.
- **Phase C** (after proof): International open-source legal template.

## 11. Deliverable

A comprehensive PLANEB document (~2,000-3,000 lines) at `Iniciativas Estratégicas/PLANEB_Argentina_ES.md`, written in Spanish (rioplatense), following the structure and depth of existing PLANs (PLANREP, PLANSUS, PLANJUS), ready to integrate into the BASTA framework.
