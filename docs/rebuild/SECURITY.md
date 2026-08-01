# Segurança e privacidade

## Fronteira

O navegador recebe apenas URL e publishable key. Toda tabela exposta habilita RLS; as RPCs críticas são `security definer`, têm `search_path` vazio, verificam `auth.uid()`, perfil ativo, condomínio e papel. Grants são explícitos e `anon` não recebe tabelas ou RPCs.

## Storage

`package-evidence` é privado, limita arquivos a 10 MB e aceita JPG, PNG ou WebP. O primeiro segmento do path é o UUID do condomínio. Policies validam tenant e `owner_id`; leitura na UI usa URL assinada de cinco minutos.

O script `npm run supabase:validate:security` prova, em projeto ativo:

- dois tenants não leem moradores ou arquivos entre si;
- portaria não insere estrutura administrativa;
- usuário inativo não lê encomendas ou memberships;
- URL pública não abre imagem;
- URL assinada abre antes e falha depois da expiração.

## Privacidade

- telefone é mascarado em busca e notificações guardam apenas quatro dígitos;
- retirada aceita somente trecho do documento;
- logs e mensagens de erro não incluem PII;
- retenção fica por condomínio, de 30 a 3.650 dias;
- anonimização exige admin, motivo e ausência de encomenda aberta;
- exclusão física de objetos deve usar Storage API antes de apagar metadados.

Isto implementa controles técnicos de menor privilégio. Não é afirmação de conformidade jurídica completa; essa conclusão exige auditoria legal específica.

## Comprovação local e pendência remota

Testes contratuais verificam RLS nas 18 tabelas, grants, bucket e concorrência. A migration e o seed executam em Postgres embutido limpo. A prova real contra Supabase está bloqueada enquanto o projeto canônico permanecer pausado.
