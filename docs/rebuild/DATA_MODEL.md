# Modelo de dados

## Tenancy e identidade

| Tabela | Responsabilidade |
| --- | --- |
| `condominiums` | tenant, timezone, WhatsApp e retenção |
| `profiles` | perfil ligado a `auth.users` e bloqueio ativo |
| `user_condominiums` | vínculo de usuário ao condomínio |
| `roles` / `user_roles` | administração, portaria e gestão |

## Estrutura e moradores

`blocks` e `units` usam chaves compostas auxiliares para impedir que uma unidade referencie bloco de outro condomínio. `residents` não representa login. `resident_units` permite múltiplas unidades, vínculo principal, ex-morador e validade temporal.

Busca de morador usa texto normalizado, índice trigram e resultado mínimo com telefone mascarado.

## Encomendas e evidência

`packages` guarda o snapshot operacional, `client_request_id` idempotente e `version` para concorrência. Evidências ficam separadas:

- `package_images`: path privado, tipo, dimensões, tamanho e SHA-256;
- `package_recognition_results`: campos sugeridos, corrigidos, confiança e texto OCR;
- `package_notifications`: mensagem renderizada, últimos quatro dígitos e confirmação humana;
- `package_pickups`: pessoa, relação, documento parcial, comprovante e anulação sem apagar;
- `package_status_history`: linha do tempo de domínio;
- `audit_events`: mudanças estruturais e ações críticas sem payload pessoal excessivo.

## Transações

- `create_package_intake(jsonb)`: valida tenant/unidade/morador, cria entrada e evidência de forma idempotente.
- `record_package_notification(...)`: só avança após confirmação do operador.
- `complete_package_pickup(...)`: `FOR UPDATE`, versão esperada e índice único de retirada ativa.
- `reopen_package(...)`: somente admin; anula retirada e preserva histórico.
- `anonymize_resident(...)`: somente admin, exige motivo e recusa morador com encomenda aberta.

## Capacidade

Índices cobrem tenant/status/data, unidade/data, morador/data, código de rastreio e pesquisa de nomes. A UI busca no servidor, limita resultados e pagina 25 encomendas; não carrega a base inteira.
