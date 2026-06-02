# Supabase + Vercel Setup — CondoLogPro

## Objetivo

Preparar o CondoLogPro para um MVP cloud-ready usando GitHub, Vercel, Supabase Postgres e Supabase Storage, sem quebrar o fluxo local-first atual.

## Estado atual

- O schema local padrão continua em `prisma/schema.prisma` com SQLite.
- O schema cloud está em `prisma/schema.supabase.prisma` com PostgreSQL.
- A aplicação usa `DATABASE_URL` para Prisma.
- O upload da etiqueta usa `src/lib/storage.ts`.
- Sem variáveis Supabase completas, o storage salva em `public/uploads`.
- Com variáveis Supabase completas, o storage envia para Supabase Storage.

## Variáveis de ambiente

Local SQLite:

```bash
DATABASE_URL="file:./dev.db"
```

Cloud Supabase/Vercel:

```bash
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[service-role-key-server-only]"
SUPABASE_STORAGE_BUCKET="package-labels"
```

`SUPABASE_SERVICE_ROLE_KEY` deve ficar apenas no servidor. Não coloque esse valor em código, Git ou variáveis públicas.

## Banco Supabase

1. Criar um projeto no Supabase.
2. Copiar a URL Postgres pooled para `DATABASE_URL`.
3. Copiar a URL direta para `DIRECT_URL`.
4. Rodar:

```bash
npm run prisma:supabase:validate
npm run prisma:supabase:generate
npm run prisma:supabase:push
npm run prisma:seed
```

Use `prisma db push` nesta fase porque o MVP ainda está evoluindo rapidamente. Quando a estrutura estabilizar, migrar para migrations versionadas.

## Storage Supabase

1. Criar bucket `package-labels`.
2. Definir política de acesso conforme o piloto:
   - bucket público se a foto precisa aparecer por URL direta no app;
   - bucket privado se o próximo passo for assinar URLs no servidor.
3. Configurar `SUPABASE_STORAGE_BUCKET="package-labels"`.
4. Configurar `NEXT_PUBLIC_SUPABASE_URL` e uma chave server-side.

O helper atual retorna URL pública. Se o bucket for privado, será necessário trocar para URL assinada antes do piloto cloud.

## Vercel

1. Conectar o repositório GitHub do CondoLogPro na Vercel.
2. Configurar as variáveis acima no painel do projeto.
3. Build command: `npm run build`.
4. Install command: `npm install`.
5. Sem credenciais Supabase reais, validar apenas o build local.

## Local vs Cloud

- Local padrão: SQLite + upload em `public/uploads`.
- Cloud: Supabase Postgres + Supabase Storage.
- O código não finge conexão cloud quando credenciais não existem.
- O fluxo de encomendas deve continuar funcionando localmente para teste controlado.

## Limitações conhecidas

- Não há validação real de conexão Supabase neste ambiente sem credenciais.
- O schema PostgreSQL está preparado, mas precisa de `DATABASE_URL`/`DIRECT_URL` reais.
- Bucket privado ainda exige implementação de URL assinada.
- Billing, WhatsApp Cloud API e módulos genéricos de condomínio continuam fora do MVP.
