import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

type MobilePackagePageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(date: Date | null) {
  if (!date) {
    return "Não registrado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

async function confirmPickup(formData: FormData) {
  "use server";

  const packageId = String(formData.get("packageId") ?? "");
  const pickedUpByName = String(formData.get("pickedUpByName") ?? "").trim();
  const pickedUpByDocument = String(formData.get("pickedUpByDocument") ?? "").trim();
  const pickupNotes = String(formData.get("pickupNotes") ?? "").trim();

  if (!packageId || pickedUpByName.length < 2) {
    return;
  }

  const pkg = await prisma.package.findUnique({
    where: { id: packageId }
  });

  if (!pkg || pkg.status === "PICKED_UP") {
    redirect("/mobile/pending");
  }

  const pickedUpAt = new Date();

  await prisma.package.update({
    where: { id: packageId },
    data: {
      status: "PICKED_UP",
      pickedUpAt,
      pickedUpByName,
      pickedUpByDocument: pickedUpByDocument || null,
      notes: pickupNotes ? `${pkg.notes ? `${pkg.notes}\n` : ""}Retirada: ${pickupNotes}` : pkg.notes,
      events: {
        create: {
          organizationId: pkg.organizationId,
          type: "PACKAGE_PICKED_UP",
          message: `Encomenda retirada por ${pickedUpByName}.`,
          createdAt: pickedUpAt,
          metadata: JSON.stringify({
            pickedUpByDocument: pickedUpByDocument || null,
            notes: pickupNotes || null
          })
        }
      }
    }
  });

  revalidatePath("/mobile");
  revalidatePath("/mobile/pending");
  revalidatePath(`/mobile/package/${packageId}`);
  redirect("/mobile/pending");
}

export default async function MobilePackageDetailPage({ params }: MobilePackagePageProps) {
  const { id } = await params;
  const pkg = await prisma.package.findUnique({
    where: { id },
    include: {
      resident: true,
      unit: {
        include: {
          building: true
        }
      },
      events: {
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  if (!pkg) {
    notFound();
  }

  const isPickedUp = pkg.status === "PICKED_UP";

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 text-white">
      <section className="mx-auto max-w-md">
        <Link href="/mobile/pending" className="min-h-11 text-sm font-medium text-neutral-300 focus:outline-none focus:ring-2 focus:ring-white">
          Voltar para pendentes
        </Link>

        <div className="mt-5 rounded-[8px] border border-neutral-700 bg-neutral-900 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
                {isPickedUp ? "Retirada" : "Aguardando retirada"}
              </p>
              <h1 className="mt-2 text-2xl font-semibold">{pkg.resident?.name ?? "Morador não vinculado"}</h1>
              <p className="mt-1 text-neutral-300">
                {pkg.unit.building.label} · Apto {pkg.unit.number}
              </p>
            </div>
            <span className="rounded-full bg-neutral-800 px-3 py-1 text-sm text-neutral-300">{pkg.status}</span>
          </div>

          {pkg.labelPhotoUrl ? (
            <img
              src={pkg.labelPhotoUrl}
              alt="Foto da etiqueta da encomenda"
              className="mt-4 aspect-[4/3] w-full rounded-[8px] border border-neutral-700 object-cover"
            />
          ) : (
            <div className="mt-4 rounded-[8px] border border-dashed border-neutral-700 p-4 text-center text-sm text-neutral-400">
              Sem foto de etiqueta registrada
            </div>
          )}

          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="text-neutral-500">Recebida em</dt>
              <dd className="mt-1 font-medium">{formatDate(pkg.receivedAt)}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Transportadora / código</dt>
              <dd className="mt-1 font-medium">
                {pkg.carrier ?? "Não informada"}
                {pkg.packageCode ? ` · ${pkg.packageCode}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Observação</dt>
              <dd className="mt-1 font-medium">{pkg.notes ?? "Nenhuma"}</dd>
            </div>
          </dl>
        </div>

        {!isPickedUp ? (
          <form action={confirmPickup} className="mt-5 grid gap-3 rounded-[8px] border border-neutral-700 bg-neutral-900 p-4">
            <input type="hidden" name="packageId" value={pkg.id} />
            <h2 className="text-lg font-semibold">Confirmar retirada</h2>
            <label className="grid gap-2 text-sm font-semibold text-neutral-200">
              Nome de quem retirou
              <input
                name="pickedUpByName"
                defaultValue={pkg.resident?.name ?? ""}
                required
                className="min-h-12 rounded-[8px] border border-neutral-700 bg-neutral-950 px-3 text-base font-normal outline-none focus:ring-2 focus:ring-white"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-neutral-200">
              Documento
              <input
                name="pickedUpByDocument"
                className="min-h-12 rounded-[8px] border border-neutral-700 bg-neutral-950 px-3 text-base font-normal outline-none focus:ring-2 focus:ring-white"
                placeholder="Opcional"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-neutral-200">
              Observação
              <textarea
                name="pickupNotes"
                className="min-h-20 rounded-[8px] border border-neutral-700 bg-neutral-950 px-3 py-3 text-base font-normal outline-none focus:ring-2 focus:ring-white"
                placeholder="Opcional"
              />
            </label>
            <button
              type="submit"
              className="min-h-14 rounded-[8px] bg-white px-5 py-4 text-base font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              Baixar retirada
            </button>
          </form>
        ) : (
          <div className="mt-5 rounded-[8px] border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-50">
            Retirada por {pkg.pickedUpByName} em {formatDate(pkg.pickedUpAt)}.
          </div>
        )}

        <div className="mt-5 rounded-[8px] border border-neutral-700 bg-neutral-900 p-4">
          <h2 className="text-lg font-semibold">Histórico</h2>
          <div className="mt-3 grid gap-3">
            {pkg.events.map((event) => (
              <div key={event.id} className="border-l border-neutral-700 pl-3">
                <p className="text-sm font-semibold">{event.message}</p>
                <p className="mt-1 text-xs text-neutral-500">{formatDate(event.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
