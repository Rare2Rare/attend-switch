import { formatDateTimeJST, isDeadlinePassed } from "@/lib/date";
import type { Thread } from "@/db/schema";

type ThreadWithCounts = Thread & {
  attendingCount: number;
  absentCount: number;
  pendingCount: number;
};

export function ThreadCard({ thread }: { thread: ThreadWithCounts }) {
  const deadlinePassed = isDeadlinePassed(thread.deadlineAt);

  return (
    <a
      href={`/thread/${thread.publicId}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-900">
          {thread.title}
        </h2>
        {deadlinePassed && (
          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            締切済み
          </span>
        )}
      </div>

      {thread.description && (
        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
          {thread.description}
        </p>
      )}

      <div className="mt-3 flex items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          <span className="text-gray-700">参加 {thread.attendingCount}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
          <span className="text-gray-700">不参加 {thread.absentCount}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" />
          <span className="text-gray-700">保留 {thread.pendingCount}</span>
        </span>
      </div>

      <p className="mt-2 text-xs text-gray-400">
        更新: {formatDateTimeJST(thread.updatedAt)}
      </p>
    </a>
  );
}
