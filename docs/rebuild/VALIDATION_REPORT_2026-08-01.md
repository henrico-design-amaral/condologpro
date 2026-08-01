# Relatório de validação — 2026-08-01

## [Certo]

- Branch isolada criada de `origin/main`; diagnóstico registrado no commit `db66b49`.
- Next.js, Prisma, schemas SQLite, rotas API e Vercel removidos do runtime versionado após inventário.
- SQLite legado auditado em modo somente leitura: 5 blocos, 50 unidades, 120 moradores numerados, 32 códigos `CLP-*`, 65 eventos e um telefone distinto. Classificação: somente seed sintético; importação automática bloqueada.
- Migration executada do zero em Postgres PGlite com RLS, functions, policies e seed.
- Seed confirmado: 41 blocos, 1.394 unidades, 120 moradores sintéticos e tenant B.
- Testes unitários/contratuais: OCR parcial/inválido, WhatsApp, rascunho, RLS, bucket, concorrência e seed.
- Playwright no produto certo, em porta exclusiva: fallback manual, câmera negada, câmera autorizada, preview, Tesseract sobre PNG nítido, correção manual, WhatsApp, retirada e negativa administrativa.
- Axe não encontrou violação automática crítica na entrada pública.
- TypeScript, lint, Astro check e build passaram nos ciclos registrados.

## [Certo] Bloqueio externo

A restauração do Supabase canônico falhou com limite de dois projetos gratuitos ativos na organização. A geração de tipos também recusou o projeto porque ele precisa estar ativo e saudável.

Por isso não foram executados: migration remota, Auth real, RLS real, Storage real, URL expirada real, Edge Function, advisors, GitHub CI remoto, Hostinger, subdomínio ou aparelho físico.

Não consigo confirmar isso em produção.

## [Provável]

- O modelo e os índices suportam o piloto de 41 blocos e 1.394 unidades; volume real deve orientar ajustes de busca e retenção.
- WebP a 1.600 px deve reduzir espera em aparelhos modestos, mas rede e câmera reais precisam de medição.

## [Palpite]

- OCR em etiquetas de transportadoras variadas pode exigir pré-processamento por rotação/contraste após amostra real.
- O SLA operacional e a política de retenção final dependem da administração e de análise jurídica.

## Próximo passo mínimo

Liberar um slot ou plano no Supabase sem alterar outro projeto ativo por inferência; então seguir `DEPLOYMENT.md` e executar as provas remotas antes de qualquer deploy de produção.
