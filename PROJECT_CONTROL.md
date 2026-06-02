# PROJECT CONTROL — CondoLogPro

## Estado atual

Fase: MVP local-first evoluindo para cloud-ready.

Status: App Next.js bootstrapado com Prisma/SQLite, seed, fluxo mobile de recebimento, câmera com fallback, autocomplete de moradores, upload de etiqueta, WhatsApp assistido, pendentes, baixa de retirada e admin desktop básico.

## Caminho local

C:\Users\henri\Documents\04_PROJETOS_CONTEÚDO\01_ACTIVE\CondoLogPro

## Objetivo do projeto

Criar um MVP de gestão de encomendas condominiais validável em condomínio real, preservando o fluxo local-first e preparando implantação simples em Supabase/Vercel.

## Fluxo-base

Portaria/administração recebe pacote > fotografa etiqueta > registra entrada > associa bloco/apto/morador > gera WhatsApp assistido > acompanha pendentes > baixa retirada > admin consulta histórico.

## Decisões técnicas

- Next.js App Router.
- TypeScript.
- Prisma.
- SQLite como padrão local.
- Schema PostgreSQL separado para Supabase em `prisma/schema.supabase.prisma`.
- Tailwind CSS + shadcn/ui base.
- Upload local como fallback.
- Supabase Storage preparado por `src/lib/storage.ts`.
- WhatsApp assistido via `wa.me`.
- OCR experimental com `tesseract.js`, não bloqueante.
- Mobile para portaria.
- Desktop para administração.

## Branch atual

infra/supabase-vercel-camera-mvp

## Último marco

Preparação cloud-ready e câmera-first iniciada na branch `infra/supabase-vercel-camera-mvp`.

## Próxima etapa

Rodar validações completas, testar manualmente as rotas mobile/admin, configurar Supabase/Vercel reais e validar cloud com credenciais reais.
