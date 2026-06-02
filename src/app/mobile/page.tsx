import { Camera, ClipboardList, PackageCheck } from "lucide-react";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function MobileHomePage() {
  const [pendingCount, todayCount, pickedUpTodayCount] = await Promise.all([
    prisma.package.count({
      where: {
        status: {
          in: ["PENDING", "NOTIFIED"]
        }
      }
    }),
    prisma.package.count({
      where: {
        receivedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    }),
    prisma.package.count({
      where: {
        status: "PICKED_UP",
        pickedUpAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })
  ]);

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 text-white">
      <section className="mx-auto flex max-w-md flex-col gap-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
            Portaria
          </p>
          <h1 className="mt-2 text-3xl font-semibold">CondoLogPro</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-300">
            Entrada, aviso e retirada de encomendas com foto da etiqueta.
          </p>
        </div>

        <Link
          href="/mobile/intake"
          className="flex min-h-24 items-center justify-between rounded-[8px] bg-white px-5 py-5 text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          <span>
            <span className="block text-xl font-semibold">Nova encomenda</span>
            <span className="mt-1 block text-sm text-neutral-600">Abrir câmera e registrar entrada</span>
          </span>
          <Camera className="h-8 w-8" aria-hidden="true" />
        </Link>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[8px] border border-neutral-700 bg-neutral-900 p-3">
            <p className="text-2xl font-semibold">{pendingCount}</p>
            <p className="mt-1 text-xs text-neutral-400">Pendentes</p>
          </div>
          <div className="rounded-[8px] border border-neutral-700 bg-neutral-900 p-3">
            <p className="text-2xl font-semibold">{todayCount}</p>
            <p className="mt-1 text-xs text-neutral-400">Entradas hoje</p>
          </div>
          <div className="rounded-[8px] border border-neutral-700 bg-neutral-900 p-3">
            <p className="text-2xl font-semibold">{pickedUpTodayCount}</p>
            <p className="mt-1 text-xs text-neutral-400">Retiradas</p>
          </div>
        </div>

        <Link
          href="/mobile/pending"
          className="flex min-h-16 items-center justify-between rounded-[8px] border border-neutral-700 bg-neutral-900 px-5 py-4 font-semibold focus:outline-none focus:ring-2 focus:ring-white"
        >
          <span className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-emerald-300" aria-hidden="true" />
            Ver pendentes
          </span>
          <span className="rounded-full bg-neutral-800 px-3 py-1 text-sm text-neutral-300">{pendingCount}</span>
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
