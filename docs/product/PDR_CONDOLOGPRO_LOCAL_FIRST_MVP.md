# PDR — CondoLogPro Local-First MVP

## 1. Nome do projeto

CondoLogPro

## 2. Categoria

Sistema local-first para gestão operacional de encomendas condominiais.

Subcategoria: logística interna de encomendas em condomínios residenciais e corporativos.

## 3. Objetivo do MVP

Criar uma primeira versão funcional para teste real em condomínio, usando o fluxo observado no condomínio de referência:

1. Portaria/administração recebe encomendas.
2. Operador fotografa a etiqueta.
3. Sistema registra a entrada do pacote.
4. Operador associa pacote a bloco, apartamento e morador.
5. Sistema gera mensagem pronta para WhatsApp.
6. Morador é avisado pelo número institucional existente.
7. Na retirada, operador baixa o pacote digitalmente.
8. Sistema mantém histórico auditável.

## 4. Princípio do produto

O sistema não deve tentar mudar a rotina da portaria.

Ele deve digitalizar o processo manual já existente:

- caderno físico vira registro digital;
- WhatsApp manual vira WhatsApp assistido;
- assinatura física vira baixa digital;
- busca manual vira busca por bloco, apartamento, morador, status e data;
- histórico disperso vira trilha auditável.

## 5. Contexto operacional real

O condomínio de referência possui grande volume operacional:

- múltiplos blocos;
- dezenas de apartamentos por bloco;
- média de múltiplos moradores por apartamento;
- administração com celular institucional;
- notificação individual por WhatsApp;
- registro de retirada em caderno físico;
- assinatura manual do morador no ato da retirada.

O MVP precisa ser funcional o suficiente para simular ou testar esse processo com dados reais ou dados anonimizados.

## 6. Perfis de usuário

### 6.1 Portaria / Administração mobile

Usuário principal do fluxo de entrada.

Precisa:

- registrar pacote rapidamente;
- fotografar etiqueta;
- buscar bloco/apartamento/morador;
- gerar mensagem WhatsApp;
- ver pacotes pendentes;
- baixar retirada.

Restrições:

- pouco tempo;
- possível fila;
- uso em celular;
- baixa tolerância a tela complexa;
- pouca familiaridade técnica.

Meta UX:

- entrada de pacote em até 30 segundos na primeira versão;
- reduzir para menos de 10 segundos em versões futuras;
- botões grandes;
- telas simples;
- texto em português claro.

### 6.2 Administração desktop

Usuário de controle.

Precisa:

- cadastrar moradores;
- importar base;
- visualizar encomendas;
- filtrar por pendentes, retiradas e data;
- corrigir cadastros;
- consultar histórico;
- exportar dados futuramente.

### 6.3 Síndico / gestão

Usuário de acompanhamento.

Precisa:

- ter rastreabilidade;
- reduzir conflitos;
- consultar histórico;
- enxergar volume de encomendas;
- validar operação.

### 6.4 Morador

Usuário indireto.

No MVP, não precisa acessar painel próprio.

Recebe mensagem por WhatsApp e retira pacote na portaria.

## 7. Escopo funcional do MVP

### 7.1 Cadastro base do condomínio

O sistema deve permitir cadastrar:

- condomínio demo;
- blocos;
- apartamentos;
- moradores;
- telefone principal do morador;
- observações opcionais.

Regra importante:

Uma unidade pode ter múltiplos moradores.

Exemplo:

Bloco 12, Apto 304:
- Morador principal;
- Familiar 1;
- Familiar 2.

### 7.2 Importação de base

O MVP deve preparar estrutura para importação CSV/XLSX.

Na primeira versão funcional, aceitar CSV é suficiente.

Campos esperados:

- bloco;
- apartamento;
- nome do morador;
- telefone;
- observação.

A importação deve ter preview ou, no mínimo, validação básica.

### 7.3 Registro de encomenda

A tela mobile deve permitir:

- tirar foto ou anexar foto da etiqueta;
- selecionar bloco;
- selecionar apartamento;
- selecionar morador;
- informar transportadora opcional;
- informar observação opcional;
- criar encomenda pendente.

Campos mínimos:

- id;
- packageCode;
- building;
- unit;
- resident;
- residentPhone;
- labelPhotoUrl;
- carrier;
- status;
- receivedAt;
- receivedBy;
- notifiedAt;
- pickedUpAt;
- pickedUpBy;
- notes.

### 7.4 Foto da etiqueta

O MVP deve salvar imagem localmente em pasta de uploads.

Não exigir OCR obrigatório.

A foto funciona como evidência visual e referência para conferência.

### 7.5 WhatsApp assistido

Após criar a encomenda, o sistema deve gerar uma mensagem pronta.

