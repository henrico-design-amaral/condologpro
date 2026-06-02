import { Clock, PackageOpen } from "lucide-react";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function statusLabel(status: string) {
  return status === "NOTIFIED" ? "Avisado" : "Pendente";
}

export default async function MobilePendingPage() {
  const packages = await prisma.package.findMany({
    where: {
      status: {
        in: ["PENDING", "NOTIFIED"]
      }
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
    take: 60
  });

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 text-white">
      <section className="mx-auto max-w-md">
        <Link href="/mobile" className="min-h-11 text-sm font-medium text-neutral-300 focus:outline-none focus:ring-2 focus:ring-white">
          Voltar
        </Link>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Portaria</p>
            <h1 className="mt-2 text-3xl font-semibold">Pendentes</h1>
          </div>
          <span className="rounded-full bg-neutral-800 px-3 py-1 text-sm text-neutral-300">{packages.length}</span>
        </div>

        {packages.length === 0 ? (
          <div className="mt-6 rounded-[8px] border border-neutral-700 bg-neutral-900 p-5 text-center">
            <PackageOpen className="mx-auto h-8 w-8 text-neutral-500" aria-hidden="true" />
            <p className="mt-3 font-semibold">Nenhuma encomenda pendente</p>
            <p className="mt-2 text-sm text-neutral-400">Novas entradas aparecerão aqui.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-3">
            {packages.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/mobile/package/${pkg.id}`}
                className="rounded-[8px] border border-neutral-700 bg-neutral-900 p-4 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{pkg.resident?.name ?? "Sem morador"}</p>
                    <p className="mt-1 text-sm text-neutral-300">
                      {pkg.unit.building.label} · Apto {pkg.unit.number}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-400 px-2 py-1 text-xs font-semibold text-neutral-950">
                    {statusLabel(pkg.status)}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-neutral-400">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {formatDate(pkg.receivedAt)}
                </div>
                <p className="mt-2 text-sm text-neutral-400">
                  {pkg.carrier ?? "Transportadora não informada"}
                  {pkg.packageCode ? ` · ${pkg.packageCode}` : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
