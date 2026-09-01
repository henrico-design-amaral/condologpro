# CondoLogOPS — Product Truth Resolver

Status: ACTIVE
Version: 1.0
Date: 2026-09-01
Authority: current `PROJECT_CONTROL.md`, `DECISIONS.md` and `henrico-design-amaral/condologpro-app`

## Product model
CondoLogOPS is a condominium-operations product with two repositories separated by responsibility:
- marketing/public explanation in `condologpro`;
- operational application in `condologpro-app`.

The operational repository is the authority for runtime, data model, authentication, migrations and validated application behavior. This marketing repository may explain only capabilities supported by that authority or by accepted product decisions.

## Core operational problem
Provide a traceable flow for condominium/front-desk operations, including receiving/identification/association/notification/withdrawal/evidence patterns where supported by the operational authority.

## Marketing responsibility
- explain the real operational problem and value;
- demonstrate truthful workflow/evidence;
- create a clear conversion/access path;
- never fabricate production state or operational capabilities.

## Boundaries
- no operational runtime/schema/auth authority in this repo;
- do not claim the app is in production without current evidence;
- historical PRs/branches are selective provenance, not runtime authority;
- semantic project name is `CondoLogOPS`; `condologpro` is a legacy technical path.

## Current status
The product is in clean operational recovery/reconciliation. See the app repository for current technical baseline and remaining E2E/cloud evidence.
