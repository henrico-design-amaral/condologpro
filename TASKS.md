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

## Bootstrap técnico

- [x] Criar estrutura inicial Next.js.
- [x] Instalar dependências.
- [x] Configurar Prisma + SQLite.
- [x] Criar schema inicial.
- [x] Criar seed data.
- [x] Criar fluxo mobile de recebimento.
- [x] Criar fluxo desktop admin.
- [x] Criar WhatsApp assistido.
- [x] Criar retirada digital.
- [ ] Rodar QA operacional manual completo.
- [ ] Testar acesso mobile na rede local.

## Cloud-ready MVP

- [x] Criar branch `infra/supabase-vercel-camera-mvp`.
- [x] Adicionar variáveis Supabase em `.env.example`.
- [x] Criar `prisma/schema.supabase.prisma` para PostgreSQL.
- [x] Criar scripts Prisma Supabase.
- [x] Criar `src/lib/storage.ts`.
- [x] Implementar fallback local de storage.
- [x] Preparar upload Supabase Storage quando variáveis reais existirem.
- [x] Criar `docs/implementation/SUPABASE_VERCEL_SETUP.md`.
- [x] Criar `docs/implementation/CAMERA_CAPTURE_CORE_FLOW.md`.
- [ ] Criar projeto Supabase real.
- [ ] Criar bucket Supabase real.
- [ ] Configurar variáveis reais na Vercel.
- [ ] Validar conexão cloud real.

## MVP Core

- [x] Cadastro de condomínio demo.
- [x] Cadastro de blocos.
- [x] Cadastro de apartamentos.
- [x] Cadastro de moradores.
- [ ] Importação CSV/XLSX.
- [x] Registro de encomenda.
- [x] Upload/foto da etiqueta.
- [x] Associação com morador por autocomplete.
- [x] Mensagem WhatsApp pronta.
- [x] Lista de encomendas pendentes.
- [x] Baixa de retirada.
- [x] Histórico de eventos.
- [x] OCR experimental não bloqueante.

## Fora de escopo no MVP

- [ ] Cobrança.
- [ ] Multi-condomínio em produção.
- [ ] WhatsApp Cloud API.
- [ ] OCR avançado obrigatório.
- [ ] Módulo de manutenção.
- [ ] Módulo de comunicados.