Formato sugerido:

Olá, [NOME]. Sua encomenda chegou na portaria do condomínio.

Bloco: [BLOCO]
Apartamento: [APTO]
Data/Hora: [DATA_HORA]

Por favor, retire na administração/portaria quando possível.

O sistema deve gerar link do tipo:

https://wa.me/55NUMERO?text=MENSAGEM_URL_ENCODED

O operador toca/clica e o WhatsApp abre com a mensagem pronta.

Importante:

Não implementar automação informal de WhatsApp Web no MVP.

### 7.6 Lista de pendentes

Mobile e desktop devem exibir lista de pacotes pendentes.

Filtros desejáveis:

- bloco;
- apartamento;
- morador;
- data;
- transportadora;
- status.

### 7.7 Retirada digital

O operador deve conseguir marcar pacote como retirado.

Campos:

- nome de quem retirou;
- documento opcional;
- observação opcional;
- timestamp automático;
- operador responsável.

No MVP, assinatura digital é opcional. Não bloquear o fluxo.

### 7.8 Histórico auditável

Cada pacote deve registrar eventos:

- package_received;
- package_notified;
- package_picked_up;
- package_updated.

Cada evento deve ter:

- tipo;
- data/hora;
- usuário/operador;
- metadados.

## 8. Fora de escopo do MVP

Não implementar agora:

- billing;
- pagamento;
- WhatsApp Cloud API;
- OCR obrigatório;
- app nativo;
- múltiplos condomínios em produção;
- módulo de manutenção;
- módulo de comunicados;
- reserva de áreas comuns;
- login de morador;
- lockers inteligentes;
- assinatura jurídica avançada;
- BI avançado.

## 9. Stack técnica

### 9.1 Framework

Next.js App Router.

Motivo:

Permite frontend, backend e rotas API no mesmo projeto.

### 9.2 Linguagem

TypeScript.

Motivo:

Reduz erro estrutural e ajuda manutenção.

### 9.3 Banco

SQLite no MVP.

Motivo:

Local-first, simples, sem depender de servidor externo para teste.

### 9.4 ORM

Prisma.

Motivo:

Schema claro, migrations, seed e evolução futura para PostgreSQL.

### 9.5 UI

Tailwind CSS + shadcn/ui.

Motivo:

Rápido, consistente, acessível, com bons componentes.

### 9.6 Forms

React Hook Form + Zod.

Motivo:

Validação clara e reuso entre frontend/backend.

### 9.7 Upload

Filesystem local.

Pasta sugerida:

public/uploads

### 9.8 OCR

Fase futura ou experimental.

Pode usar Tesseract.js apenas se não comprometer o fluxo.

No MVP, OCR não pode ser bloqueante.

## 10. Estrutura sugerida do projeto técnico

app/
  page.tsx
  layout.tsx
  globals.css
  mobile/
    page.tsx
    intake/
      page.tsx
    pending/
      page.tsx
  admin/
    page.tsx
    residents/
      page.tsx
    packages/
      page.tsx
    settings/
      page.tsx
  api/
    residents/
    packages/
    upload/
    import/
    dashboard/

components/
  layout/
  mobile/
  admin/
  forms/
  tables/
  shared/
  ui/

lib/
  prisma.ts
  validations/
  whatsapp.ts
  storage.ts
  utils.ts
  constants.ts

prisma/
  schema.prisma
  seed.ts

public/
  uploads/

## 11. Modelo de dados inicial

### Organization

Representa o condomínio demo.

Campos:

- id
- name
- address
- whatsappPhone
- createdAt
- updatedAt

### Building

Representa bloco, torre ou conjunto.

Campos:

- id
- organizationId
- label
- createdAt
- updatedAt

### Unit

Representa apartamento ou conjunto.

Campos:

- id
- organizationId
- buildingId
- number
- label
- createdAt
- updatedAt

### Resident

Representa morador.

Campos:

- id
- organizationId
- unitId
- name
- phone
- isPrimary
- notes
- isActive
- createdAt
- updatedAt

### Package

Representa encomenda.

Campos:

- id
- organizationId
- unitId
- residentId
- packageCode
- carrier
- labelPhotoUrl
- status
- notes
- receivedAt
- notifiedAt
- pickedUpAt
- pickedUpByName
- pickedUpByDocument
- createdAt
- updatedAt

Status:

- PENDING
- NOTIFIED
- PICKED_UP
- CANCELLED

### PackageEvent

Representa trilha de auditoria.

Campos:

- id
- organizationId
- packageId
- type
- message
- metadata
- createdAt

Tipos:

- PACKAGE_RECEIVED
- PACKAGE_NOTIFIED
- PACKAGE_PICKED_UP
- PACKAGE_UPDATED
- PACKAGE_CANCELLED

