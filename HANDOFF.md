# HANDOFF — CondoLogPro

## Decisão

O produto foi reconstruído no branch `codex/rebuild-astro-supabase`. A implementação anterior Next/Prisma/SQLite/Vercel foi inventariada, mapeada em `docs/rebuild/MIGRATION_MAP.md` e removida do runtime.

## O que funciona localmente

- Astro/Preact renderiza a aplicação autenticada e responsiva.
- Câmera usa `getUserMedia`; arquivo é fallback explícito.
- Imagem original e thumbnail são preparadas sem base64 no banco.
- Tesseract roda localmente, sugere dados e nunca bloqueia entrada manual.
- RPCs transacionais definem recebimento, confirmação WhatsApp, retirada, reabertura e anonimização.
- RLS cobre as 18 tabelas expostas e paths do Storage começam pelo condomínio.
- O Postgres embutido executa migration + seed do zero.
- Playwright cobre 360, 390, 768, 1024 e 1440 px.

## O que não foi confirmado

O Supabase anterior foi excluído, mas o substituto não pôde ser criado porque a organização excedeu o limite gratuito de projetos ativos. Logo, não foram confirmados schema remoto, Auth real, RLS real, Storage real, Edge Function, tipos gerados, integração remota, Hostinger ou produção.

Não consigo confirmar isso.

## Retomada mínima

1. Liberar slot/plano Supabase sem pausar outro projeto ativo por inferência.
2. Criar um novo projeto `condologpro` em `sa-east-1` e registrar o novo project ref.
3. Seguir `docs/rebuild/DEPLOYMENT.md` do passo de migration em diante.
4. Só então declarar produção validada.
