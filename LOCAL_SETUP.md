# Setup local — marketing

Pré-requisitos: Node.js compatível com `package.json` e npm.

```powershell
npm ci
npm run dev
```

Validação antes de qualquer publicação:

```powershell
npm run check
npm run build
```

O output é estático. Nenhuma variável de banco, Supabase ou aplicação operacional é necessária para construir a landing. Se uma alteração passar a exigir essas variáveis, ela violou a separação de arquitetura.