### Operator

Representa operador da portaria/admin.

Campos:

- id
- organizationId
- name
- role
- isActive
- createdAt
- updatedAt

Roles:

- ADMIN
- FRONT_DESK
- MANAGER

## 12. Rotas principais

### Mobile

/mobile

Home operacional da portaria.

/mobile/intake

Registrar nova encomenda.

/mobile/pending

Lista de encomendas pendentes.

/mobile/package/[id]

Detalhe e baixa de encomenda.

### Admin

/admin

Dashboard desktop.

/admin/residents

Base de moradores.

/admin/packages

Gestão de encomendas.

/admin/import

Importar base CSV.

/admin/settings

Configurações do condomínio.

## 13. API inicial

### Residents

GET /api/residents
POST /api/residents
GET /api/residents/search?q=
PUT /api/residents/[id]

### Packages

GET /api/packages
POST /api/packages
GET /api/packages/[id]
PUT /api/packages/[id]
POST /api/packages/[id]/notify
POST /api/packages/[id]/pickup

### Upload

POST /api/upload/label

### Import

POST /api/import/residents

### Dashboard

GET /api/dashboard/summary

## 14. Seed data

Criar dados suficientes para teste realista:

- 1 condomínio demo;
- 5 blocos;
- 10 apartamentos por bloco;
- 2 a 3 moradores por apartamento;
- telefones fictícios em formato brasileiro;
- 2 operadores;
- 20 encomendas de exemplo;
- mistura de status PENDING, NOTIFIED e PICKED_UP.

Credenciais/admin podem ser simplificadas no MVP se auth ainda não existir.

## 15. UX mobile da portaria

Tela inicial mobile deve ter:

- botão grande: Nova encomenda;
- botão: Pendentes;
- busca rápida por bloco/apto;
- contador de pendentes.

Tela de nova encomenda:

1. Foto da etiqueta.
2. Escolha bloco.
3. Escolha apartamento.
4. Escolha morador.
5. Transportadora opcional.
6. Criar e avisar.

Após salvar:

- mostrar confirmação;
- exibir botão Enviar WhatsApp;
- exibir botão Nova encomenda.

## 16. UX desktop admin

Dashboard deve mostrar:

- total de encomendas hoje;
- pendentes;
- retiradas;
- tempo médio de retirada se possível;
- tabela de últimas encomendas.

Tela moradores:

- lista;
- busca;
- filtro por bloco;
- criar/editar morador;
- importar CSV.

Tela encomendas:

- tabela;
- filtros;
- detalhe;
- baixa manual.

## 17. Critérios de aceite do MVP

O MVP só é considerado pronto se:

1. App roda localmente.
2. Existe seed data.
3. Mobile permite registrar encomenda.
4. Mobile permite anexar/fotografar etiqueta.
5. Mobile permite selecionar morador.
6. Sistema salva pacote como pendente/notificado.
7. Sistema gera link WhatsApp funcional.
8. Sistema lista pendentes.
9. Sistema permite baixa de retirada.
10. Admin desktop visualiza histórico.
11. Tudo funciona sem serviço externo obrigatório.
12. Dados persistem em SQLite.

## 18. Métricas de teste no condomínio

Durante piloto observar:

- tempo médio para registrar encomenda;
- erros de associação morador/pacote;
- dificuldade do operador;
- tempo para localizar pendentes;
- quantidade de mensagens enviadas;
- quantidade de retiradas baixadas;
- conflitos evitados ou evidências geradas.

## 19. Estratégia de rollout piloto

### Dia 1

Rodar com dados simulados.

### Dia 2

Cadastrar base parcial real ou anonimizada.

### Dia 3

Registrar encomendas reais em paralelo ao caderno.

### Dia 4-7

Comparar sistema vs processo manual.

Regra:

Não substituir o caderno no piloto inicial. Rodar em paralelo.

## 20. Riscos

### Risco 1 — Operador não usar

Mitigação:

mobile simples, poucos campos e botão grande.

### Risco 2 — Base de moradores ruim

Mitigação:

importação com edição fácil e busca tolerante.

### Risco 3 — WhatsApp assistido não reduzir trabalho suficiente

Mitigação:

mensagem pronta já reduz digitação. Automação oficial vem depois.

### Risco 4 — OCR instável

Mitigação:

não depender de OCR no MVP.

### Risco 5 — Resistência da administração

Mitigação:

posicionar como histórico auditável, não como “mais um sistema”.

## 21. Norte de produto

O produto não é um app social de condomínio.

É uma camada logística operacional para portaria.

Primeiro vencer encomendas.

Depois pensar em manutenção, avisos e demais módulos.
