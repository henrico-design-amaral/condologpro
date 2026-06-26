import { Camera, ClipboardList, PackageCheck, ScrollText, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { getMobileSummaryStats } from "@/lib/stats";
import { OPERATIONAL_ROLES } from "@/lib/auth/policy";
import { requirePageOperator } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function MobileHomePage() {
  const operator = await requirePageOperator(OPERATIONAL_ROLES, "/mobile");
  const { pendingCount, notifiedCount, todayCount, pickedUpTodayCount, overdueCount } =
    await getMobileSummaryStats(operator.organizationId);

  const totalPending = pendingCount + notifiedCount;

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 text-white">
      <section className="mx-auto flex max-w-md flex-col gap-5">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Portaria
          </p>
          <h1 className="mt-2 whitespace-nowrap text-3xl font-semibold">CondoLogPro</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-300">
            Entrada, aviso e retirada de encomendas com foto da etiqueta.
          </p>
        </header>

        <Link
          href="/mobile/intake"
          className="flex min-h-24 items-center justify-between rounded-[8px] bg-white px-5 py-5 text-neutral-950 shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-neutral-950"
        >
          <span>
            <span className="block text-xl font-semibold">Nova encomenda</span>
            <span className="mt-1 block text-sm text-neutral-600">Abrir câmera e registrar entrada</span>
          </span>
          <Camera className="h-8 w-8" aria-hidden="true" />
        </Link>

        <section aria-label="Resumo do turno" className="grid grid-cols-3 gap-3">
          <article className="rounded-[8px] border border-neutral-700 bg-neutral-900 p-3 text-center">
            <p className="text-2xl font-semibold">{totalPending}</p>
            <p className="mt-1 text-xs text-neutral-400">Pendentes</p>
          </article>
          <article className="rounded-[8px] border border-neutral-700 bg-neutral-900 p-3 text-center">
            <p className="text-2xl font-semibold">{todayCount}</p>
            <p className="mt-1 text-xs text-neutral-400">Entradas hoje</p>
          </article>
          <article className="rounded-[8px] border border-neutral-700 bg-neutral-900 p-3 text-center">
            <p className="text-2xl font-semibold">{pickedUpTodayCount}</p>
            <p className="mt-1 text-xs text-neutral-400">Retiradas</p>
          </article>
        </section>

        {overdueCount > 0 ? (
          <Link
            href="/mobile/pending?overdue=1"
            className="flex min-h-16 items-center justify-between rounded-[8px] border border-rose-400/60 bg-rose-500/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <span className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-rose-300" aria-hidden="true" />
              <span>
                <span className="block text-sm font-semibold text-rose-50">
                  {overdueCount} encomenda(s) atrasada(s)
                </span>
                <span className="block text-xs text-rose-100/80">Aguardando há mais de 24h</span>
              </span>
            </span>
            <span aria-hidden="true" className="text-rose-100">→</span>
          </Link>
        ) : null}

        <Link
          href="/mobile/pending"
          className="flex min-h-16 items-center justify-between rounded-[8px] border border-neutral-700 bg-neutral-900 px-5 py-4 font-semibold focus:outline-none focus:ring-2 focus:ring-white"
        >
          <span className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-emerald-300" aria-hidden="true" />
            Ver pendentes
          </span>
          <span className="rounded-full bg-neutral-800 px-3 py-1 text-sm text-neutral-300">{totalPending}</span>
        </Link>

        <Link
          href="/admin/history"
          className="flex min-h-14 items-center gap-3 rounded-[8px] border border-neutral-800 px-5 py-4 text-sm font-semibold text-neutral-300 focus:outline-none focus:ring-2 focus:ring-white"
        >
          <ScrollText className="h-5 w-5" aria-hidden="true" />
          Consultar histórico
        </Link>

        <Link
          href="/admin"
          className="flex min-h-14 items-center gap-3 rounded-[8px] border border-neutral-800 px-5 py-4 text-sm font-semibold text-neutral-300 focus:outline-none focus:ring-2 focus:ring-white"
        >
          <PackageCheck className="h-5 w-5" aria-hidden="true" />
          Abrir admin desktop
        </Link>
      </section>
    </main>
  );
}
