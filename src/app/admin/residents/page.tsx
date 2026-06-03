import Link from "next/link";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminResidentsPageProps = {
  searchParams: Promise<{
    q?: string;
    building?: string;
  }>;
};

export default async function AdminResidentsPage({ searchParams }: AdminResidentsPageProps) {
  const params = await searchParams;
  const q = params.q?.trim();
  const buildingFilter = params.building?.trim();

  const residents = await prisma.resident.findMany({
    where: {
      isActive: true,
      ...(buildingFilter
        ? {
            unit: {
              building: {
                label: buildingFilter
              }
            }
          }
        : {}),
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
    take: 200
  });

  const buildings = await prisma.building.findMany({
    orderBy: { label: "asc" },
    select: { label: true }
  });

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-8 text-neutral-950">
      <section className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-950"
            >
              ← Voltar ao painel
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Moradores</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Base usada pelo autocomplete da portaria. {residents.length} resultado(s).
            </p>
          </div>
          <Link
            href="/admin/import"
            className="inline-flex min-h-11 items-center rounded-lg bg-neutral-950 px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 focus:ring-offset-neutral-100"
          >
            Importar base
          </Link>
        </header>

        <form className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4">
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Buscar morador
            <input
              name="q"
              defaultValue={q}
              placeholder="Nome, telefone, bloco ou apto"
              className="min-h-11 w-80 rounded-lg border border-neutral-300 px-3 text-base font-normal text-neutral-950 outline-none focus:ring-2 focus:ring-neutral-950"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Bloco
            <select
              name="building"
              defaultValue={buildingFilter ?? ""}
              className="min-h-11 rounded-lg border border-neutral-300 bg-white px-3 text-base font-normal text-neutral-950 outline-none focus:ring-2 focus:ring-neutral-950"
            >
              <option value="">Todos</option>
              {buildings.map((building) => (
                <option key={building.label} value={building.label}>
                  {building.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="min-h-11 rounded-lg bg-neutral-950 px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 focus:ring-offset-white"
          >
            Filtrar
          </button>
          <Link
            href="/admin/residents"
            className="min-h-11 rounded-lg border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 focus:ring-offset-white"
          >
            Limpar
          </Link>
        </form>

        <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
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
                  <tr key={resident.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                    <td className="px-5 py-3 font-medium text-neutral-900">{resident.name}</td>
                    <td className="px-5 py-3 text-neutral-600">{resident.unit.building.label}</td>
                    <td className="px-5 py-3 text-neutral-600">{resident.unit.number}</td>
                    <td className="px-5 py-3 text-neutral-600">{resident.phone ?? "Não informado"}</td>
                    <td className="px-5 py-3">
                      {resident.isPrimary ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-900">
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
                    <td colSpan={6} className="px-5 py-10 text-center text-neutral-500">
                      Nenhum morador encontrado para os filtros aplicados.
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
