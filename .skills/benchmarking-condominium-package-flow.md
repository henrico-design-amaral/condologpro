# benchmarking-condominium-package-flow

## Quando usar

Sempre que aparecer dúvida sobre o que CondoLogPro deve ou não copiar de concorrentes do mercado condominial e mailroom.

## Categorias mapeadas

1. **Super-apps de condomínio**: cobrem reservas, comunicados, ocorrências, financeiro. Encomenda costuma ser um módulo secundário com cadastro lento, sem foco operacional na portaria.
2. **Mailroom/Inbound package tracking (B2B internacional)**: PackageX, Notifii, EZTrackIt. Têm OCR forte, notificação multi-canal, integração com câmera USB ou scanner. Foco profissional, fluxo enxuto, ergonomia comprovada.
3. **Lockers inteligentes**: solução excelente quando há infra física, mas exige investimento alto. Útil como benchmark para fluxo de retirada com código.
4. **Portaria virtual e controle de acesso**: foco em entrada de visitantes e veículos. Costumam não cobrir encomenda com profundidade.

## O que adotar

- Cadastro de encomenda em poucos toques (mailroom).
- Lista de pendentes filtrada por bloco/apto/nome (mailroom + super-app).
- Confirmação de retirada com nome do retirante (mailroom + lockers).
- Histórico auditável (mailroom).
- Mensagem assistida pronta (super-app brasileiro + WhatsApp manual atual).

## O que ignorar no MVP

- Reservas, financeiro, ocorrências, comunicados (super-app).
- Lockers físicos (não é nosso espaço agora).
- Integração com scanner USB profissional (cliente alvo usa celular).
- OCR obrigatório (custo de erro alto).
- App nativo (custo de manutenção alto).

## Hipóteses sob teste

- Reduzir tempo de registro para menos de 30 segundos com câmera + autocomplete.
- Substituir caderno físico por histórico auditável sem treinar o porteiro mais que 10 minutos.
- Reduzir esquecimento de avisar moradores com mensagem WhatsApp pronta.
- Reduzir conflito de retirada com nome do retirante registrado.

## Saída

Atualizar `docs/BENCHMARK_NOTES.md` com decisões e hipóteses revisadas.
