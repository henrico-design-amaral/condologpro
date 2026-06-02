import Link from "next/link";
import { PackageStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type AdminPackagesPageProps = {
  searchParams: Promise<{
    status?: string;
    q?: string;
  }>;
};

function formatDate(date: Date | null) {
  if (!date) {
    return "Não registrado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function statusBadge(status: string) {
  const classes =
    status === "PICKED_UP"
      ? "bg-emerald-50 text-emerald-700"
      : status === "NOTIFIED"
        ? "bg-blue-50 text-blue-700"
        : status === "CANCELLED"
          ? "bg-red-50 text-red-700"
          : "bg-amber-50 text-amber-700";

  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${classes}`}>{status}</span>;
}

function parsePackageStatus(value?: string) {
  if (!value || value === "ALL") {
    return null;
  }

  return Object.values(PackageStatus).includes(value as PackageStatus)
    ? (value as PackageStatus)
    : null;
}

export default async function AdminPackagesPage({ searchParams }: AdminPackagesPageProps) {
  const params = await searchParams;
  const status = params.status;
  const q = params.q?.trim();
  const parsedStatus = parsePackageStatus(status);
  const where: Prisma.PackageWhereInput = {
    ...(parsedStatus ? { status: parsedStatus } : {}),
    ...(q
      ? {
          OR: [
            { packageCode: { contains: q } },
            { carrier: { contains: q } },
            { resident: { name: { contains: q } } },
            { unit: { number: { contains: q } } },
            { unit: { building: { label: { contains: q } } } }
          ]
        }
      : {})
  };

  const packages = await prisma.package.findMany({
    where,
    include: {
      resident: true,
      unit: {
        include: {
          building: true
        }
      }
    },
    orderBy: {
      receivedAt: "desc"
    },
    take: 120
  });

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-8 text-neutral-950">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm font-semibold text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-950">
              Voltar ao painel
            </Link>
            <h1 className="mt-3 text-3xl font-semibold">Encomendas</h1>
            <p className="mt-2 text-sm text-neutral-600">Consulta operacional de entradas, avisos e retiradas.</p>
          </div>
          <Link
            href="/mobile/intake"
            className="min-h-11 rounded-[8px] bg-neutral-950 px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-neutral-950"
          >
            Nova encomenda
          </Link>
        </div>

        <form className="mt-6 flex flex-wrap gap-3 rounded-[8px] border border-neutral-200 bg-white p-4">
          <label className="grid gap-1 text-sm font-semibold text-neutral-600">
            Busca
            <input
              name="q"
              defaultValue={q}
              placeholder="Morador, bloco, apto, código"
              className="min-h-11 w-72 rounded-[8px] border border-neutral-300 px-3 font-normal text-neutral-950 outline-none focus:ring-2 focus:ring-neutral-950"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-neutral-600">
            Status
            <select
              name="status"
              defaultValue={status ?? "ALL"}
              className="min-h-11 rounded-[8px] border border-neutral-300 px-3 font-normal text-neutral-950 outline-none focus:ring-2 focus:ring-neutral-950"
            >
              <option value="ALL">Todos</option>
              <option value="PENDING">Pendentes</option>
              <option value="NOTIFIED">Avisados</option>
              <option value="PICKED_UP">Retirados</option>
              <option value="CANCELLED">Cancelados</option>
            </select>
          </label>
          <button
            type="submit"
            className="mt-auto min-h-11 rounded-[8px] bg-neutral-950 px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-neutral-950"
          >
            Filtrar
          </button>
        </form>

        <div className="mt-6 overflow-hidden rounded-[8px] border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-sm">
              <thead className="bg-neutral-50 text-left text-neutral-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Morador</th>
                  <th className="px-5 py-3 font-semibold">Unidade</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Código</th>
                  <th className="px-5 py-3 font-semibold">Transportadora</th>
                  <th className="px-5 py-3 font-semibold">Recebida</th>
                  <th className="px-5 py-3 font-semibold">Retirada</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="border-t border-neutral-100">
                    <td className="px-5 py-3 font-medium">{pkg.resident?.name ?? "Sem morador"}</td>
                    <td className="px-5 py-3 text-neutral-600">
                      {pkg.unit.building.label} / {pkg.unit.number}
                    </td>
                    <td className="px-5 py-3">{statusBadge(pkg.status)}</td>
                    <td className="px-5 py-3 text-neutral-600">{pkg.packageCode ?? "Não informado"}</td>
                    <td className="px-5 py-3 text-neutral-600">{pkg.carrier ?? "Não informada"}</td>
                    <td className="px-5 py-3 text-neutral-600">{formatDate(pkg.receivedAt)}</td>
                    <td className="px-5 py-3 text-neutral-600">{formatDate(pkg.pickedUpAt)}</td>
                  </tr>
                ))}
                {packages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-neutral-500">
                      Nenhuma encomenda encontrada.
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
