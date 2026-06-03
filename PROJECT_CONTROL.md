# PROJECT CONTROL — CondoLogPro

## Estado atual

Fase: **Cloud-ready MVP com fallback local**, em resolução de merge na branch `infra/supabase-vercel-camera-mvp`.

Status: App Next.js com base local-first sólida + preparação cloud (Supabase Postgres + Supabase Storage + Vercel + CI no GitHub Actions). A branch preserva o fluxo câmera-first mobile intake, OCR opcional, autocomplete de moradores, WhatsApp assistido, pendentes, baixa de retirada, admin desktop conectado, importador CSV, dashboard com KPIs e histórico.

## Caminho local

C:\Users\henri\Documents\04_PROJETOS_CONTEÚDO\01_ACTIVE\CondoLogPro

## Objetivo do projeto

Criar um **MVP cloud-ready de gestão de encomendas condominiais**, validável em condomínio real, implantável em Supabase/Vercel e que **preserva desenvolvimento e piloto local** via fallback SQLite + `public/uploads`.

## Fluxo-base

Portaria/administração recebe pacote > fotografa etiqueta > registra entrada > associa bloco/apto/morador > gera WhatsApp assistido > acompanha pendentes > baixa retirada > admin consulta histórico e KPIs.

## Decisões técnicas

- Next.js App Router.
- TypeScript strict.
- Prisma com **dois schemas**:
  - `prisma/schema.prisma` (SQLite) — local default.
  - `prisma/schema.supabase.prisma` (PostgreSQL) — cloud.
- Tailwind CSS.
- Mobile para portaria (dark, large targets, câmera como ação principal).
- Desktop para administração (light, denso, tabelas e KPIs).
- Upload local (`public/uploads`) **e** Supabase Storage — `src/lib/storage.ts` decide por env.
- Supabase Storage preparado com service role apenas no servidor e signed URL para bucket privado.
- WhatsApp assistido via `wa.me`.
- OCR experimental com `tesseract.js`, não bloqueante.
- Vercel para hosting.
- GitHub Actions para CI.
- CI prepara SQLite com `prisma:push` + `prisma:seed` antes de `typecheck` e `build`.
- Páginas que consultam Prisma são `force-dynamic`.
- Documentação em `docs/` e `docs/implementation/`.

## Branch atual

`infra/supabase-vercel-camera-mvp`

## Último marco

- Preparação cloud/câmera: `feat: prepare cloud mvp with camera-first intake` (68af13b).
- PR #6 em `main`: confiabilidade de CI/database build, incluindo SQLite preparado antes do build e páginas DB-backed dinâmicas.
- Merge de `main` em `infra/supabase-vercel-camera-mvp` em resolução para preservar ambos os trabalhos.

## Próxima etapa

- Finalizar resolução de conflitos e validar PR #5.
- Rodar validações locais completas.
- Configurar projeto Supabase real (conta, bucket, envs).
- Conectar repo GitHub na Vercel.
- Validar deploy de preview com envs Supabase reais.
- Smoke test cloud: registrar uma encomenda real, conferir upload no Storage, enviar WhatsApp assistido e baixar retirada.
- Testar câmera em aparelho físico via HTTPS; telefone em LAN HTTP pode depender do fallback de upload/captura.
