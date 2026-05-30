import Link from "next/link";
import { getDashboardSummary, getDefaultOrg, getRecentPackages } from "@/lib/data";
import { MetricCard } from "@/components/MetricCard";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

export default async function AdminDashboardPage() {
  const org = await getDefaultOrg();

  if (!org) {
    return (
      <div className="py-16 text-center text-neutral-500">
        Nenhuma organização encontrada. Execute o seed do banco de dados.
      </div>
    );
  }

  const [summary, recent] = await Promise.all([
    getDashboardSummary(org.id),
    getRecentPackages(org.id, 12)
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
          {org.name}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-950">
          Painel operacional
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Recebidas hoje"
          value={summary.todayTotal}
          accent="default"
        />
        <MetricCard
          label="Pendentes"
          value={summary.pending}
          accent="amber"
        />
        <MetricCard
          label="Aguardando retirada"
          value={summary.notified}
          accent="blue"
        />
        <MetricCard
          label="Retiradas hoje"
          value={summary.pickedUpToday}
          accent="green"
        />
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-neutral-950">
            Encomendas recentes
          </h2>
          <Link
            href="/admin/packages"
            className="text-xs text-neutral-500 hover:text-neutral-950"
          >
            Ver todas →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="p-6">
            <EmptyState title="Nenhuma encomenda registrada ainda." />
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {recent.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/mobile/package/${pkg.id}`}
                className="flex items-center gap-4 px-6 py-3.5 transition hover:bg-neutral-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-neutral-950">
                      {pkg.resident?.name ?? "—"}
                    </span>
                    <StatusBadge status={pkg.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {pkg.unit.building.label} · Apto {pkg.unit.number}
                    {pkg.carrier ? ` · ${pkg.carrier}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-neutral-400">
                  {formatDate(pkg.receivedAt)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/mobile/intake"
          className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Portaria
          </p>
          <p className="mt-2 text-lg font-semibold text-neutral-950">
            Registrar encomenda
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Abre o fluxo mobile de entrada.
          </p>
        </Link>
        <Link
          href="/mobile/pending"
          className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Pendentes
          </p>
          <p className="mt-2 text-lg font-semibold text-neutral-950">
            Ver pendentes
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Lista de retiradas em aberto.
          </p>
        </Link>
        <Link
          href="/admin/residents"
          className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
            Base
          </p>
          <p className="mt-2 text-lg font-semibold text-neutral-950">
            Moradores
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Consultar base de moradores.
          </p>
        </Link>
      </div>
    </div>
  );
}
