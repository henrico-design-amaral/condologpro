# GEMINI.md — Gemini / Antigravity Instructions

Este arquivo orienta o Antigravity sobre regras de conduta, boundaries de diretórios e padrões de qualidade específicos no desenvolvimento deste projeto.

---

## 1. LIMITES OPERACIONAIS DE ESCOPO

- **Ambiente de Trabalho**: Apenas leia, modifique ou crie arquivos que estejam contidos explicitamente no diretório deste projeto local. Nunca acesse ou altere diretórios irmãos (ex: outros projetos ativos ou de sistema) a menos que explicitamente solicitado.
- **Detecção de Riscos**: Em modo `Audit Mode` ou antes de executar modificações no código, faça uma leitura preventiva dos arquivos de configuração e de controle (`PROJECT_CONTROL.md`, `AGENTS.md`, `GEMINI.md`, `ai-memory/`).
- **Segurança de Credenciais**: CondoLogPro manipula variáveis sensíveis de banco de dados e buckets. Nunca persista chaves de API reais, segredos ou dados reais de moradores em arquivos versionados.

---

## 2. HIERARQUIA DA VERDADE (FONTES DE CONTEXTO)

Ao tomar decisões ou resolver ambiguidades técnicas, siga a ordem estrita de precedência:
1. Instrução explícita em tempo real fornecida pelo usuário no chat.
2. Código-fonte real implementado no repositório ativo.
3. Arquivos de memória do projeto em `ai-memory/`.
4. Arquivo de regras específico `GEMINI.md` (este arquivo).
5. Diretrizes globais de governança em `00_SYSTEM/henrico-agent-os` do workspace principal.
6. Histórico recente da sessão de chat.

---

## 3. HIGIENE DE EXECUÇÃO E GIT

- **Validação de Estado**: Antes de realizar alterações de código, certifique-se de que a branch atual é a adequada para o escopo e verifique se há arquivos não commitados via `git status`.
- **Prevenção de Modificação Acidental**: Certifique-se de que caminhos ignorados (como variáveis locais `.env.local` ou pacotes instalados `node_modules`) não estão marcados no `git status` para serem commitados.
- **Revisão de Commits**:
  - Rode `git diff --stat` para validar visualmente a extensão da alteração antes de criar o commit.
  - Faça o commit detalhando de forma objetiva apenas o que foi de fato alterado.
  - Não execute `git push` a menos que explicitamente autorizado pelo usuário.

---

## 4. QUANDO HOUVER AMBIGUIDADE

Caso não seja possível rastrear um bug ou se as metas de um escopo estiverem conflitantes com a memória do projeto, pare a execução de arquivos e apresente:
1. "Não consigo confirmar isso no estado atual do projeto."
2. Apresente as duas hipóteses/caminhos identificados.
3. Proponha uma validação simples para obter a resposta exata do usuário.

---

## 5. FORMATO DE ENTRADA E SAÍDA DE SESSÕES

- **Handoff Inicial**: Sempre comece revisando a seção final de `PROJECT_CONTROL.md` ou `HANDOFF.md` para saber de onde continuar.
- **Relatório de Saída**: Ao concluir a tarefa, atualize o log de sessões no `PROJECT_CONTROL.md` ou `HANDOFF.md` e apresente ao usuário no chat:
  - O projeto afetado.
  - Lista de arquivos alterados.
  - Resumo das decisões tomadas e registradas.
  - Próximos passos sugeridos.
