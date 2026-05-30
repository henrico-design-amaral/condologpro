# TASKS — CondoLogPro

## Fundação

- [x] Criar pasta raiz do projeto.
- [x] Criar arquivos de controle.
- [x] Inicializar Git local.
- [x] Criar PDR completo.
- [x] Criar prompts Claude Code.
- [x] Criar agentes Claude.
- [x] Criar skills Claude.
- [x] Criar documentação de arquitetura local-first.
- [x] Criar plano de implementação do MVP.
- [x] Criar checklist QA piloto.

## Bootstrap e estrutura

- [x] Criar repositório GitHub.
- [x] Criar estrutura inicial Next.js.
- [x] Instalar dependências.
- [x] Configurar Prisma + SQLite.
- [x] Criar schema inicial.
- [x] Criar seed data (1 org, 5 blocos, 50 apts, 120 moradores, 30 encomendas).

## MVP Core — implementado 2026-05-29

- [x] Camada de acesso a dados (src/lib/data.ts).
- [x] Upload local de foto de etiqueta (/api/upload).
- [x] API de criação de encomenda (/api/packages).
- [x] API de notificação (/api/packages/[id]/notify).
- [x] API de retirada (/api/packages/[id]/pickup).
- [x] WhatsApp assistido via wa.me (src/lib/whatsapp.ts).
- [x] Mobile home com contadores em tempo real (/mobile).
- [x] Formulário de entrada de encomenda (/mobile/intake).
- [x] Lista de pendentes (/mobile/pending).
- [x] Detalhe de encomenda + notificação + retirada (/mobile/package/[id]).
- [x] Dashboard admin com métricas (/admin).
- [x] Tabela de encomendas admin (/admin/packages).
- [x] Tabela de moradores admin (/admin/residents).
- [x] Tela de importação planejada (/admin/import).
- [x] Tela de configurações (/admin/settings).
- [x] Componentes compartilhados (StatusBadge, MetricCard, EmptyState).
- [x] Layout admin com navegação.

## Próximas iterações

- [ ] Busca/filtro na lista de pendentes.
- [ ] Busca/filtro nas tabelas admin.
- [ ] Importação CSV de moradores (/admin/import).
- [ ] Criar repositório GitHub e subir branch main.
- [ ] QA operacional com fluxo completo.
- [ ] Teste de acesso mobile na rede local (npm run dev:host).

## Fora de escopo no MVP

- [ ] Cobrança.
- [ ] Multi-condomínio em produção.
- [ ] WhatsApp Cloud API.
- [ ] OCR avançado obrigatório.
- [ ] Módulo de manutenção.
- [ ] Módulo de comunicados.
