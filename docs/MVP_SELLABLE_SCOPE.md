# CondoLogPro — escopo vendável

## Resultado comercial mínimo

Um condomínio deve conseguir avaliar e operar o fluxo de encomendas sem intervenção técnica durante a demonstração:

1. operador autenticado registra a encomenda no celular;
2. anexa ou fotografa a etiqueta;
3. confirma bloco, unidade e morador;
4. cria um registro sem duplicação;
5. abre uma mensagem de WhatsApp assistida;
6. acompanha pendentes;
7. confirma a retirada;
8. administração consulta histórico, moradores e indicadores básicos.

## Superfícies

- A landing comercial Astro vive em `condologpro` / `condologpro.henrico.works`.
- O app Next.js vive em `condologpro-app` / `app.condologpro.henrico.works`.
- A landing não é fallback do app e o app não hospeda marketing.

## Requisitos obrigatórios

- autenticação server-side de operadores convidados;
- papéis `FRONT_DESK`, `ADMIN` e `MANAGER` com autorização real;
- isolamento por organização em aplicação e RLS;
- PostgreSQL versionado por migrations;
- fotos privadas e acesso temporário autenticado;
- dados sintéticos em preview/demonstração até existir política de piloto;
- fallback de arquivo quando câmera falhar;
- fallback manual quando OCR falhar;
- idempotência e preservação do formulário em falha/retry;
- trilha auditável de recebimento, aviso e retirada;
- HTTPS e smoke reais antes de afirmar disponibilidade.

## Fora do escopo

- billing, assinatura e cobrança;
- conta ou portal de morador;
- WhatsApp Cloud API e envio automático;
- OCR avançado ou obrigatório;
- manutenção, reservas, comunicados, reclamações e outros módulos;
- app nativo, PWA complexa ou service worker;
- redesign amplo ou sistema visual concorrente;
- multi-condomínio comercial completo além do isolamento mínimo já necessário.

## Critério de venda

Build verde não basta. O MVP é vendável quando o fluxo crítico funciona em ambiente isolado, HTTPS, celular real e desktop, com acesso controlado, persistência conhecida, recuperação documentada e limitações declaradas. Sem essa evidência: “Não consigo confirmar isso.”
