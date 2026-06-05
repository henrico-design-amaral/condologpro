import {
  ArrowRight,
  Building2,
  Clock,
  Mail,
  PackageCheck,
  PackageOpen,
  PackageX,
  Truck,
  Users
} from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatRelativeHours } from "@/lib/format";
import {
  formatAverageHours,
  getBuildingActivity,
  getDashboardStats,
  isPackageOverdue
} from "@/lib/stats";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/admin/residents", label: "Moradores", description: "Base usada pelo autocomplete da portaria." },
  { href: "/admin/packages", label: "Encomendas", description: "Operação completa com filtros e busca." },
  { href: "/admin/history", label: "Histórico", description: "Trilha auditável por morador e período." },
  { href: "/admin/import", label: "Importar base", description: "CSV ou XLSX para popular moradores." },
  { href: "/admin/settings", label: "Configurações", description: "Dados do condomínio e regras locais." }
];

export default async function AdminHomePage() {
  const [stats, buildingActivity, recentPackages] = await Promise.all([
    getDashboardStats(),
    getBuildingActivity(),
    prisma.package.findMany({
      select: {
        id: true,
        status: true,
        carrier: true,
        receivedAt: true,
        resident: {
          select: {
            name: true
          }
        },
        unit: {
          select: {
            number: true,
            building: {
              select: {
                label: true
              }
            }
          }
        }
      },
      orderBy: {
        receivedAt: "desc"
      },
      take: 10
    })
  ]);

  const topBuildings = buildingActivity.slice(0, 5);

  const primaryStats = [
    {
      label: "Entradas hoje",
      value: stats.todayCount,
      hint: `Ontem ${stats.yesterdayCount}`,
      icon: PackageOpen,
      accent: "border-sky-200 bg-sky-50 text-sky-900"
    },
    {
      label: "Pendentes",
      value: stats.pendingCount,
      hint: "Aguardando aviso",
      icon: Mail,
      accent: "border-amber-200 bg-amber-50 text-amber-900"
    },
    {
      label: "Avisados",
      value: stats.notifiedCount,
      hint: "Aguardando retirada",
      icon: Truck,
      accent: "border-indigo-200 bg-indigo-50 text-indigo-900"
    },
    {
      label: "Retiradas hoje",
      value: stats.pickedUpTodayCount,
      hint: "Concluídas no dia",
      icon: PackageCheck,
      accent: "border-emerald-200 bg-emerald-50 text-emerald-900"
    }
  ];

  const secondaryStats = [
    {
      label: "Atrasadas (24h+)",
      value: stats.overdueCount,
      hint: "Requer ação",
      icon: PackageX,
      accent:
        stats.overdueCount > 0
          ? "border-rose-200 bg-rose-50 text-rose-900"
          : "border-neutral-200 bg-neutral-50 text-neutral-700"
    },
    {
      label: "Tempo médio até retirada",
      value: formatAverageHours(stats.averagePickupHours),
      hint: "Últimas 40 retiradas",
      icon: Clock,
      accent: "border-neutral-200 bg-white text-neutral-900"
    },
    {
      label: "Moradores ativos",
      value: stats.activeResidentCount,
      hint: `${stats.totalUnits} unidades · ${stats.totalBuildings} blocos`,
      icon: Users,
      accent: "border-neutral-200 bg-white text-neutral-900"
    }
  ];

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-8 text-neutral-950">
      <section className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Administração
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Painel CondoLogPro
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
              Cockpit operacional para acompanhar entradas, pendências, retiradas e base de moradores.
            </p>
          </div>
          <Link
            href="/mobile"
            className="inline-flex min-h-11 items-center gap-2 rounded-[8px] bg-neutral-950 px-4 py-3 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 focus:ring-offset-neutral-100"
          >
            Abrir portaria mobile
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </header>

        <section aria-label="Indicadores operacionais do dia" className="mt-8 grid gap-4 md:grid-cols-4">
          {primaryStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article
                key={stat.label}
                className={`rounded-[8px] border bg-white p-5 ${stat.accent}`}
              >
                <header className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{stat.label}</p>
                  <Icon className="h-5 w-5 opacity-80" aria-hidden="true" />
                </header>
                <p className="mt-4 text-3xl font-semibold tracking-tight">{stat.value}</p>
                <p className="mt-2 text-xs font-medium opacity-80">{stat.hint}</p>
              </article>
            );
          })}
        </section>

        <section aria-label="Indicadores complementares" className="mt-4 grid gap-4 md:grid-cols-3">
          {secondaryStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article key={stat.label} className={`rounded-[8px] border p-5 ${stat.accent}`}>
                <header className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">{stat.label}</p>
                  <Icon className="h-5 w-5 opacity-80" aria-hidden="true" />
                </header>
                <p className="mt-4 text-2xl font-semibold tracking-tight">{stat.value}</p>
                <p className="mt-2 text-xs font-medium opacity-80">{stat.hint}</p>
              </article>
            );
          })}
        </section>

        <section aria-label="Áreas de gestão" className="mt-8 grid gap-3 md:grid-cols-5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col rounded-[8px] border border-neutral-200 bg-white p-4 transition focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 focus:ring-offset-neutral-100 hover:border-neutral-300"
            >
              <span className="text-sm font-semibold text-neutral-900">{item.label}</span>
              <span className="mt-2 text-xs leading-5 text-neutral-500">{item.description}</span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-neutral-600 group-hover:text-neutral-900">
                Abrir
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <article className="overflow-hidden rounded-[8px] border border-neutral-200 bg-white">
            <header className="flex items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">Últimas encomendas</h2>
                <p className="text-xs text-neutral-500">10 movimentos mais recentes.</p>
              </div>
              <Link
                href="/admin/packages"
                className="inline-flex min-h-11 items-center gap-1 rounded-[8px] border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 focus:ring-offset-white"
              >
                Ver todas
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Morador</th>
                    <th className="px-5 py-3 font-semibold">Unidade</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Transportadora</th>
                    <th className="px-5 py-3 font-semibold">Recebida</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPackages.map((pkg) => {
                    const overdue = isPackageOverdue(pkg);
                    return (
                      <tr key={pkg.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                        <td className="px-5 py-3 font-medium text-neutral-900">
                          {pkg.resident?.name ?? "Sem morador"}
                        </td>
                        <td className="px-5 py-3 text-neutral-600">
                          {pkg.unit.building.label} · Apto {pkg.unit.number}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={pkg.status} />
                            {overdue ? <StatusBadge status="OVERDUE" /> : null}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-neutral-600">{pkg.carrier ?? "Não informada"}</td>
                        <td className="px-5 py-3 text-neutral-600">
                          {formatDateTime(pkg.receivedAt)}
                          <span className="ml-2 text-xs text-neutral-400">
                            ({formatRelativeHours(pkg.receivedAt)})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {recentPackages.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-neutral-500">
                        Nenhuma encomenda registrada ainda.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-[8px] border border-neutral-200 bg-white">
            <header className="border-b border-neutral-200 px-5 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                Blocos com mais encomendas
              </h2>
              <p className="text-xs text-neutral-500">
                Volume acumulado e pendências em aberto.
              </p>
            </header>
            <ul className="divide-y divide-neutral-100">
              {topBuildings.map((building) => (
                <li
                  key={building.buildingLabel}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{building.buildingLabel}</p>
                    <p className="text-xs text-neutral-500">
                      {building.totalPackages} encomendas totais
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      building.pendingPackages > 0
                        ? "bg-amber-100 text-amber-900"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {building.pendingPackages} em aberto
                  </span>
                </li>
              ))}
              {topBuildings.length === 0 ? (
                <li className="px-5 py-6 text-sm text-neutral-500">
                  Sem dados de blocos ainda.
                </li>
              ) : null}
            </ul>
          </article>
        </section>
      </section>
    </main>
  );
}
