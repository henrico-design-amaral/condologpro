# Supabase + Vercel Setup — CondoLogPro

## Objetivo

Preparar o CondoLogPro para um MVP cloud-ready usando GitHub, Vercel, Supabase Postgres e Supabase Storage, sem quebrar o fluxo local-first atual.

## Estado atual

- O schema local padrão continua em `prisma/schema.prisma` com SQLite.
- O schema cloud está em `prisma/schema.supabase.prisma` com PostgreSQL.
- A aplicação usa `DATABASE_URL` para Prisma.
- O upload da etiqueta usa `src/lib/storage.ts`.
- Sem variáveis Supabase completas, o storage salva em `public/uploads`.
- Com variáveis Supabase completas, o storage envia para Supabase Storage usando `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor.
- O CI prepara um SQLite local com `prisma:push` e `prisma:seed` antes de `typecheck` e `build`; isso não valida Supabase real.

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
SUPABASE_STORAGE_PUBLIC="true"
```

Use `SUPABASE_STORAGE_PUBLIC="false"` se o bucket for privado. Nesse caso, a UI deve consumir URLs assinadas geradas no servidor.

`SUPABASE_SERVICE_ROLE_KEY` deve ficar apenas no servidor. Não coloque esse valor em código, Git, variáveis públicas ou componentes client-side.

## Banco Supabase

1. Criar um projeto no Supabase.
2. Copiar a URL Postgres pooled para `DATABASE_URL`.
3. Copiar a URL direta para `DIRECT_URL`.
4. Rodar:

```bash
npm run prisma:supabase:validate
npm run prisma:supabase:generate
npm run prisma:supabase:push
npm run prisma:supabase:seed
```

Use `prisma db push` nesta fase porque o MVP ainda está evoluindo rapidamente. Quando a estrutura estabilizar, migrar para migrations versionadas.

## Storage Supabase

1. Criar bucket `package-labels`.
2. Definir política de acesso conforme o piloto:
   - bucket público se a foto precisa aparecer por URL direta no app;
   - bucket privado se o próximo passo for assinar URLs no servidor.
3. Configurar `SUPABASE_STORAGE_BUCKET="package-labels"`.
4. Configurar `SUPABASE_STORAGE_PUBLIC`:
   - `"true"` para URL pública;
   - `"false"` para bucket privado e URL assinada.
5. Configurar `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.

O helper atual:

- valida JPG, PNG e WebP;
- limita imagens a 8 MB;
- gera nomes seguros por UUID;
- grava localmente quando Supabase não está configurado;
- envia para Supabase Storage quando as variáveis existem;
- oferece `createSignedLabelUrl()` para bucket privado.

## Vercel

1. Conectar o repositório GitHub do CondoLogPro na Vercel.
2. Configurar as variáveis acima no painel do projeto.
3. Build command: `npm run build`.
4. Install command: `npm install`.
5. Sem credenciais Supabase reais, validar apenas o build local.

## CI GitHub Actions

O CI não usa secrets Supabase. Ele valida o modo local:

```bash
npm ci
npm run prisma:validate
npm run prisma:generate
mkdir -p prisma && touch prisma/dev.db
npm run prisma:push
npm run prisma:seed
npm run typecheck
npm run build
```

Esse fluxo garante que páginas que consultam Prisma não falhem por tabelas SQLite ausentes em runner limpo. Ele não prova que Postgres/Supabase Storage estão configurados.

## Local vs Cloud

- Local padrão: SQLite + upload em `public/uploads`.
- Cloud: Supabase Postgres + Supabase Storage.
- O código não finge conexão cloud quando credenciais não existem.
- O fluxo de encomendas deve continuar funcionando localmente para teste controlado.

## Câmera mobile

`getUserMedia` exige secure context. Em produção Vercel com HTTPS, a câmera direta deve ser suportada quando o navegador permitir. Em localhost, navegadores costumam permitir testes locais. Em celular acessando `http://IP-DA-LAN:3000`, a câmera direta pode falhar por contexto inseguro.

Por isso `/mobile/intake` mantém sempre o fallback:

```html
<input type="file" accept="image/*" capture="environment">
```

A câmera física ainda precisa ser testada em aparelho real via HTTPS. Não considerar validação local desktop como prova de câmera em produção.

## Limitações conhecidas

- Não há validação real de conexão Supabase neste ambiente sem credenciais.
- O schema PostgreSQL está preparado, mas precisa de `DATABASE_URL`/`DIRECT_URL` reais.
- Bucket privado exige consumo de URL assinada server-side antes do piloto cloud.
- Telefone em LAN HTTP pode não abrir câmera direta; fallback de captura por arquivo deve funcionar.
- Billing, WhatsApp Cloud API e módulos genéricos de condomínio continuam fora do MVP.
