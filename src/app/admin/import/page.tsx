export default function AdminImportPage() {
  const columns = [
    { name: "bloco", desc: "Identificador do bloco ou torre (ex: Bloco A, Torre 1)" },
    { name: "apartamento", desc: "Número do apartamento (ex: 101, 202)" },
    { name: "morador", desc: "Nome completo do morador" },
    { name: "telefone", desc: "Celular com DDD, sem formatação (ex: 11987654321)" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
          Importar base de moradores
        </h1>
        <p className="mt-2 text-neutral-600">
          Importe a base de moradores a partir de um arquivo CSV para popular
          o sistema rapidamente.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
            Estrutura esperada do CSV
          </h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-neutral-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">
                    Coluna
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">
                    Descrição
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {columns.map((col) => (
                  <tr key={col.name}>
                    <td className="px-4 py-2.5 font-mono text-xs font-medium text-neutral-800">
                      {col.name}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-neutral-600">
                      {col.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-xl bg-neutral-50 p-4">
            <p className="text-xs font-medium text-neutral-500">
              Exemplo de linha CSV
            </p>
            <code className="mt-2 block text-xs text-neutral-700">
              Bloco A,101,Ana Silva,11987654321
            </code>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
            Regras de importação
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-neutral-700">
            <li className="flex gap-2">
              <span className="mt-0.5 shrink-0 text-neutral-400">·</span>
              Primeira linha deve ser o cabeçalho com os nomes exatos das colunas.
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 shrink-0 text-neutral-400">·</span>
              Blocos e apartamentos são criados automaticamente se não existirem.
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 shrink-0 text-neutral-400">·</span>
              O primeiro morador de cada apartamento é marcado como principal.
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 shrink-0 text-neutral-400">·</span>
              Telefone deve incluir DDD, sem espaços ou pontuação.
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 shrink-0 text-neutral-400">·</span>
              Moradores duplicados (mesmo bloco + apto + nome) são ignorados.
            </li>
          </ul>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-medium text-amber-800">
              Importação CSV disponível na próxima fase.
            </p>
            <p className="mt-1 text-xs text-amber-700">
              Use o seed de demonstração para testar o fluxo completo
              enquanto esta funcionalidade é implementada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
