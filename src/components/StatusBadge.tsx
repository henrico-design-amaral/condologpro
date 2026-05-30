import { cn } from "@/lib/utils";

type Status = "PENDING" | "NOTIFIED" | "PICKED_UP" | "CANCELLED";

const config: Record<Status, { label: string; className: string }> = {
  PENDING: {
    label: "Pendente",
    className: "bg-amber-100 text-amber-800 border-amber-200"
  },
  NOTIFIED: {
    label: "Avisado",
    className: "bg-blue-100 text-blue-800 border-blue-200"
  },
  PICKED_UP: {
    label: "Retirado",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200"
  },
  CANCELLED: {
    label: "Cancelado",
    className: "bg-neutral-100 text-neutral-500 border-neutral-200"
  }
};

export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = config[status] ?? config.PENDING;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        className
      )}
    >
      {label}
    </span>
  );
}

export function StatusBadgeDark({ status }: { status: Status }) {
  const darkConfig: Record<Status, { label: string; className: string }> = {
    PENDING: {
      label: "Pendente",
      className: "bg-amber-900/40 text-amber-300 border-amber-700"
    },
    NOTIFIED: {
      label: "Avisado",
      className: "bg-blue-900/40 text-blue-300 border-blue-700"
    },
    PICKED_UP: {
      label: "Retirado",
      className: "bg-emerald-900/40 text-emerald-300 border-emerald-700"
    },
    CANCELLED: {
      label: "Cancelado",
      className: "bg-neutral-800 text-neutral-400 border-neutral-700"
    }
  };
  const { label, className } = darkConfig[status] ?? darkConfig.PENDING;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        className
      )}
    >
      {label}
    </span>
  );
}
