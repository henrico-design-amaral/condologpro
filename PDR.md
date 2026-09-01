# CondoLogOPS — Project Definition Report

Status: ACTIVE
Version: 1.0
Date: 2026-09-01
Authority: `PROJECT_CONTROL.md` + `DECISIONS.md` + operational repo contracts

## Identity
- Canonical semantic project name: `CondoLogOPS`.
- Marketing repository/path remains `henrico-design-amaral/condologpro` until a deliberate migration.
- Operational repository: `henrico-design-amaral/condologpro-app`.
- Legacy physical names do not redefine public/product semantics.

## Why it exists
CondoLogOPS addresses traceable condominium/front-desk operations while keeping public marketing and operational runtime separated by responsibility.

## Surface architecture
1. **Marketing** — this repository, Astro/static, proposition/value/conversion/product explanation.
2. **Operational app** — `condologpro-app`, Next.js/TypeScript, operational runtime/data/auth recovery.

## Current maturity
Architecture reconciliation/recovery. The marketing surface is separated from the operational application. Production availability of the app must not be claimed without current build/environment/HTTPS/smoke evidence.

## Scope
- public product/service explanation and conversion in this repo;
- factual visualization of condominium/package operations;
- explicit bridge to the operational app without duplicating app runtime;
- preservation of canonical product/runtime boundaries.

## Non-goals
- restore Next.js operational runtime into marketing repo;
- imply operational production availability without evidence;
- merge historical recovery branches blindly;
- use legacy physical naming as authority over semantic `CondoLogOPS`.

## Success signals
- marketing and app responsibilities remain unambiguous;
- public claims reflect operational truth;
- current runtime builds deterministically;
- another executor can identify current authority and next safe action without chat history.

## Level 0
- Style Guide: `STYLE_GUIDE.md`.
- Design System resolver: `DESIGN_SYSTEM.md`.
- Agent visual resolver: `DESIGN.md`.
- Accessibility: `A11Y.md`.

## Risks/open decisions
- physical repository/domain naming remains legacy and needs a separate migration if ever changed;
- app production/deploy remains evidence-gated;
- visual system is resolved from current accepted implementation/assets until a newer explicit identity decision is recorded.

## Canonical map
`README.md -> PDR.md -> AGENTS.md -> PRODUCT.md -> STYLE_GUIDE.md -> DESIGN_SYSTEM.md -> DESIGN.md -> A11Y.md -> DECISIONS.md -> HANDOFF.md -> TASKS.md -> REFERENCES.md -> specs/`
