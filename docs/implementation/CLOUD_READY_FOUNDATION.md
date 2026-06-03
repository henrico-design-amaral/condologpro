# Cloud-Ready Foundation — CondoLogPro

> **Direção:** cloud-ready MVP com fallback local. Este documento lista o que a base atual já entrega e o que **permanece manual** até existirem credenciais reais de Supabase/Vercel.

## 1. O que esta fundação já entrega

### 1.1. Aplicação cloud-ready
- Mesma base de código roda em local (SQLite + `public/uploads`) e em cloud (Supabase Postgres + Supabase Storage).
- `src/lib/storage.ts` detecta envs Supabase e roteia o upload automaticamente.
- `src/lib/storage.ts` expõe `createSignedLabelUrl(path, ttl)` para buckets privados.
- `vercel.json` no root declara framework, build/install commands e headers de segurança básicos.

### 1.2. Banco dual
- `prisma/schema.prisma` (SQLite) — local default.
- `prisma/schema.supabase.prisma` (PostgreSQL) — cloud, com `directUrl` para migrations.
- Scripts `prisma:supabase:validate | generate | push | seed | studio` em `package.json`, **sem remover** os scripts SQLite.

### 1.3. CI básica no GitHub Actions
- `.github/workflows/ci.yml` roda em push e PR para `main` e `mvp/**`.
- Steps: `prisma:validate` → `prisma:generate` → **`prisma:push`** → **`prisma:seed`** → `typecheck` → `build`.
- O CI **cria e popula o SQLite local** (`prisma/dev.db`) antes do build, então o prerender de páginas que consultam Prisma não falha por tabela ausente.
- Não exige secrets Supabase. Cloud validation permanece manual até existirem credenciais reais.

### 1.4. Páginas dinâmicas
- Páginas que consultam Prisma em render foram marcadas com `export const dynamic = "force-dynamic"`.
- Páginas afetadas: `/admin`, `/admin/packages`, `/admin/residents`, `/admin/history`, `/admin/settings`, `/mobile`, `/mobile/pending`, `/mobile/package/[id]`.
- Páginas puramente informativas (`/`, `/mobile/intake`, `/admin/import`) seguem estáticas porque não dependem de dados em tempo de build.
- **Por que dinâmico**: cada render reflete o estado real do banco (entrada de pacote, baixa de retirada, KPIs). Evita cache obsoleto e dispensa o build de depender de uma seed "perfeita" que poderia mascarar regressões.

### 1.5. UX preservada
- Câmera-first mobile intake (`/mobile/intake`) com OCR opcional e fallback manual.
- Resident autocomplete (`/api/residents/search`).
- WhatsApp assistido via `wa.me` (sem Cloud API).
- Admin desktop denso, portaria mobile dark.
- Status badges, atrasadas (>24h), acessibilidade WCAG-friendly.

## 2. O que **permanece manual** (até existirem credenciais)

| Item | Por que é manual | Quem faz |
| --- | --- | --- |
| Criar projeto Supabase | Requer conta e billing | Usuário |
| Provisionar bucket `package-labels` | Configuração de painel | Usuário |
| Definir `DATABASE_URL` (pooled) e `DIRECT_URL` | Secrets da Vercel | Usuário |
| Definir `SUPABASE_SERVICE_ROLE_KEY` no servidor | Secrets sensíveis | Usuário |
| `prisma db push` contra Supabase real | Operação destrutiva | Usuário + dev |
| Regenerar o cliente Prisma para o schema Supabase antes do seed | Prisma gera cliente por provider | Dev |
| Validar upload de etiqueta contra Supabase Storage | Requer bucket real | Dev |
| Conectar GitHub repo à Vercel | Conta Vercel | Usuário |
| Configurar envs Supabase na Vercel (Production/Preview) | Painel Vercel | Usuário |
| Smoke test cloud com pacote de teste | Requer deploy real | Dev |

