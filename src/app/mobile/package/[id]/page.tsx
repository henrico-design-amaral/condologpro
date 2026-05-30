import Link from "next/link";
import { notFound } from "next/navigation";
import { getPackageById } from "@/lib/data";
import { buildPackageNotificationMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { StatusBadgeDark } from "@/components/StatusBadge";
import { NotifyButton } from "./NotifyButton";
import { PickupForm } from "./PickupForm";

function formatFull(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(date));
}

const eventTypeLabel: Record<string, string> = {
  PACKAGE_RECEIVED: "Encomenda recebida",
  PACKAGE_NOTIFIED: "Morador notificado",
  PACKAGE_PICKED_UP: "Retirada confirmada",
  PACKAGE_UPDATED: "Atualizado",
  PACKAGE_CANCELLED: "Cancelado"
};

export default async function PackageDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pkg = await getPackageById(id);

  if (!pkg) notFound();

  const phone = pkg.resident?.phone ?? null;
  const whatsappUrl =
    phone
      ? buildWhatsAppUrl(
          phone,
          buildPackageNotificationMessage({
            residentName: pkg.resident?.name ?? "Morador",
            condominiumName: pkg.organization.name,
            buildingLabel: pkg.unit.building.label,
            unitLabel: pkg.unit.number,
            receivedAt: pkg.receivedAt
          })
        )
      : null;

  const isPickedUp = pkg.status === "PICKED_UP";
  const isCancelled = pkg.status === "CANCELLED";

  return (
    <main className="min-h-screen bg-neutral-950 px-4 pb-12 pt-6 text-white">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/mobile/pending"
            className="text-sm text-neutral-500 hover:text-neutral-300"
          >
            ← Pendentes
          </Link>
          <StatusBadgeDark status={pkg.status} />
        </div>

        {/* Header info */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <p className="text-2xl font-semibold">
            {pkg.resident?.name ?? "Morador não vinculado"}
          </p>
          <p className="mt-1 text-neutral-400">
            {pkg.unit.building.label} · Apto {pkg.unit.number}
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-neutral-500">Transportadora</dt>
              <dd className="mt-0.5 font-medium">{pkg.carrier ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Código</dt>
              <dd className="mt-0.5 font-mono font-medium">
                {pkg.packageCode ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Recebido em</dt>
              <dd className="mt-0.5 font-medium">{formatFull(pkg.receivedAt)}</dd>
            </div>
            {pkg.notifiedAt && (
              <div>
                <dt className="text-xs text-neutral-500">Avisado em</dt>
                <dd className="mt-0.5 font-medium">
                  {formatFull(pkg.notifiedAt)}
                </dd>
              </div>
            )}
            {pkg.pickedUpAt && (
              <div className="col-span-2">
                <dt className="text-xs text-neutral-500">Retirado em</dt>
                <dd className="mt-0.5 font-medium">{formatFull(pkg.pickedUpAt)}</dd>
              </div>
            )}
            {pkg.pickedUpByName && (
              <div className="col-span-2">
                <dt className="text-xs text-neutral-500">Retirado por</dt>
                <dd className="mt-0.5 font-medium">{pkg.pickedUpByName}</dd>
              </div>
            )}
            {pkg.notes && (
              <div className="col-span-2">
                <dt className="text-xs text-neutral-500">Observações</dt>
                <dd className="mt-0.5 text-neutral-300">{pkg.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Label photo */}
        {pkg.labelPhotoUrl && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
              Foto da etiqueta
            </p>
            <img
              src={pkg.labelPhotoUrl}
              alt="Etiqueta"
              className="w-full rounded-xl object-cover"
            />
          </div>
        )}

        {/* Actions */}
        {!isPickedUp && !isCancelled && (
          <div className="space-y-5">
            {/* WhatsApp notify */}
            {pkg.status !== "NOTIFIED" && (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                <p className="mb-4 text-sm font-medium text-neutral-400">
                  Notificar morador
                </p>
                {whatsappUrl ? (
                  <NotifyButton
                    packageId={pkg.id}
                    whatsappUrl={whatsappUrl}
                  />
                ) : (
                  <p className="text-sm text-neutral-500">
                    Morador sem telefone cadastrado.
                  </p>
                )}
              </div>
            )}

            {pkg.status === "NOTIFIED" && (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
                <p className="text-sm text-neutral-400">
                  Morador já foi notificado em{" "}
                  <span className="font-medium text-neutral-300">
                    {formatFull(pkg.notifiedAt)}
                  </span>
                  .
                </p>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-emerald-400 hover:underline"
                  >
                    Reenviar WhatsApp →
                  </a>
                )}
              </div>
            )}

            {/* Pickup form */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
              <p className="mb-4 text-sm font-medium text-neutral-400">
                Confirmar retirada
              </p>
              <PickupForm packageId={pkg.id} />
            </div>
          </div>
        )}

        {isPickedUp && (
          <div className="rounded-2xl border border-emerald-900 bg-emerald-900/20 p-5 text-center">
            <p className="text-lg font-semibold text-emerald-400">
              Encomenda retirada ✓
            </p>
            <p className="mt-1 text-sm text-emerald-600">
              {pkg.pickedUpByName} em {formatFull(pkg.pickedUpAt)}
            </p>
          </div>
        )}

        {/* Event timeline */}
        {pkg.events.length > 0 && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-neutral-500">
              Histórico
            </p>
            <ol className="space-y-3">
              {pkg.events.map((ev) => (
                <li key={ev.id} className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-600" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-300">
                      {eventTypeLabel[ev.type] ?? ev.type}
                    </p>
                    <p className="text-xs text-neutral-600">{ev.message}</p>
                    <p className="mt-0.5 text-xs text-neutral-700">
                      {formatFull(ev.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </main>
  );
}
