import Link from "next/link";
import { getDefaultOrg, getPendingPackages } from "@/lib/data";
import { StatusBadgeDark } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";

function timeAgo(date: Date) {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

export default async function MobilePendingPage() {
  const org = await getDefaultOrg();
  const packages = org ? await getPendingPackages(org.id) : [];

  return (
    <main className="min-h-screen bg-neutral-950 px-4 pb-12 pt-6 text-white">
      <div className="mx-auto max-w-md">
        <Link
          href="/mobile"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-300"
        >
          ← Voltar
        </Link>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Pendentes</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {packages.length} encomenda{packages.length !== 1 ? "s" : ""} em aberto
            </p>
          </div>
        </div>

        <div className="mt-6">
          {packages.length === 0 ? (
            <EmptyState
              dark
              title="Nenhuma encomenda pendente."
              description="Todas as encomendas foram retiradas."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {packages.map((pkg) => (
                <Link
                  key={pkg.id}
                  href={`/mobile/package/${pkg.id}`}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 transition active:bg-neutral-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">
                        {pkg.resident?.name ?? "Morador não vinculado"}
                      </p>
                      <p className="mt-0.5 text-sm text-neutral-400">
                        {pkg.unit.building.label} · Apto {pkg.unit.number}
                      </p>
                    </div>
                    <StatusBadgeDark status={pkg.status} />
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-xs text-neutral-500">
                    {pkg.carrier && (
                      <span className="rounded-lg border border-neutral-700 px-2 py-1">
                        {pkg.carrier}
                      </span>
                    )}
                    <span>{timeAgo(pkg.receivedAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
