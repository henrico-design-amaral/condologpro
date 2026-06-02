# PROJECT CONTROL — CondoLogPro

## Estado atual

Fase: **Cloud-ready MVP com fallback local.**

Status: App Next.js com base local-first sólida + preparação cloud (Supabase Postgres + Supabase Storage + Vercel + CI no GitHub Actions). Câmera-first mobile intake, OCR opcional, autocomplete de moradores, WhatsApp assistido, pendentes, baixa de retirada, admin desktop, importador CSV, dashboard com KPIs, histórico.

## Caminho local

C:\Users\henri\Documents\04_PROJETOS_CONTEÚDO\01_ACTIVE\CondoLogPro

## Objetivo do projeto

Criar um **MVP cloud-ready de gestão de encomendas condominiais**, validável em condomínio real, implantável em Supabase/Vercel e que **preserva desenvolvimento e piloto offline** via fallback local (SQLite + `public/uploads`).

## Fluxo-base

Portaria/administração recebe pacote > fotografa etiqueta > registra entrada > associa bloco/apto/morador > gera WhatsApp assistido > acompanha pendentes > baixa retirada > admin consulta histórico e KPIs.

## Decisões técnicas

- Next.js App Router.
- TypeScript strict.
- Prisma com **dois schemas**:
  - `prisma/schema.prisma` (SQLite) — local default.
  - `prisma/schema.supabase.prisma` (PostgreSQL) — cloud.
- Tailwind CSS.
- Mobile para portaria (dark, large targets).
- Desktop para administração (light, denso).
- Upload local (`public/uploads`) **e** Supabase Storage — `src/lib/storage.ts` decide por env.
- WhatsApp assistido via `wa.me`.
- OCR experimental com `tesseract.js`, não bloqueante.
- Vercel para hosting.
- GitHub Actions para CI (typecheck + build).
- Documentação em `docs/` e `docs/implementation/`.

## Branch atual

`mvp/cloud-ready-foundation` (anteriormente `mvp/offline-first-foundation`; renomeada após o checkpoint estratégico).

## Último marco

- Fundação local-first forte: `feat: build offline-first mvp foundation` (ef20e0a).
- Preparação cloud pré-existente: `feat: prepare cloud mvp with camera-first intake` (68af13b).
- Alinhamento cloud-ready: `chore: align cloud-ready foundation` (próximo commit, inclui Supabase scripts, vercel.json, CI, signed URL helper, docs refresh).

## Próxima etapa

- Configurar projeto Supabase real (conta, billing, bucket, envs).
- Conectar repo GitHub na Vercel.
- Validar deploy de preview com envs Supabase reais.
- Smoke test: registrar uma encomenda real, conferir upload no Storage, baixar retirada.
- Adicionar endpoint de leitura signed URL se o bucket for privado.
