# CondoLogPro — Phase 2 Clean Operational Recovery

Status: especificação autorizada após a reconciliação de arquitetura. Sem deploy de produção.

## Objetivo

Recuperar o app operacional Next.js em `henrico-design-amaral/condologpro-app`, usando `a136054` como anchor e incorporando capacidades selecionadas do PR #17 em lotes verificáveis.

## Sequência obrigatória

1. criar ou confirmar repositório privado vazio;
2. recuperar `a136054` com histórico rastreável;
3. abrir `codex/phase-2-clean-recovery`;
4. inventariar e remover apenas resíduo meta não necessário;
5. executar instalação determinística;
6. validar schemas Prisma sem tocar no Supabase remoto;
7. subir PostgreSQL descartável e aplicar o ledger completo;
8. rodar typecheck, lint, testes e build;
9. iniciar servidor local;
10. executar smoke real no navegador;
11. registrar evidência antes de cada reimplementação do PR #17.

## Runtime

- Next.js App Router + TypeScript estrito;
- runtime Node.js por padrão;
- Server Components para leituras internas;
- Server Actions ou handlers server-side para mutações da UI;
- Route Handlers apenas quando a fronteira HTTP for necessária;
- sem Edge runtime salvo requisito e compatibilidade comprovados;
- self-hosting usa output standalone e health check se o provedor exigir processo Node.

## Banco e migrations

### Autoridade única

- `prisma/schema.supabase.prisma`: mapeamento ORM cloud;
- `prisma/migrations/`: único ledger executável;
- SQL do PR #17: material de entrada a ser revisado e transplantado para migrations Prisma;
- `supabase/migrations/`: não será copiado como segundo ledger.

### Reconciliação

1. aplicar `20260621000000_baseline` e `20260621010000_auth_cloud_foundation` em PostgreSQL descartável;
2. comparar tabelas, enums, constraints, índices e nomes com `0855b72`;
3. extrair apenas deltas necessários de RLS, grants, funções, buckets e tenancy;
4. gerar uma migration nova e pequena, sem reescrever migrations já publicadas;
5. adicionar índices para FKs e colunas usadas em RLS;
6. testar leitura e escrita entre dois tenants, incluindo negação cruzada;
7. validar `migrate deploy` e `migrate status` do zero;
8. só depois comparar com o schema remoto, ainda sem aplicar alterações.

## Capacidades a recuperar do PR #17

- modelo de domínio e contratos de tenancy;
- RLS, grants e validações de segurança;
- testes PGlite de migration, seed e isolamento;
- E2E do shell e fluxo operacional;
- camera/file fallback, OCR opcional e confirmação humana;
- drafts e preservação de formulário;
- idempotência, concorrência e retry de rede;
- fallbacks de WhatsApp e upload;
- gates de release e evidências.

O componente Astro operacional, seu repositório em memória e sua troca de runtime são descartados.

## Infraestrutura

- Supabase candidato: `ricnsldmlnisleklmmch`, `sa-east-1`, atualmente inativo;
- nenhuma restauração, projeto novo ou migration remota nesta etapa;
- Hostinger versus outro runtime será decidido por suporte a Node.js, HTTPS, secrets, logs, health check, rollback, custo e tempo até receita;
- nenhuma plataforma é escolhida apenas porque já possui configuração histórica.

## Gates de aceite

- checkout limpo e origem do anchor registrada;
- `npm ci` determinístico;
- Prisma válido e migration history aplicável do zero;
- testes de autenticação, papéis, tenancy, storage e idempotência verdes;
- typecheck e build verdes;
- login, intake, pendentes, retirada e admin verificados em navegador local;
- nenhuma credencial ou PII no Git/log;
- relatório separa o que foi validado localmente do que continua não confirmado em cloud ou aparelho físico.

## Não objetivos

Billing, conta de morador, WhatsApp Cloud API, OCR avançado, novos módulos, redesign, novos agentes/frameworks e PWA complexa permanecem fora do escopo.
