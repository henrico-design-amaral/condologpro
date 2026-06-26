# QUALITY GATES — CondoLogPro

Este documento define os gates operacionais obrigatórios para sessões de trabalho e os critérios de aceitação do produto para o CondoLogPro.

---

## PARTE A — GATES OPERACIONAIS DA SESSÃO (HARNESS)

Estes gates operacionais são aplicados a cada sessão de desenvolvimento conduzida por agentes de IA no ecossistema `henrico-agent-os`.

### Gate 0 — Abertura de sessão
**Objetivo:** Confirmar que o agente opera no repositório correto, com estado limpo e contexto carregado.
- Executar e reportar: `pwd`, `git status -sb`, `git branch --show-current`, `git remote -v`, `git log --oneline -5`.
- **Aprovação:** Estado esperado confirmado; sem alterações imprevistas.
- **Bloqueio:** Diretório incorreto, branch inadequada ou working tree sujo.

### Gate 1 — Escopo
**Objetivo:** Delimitar as alterações antes de qualquer edição.
- Listar arquivos autorizados e proibidos com base no `HANDOFF.md` ou `AGENTS.md`.
- **Bloqueio:** Escopo ambíguo (ex: "melhorar o site") ou falta de arquivos de governança para tarefas complexas.

### Gate 2 — Segurança (Obrigatório)
**Objetivo:** Prevenir vazamento de credenciais e dados sensíveis.
- Revisar staging com `git diff --cached --stat`.
- **Aprovação:** Sem arquivos `.env`, chaves privadas (`sk-`, `ghp_`, etc.) ou dados reais de moradores/clientes.
- **Bloqueio:** Presença de qualquer credencial hardcoded ou PII em arquivos de código ou documentação.

### Gate 3 — Alteração
**Objetivo:** Garantir modificações mínimas e focadas.
- Revisar diff do working tree com `git diff --stat`.
- **Bloqueio:** Modificações fora do escopo ou múltiplos tipos de arquivos misturados sem justificativa.

### Gate 4 — Visual/Design (Sem Redesign)
**Objetivo:** Manter a consistência estética sem personalizações ad-hoc.
- Seguir o design system e manter as regras existentes.
- **Bloqueio:** Cores CSS nomeadas básicas ou layouts genéricos sem alto contraste para portaria.

### Gate 5 — Build/Teste
**Objetivo:** Validar se o código compila e funciona localmente antes do commit.
- Rodar commands de validação:
  ```bash
  npx prisma validate
  npm run build
  ```
- **Bloqueio:** Erros fatais de TypeScript, validação do Prisma ou falha de compilação.

### Gate 6 — Git
**Objetivo:** Histórico semântico e commits atômicos.
- Mensagem de commit estruturada: `type(scope): descrição` (ex: `fix(storage): add local upload fallback`).
- Commits separados por escopo (não misturar código e documentação de governança).

### Gate 7 — Pré-push
**Objetivo:** Revisão final da fila de commits.
- Rodar: `git log --oneline origin/main..HEAD` e `git diff origin/main --stat`.
- **Aprovação:** Usuário autorizou ou push está no escopo explícito da tarefa.

### Gate 8 — Fechamento/Memória
**Objetivo:** Manter rastreabilidade de decisões e handoffs.
- Atualizar a memória operacional em `ai-memory/HenricoOPS.md` e o `HANDOFF.md`.
- Relatar arquivos alterados, decisões registradas e passos futuros.

---

## PARTE B — GATES DE PRODUTO (MVP)

Estes gates definem as réguas de aceitação técnica do ciclo de vida do MVP do CondoLogPro.

### Gate 1 — Fundação
**Aprovado somente se:**
- Pasta do projeto criada;
- Arquivos de controle existem;
- Git local iniciado;
- Nenhum app foi criado ainda;
- Documentação inicial coerente.

### Gate 2 — Bootstrap técnico
**Aprovado somente se:**
- Next.js roda localmente;
- TypeScript sem erro;
- Prisma configurado;
- SQLite funcionando;
- Seed executa;
- Login/admin inicial funciona.

### Gate 3 — Fluxo mobile portaria
**Aprovado somente se:**
- Tela mobile permite cadastrar pacote;
- Permite anexar/fotografar etiqueta;
- Permite buscar bloco/apto/morador;
- Cria encomenda pendente;
- Gera mensagem WhatsApp assistida.

### Gate 4 — Fluxo admin desktop
**Aprovado somente se:**
- Admin visualiza encomendas;
- Filtra por status;
- Visualiza moradores;
- Edita dados básicos;
- Vê histórico de retirada.

### Gate 5 — Teste real controlado
**Aprovado somente se:**
- O fluxo completo funciona com dados simulados do condomínio;
- Não depende de internet externa para funções core;
- Pode ser usado em celular na mesma rede local;
- O operador consegue concluir entrada e retirada sem ajuda técnica.
