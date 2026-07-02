---
name: henrico-security-review
description: Revisão de segurança antes de aceitar código, dependência, MCP, script ou deploy.
---

# Henrico Security Review

Use antes de:
- instalar MCPs
- instalar dependências
- alterar scripts
- tocar em auth
- tocar em banco
- tocar em variáveis de ambiente
- preparar deploy
- rodar comando remoto

Checagens:
1. Não expor secrets.
2. Não executar script remoto sem inspeção ou confirmação.
3. Não alterar ambiente global sem necessidade.
4. Não conceder permissão ampla a agente.
5. Não commitar arquivos sensíveis.
6. Registrar rollback.
