import Link from "next/link";

import { prisma } from "@/lib/prisma";

type AdminResidentsPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function AdminResidentsPage({ searchParams }: AdminResidentsPageProps) {
  const params = await searchParams;
  const q = params.q?.trim();
  const residents = await prisma.resident.findMany({
    where: {
      isActive: true,
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { phone: { contains: q.replace(/\D/g, "") || q } },
              { unit: { number: { contains: q } } },
              { unit: { building: { label: { contains: q } } } }
            ]
          }
        : {})
    },
    include: {
      unit: {
        include: {
          building: true
        }
      }
    },
    orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
    take: 160
  });

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-8 text-neutral-950">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm font-semibold text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-950">
              Voltar ao painel
            </Link>
            <h1 className="mt-3 text-3xl font-semibold">Moradores</h1>
            <p className="mt-2 text-sm text-neutral-600">Base usada pelo autocomplete da portaria.</p>
          </div>
          <Link
            href="/admin/import"
            className="min-h-11 rounded-[8px] bg-neutral-950 px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-neutral-950"
          >
            Importar base
          </Link>
        </div>

        <form className="mt-6 flex flex-wrap gap-3 rounded-[8px] border border-neutral-200 bg-white p-4">
          <label className="grid gap-1 text-sm font-semibold text-neutral-600">
            Buscar morador
            <input
              name="q"
              defaultValue={q}
              placeholder="Nome, telefone, bloco ou apto"
              className="min-h-11 w-80 rounded-[8px] border border-neutral-300 px-3 font-normal text-neutral-950 outline-none focus:ring-2 focus:ring-neutral-950"
            />
          </label>
          <button
            type="submit"
            className="mt-auto min-h-11 rounded-[8px] bg-neutral-950 px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-neutral-950"
          >
            Buscar
          </button>
        </form>

        <div className="mt-6 overflow-hidden rounded-[8px] border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead className="bg-neutral-50 text-left text-neutral-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Morador</th>
                  <th className="px-5 py-3 font-semibold">Bloco</th>
                  <th className="px-5 py-3 font-semibold">Apto</th>
                  <th className="px-5 py-3 font-semibold">Telefone</th>
                  <th className="px-5 py-3 font-semibold">Perfil</th>
                  <th className="px-5 py-3 font-semibold">Observação</th>
                </tr>
              </thead>
              <tbody>
                {residents.map((resident) => (
                  <tr key={resident.id} className="border-t border-neutral-100">
                    <td className="px-5 py-3 font-medium">{resident.name}</td>
                    <td className="px-5 py-3 text-neutral-600">{resident.unit.building.label}</td>
                    <td className="px-5 py-3 text-neutral-600">{resident.unit.number}</td>
                    <td className="px-5 py-3 text-neutral-600">{resident.phone ?? "Não informado"}</td>
                    <td className="px-5 py-3">
                      {resident.isPrimary ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                          Principal
                        </span>
                      ) : (
                        <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-600">
                          Vinculado
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-neutral-600">{resident.notes ?? "Nenhuma"}</td>
                  </tr>
                ))}
                {residents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-neutral-500">
                      Nenhum morador encontrado.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
