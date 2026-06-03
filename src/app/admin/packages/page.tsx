import Link from "next/link";
import { PackageStatus, Prisma } from "@prisma/client";

import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatRelativeHours } from "@/lib/format";
import { isPackageOverdue } from "@/lib/stats";

export const dynamic = "force-dynamic";

type AdminPackagesPageProps = {
  searchParams: Promise<{
    status?: string;
    q?: string;
    overdue?: string;
  }>;
};

function parsePackageStatus(value?: string) {
  if (!value || value === "ALL") {
    return null;
  }

  return Object.values(PackageStatus).includes(value as PackageStatus)
    ? (value as PackageStatus)
    : null;
}

function overdueThresholdDate() {
  const now = new Date();
  now.setHours(now.getHours() - 24);
  return now;
}

export default async function AdminPackagesPage({ searchParams }: AdminPackagesPageProps) {
  const params = await searchParams;
  const status = params.status;
  const q = params.q?.trim();
  const isOverdueFilter = params.overdue === "1";
  const parsedStatus = parsePackageStatus(status);

  const where: Prisma.PackageWhereInput = {
    ...(parsedStatus ? { status: parsedStatus } : {}),
    ...(isOverdueFilter
      ? {
          status: { in: [PackageStatus.PENDING, PackageStatus.NOTIFIED] },
          receivedAt: { lt: overdueThresholdDate() }
        }
      : {}),
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
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              href="/admin"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-950"
            >
              ← Voltar ao painel
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">Encomendas</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Consulta operacional de entradas, avisos e retiradas.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/packages?overdue=1"
              className="inline-flex min-h-11 items-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              Ver atrasadas (24h+)
            </Link>
            <Link
              href="/mobile/intake"
              className="inline-flex min-h-11 items-center rounded-lg bg-neutral-950 px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 focus:ring-offset-neutral-100"
            >
              Nova encomenda
            </Link>
          </div>
        </header>

        <form className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4">
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Busca
            <input
              name="q"
              defaultValue={q}
              placeholder="Morador, bloco, apto, código"
              className="min-h-11 w-72 rounded-lg border border-neutral-300 px-3 text-base font-normal text-neutral-950 outline-none focus:ring-2 focus:ring-neutral-950"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Status
            <select
              name="status"
              defaultValue={status ?? "ALL"}
              className="min-h-11 rounded-lg border border-neutral-300 bg-white px-3 text-base font-normal text-neutral-950 outline-none focus:ring-2 focus:ring-neutral-950"
            >
              <option value="ALL">Todos</option>
              <option value="PENDING">Pendentes</option>
              <option value="NOTIFIED">Avisados</option>
              <option value="PICKED_UP">Retirados</option>
              <option value="CANCELLED">Cancelados</option>
            </select>
          </label>
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-700">
            <input
              type="checkbox"
              name="overdue"
              value="1"
              defaultChecked={isOverdueFilter}
              className="h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950"
            />
            Apenas atrasadas
          </label>
          <button
            type="submit"
            className="min-h-11 rounded-lg bg-neutral-950 px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 focus:ring-offset-white"
          >
            Aplicar filtros
          </button>
          <Link
            href="/admin/packages"
            className="min-h-11 rounded-lg border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 focus:ring-offset-white"
          >
            Limpar
          </Link>
        </form>

        <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-sm">
              <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
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
                {packages.map((pkg) => {
                  const overdue = isPackageOverdue(pkg);
                  return (
                    <tr key={pkg.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                      <td className="px-5 py-3 font-medium text-neutral-900">
                        {pkg.resident?.name ?? "Sem morador"}
                      </td>
                      <td className="px-5 py-3 text-neutral-600">
                        {pkg.unit.building.label} / {pkg.unit.number}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={pkg.status} />
                          {overdue ? <StatusBadge status="OVERDUE" /> : null}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-neutral-600">{pkg.packageCode ?? "Não informado"}</td>
                      <td className="px-5 py-3 text-neutral-600">{pkg.carrier ?? "Não informada"}</td>
                      <td className="px-5 py-3 text-neutral-600">
                        {formatDateTime(pkg.receivedAt)}
                        <span className="ml-2 text-xs text-neutral-400">
                          ({formatRelativeHours(pkg.receivedAt)})
                        </span>
                      </td>
                      <td className="px-5 py-3 text-neutral-600">{formatDateTime(pkg.pickedUpAt)}</td>
                    </tr>
                  );
                })}
                {packages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-neutral-500">
                      Nenhuma encomenda encontrada para os filtros aplicados.
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
