import Link from "next/link";

import { ImportForm } from "./import-form";

export default function AdminImportPage() {
  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-8 text-neutral-950">
      <section className="mx-auto max-w-7xl">
        <header>
          <Link
            href="/admin"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-950"
          >
            ← Voltar ao painel
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Importar base</h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            Suba o cadastro de moradores em CSV. A simulação valida o arquivo antes de gravar
            qualquer dado. A execução escreve no SQLite local.
          </p>
        </header>

        <div className="mt-6">
          <ImportForm />
        </div>

        <p className="mt-6 max-w-3xl text-xs text-neutral-500">
          XLSX será suportado em uma próxima versão. Por enquanto, exporte para CSV em UTF-8 antes
          de importar. Linhas existentes (mesmo nome + apto) são ignoradas para evitar duplicação.
        </p>
      </section>
    </main>
  );
}
