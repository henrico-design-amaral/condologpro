import Link from "next/link";
import { getDashboardSummary, getDefaultOrg } from "@/lib/data";
import { MetricCardDark } from "@/components/MetricCard";

export default async function MobileHomePage() {
  const org = await getDefaultOrg();
  const summary = org
    ? await getDashboardSummary(org.id)
    : { todayTotal: 0, pending: 0, notified: 0, pickedUpToday: 0 };

  return (
    <main className="min-h-screen bg-neutral-950 px-4 pb-10 pt-8 text-white">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
            Portaria
          </p>
          <h1 className="mt-1.5 text-3xl font-semibold">CondoLogPro</h1>
          {org && (
            <p className="mt-1 text-sm text-neutral-500">{org.name}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <MetricCardDark
            label="Pendentes"
            value={summary.pending}
            accent="amber"
          />
          <MetricCardDark
            label="Avisadas"
            value={summary.notified}
            accent="blue"
          />
          <MetricCardDark
            label="Retiradas hoje"
            value={summary.pickedUpToday}
            accent="green"
          />
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/mobile/intake"
            className="flex items-center justify-center rounded-2xl bg-white px-6 py-6 text-center text-xl font-semibold text-neutral-950 active:bg-neutral-100"
          >
            + Nova encomenda
          </Link>

          <Link
            href="/mobile/pending"
            className="flex items-center justify-center rounded-2xl border border-neutral-700 px-6 py-5 text-center text-lg font-medium text-white active:bg-neutral-900"
          >
            Ver pendentes
            {summary.pending + summary.notified > 0 && (
              <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
                {summary.pending + summary.notified}
              </span>
            )}
          </Link>
        </div>

        <div className="border-t border-neutral-800 pt-4">
          <Link
            href="/admin"
            className="text-xs text-neutral-600 hover:text-neutral-400"
          >
            Painel admin →
          </Link>
        </div>
      </div>
    </main>
  );
}
