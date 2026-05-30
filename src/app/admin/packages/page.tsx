import { getAllPackages, getDefaultOrg } from "@/lib/data";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

export default async function AdminPackagesPage() {
  const org = await getDefaultOrg();
  const packages = org ? await getAllPackages(org.id) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
            Encomendas
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {packages.length} registro{packages.length !== 1 ? "s" : ""} encontrado{packages.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/mobile/intake"
          className="rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          + Nova encomenda
        </Link>
      </div>

      {packages.length === 0 ? (
        <EmptyState
          title="Nenhuma encomenda registrada."
          description="Registre a primeira encomenda pela portaria mobile."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-neutral-500">
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-neutral-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-neutral-500">
                    Bloco
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-neutral-500">
                    Apto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-neutral-500">
                    Morador
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-neutral-500">
                    Transportadora
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-neutral-500">
                    Recebido em
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-neutral-500">
                    Retirado em
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-mono text-xs text-neutral-700">
                      {pkg.packageCode ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={pkg.status} />
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {pkg.unit.building.label}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {pkg.unit.number}
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-950">
                      {pkg.resident?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {pkg.carrier ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {formatDate(pkg.receivedAt)}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {formatDate(pkg.pickedUpAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/mobile/package/${pkg.id}`}
                        className="text-xs text-neutral-500 hover:text-neutral-950"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
