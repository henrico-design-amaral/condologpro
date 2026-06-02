# Benchmark — Fluxo de encomendas em condomínios

> Comparativo com produtos e práticas do mercado brasileiro para sustentar decisões de escopo e UI do MVP.

## Produtos observados

| Produto | Tipo | Pontos fortes | Lacunas que o CondoLogPro resolve |
| --- | --- | --- | --- |
| **Condomínios Live / AppTecnologia** | SaaS completo (gestão de condomínio) | Cobre assembleia, financeiro, reservas | Pacote é módulo secundário, fluxo lento, exige login de morador |
| **Coletivo Super (SaaS)** | Gestão condominial | Forte em financeiro e comunicações | Pacote vira "ocorrência" genérica, sem foto/etiqueta |
| **Planilhas + WhatsApp (realidade dominante)** | Manual | Zero atrito, mas frágil | Sem histórico, sem foto, sem SLA, sem auditoria, sem busca |
| **iFriend / similares (PABX + apps)** | Portaria remota | Integra câmera e interfone | Não trata o ciclo da encomenda fim a fim |
| **Soluções de "guarita inteligente"** (nicho) | Hardware + software | Câmeras, OCR dedicado | Custo alto, exige obra, amarra ao fornecedor |

## Insights que viraram requisito

1. **Foto da etiqueta é o ponto de virada.** Planilhas falham aqui; produtos SaaS escondem atrás de login. Decisão: foto obrigatória no caminho feliz do MVP, com OCR opcional.
2. **Busca de morador por bloco + apto + nome + telefone** cobre a realidade do porteiro digitando rápido. Decisão: endpoint `/api/residents/search` com debounce.
3. **Aviso por WhatsApp é o canal dominante.** Decisão: montar `wa.me` com mensagem pronta é mais útil do que tentar integração oficial no MVP (sem custo, sem segredo, sem lock-in).
4. **Atraso > 24h é a métrica que o síndico quer ver.** Decisão: `OVERDUE` como estado derivado destacado em todas as listas.
5. **Histórico auditável é o mínimo de governança.** Decisão: `PackageEvent` em todo estado relevante, exibido em `/admin/history` e `/mobile/package/[id]`.

## Decisões de UI tomadas a partir do benchmark

- **Portaria dark, mobile-first, alvos ≥ 44 px** — referência aos melhores apps de campo (entregadores, ordem de serviço), porque o porteiro opera com uma mão e sob luz artificial.
- **Admin light, denso, tabela-first** — referência a ERPs leves, porque o síndico lê várias linhas por turno.
- **Status pill com cor semântica** (âmbar / azul / verde / rosa) — convenção universal em SaaS de logística.
- **Botão "Marcar como avisado" separado do WhatsApp** — para cobrir casos sem telefone ou sem WhatsApp, sem bloquear o fluxo.
- **Confirmação de retirada com nome obrigatório + documento opcional** — equilibra agilidade e auditoria.

## Não-objetivos confirmados pelo benchmark

- **Tela de morador (login + consulta)** — fora do MVP. O morador recebe pelo WhatsApp; consulta pode vir depois.
- **Reconhecimento facial** — caro, exige hardware e consentimento; não cabe no MVP offline.
- **Integração com transportadoras (rastreio reverso)** — alto custo de manutenção e contratos; deferido.
