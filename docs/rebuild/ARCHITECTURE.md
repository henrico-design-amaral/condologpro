# Arquitetura alvo

## Decisão

O CondoLogPro será um aplicativo Astro 7 estático hospedado na Hostinger, com uma ilha Preact para a superfície autenticada. Supabase Auth, Data API, Postgres e Storage fornecem identidade, persistência e arquivos. RLS é a fronteira de segurança; nenhuma service role entra no navegador ou no build.

## Fronteiras

- Hostinger: HTML, CSS, JavaScript e assets versionados.
- Navegador autenticado: sessão Supabase, UI, câmera, compressão, OCR local e chamadas com publishable key.
- Supabase Auth: login, recuperação e sessão persistente.
- Supabase Postgres: domínio, permissões, transações, concorrência e auditoria.
- Supabase Storage: bucket privado `package-evidence` com paths por condomínio e encomenda.
- Edge Function `admin-invite-user`: único uso de service role, restrito a convite administrativo.

## Resiliência

- Rascunho de recebimento salvo em `localStorage`, sem imagem ou PII excessiva.
- `client_request_id` único evita criação duplicada após retry.
- Uploads são removidos quando a transação de criação falha.
- Operações críticas usam RPC transacional e retornam conflito legível.
- OCR roda no dispositivo e pode ser ignorado.

## Autorização

- `admin`: estrutura, usuários, templates, auditoria e todas as operações.
- `front_desk`: receber, identificar, notificar, consultar e registrar retirada.
- `manager`: consulta administrativa, correções operacionais e auditoria, sem convite de usuários.
- Morador: entidade e contato, sem login no MVP.

## Modelo

O schema versionado inclui condomínios, blocos, unidades, moradores, vínculos de morador, perfis, memberships, papéis, encomendas, imagens, OCR, notificações, retiradas, histórico de status, templates, transportadoras e auditoria.

Todas as tabelas expostas têm RLS. Funções auxiliares de policy ficam no schema privado `security`, com `search_path` vazio, `auth.uid()` obrigatório e grants explícitos.

## Fluxos transacionais

- `create_package_intake`: cria encomenda, imagens, OCR, primeiro status e auditoria.
- `record_package_notification`: registra confirmação humana e avança status.
- `complete_package_pickup`: bloqueia a linha, impede segunda retirada, cria comprovante e auditoria.
- `reopen_package`: correção exclusiva de administração, sem apagar história.
- `search_residents`: busca normalizada no servidor; encomendas usam consulta Data API paginada, filtrada e indexada.
- `get_dashboard_stats`: agregados acionáveis, sem carregar a base no cliente.

## Deploy

O GitHub Actions executa instalação limpa, format check, lint, TypeScript, testes, auditoria, Astro check, E2E e build. O job de deploy só roda depois dos gates, verifica `dist`, valida as variáveis públicas Supabase e publica via SFTP com os secrets existentes.

## Limites conscientes

- Realtime não é ativado: o volume e o fluxo atual não justificam conexão permanente.
- O rascunho local não substitui o Postgres; existe apenas para recuperar digitação após falha de rede.
- A service role não participa do build. Ela é aceita apenas por scripts locais e pelo runtime protegido da Edge Function.
- A aplicação estática usa gate de sessão no cliente, mas a fronteira real de autorização é RLS/RPC no Supabase.
