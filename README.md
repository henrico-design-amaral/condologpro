# CondoLogPro

Produto operacional para recebimento, identificação, comunicação e retirada de encomendas em condomínios. O runtime atual é Astro 7 + TypeScript estrito + Preact + Supabase; Next.js, Prisma, SQLite e Vercel não participam mais da aplicação.

## Fluxo

1. Usuário ativo entra pelo Supabase Auth.
2. Portaria fotografa ou escolhe a etiqueta.
3. A imagem original e uma versão comprimida são preparadas; Tesseract roda localmente e sugere campos.
4. Operador confirma ou corrige os dados, associa unidade/morador e recebe aviso de provável duplicidade.
5. Supabase Storage guarda os arquivos em bucket privado e uma RPC transacional cria encomenda, OCR, histórico e auditoria.
6. O WhatsApp é aberto com mensagem editável; o envio só muda de estado quando o operador confirma que enviou.
7. A retirada usa nome, relação, documento parcial, comprovante opcional e controle de versão contra dois operadores simultâneos.

OCR, câmera e WhatsApp nunca são ações falsas: todos têm fallback manual ou confirmação humana explícita.

## Stack

- Astro 7, ilha Preact e CSS por tokens;
- Supabase Auth, Postgres, Storage privado e Edge Function administrativa;
- RLS por condomínio, usuário ativo e papel;
- Tesseract.js no navegador;
- Vitest, PGlite, Playwright e axe;
- GitHub Actions e SFTP Hostinger.

## Desenvolvimento

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Variáveis públicas necessárias:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`SUPABASE_SERVICE_ROLE_KEY` é aceita somente pelos scripts locais de seed. Nunca use prefixo `PUBLIC_` nela.

## Validação

```bash
npm run format
npm run lint
npm run typecheck
npm run test
npm run check
npm run build
npm run security
npm run test:e2e
```

O teste de banco executa a migration e o seed em Postgres embutido limpo. As provas reais de RLS/Storage e concorrência ficam em:

```bash
npm run supabase:validate:security
npm run supabase:validate:flow
```

Esses dois comandos exigem o projeto Supabase ativo e as identidades E2E do `.env.example`.

## Supabase

```bash
npx supabase start
npx supabase db reset
npm run supabase:seed:users
```

Docker não está disponível no ambiente Windows atual, por isso a validação local de schema usa PGlite. A migration canônica é `supabase/migrations/20260801160101_rebuild_astro_supabase_foundation.sql`.

## Estado externo em 2026-08-01

O projeto Supabase anterior `condologpro` (`jbzpmeudvgrwodgqgozk`) foi excluído no painel após autorização explícita. A criação do substituto foi recusada porque a organização continua usando os dois slots gratuitos ativos com MotoristaOps e PersonalOps. Não existe um projeto Supabase canônico atual até que um slot seja liberado ou o plano seja atualizado. O código, a migration e os testes locais estão prontos, mas Auth, RLS, Storage, GitHub secrets Supabase, Hostinger e produção não podem ser declarados validados sem o substituto saudável.

Não consigo confirmar isso em produção.

## Documentação atual

- `PRODUCT.md` e `DESIGN.md`: produto e linguagem visual;
- `docs/rebuild/ARCHITECTURE.md`: arquitetura e fronteiras;
- `docs/rebuild/DATA_MODEL.md`: entidades e transações;
- `docs/rebuild/OCR.md`: câmera, imagem e reconhecimento;
- `docs/rebuild/SECURITY.md`: RLS, Storage e privacidade;
- `docs/rebuild/DEPLOYMENT.md`: GitHub e Hostinger;
- `docs/rebuild/OPERATIONAL_CHECKLIST.md`: checklist de piloto;
- `docs/rebuild/VALIDATION_REPORT_2026-08-01.md`: evidências e bloqueio atual.

Arquivos fora de `docs/rebuild` podem registrar decisões históricas do runtime Next/SQLite e não substituem esta fonte canônica.
