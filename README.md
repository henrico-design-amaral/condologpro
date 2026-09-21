# CondoLogOPS — site comercial

Este repositório é a autoridade da superfície pública de marketing do CondoLogOPS.

## Limite de responsabilidade

- Repositório técnico: `henrico-design-amaral/condologpro`
- Domínio técnico: `https://condologpro.henrico.works`
- Runtime: Astro estático
- Responsabilidade: proposta de valor, demonstração sintética, conversão e acesso ao produto
- Aplicação operacional: `henrico-design-amaral/condologpro-app`

O nome semântico público é **CondoLogOPS**. Strings `condologpro` permanecem apenas como identificadores técnicos legados até migração deliberada.

## Desenvolvimento local

```powershell
npm ci
npm run check
npm run build
```

## Estado atual

O runtime Next.js/Prisma legado foi removido da árvore ativa em 2026-09-21 após prova de independência do build Astro. A aplicação operacional, banco, autenticação e migrations pertencem exclusivamente a `condologpro-app`.

Consulte `PROJECT_CONTROL.md`, `VISUAL_LOCK.json` e `docs/architecture/PHASE_1_PROVENANCE_MATRIX.md`.
