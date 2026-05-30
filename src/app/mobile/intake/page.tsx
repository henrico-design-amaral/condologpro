import Link from "next/link";
import { getDefaultOrg, getResidentsForSelect } from "@/lib/data";
import { IntakeForm } from "./IntakeForm";

export default async function MobileIntakePage() {
  const org = await getDefaultOrg();
  const residents = org ? await getResidentsForSelect(org.id) : [];

  return (
    <main className="min-h-screen bg-neutral-950 px-4 pb-12 pt-6 text-white">
      <div className="mx-auto max-w-md">
        <Link
          href="/mobile"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-300"
        >
          ← Voltar
        </Link>

        <h1 className="mt-5 text-3xl font-semibold">Nova encomenda</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Preencha os dados e registre a entrada.
        </p>

        {residents.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-neutral-700 p-8 text-center text-neutral-500">
            <p>Nenhum morador cadastrado.</p>
            <p className="mt-1 text-sm">
              Execute o seed do banco de dados antes de usar este fluxo.
            </p>
          </div>
        ) : (
          <IntakeForm residents={residents} />
        )}
      </div>
    </main>
  );
}
