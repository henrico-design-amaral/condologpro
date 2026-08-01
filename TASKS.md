# TASKS — CondoLogPro

## Concluído localmente

- [x] Inventário, fonte canônica, branch isolada e diagnóstico registrados.
- [x] Astro 7 + TypeScript estrito + Preact como único runtime.
- [x] Next.js, Prisma, SQLite e Vercel removidos do runtime versionado.
- [x] Modelo multi-condomínio, migrations, RLS, Storage privado, RPCs e seed.
- [x] Auth, sessão persistente, usuário ativo, memberships e papéis no cliente.
- [x] Dashboard operacional sem gráficos decorativos.
- [x] Câmera, escolha de arquivo, preview, recaptura, original + thumbnail.
- [x] OCR local assistivo com fallback e correção manual.
- [x] Busca de unidade/morador e provável duplicidade.
- [x] WhatsApp assistido com confirmação separada.
- [x] Retirada, comprovante opcional, histórico e concorrência.
- [x] Administração de moradores, blocos, unidades, usuários, templates e retenção.
- [x] Scripts de auditoria SQLite, seed Auth, RLS/Storage e fluxo operacional.
- [x] Testes unitários, Postgres embutido, Playwright, câmera e acessibilidade.
- [x] CI e deploy Hostinger corrigidos para os secrets existentes.
- [x] Documentação canônica atualizada.

## Bloqueado externamente

- [ ] Criar o projeto Supabase substituto em `sa-east-1` (limite gratuito da organização).
- [ ] Aplicar migration e seed no Supabase.
- [ ] Gerar `database.types.ts` do schema remoto saudável.
- [ ] Criar identidades de teste Auth e executar RLS/Storage/concurrency real.
- [ ] Publicar a Edge Function administrativa.
- [ ] Configurar `PUBLIC_SUPABASE_URL` e `PUBLIC_SUPABASE_PUBLISHABLE_KEY` no GitHub.
- [ ] Mesclar em `main`, executar deploy Hostinger e validar o subdomínio.
- [ ] Testar câmera em aparelho físico real via HTTPS.

Não consigo confirmar isso em produção enquanto o primeiro item continuar bloqueado.
