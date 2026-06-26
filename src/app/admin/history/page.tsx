import Link from "next/link";
import { PackageStatus, Prisma } from "@prisma/client";

import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { ADMIN_ROLES } from "@/lib/auth/policy";
import { requirePageOperator } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

type AdminHistoryPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    from?: string;
    to?: string;
    building?: string;
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

function parseDate(value: string | undefined, endOfDay = false) {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  if (endOfDay) {
    parsed.setHours(23, 59, 59, 999);
  } else {
    parsed.setHours(0, 0, 0, 0);
  }

  return parsed;
}

const EVENT_LABEL: Record<string, string> = {
  PACKAGE_RECEIVED: "Recebida",
  PACKAGE_NOTIFIED: "Avisada",
  PACKAGE_PICKED_UP: "Retirada",
  PACKAGE_UPDATED: "Atualizada",
  PACKAGE_CANCELLED: "Cancelada"
};

export default async function AdminHistoryPage({ searchParams }: AdminHistoryPageProps) {
  const operator = await requirePageOperator(ADMIN_ROLES, "/admin/history");
  const params = await searchParams;
  const q = params.q?.trim();
  const statusFilter = parsePackageStatus(params.status);
  const fromDate = parseDate(params.from);
  const toDate = parseDate(params.to, true);
  const buildingFilter = params.building?.trim();

  const where: Prisma.PackageWhereInput = {
    organizationId: operator.organizationId,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(fromDate || toDate
      ? {
          receivedAt: {
            ...(fromDate ? { gte: fromDate } : {}),
            ...(toDate ? { lte: toDate } : {})
          }
        }
      : {}),
    ...(buildingFilter
      ? {
          unit: {
            building: {
              label: { contains: buildingFilter }
            }
          }
        }
      : {}),
    ...(q
      ? {
          OR: [
            { packageCode: { contains: q } },
            { carrier: { contains: q } },
            { resident: { name: { contains: q } } },
            { unit: { number: { contains: q } } },
            { unit: { building: { label: { contains: q } } } },
            { pickedUpByName: { contains: q } }
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
      },
      events: {
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { receivedAt: "desc" },
    take: 60
  });

  const buildings = await prisma.building.findMany({
    where: { organizationId: operator.organizationId },
    orderBy: { label: "asc" },
    select: { label: true }
  });

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
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Histórico</h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            Trilha auditável de cada encomenda: entrada, aviso, retirada e ajustes.
          </p>
        </header>

        <form className="mt-6 grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 md:grid-cols-6">
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-500 md:col-span-2">
            Busca
            <input
              name="q"
              defaultValue={q}
              placeholder="Morador, retirante, bloco, código"
              className="min-h-11 rounded-lg border border-neutral-300 px-3 text-base font-normal outline-none focus:ring-2 focus:ring-neutral-950"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Bloco
            <select
              name="building"
              defaultValue={buildingFilter ?? ""}
              className="min-h-11 rounded-lg border border-neutral-300 bg-white px-3 text-base font-normal outline-none focus:ring-2 focus:ring-neutral-950"
            >
              <option value="">Todos</option>
              {buildings.map((building) => (
                <option key={building.label} value={building.label}>
                  {building.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Status
            <select
              name="status"
              defaultValue={params.status ?? "ALL"}
              className="min-h-11 rounded-lg border border-neutral-300 bg-white px-3 text-base font-normal outline-none focus:ring-2 focus:ring-neutral-950"
            >
              <option value="ALL">Todos</option>
              <option value="PENDING">Pendentes</option>
              <option value="NOTIFIED">Avisados</option>
              <option value="PICKED_UP">Retirados</option>
              <option value="CANCELLED">Cancelados</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            De
            <input
              type="date"
              name="from"
              defaultValue={params.from ?? ""}
              className="min-h-11 rounded-lg border border-neutral-300 px-3 text-base font-normal outline-none focus:ring-2 focus:ring-neutral-950"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Até
            <input
              type="date"
              name="to"
              defaultValue={params.to ?? ""}
              className="min-h-11 rounded-lg border border-neutral-300 px-3 text-base font-normal outline-none focus:ring-2 focus:ring-neutral-950"
            />
          </label>
          <div className="md:col-span-6 flex flex-wrap gap-2">
            <button
              type="submit"
              className="min-h-11 rounded-lg bg-neutral-950 px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 focus:ring-offset-white"
            >
              Aplicar filtros
            </button>
            <Link
              href="/admin/history"
              className="min-h-11 rounded-lg border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 focus:ring-offset-white"
            >
              Limpar
            </Link>
          </div>
        </form>

        <div className="mt-6 grid gap-4">
          {packages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
              Nenhuma encomenda encontrada para os filtros aplicados.
            </div>
          ) : null}

          {packages.map((pkg) => (
            <article key={pkg.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    {pkg.packageCode ?? "Sem código"}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">
                    {pkg.resident?.name ?? "Sem morador vinculado"}
                  </h2>
                  <p className="text-sm text-neutral-600">
                    {pkg.unit.building.label} · Apto {pkg.unit.number} · {pkg.carrier ?? "Transportadora não informada"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 text-right">
                  <StatusBadge status={pkg.status} />
                  <p className="text-xs text-neutral-500">
                    Recebida em {formatDateTime(pkg.receivedAt)}
                  </p>
                  {pkg.pickedUpAt ? (
                    <p className="text-xs text-emerald-700">
                      Retirada em {formatDateTime(pkg.pickedUpAt)} por {pkg.pickedUpByName ?? "—"}
                    </p>
                  ) : null}
                </div>
              </header>
              <ol className="divide-y divide-neutral-100">
                {pkg.events.map((event) => (
                  <li key={event.id} className="grid gap-1 px-5 py-3 sm:grid-cols-[160px_1fr_180px] sm:items-center">
                    <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      {EVENT_LABEL[event.type] ?? event.type}
                    </span>
                    <p className="text-sm text-neutral-900">{event.message}</p>
                    <span className="text-xs text-neutral-500 sm:text-right">
                      {formatDateTime(event.createdAt)}
                    </span>
                  </li>
                ))}
                {pkg.events.length === 0 ? (
                  <li className="px-5 py-3 text-sm text-neutral-500">
                    Sem eventos registrados.
                  </li>
                ) : null}
              </ol>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
