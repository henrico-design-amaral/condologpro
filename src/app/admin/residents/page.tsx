import { getAllResidents, getDefaultOrg } from "@/lib/data";
import { EmptyState } from "@/components/EmptyState";

export default async function AdminResidentsPage() {
  const org = await getDefaultOrg();
  const residents = org ? await getAllResidents(org.id) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
          Moradores
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {residents.length} morador{residents.length !== 1 ? "es" : ""} cadastrado{residents.length !== 1 ? "s" : ""}
        </p>
      </div>

      {residents.length === 0 ? (
        <EmptyState
          title="Nenhum morador cadastrado."
          description="Importe a base de moradores ou adicione manualmente."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
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
                    Telefone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-neutral-500">
                    Principal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-widest text-neutral-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {residents.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-neutral-700">
                      {r.unit.building.label}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {r.unit.number}
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-950">
                      {r.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-neutral-600">
                      {r.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.isPrimary ? (
                        <span className="text-emerald-600">✓</span>
                      ) : (
                        <span className="text-neutral-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.isActive ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-xs font-medium text-neutral-500">
                          Inativo
                        </span>
                      )}
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
