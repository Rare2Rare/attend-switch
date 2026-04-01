import type { ResponseStatus } from "@/db/schema";

const statusConfig: Record<
  ResponseStatus,
  { label: string; className: string }
> = {
  attending: {
    label: "参加",
    className: "bg-green-100 text-green-800 border-green-300",
  },
  absent: {
    label: "不参加",
    className: "bg-red-100 text-red-800 border-red-300",
  },
  pending: {
    label: "保留",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
};

export function StatusBadge({ status }: { status: ResponseStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export function statusLabel(status: ResponseStatus): string {
  return statusConfig[status].label;
}
