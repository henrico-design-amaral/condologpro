import { ArrowRight, PackageCheck, PackageOpen, Users } from "lucide-react";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

const navItems = [
  { href: "/admin/residents", label: "Moradores" },
  { href: "/admin/packages", label: "Encomendas" },
  { href: "/admin/import", label: "Importar base" },
  { href: "/admin/settings", label: "Configurações" }
];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

export default async function AdminHomePage() {
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
  const [todayCount, pendingCount, pickedUpCount, residentCount, recentPackages] = await Promise.all([
    prisma.package.count({
      where: {
        receivedAt: {
          gte: startOfDay
        }
      }
    }),
    prisma.package.count({
      where: {
        status: {
          in: ["PENDING", "NOTIFIED"]
        }
      }
    }),
    prisma.package.count({
      where: {
        status: "PICKED_UP",
        pickedUpAt: {
          gte: startOfDay
        }
      }
    }),
    prisma.resident.count({
      where: {
        isActive: true
      }
    }),
    prisma.package.findMany({
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
      take: 8
    })
  ]);

  const stats = [
    { label: "Entradas hoje", value: todayCount, icon: PackageOpen },
    { label: "Pendentes", value: pendingCount, icon: PackageCheck },
    { label: "Retiradas hoje", value: pickedUpCount, icon: PackageCheck },
    { label: "Moradores ativos", value: residentCount, icon: Users }
  ];

  return (
    <main className="min-h-screen bg-neutral-100 px-6 py-8 text-neutral-950">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Administração
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Painel CondoLogPro
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600">
              Controle desktop para acompanhar entradas, pendências, retiradas e base de moradores.
            </p>
          </div>
          <Link
            href="/mobile"
            className="flex min-h-11 items-center gap-2 rounded-[8px] bg-neutral-950 px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-neutral-950"
          >
            Portaria mobile
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-[8px] border border-neutral-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
                  <Icon className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                </div>
                <p className="mt-4 text-3xl font-semibold">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[8px] border border-neutral-200 bg-white p-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-950"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-[8px] border border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-lg font-semibold">Últimas encomendas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead className="bg-neutral-50 text-left text-neutral-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Morador</th>
                  <th className="px-5 py-3 font-semibold">Unidade</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Transportadora</th>
                  <th className="px-5 py-3 font-semibold">Recebida</th>
                </tr>
              </thead>
              <tbody>
                {recentPackages.map((pkg) => (
                  <tr key={pkg.id} className="border-t border-neutral-100">
                    <td className="px-5 py-3 font-medium">{pkg.resident?.name ?? "Sem morador"}</td>
                    <td className="px-5 py-3 text-neutral-600">
                      {pkg.unit.building.label} / {pkg.unit.number}
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700">
                        {pkg.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-neutral-600">{pkg.carrier ?? "Não informada"}</td>
                    <td className="px-5 py-3 text-neutral-600">{formatDate(pkg.receivedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
