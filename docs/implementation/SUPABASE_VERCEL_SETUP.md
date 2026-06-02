# Supabase + Vercel Setup — CondoLogPro

> **Direção atual:** cloud-ready MVP com fallback local. Cloud é o alvo; local é o modo de desenvolvimento e contingência.

## Estado atual

- Schema local padrão em `prisma/schema.prisma` (SQLite).
- Schema cloud em `prisma/schema.supabase.prisma` (PostgreSQL + `directUrl`).
- Scripts `prisma:supabase:*` registrados em `package.json` (sem remover os scripts SQLite).
- `src/lib/storage.ts` decide sozinho entre Supabase Storage e `public/uploads`.
- `vercel.json` no root com `framework: nextjs` e headers de segurança básicos.
- CI em `.github/workflows/ci.yml` rodando `prisma:validate`, `prisma:generate`, `typecheck`, `build` — **sem** secrets Supabase.
- `docs/implementation/CLOUD_READY_FOUNDATION.md` lista o que ainda depende de credenciais reais.

## Variáveis de ambiente

### Local (SQLite)

```bash
DATABASE_URL="file:./dev.db"
```

### Cloud (Supabase + Vercel)

```bash
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[service-role-key-server-only]"
SUPABASE_STORAGE_BUCKET="package-labels"
# Opcional: força bucket privado (signed URLs server-side)
# SUPABASE_STORAGE_PUBLIC="false"
```

> `SUPABASE_SERVICE_ROLE_KEY` deve ficar **apenas no servidor**. Nunca commitar, nunca expor ao cliente.

## Banco Supabase

1. Criar projeto no Supabase.
2. Copiar URL Postgres pooled para `DATABASE_URL`.
3. Copiar URL direta para `DIRECT_URL`.
4. Rodar, **na ordem**:

```bash
npm run prisma:supabase:validate
npm run prisma:supabase:generate
npm run prisma:supabase:push
npm run prisma:supabase:seed
```

> O seed atual usa o cliente Prisma padrão (`schema.prisma` = SQLite). Para rodar contra Supabase, é necessário regenerar o cliente com `--schema prisma/schema.supabase.prisma` **antes** do seed, ou usar um cliente paralelo. Documentar este passo quando o piloto cloud começar.

`prisma db push` é aceitável nesta fase porque o MVP evolui rápido. Quando a estrutura estabilizar, migrar para `prisma migrate dev` com migrations versionadas.

## Storage Supabase

1. Criar bucket `package-labels` no painel do Supabase.
2. Definir política de acesso conforme o piloto:
   - **Público** (`SUPABASE_STORAGE_PUBLIC=true` ou omitido): foto aparece por URL direta no app.
   - **Privado** (`SUPABASE_STORAGE_PUBLIC=false`): usar `createSignedLabelUrl(path, ttl)` server-side. A UI consome via endpoint dedicado.
3. `src/lib/storage.ts` já detecta a config e valida o upload (jpeg/png/webp, ≤ 8 MB).

### Helper de URL assinada

```ts
import { createSignedLabelUrl } from "@/lib/storage";

// server-side only; nunca exponha a service role key
const signedUrl = await createSignedLabelUrl("labels/2026-06-02/uuid.jpg", 600);
// → "https://[project-ref].supabase.co/storage/v1/object/sign/package-labels/...?...&token=..."
```

A UI atual consome `storeLabelPhoto` que retorna URL pública. Para bucket privado, recomenda-se um endpoint `/api/upload/label/[...path]` que chama `createSignedLabelUrl` antes de servir a foto. Está listado em `CLOUD_READY_FOUNDATION.md` como follow-up.

## Vercel

1. Conectar o repositório GitHub do CondoLogPro na Vercel.
2. Configurar as variáveis acima no painel do projeto (Production, Preview e Development conforme apropriado).
3. Vercel auto-detecta Next.js. `vercel.json` reforça `framework: nextjs`, `buildCommand`, `installCommand` e adiciona headers de segurança (X-Content-Type-Options, Referrer-Policy, X-Frame-Options).
4. Sem credenciais Supabase reais, validar apenas o build local (`npm run build`) — que continua passando contra SQLite.

## GitHub Actions

- `.github/workflows/ci.yml` roda em push/PR para `main` e `mvp/**`.
- Steps: checkout → setup Node 20 → `npm ci` → `prisma:validate` → `prisma:generate` → `typecheck` → `build`.
- Não exige secrets Supabase; cloud validation é manual.

## Local vs Cloud — checklist

| Verificação | Local | Cloud |
| --- | --- | --- |
| `prisma:validate` | ✅ | ✅ (com schema.supabase) |
| `prisma:generate` | ✅ | ✅ (com schema.supabase) |
| `prisma:push` | ✅ (SQLite) | ✅ (Supabase Postgres) |
| `db:seed` | ✅ | ⚠️ requer regenerar client Supabase |
| `typecheck` | ✅ | ✅ |
| `build` | ✅ | ✅ (Vercel) |
| Upload de etiqueta | `public/uploads` | Supabase Storage |
| Conexão real Supabase | n/a | manual |

## Limitações conhecidas

- CI não roda contra Supabase (sem credenciais).
- Seed contra Supabase exige regenerar o cliente Prisma para o schema PostgreSQL.
- Bucket privado ainda exige um endpoint de leitura para URL assinada ser consumida pela UI.
- Billing, WhatsApp Cloud API, multi-tenant e módulos genéricos de condomínio continuam fora do MVP.
