# CondoLogOPS — Marketing Design System Resolver

Status: ACTIVE
Version: 1.0
Date: 2026-09-01
Authority: `STYLE_GUIDE.md` + `DESIGN.md` + accepted Astro implementation + Henrico Visual System quality contracts

## Scope
This file governs repeatable marketing-surface implementation. It does not govern the operational app runtime or data model.

## Responsibilities
- semantic tokens derived from current accepted marketing implementation;
- typography roles;
- spacing/rhythm;
- layout/grid/container rules;
- responsive transformations;
- navigation/CTA/content primitives;
- process/evidence visualizations;
- interaction/motion behavior;
- media/icon behavior;
- accessibility mapping.

## Source rule
Do not invent token values in this resolver. Current concrete values are extracted from the accepted implementation/assets and may be promoted into explicit tokens when repeated and validated.

## Component rule
Components exist to make public communication reliable. Do not import operational-app UI wholesale into the marketing site merely for visual consistency.

## Responsive rule
Marketing composition must reflow without overlap/occlusion or horizontal overflow. Mobile is a designed state.

## Product evidence
Any process/card/diagram must be traceable to `PRODUCT.md` / operational authority. Fake metrics and decorative dashboards are blocked.

## A11Y
Inherit `A11Y.md` and HenricoOPS WCAG 2.2 AA baseline.

## Change control
A material visual-system change requires a scoped spec/decision. HVS is a quality floor, not a replacement CondoLogOPS aesthetic.
