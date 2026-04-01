import { StatusBadge } from "./status-badge";
import { formatDateTimeJST } from "@/lib/date";
import type { Response, ResponseStatus } from "@/db/schema";

const STATUS_ORDER: ResponseStatus[] = ["attending", "absent", "pending"];

export function ResponseList({ responses }: { responses: Response[] }) {
  const active = responses.filter((r) => !r.deletedAt);

  if (active.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-gray-500">
        まだ参加者はいません
      </p>
    );
  }

  const sorted = [...active].sort((a, b) => {
    const ai = STATUS_ORDER.indexOf(a.status);
    const bi = STATUS_ORDER.indexOf(b.status);
    if (ai !== bi) return ai - bi;
    return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
  });

  return (
    <div className="divide-y divide-gray-100">
      {sorted.map((r) => (
        <div
          key={r.id}
          className="flex items-center justify-between gap-2 py-2.5"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {r.displayName}
            </span>
            <StatusBadge status={r.status} />
          </div>
          <span className="shrink-0 text-xs text-gray-400">
            {formatDateTimeJST(r.updatedAt)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ResponseSummary({ responses }: { responses: Response[] }) {
  const active = responses.filter((r) => !r.deletedAt);
  const counts = {
    attending: active.filter((r) => r.status === "attending").length,
    absent: active.filter((r) => r.status === "absent").length,
    pending: active.filter((r) => r.status === "pending").length,
  };

  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
        <span className="font-medium">参加 {counts.attending}</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
        <span className="font-medium">不参加 {counts.absent}</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-3 w-3 rounded-full bg-yellow-500" />
        <span className="font-medium">保留 {counts.pending}</span>
      </span>
    </div>
  );
}
