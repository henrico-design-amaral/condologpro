# PROJECT CONTROL — CondoLogPro

## Estado atual

Fase: reconstrução Astro + Supabase concluída localmente, integração remota bloqueada.

Branch: `codex/rebuild-astro-supabase`, criada de `origin/main` (`8e8e14a`).

Runtime: Astro 7 estático na Hostinger, ilha Preact autenticada e Supabase como única persistência planejada. Não há fallback SQLite no runtime.

## Fonte canônica

- Código: este repositório, `origin/main`.
- Produto: `/goal` de 2026-08-01, `PRODUCT.md` e `docs/rebuild`.
- Banco: migration versionada em `supabase/migrations`.
- Domínio: `https://condologpro.henrico.works`.

## Evidência local

- migration + seed executados em Postgres embutido limpo;
- 41 blocos, 1.394 unidades, 120 moradores sintéticos e segundo condomínio de isolamento;
- 37 testes unitários/contratuais locais na última execução completa antes do relatório;
- Playwright validou câmera permitida/negada, OCR real, fallback manual, WhatsApp, retirada e negativa administrativa;
- lint, TypeScript, Astro check e build passam.

## Bloqueio

O projeto Supabase anterior `jbzpmeudvgrwodgqgozk` foi excluído em 2026-08-01 após autorização explícita. A criação imediata do substituto `condologpro` em `sa-east-1` foi bloqueada porque a organização já usa os dois slots gratuitos ativos com MotoristaOps e PersonalOps. Nenhum desses projetos será pausado e nenhum plano pago será contratado sem autorização específica.

Sem criar o substituto não é possível aplicar migration, gerar tipos remotos, criar usuários Auth, comprovar RLS/Storage real, configurar as variáveis GitHub nem executar o fluxo em produção. O ID excluído é apenas histórico e não deve ser reutilizado.

## Próximo passo mínimo

Liberar um slot Supabase ou atualizar o plano da organização; criar um novo `condologpro` em `sa-east-1`; registrar o novo project ref; em seguida executar `docs/rebuild/DEPLOYMENT.md` a partir do gate de migration.
