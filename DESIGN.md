---
name: CondoLogPro
description: Sistema operacional de encomendas para portaria e administração.
colors:
  operational-dark: "#151313"
  structure-dark: "#282321"
  editorial-light: "#F3F0EA"
  structure-light: "#D8D2C9"
  ink: "#1A1715"
  signal-teal: "#00A996"
  attention-amber: "#D47B12"
  signature-gold: "#FFC83D"
  success-green: "#287A52"
  problem-red: "#C64046"
  info-blue: "#3B6FA8"
  muted-silver: "#756E66"
typography:
  display:
    fontFamily: "Syne Variable, Syne, Inter Variable, sans-serif"
    fontSize: "2rem"
    fontWeight: 650
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Inter Variable, Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 450
    lineHeight: 1.5
  label:
    fontFamily: "Inter Variable, Inter, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "0"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.signal-teal}"
    textColor: "{colors.operational-dark}"
    rounded: "{rounded.md}"
    padding: "14px 18px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.structure-light}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "14px 18px"
    height: "48px"
  input:
    backgroundColor: "{colors.editorial-light}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
    height: "48px"
---

# Design System: CondoLogPro

## Overview

**Creative North Star: "Operational Signal"**

O sistema se comporta como uma bancada de portaria bem organizada: superfícies claras para leitura prolongada, uma camada escura para navegação e captura, e sinais raros que indicam a próxima ação. A densidade é funcional; controles familiares desaparecem no fluxo e a evidência permanece visível.

O produto rejeita a apresentação estática que descreve telas, o dashboard SaaS genérico e qualquer automação falsa. Motion comunica estado em 150 a 220 ms, nunca cria uma sequência de entrada.

**Key Characteristics:**

- Mobile-first no recebimento, desktop denso na administração.
- Accent restrito a ação, seleção e estado.
- Superfícies planas e separação estrutural por tom.
- Ícones acompanhados de rótulos nas ações críticas.
- Formulários previsíveis, recuperáveis e operáveis com teclado.

## Colors

O teal sinaliza progresso; âmbar exige atenção humana; ouro aparece somente em confirmação ou marca institucional excepcional. Os neutros quentes pertencem ao ecossistema Henrico, mas a hierarquia continua utilitária.

### Primary

- **Signal Teal**: ação primária, foco e estado selecionado. Nunca decora áreas inativas.

### Secondary

- **Attention Amber**: baixa confiança, SLA, conflito provável e confirmação pendente.
- **Signature Gold**: confirmação de confiança ou detalhe de marca, sem competir com o CTA.

### Tertiary

- **Success Green**: retirada concluída e operação confirmada.
- **Problem Red**: bloqueio, falha ou ação destrutiva.
- **Info Blue**: informação neutra e estado aguardando retirada.

### Neutral

- **Operational Dark**: navegação, câmera e superfícies de turno.
- **Structure Dark**: barras, painéis escuros e divisores tonais.
- **Editorial Light**: superfície principal de leitura e formulários.
- **Structure Light**: navegação secundária, campos inativos e linhas.
- **Ink**: texto primário em superfícies claras.
- **Muted Silver**: metadados que ainda mantêm contraste AA.

**The Signal Budget Rule.** O accent ocupa no máximo 10% de uma tela operacional; se tudo chama atenção, nada orienta.

## Typography

**Display Font:** Syne Variable (com Inter como fallback)
**Body Font:** Inter Variable (com system-ui como fallback)
**Label/Mono Font:** Inter Variable

**Character:** Syne identifica títulos de página e marca; Inter domina dados, formulários, navegação e mensagens. Nenhuma fonte display entra em rótulos ou tabelas.

### Hierarchy

- **Display** (650, 2rem, 1.05): título de página e marca, sem escala de landing page.
- **Headline** (650, 1.5rem, 1.15): títulos de seção operacional.
- **Title** (650, 1.125rem, 1.25): agrupamentos, painéis e itens de lista.
- **Body** (450, 1rem, 1.5): instruções, valores e copy com largura máxima de 70ch.
- **Label** (650, 0.8125rem, sem tracking artificial): campos, botões e metadados curtos.

**The Product Type Rule.** Syne cria orientação; Inter executa o trabalho. Rótulos em caixa alta corrida são proibidos.

## Elevation

O sistema é plano por padrão. Profundidade vem de superfícies tonais e bordas estruturais; sombra curta aparece apenas em menu suspenso, toast e diálogo acima do conteúdo.

### Shadow Vocabulary

- **Overlay** (`0 6px 8px rgba(21, 19, 19, 0.18)`): menu, toast e diálogo; nunca em cartões estáticos.

**The Flat-by-Default Rule.** Cartão com borda e sombra difusa ao mesmo tempo é proibido.

## Components

### Buttons

- **Shape:** curva contida (10px), altura mínima de 48px no mobile.
- **Primary:** Signal Teal sobre Operational Dark, verbo e objeto no rótulo.
- **Hover / Focus:** mudança tonal curta e anel de foco de 3px; nenhuma translação decorativa.
- **Secondary / Ghost:** neutral estrutural ou transparente, mantendo área de toque.

### Chips

- **Style:** texto, ícone e fundo tonal correspondente ao estado; nunca cor isolada.
- **State:** selecionado usa Signal Teal; filtros inativos permanecem neutros.

### Cards / Containers

- **Corner Style:** 10 a 14px.
- **Background:** uma superfície tonal, sem glassmorphism.
- **Shadow Strategy:** plana em repouso.
- **Border:** linha estrutural de 1px quando a separação tonal não basta.
- **Internal Padding:** 16px mobile, 20 a 24px desktop.

### Inputs / Fields

- **Style:** superfície clara ou tonal escura, borda estrutural e 10px de raio.
- **Focus:** borda Signal Teal e anel externo perceptível.
- **Error / Disabled:** mensagem textual próxima; disabled não perde legibilidade.

### Navigation

Barra inferior no mobile para tarefas da portaria e lateral compacta no desktop. Estado ativo combina ícone, texto e contraste; navegação nunca depende apenas de cor.

### Capture Workspace

Preview 4:3, ações de capturar, anexar e refazer sempre visíveis. Permissão negada, câmera indisponível e OCR falho mantêm o formulário manual acessível.

## Do's and Don'ts

### Do:

- **Do** manter a ação primária próxima do campo ou evidência que ela conclui.
- **Do** preservar rascunho local e explicar a recuperação após falha de rede.
- **Do** combinar texto, ícone e cor em cada status.
- **Do** testar 360, 390, 768, 1024 e 1440 px com foco e teclado visíveis.

### Don't:

- **Don't** criar página de portfólio ou landing page que descreve telas em vez de permitir operá-las.
- **Don't** usar dashboard SaaS genérico com gráficos decorativos, métricas inventadas ou cartões repetidos.
- **Don't** criar CRUD administrativo que obriga a portaria a navegar por módulos antes de receber um pacote.
- **Don't** usar interface neon, glassmorphism, gradientes decorativos ou motion coreografado.
- **Don't** registrar abrir o WhatsApp como mensagem enviada, nem tratar OCR como dado confirmado.
- **Don't** usar faixa lateral colorida, gradient text, cartão com raio acima de 16px ou sombra difusa decorativa.
