---
name: henrico-project-gate
description: Gate obrigatório antes de qualquer alteração em projeto do ecossistema HenricoOPS.
---

# Henrico Project Gate

Todo prompt de projeto deve iniciar com:

/goal

Procedimento obrigatório:
1. Ler documentação e governança do projeto.
2. Identificar escopo exato.
3. Bloquear tudo fora do escopo.
4. Não reaproveitar código sujo, experimental ou legado.
5. Se a parte pedida estiver ruim, refazer apenas aquela parte.
6. Não tocar no restante.
7. Validar localmente.
8. Só depois preparar commit, PR ou deploy.

Nunca publicar antes da validação local.
Nunca transformar mudança pontual em puxadinho.
