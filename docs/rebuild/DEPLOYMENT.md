# Desenvolvimento e deploy

## Gate local

```bash
npm ci
npm run quality
npx playwright install chromium
npm run test:e2e
npm run legacy:audit
```

`quality` executa formatação, lint, TypeScript, Vitest/PGlite, Astro check, build e auditoria de dependências.

## Supabase

Quando o projeto `jbzpmeudvgrwodgqgozk` estiver ativo:

1. confirmar que não há schema de produção útil a sobrescrever;
2. aplicar `20260801160101_rebuild_astro_supabase_foundation.sql` como migration;
3. executar `supabase/seed.sql` somente no ambiente de validação/piloto aprovado;
4. gerar os tipos TypeScript do schema saudável;
5. publicar `admin-invite-user` com `verify_jwt=true`;
6. criar contas E2E com `npm run supabase:seed:users` em ambiente controlado;
7. rodar `npm run supabase:validate:security`;
8. rodar `npm run supabase:validate:flow`;
9. consultar advisors de segurança e performance;
10. remover/anonimizar fixtures antes de dados reais, se o ambiente for produção.

## GitHub

Secrets necessários:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `HOSTINGER_HOST`
- `HOSTINGER_USERNAME`
- `HOSTINGER_PASSWORD`
- `HOSTINGER_PORT`
- `HOSTINGER_TARGET_DIR`

CI usa dados mockados somente para navegação do navegador; não simula prova de RLS. Deploy reconstrói `dist` com as variáveis reais depois dos testes e falha se qualquer configuração estiver ausente.

## Hostinger

O workflow publica apenas `dist/` por SFTP com `mirror --reverse --delete`. Depois do merge em `main`:

1. aguardar CI e deploy verdes;
2. abrir `https://condologpro.henrico.works`;
3. verificar DNS, HTTPS, assets, console e requests;
4. executar login, foto/upload, OCR, correção, associação, WhatsApp, confirmação, reload, retirada, logout e novo login;
5. repetir em mobile físico e desktop;
6. registrar IDs sem copiar PII ou secrets.

Não publicar se as provas Supabase reais não passaram.