> **Importante**: não afirmar "validação cloud concluída" enquanto os itens acima não forem executados com credenciais reais.

## 3. Riscos e mitigações

| Risco | Mitigação |
| --- | --- |
| Service role key vazar para o cliente | Todas as chamadas Supabase Storage e signed URL ficam server-side (`src/lib/storage.ts`, `/api/*`). A UI só consome URLs (públicas ou assinadas). |
| Bucket público expor etiquetas | Por padrão o app trata bucket como público. Para piloto, considerar bucket privado + signed URL. Trocar exige ler o arquivo `CLOUD_READY_FOUNDATION.md` antes. |
| Seed contra Supabase quebrar por causa do client SQLite | Documentar passo de regeneração (`prisma:supabase:generate`) antes do seed cloud. |
| Drift entre `schema.prisma` e `schema.supabase.prisma` | CI valida o schema SQLite; manter as duas definições em sincronia é responsabilidade de dev. Considerar gerar `schema.supabase.prisma` a partir do `schema.prisma` quando estabilizar. |
| Vercel build lento por `tesseract.js` dinâmico | tesseract.js é carregado sob demanda no cliente, não no build. Build deve permanecer < 30s local. |
| Cold start do Supabase Postgres | Pooled connection + `pgbouncer=true` na `DATABASE_URL` mitiga. |

## 4. Como subir o ambiente cloud (passo a passo)

1. **Criar projeto no Supabase** e copiar:
   - `DATABASE_URL` (pooler, porta 6543, `?pgbouncer=true`).
   - `DIRECT_URL` (porta 5432).
   - `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - `SUPABASE_SERVICE_ROLE_KEY` (apenas server-side).
2. **Criar bucket `package-labels`** com a política de acesso desejada.
3. **Conectar repo GitHub na Vercel** e configurar as envs acima.
4. **Push para `main`** (ou PR) — Vercel dispara build, CI do GitHub dispara typecheck.
5. **Rodar push do schema**:
   ```bash
   npm run prisma:supabase:push
   ```
6. **Regenerar cliente Supabase e seedar**:
   ```bash
   npm run prisma:supabase:generate
   npm run prisma:supabase:seed
   ```
7. **Smoke test**:
   - Abrir `/mobile/intake` no celular (HTTPS) e registrar uma encomenda real.
   - Conferir upload no painel do Supabase Storage.
   - Confirmar WhatsApp assistido abrindo o `wa.me`.
   - Dar baixa e verificar evento `PACKAGE_PICKED_UP` no histórico.

## 5. Próximos passos fora deste commit

- Endpoint `/api/upload/label/[...path]` que retorna signed URL (necessário para bucket privado).
- GitHub Actions job opcional `cloud-smoke` que valida contra Supabase staging com secrets protegidos.
- PWA manifest + service worker para tolerar offline real.
- Migrations versionadas (`prisma migrate dev`) quando a estrutura estabilizar.
- Documentar o fluxo de regenerar o cliente Prisma no seed cloud.

## 6. CI: contrato atual

O CI executa a sequência abaixo em todo push/PR para `main` e `mvp/**`:

```bash
npm ci
npm run prisma:validate   # schema SQLite válido
npm run prisma:generate   # cliente Prisma
npm run prisma:push       # cria prisma/dev.db com todas as tabelas
npm run prisma:seed       # popula com 5 buildings, 50 units, 120 residents, 32 packages
npm run typecheck         # tsc --noEmit
npm run build             # Next.js build (16/16 páginas)
```

Páginas DB-backed são `force-dynamic` para evitar dependência de banco no build. Páginas estáticas (`/`, `/mobile/intake`, `/admin/import`) permanecem estáticas porque não chamam Prisma.

> **Importante**: passar o CI **não é** validação cloud. Para validar contra Supabase real, siga o passo a passo da seção 4 com credenciais de verdade. O CI garante que o build fica verde localmente; o deploy na Vercel continua dependendo das envs configuradas no painel.
