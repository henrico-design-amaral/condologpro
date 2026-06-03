import type { PackageStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const STATUS_COPY: Record<PackageStatus | "OVERDUE", { label: string; tone: string }> = {
  PENDING: {
    label: "Pendente",
    tone: "bg-amber-100 text-amber-900 border-amber-200"
  },
  NOTIFIED: {
    label: "Avisado",
    tone: "bg-sky-100 text-sky-900 border-sky-200"
  },
  PICKED_UP: {
    label: "Retirado",
    tone: "bg-emerald-100 text-emerald-900 border-emerald-200"
  },
  CANCELLED: {
    label: "Cancelado",
    tone: "bg-rose-100 text-rose-900 border-rose-200"
  },
  OVERDUE: {
    label: "Atrasado",
    tone: "bg-yellow-200 text-yellow-950 border-yellow-300"
  }
};

type StatusBadgeProps = {
  status: PackageStatus | "OVERDUE";
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const meta = STATUS_COPY[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold uppercase tracking-wide",
        meta.tone,
        className
      )}
    >
      {meta.label}
    </span>
  );
}

export function statusLabel(status: PackageStatus | "OVERDUE") {
  return STATUS_COPY[status].label;
}
