import { Clock, PackageOpen, Search } from "lucide-react";
import Link from "next/link";
import type { PackageStatus } from "@prisma/client";

import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatRelativeHours } from "@/lib/format";
import { isPackageOverdue, overdueThresholdDate } from "@/lib/stats";

export const dynamic = "force-dynamic";

type MobilePendingPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    overdue?: string;
  }>;
};

const PENDING_STATUSES: PackageStatus[] = ["PENDING", "NOTIFIED"];

export default async function MobilePendingPage({ searchParams }: MobilePendingPageProps) {
  const params = await searchParams;
  const q = params.q?.trim();
  const status = params.status;
  const onlyOverdue = params.overdue === "1";

  const statusFilter: { status: PackageStatus | { in: PackageStatus[] } } =
    status === "PENDING" || status === "NOTIFIED"
      ? { status: status as PackageStatus }
      : { status: { in: PENDING_STATUSES } };

  const packages = await prisma.package.findMany({
    where: {
      ...statusFilter,
      ...(onlyOverdue ? { receivedAt: { lt: overdueThresholdDate() } } : {}),
      ...(q
        ? {
            OR: [
              { resident: { name: { contains: q } } },
              { packageCode: { contains: q } },
              { unit: { number: { contains: q } } },
              { unit: { building: { label: { contains: q } } } }
            ]
          }
        : {})
    },
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
    take: 100
  });

  const overdueCount = packages.filter((pkg) => isPackageOverdue(pkg)).length;

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 text-white">
      <section className="mx-auto max-w-md">
        <Link
          href="/mobile"
          className="inline-flex min-h-11 items-center text-sm font-medium text-neutral-300 focus:outline-none focus:ring-2 focus:ring-white"
        >
          ← Voltar
        </Link>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Portaria
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Pendentes</h1>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="rounded-full bg-neutral-800 px-3 py-1 text-sm font-semibold text-neutral-100">
              {packages.length}
            </span>
            {overdueCount > 0 ? (
              <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-100">
                {overdueCount} atrasada(s)
              </span>
            ) : null}
          </div>
        </div>

        <form className="mt-5 flex flex-col gap-3 rounded-[12px] border border-neutral-800 bg-neutral-900 p-3">
          <label className="flex min-h-12 items-center gap-2 rounded-[8px] border border-neutral-700 bg-neutral-950 px-3 focus-within:ring-2 focus-within:ring-emerald-300">
            <Search className="h-4 w-4 text-neutral-500" aria-hidden="true" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Nome, bloco, apto ou código"
              className="min-h-12 flex-1 bg-transparent text-base outline-none placeholder:text-neutral-500"
              autoComplete="off"
              aria-label="Buscar encomendas pendentes"
            />
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className="flex items-center justify-center rounded-[8px] border border-neutral-700 p-2 text-xs font-semibold has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-300 has-[:checked]:text-neutral-950">
              <input type="radio" name="status" value="" defaultChecked={!status} className="sr-only" />
              Todas
            </label>
            <label className="flex items-center justify-center rounded-[8px] border border-neutral-700 p-2 text-xs font-semibold has-[:checked]:border-amber-300 has-[:checked]:bg-amber-300 has-[:checked]:text-neutral-950">
              <input type="radio" name="status" value="PENDING" defaultChecked={status === "PENDING"} className="sr-only" />
              Pendentes
            </label>
            <label className="flex items-center justify-center rounded-[8px] border border-neutral-700 p-2 text-xs font-semibold has-[:checked]:border-sky-300 has-[:checked]:bg-sky-300 has-[:checked]:text-neutral-950">
              <input type="radio" name="status" value="NOTIFIED" defaultChecked={status === "NOTIFIED"} className="sr-only" />
              Avisadas
            </label>
          </div>
          <label className="flex min-h-11 items-center gap-2 rounded-[8px] border border-neutral-700 px-3 text-sm text-neutral-200 has-[:checked]:border-rose-300 has-[:checked]:text-rose-100">
            <input
              type="checkbox"
              name="overdue"
              value="1"
              defaultChecked={onlyOverdue}
              className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-rose-300 focus:ring-rose-300"
            />
            Mostrar apenas atrasadas (24h+)
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="min-h-12 flex-1 rounded-[8px] bg-white px-3 text-sm font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              Aplicar filtros
            </button>
            <Link
              href="/mobile/pending"
              className="flex min-h-12 flex-1 items-center justify-center rounded-[8px] border border-neutral-700 px-3 text-sm font-semibold text-neutral-200 focus:outline-none focus:ring-2 focus:ring-white"
            >
              Limpar
            </Link>
          </div>
        </form>

        {packages.length === 0 ? (
          <div className="mt-6 rounded-[8px] border border-neutral-700 bg-neutral-900 p-5 text-center">
            <PackageOpen className="mx-auto h-8 w-8 text-neutral-500" aria-hidden="true" />
            <p className="mt-3 font-semibold">Nenhuma encomenda pendente</p>
            <p className="mt-2 text-sm text-neutral-400">
              Novas entradas aparecerão aqui. Tente limpar os filtros para ver mais.
            </p>
          </div>
        ) : (
          <ul className="mt-6 grid gap-3">
            {packages.map((pkg) => {
              const overdue = isPackageOverdue(pkg);
              return (
                <li key={pkg.id}>
                  <Link
                    href={`/mobile/package/${pkg.id}`}
                    className={`block rounded-[12px] border bg-neutral-900 p-4 focus:outline-none focus:ring-2 focus:ring-emerald-300 ${
                      overdue ? "border-rose-400/60" : "border-neutral-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-white">
                          {pkg.resident?.name ?? "Sem morador"}
                        </p>
                        <p className="mt-1 text-sm text-neutral-300">
                          {pkg.unit.building.label} · Apto {pkg.unit.number}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <StatusBadge status={pkg.status} className="text-[10px]" />
                        {overdue ? <StatusBadge status="OVERDUE" className="text-[10px]" /> : null}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      {formatDateTime(pkg.receivedAt)}
                      <span aria-hidden="true">·</span>
                      <span>{formatRelativeHours(pkg.receivedAt)} atrás</span>
                    </div>
                    <p className="mt-2 text-xs text-neutral-400">
                      {pkg.carrier ?? "Transportadora não informada"}
                      {pkg.packageCode ? ` · ${pkg.packageCode}` : ""}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
