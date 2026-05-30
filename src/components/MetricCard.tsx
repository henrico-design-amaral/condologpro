import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number | string;
  accent?: "default" | "amber" | "blue" | "green";
  className?: string;
};

const accentMap = {
  default: "text-neutral-950",
  amber: "text-amber-600",
  blue: "text-blue-600",
  green: "text-emerald-600"
};

export function MetricCard({ label, value, accent = "default", className }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm",
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-4xl font-semibold tabular-nums",
          accentMap[accent]
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function MetricCardDark({
  label,
  value,
  accent = "default",
  className
}: Props) {
  const darkAccent = {
    default: "text-white",
    amber: "text-amber-400",
    blue: "text-blue-400",
    green: "text-emerald-400"
  };
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-800 bg-neutral-900 p-4",
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 text-3xl font-semibold tabular-nums",
          darkAccent[accent]
        )}
      >
        {value}
      </p>
    </div>
  );
}
