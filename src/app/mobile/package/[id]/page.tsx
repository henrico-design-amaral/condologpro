import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Clock, MapPin, MessageCircle, ScrollText, Truck, User } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatRelativeHours } from "@/lib/format";
import { buildPackageNotificationMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { isPackageOverdue } from "@/lib/stats";

export const dynamic = "force-dynamic";

type MobilePackagePageProps = {
  params: Promise<{
    id: string;
  }>;
};

const EVENT_LABEL: Record<string, string> = {
  PACKAGE_RECEIVED: "Recebida",
  PACKAGE_NOTIFIED: "Avisada",
  PACKAGE_PICKED_UP: "Retirada",
  PACKAGE_UPDATED: "Atualizada",
  PACKAGE_CANCELLED: "Cancelada"
};

async function markNotified(formData: FormData) {
  "use server";

  const packageId = String(formData.get("packageId") ?? "");

  if (!packageId) {
    return;
  }

  const pkg = await prisma.package.findUnique({ where: { id: packageId } });

  if (!pkg || pkg.status === "PICKED_UP" || pkg.status === "CANCELLED") {
    return;
  }

  const notifiedAt = new Date();

  await prisma.package.update({
    where: { id: packageId },
    data: {
      status: "NOTIFIED",
      notifiedAt,
      events: {
        create: {
          organizationId: pkg.organizationId,
          type: "PACKAGE_NOTIFIED",
          message: "Morador marcado como notificado pela portaria.",
          createdAt: notifiedAt
        }
      }
    }
  });

  revalidatePath("/mobile");
  revalidatePath("/mobile/pending");
  revalidatePath(`/mobile/package/${packageId}`);
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
      organization: true,
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
  const isCancelled = pkg.status === "CANCELLED";
  const overdue = isPackageOverdue(pkg);

  const whatsappUrl =
    pkg.resident?.phone && !isPickedUp && !isCancelled
      ? buildWhatsAppUrl(
          pkg.resident.phone,
          buildPackageNotificationMessage({
            residentName: pkg.resident.name,
            condominiumName: pkg.organization.name,
            buildingLabel: pkg.unit.building.label,
            unitLabel: pkg.unit.number,
            receivedAt: pkg.receivedAt
          })
        )
      : null;

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 text-white">
      <section className="mx-auto max-w-md">
        <Link
          href="/mobile/pending"
          className="inline-flex min-h-11 items-center text-sm font-medium text-neutral-300 focus:outline-none focus:ring-2 focus:ring-white"
        >
          ← Voltar para pendentes
        </Link>

        <article className="mt-5 rounded-[12px] border border-neutral-700 bg-neutral-900 p-4">
          <header className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                {isPickedUp ? "Retirada concluída" : isCancelled ? "Cancelada" : "Aguardando retirada"}
              </p>
              <h1 className="mt-2 text-2xl font-semibold">{pkg.resident?.name ?? "Morador não vinculado"}</h1>
              <p className="mt-1 flex items-center gap-2 text-neutral-300">
                <MapPin className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                {pkg.unit.building.label} · Apto {pkg.unit.number}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={pkg.status} className="text-[10px]" />
              {overdue ? <StatusBadge status="OVERDUE" className="text-[10px]" /> : null}
            </div>
          </header>

          {pkg.labelPhotoUrl ? (
            <img
              src={pkg.labelPhotoUrl}
              alt={`Etiqueta da encomenda ${pkg.packageCode ?? "sem código"}`}
              className="mt-4 aspect-[4/3] w-full rounded-[12px] border border-neutral-700 object-cover"
            />
          ) : (
            <div className="mt-4 rounded-[12px] border border-dashed border-neutral-700 p-4 text-center text-sm text-neutral-400">
              Sem foto de etiqueta registrada
            </div>
          )}

          <dl className="mt-4 grid gap-3 text-sm">
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-neutral-400" aria-hidden="true" />
              <div>
                <dt className="text-neutral-500">Recebida em</dt>
                <dd className="mt-0.5 font-medium">
                  {formatDateTime(pkg.receivedAt)}
                  <span className="ml-2 text-xs text-neutral-400">
                    ({formatRelativeHours(pkg.receivedAt)} atrás)
                  </span>
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Truck className="mt-0.5 h-4 w-4 text-neutral-400" aria-hidden="true" />
              <div>
                <dt className="text-neutral-500">Transportadora / código</dt>
                <dd className="mt-0.5 font-medium">
                  {pkg.carrier ?? "Não informada"}
                  {pkg.packageCode ? ` · ${pkg.packageCode}` : ""}
                </dd>
              </div>
            </div>
            {pkg.notes ? (
              <div className="flex items-start gap-2">
                <ScrollText className="mt-0.5 h-4 w-4 text-neutral-400" aria-hidden="true" />
                <div>
                  <dt className="text-neutral-500">Observação</dt>
                  <dd className="mt-0.5 whitespace-pre-line font-medium">{pkg.notes}</dd>
                </div>
              </div>
            ) : null}
            {pkg.resident?.phone ? (
              <div className="flex items-start gap-2">
                <User className="mt-0.5 h-4 w-4 text-neutral-400" aria-hidden="true" />
                <div>
                  <dt className="text-neutral-500">Telefone do morador</dt>
                  <dd className="mt-0.5 font-medium">{pkg.resident.phone}</dd>
                </div>
              </div>
            ) : null}
          </dl>
        </article>

        {!isPickedUp && !isCancelled ? (
          <section className="mt-4 grid gap-3 rounded-[12px] border border-neutral-700 bg-neutral-900 p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <MessageCircle className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              Notificar morador
            </h2>
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-14 items-center justify-center gap-3 rounded-[8px] bg-emerald-400 px-4 py-3 text-base font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                Abrir WhatsApp com mensagem pronta
              </a>
            ) : (
              <p className="rounded-[8px] border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-100">
                Telefone não cadastrado. Avise o morador manualmente.
              </p>
            )}
            <form action={markNotified}>
              <input type="hidden" name="packageId" value={pkg.id} />
              <button
                type="submit"
                className="min-h-12 w-full rounded-[8px] border border-neutral-600 px-4 py-3 text-sm font-semibold text-neutral-100 focus:outline-none focus:ring-2 focus:ring-white"
              >
                Marcar como avisado
              </button>
            </form>
          </section>
        ) : null}

        {!isPickedUp ? (
          <form action={confirmPickup} className="mt-4 grid gap-3 rounded-[12px] border border-neutral-700 bg-neutral-900 p-4">
            <input type="hidden" name="packageId" value={pkg.id} />
            <h2 className="text-lg font-semibold">Confirmar retirada</h2>
            <label className="grid gap-1 text-sm font-semibold text-neutral-200">
              Nome de quem retirou
              <input
                name="pickedUpByName"
                defaultValue={pkg.resident?.name ?? ""}
                required
                minLength={2}
                className="min-h-12 rounded-[8px] border border-neutral-700 bg-neutral-950 px-3 text-base font-normal outline-none focus:ring-2 focus:ring-white"
                aria-describedby="pickup-name-help"
              />
              <span id="pickup-name-help" className="text-xs text-neutral-500">
                Obrigatório. Use o nome do morador ou de quem está retirando.
              </span>
            </label>
            <label className="grid gap-1 text-sm font-semibold text-neutral-200">
              Documento
              <input
                name="pickedUpByDocument"
                className="min-h-12 rounded-[8px] border border-neutral-700 bg-neutral-950 px-3 text-base font-normal outline-none focus:ring-2 focus:ring-white"
                placeholder="Opcional"
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-neutral-200">
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
          <div className="mt-4 rounded-[12px] border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-50">
            Retirada por {pkg.pickedUpByName} em {formatDateTime(pkg.pickedUpAt)}.
          </div>
        )}

        <section className="mt-4 rounded-[12px] border border-neutral-700 bg-neutral-900 p-4">
          <h2 className="text-lg font-semibold">Histórico</h2>
          <ol className="mt-3 grid gap-3">
            {pkg.events.map((event) => (
              <li key={event.id} className="border-l border-neutral-700 pl-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                  {EVENT_LABEL[event.type] ?? event.type}
                </p>
                <p className="mt-1 text-sm">{event.message}</p>
                <p className="mt-1 text-xs text-neutral-500">{formatDateTime(event.createdAt)}</p>
              </li>
            ))}
            {pkg.events.length === 0 ? (
              <li className="text-sm text-neutral-500">Nenhum evento registrado.</li>
            ) : null}
          </ol>
        </section>
      </section>
    </main>
  );
}
