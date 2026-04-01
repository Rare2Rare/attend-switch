import { db } from "@/db";
import { threads, responses } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ResponsePanel } from "@/components/response-panel";
import { ResponseList, ResponseSummary } from "@/components/response-list";
import { formatDateTimeJST, isDeadlinePassed } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function ThreadDetailPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;

  const thread = await db.query.threads.findFirst({
    where: eq(threads.publicId, publicId),
  });

  if (!thread) {
    notFound();
  }

  const threadResponses = await db
    .select()
    .from(responses)
    .where(eq(responses.threadId, thread.id));

  const activeResponses = threadResponses.filter((r) => !r.deletedAt);
  const deadlinePassed = isDeadlinePassed(thread.deadlineAt);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold">{thread.title}</h1>
          {deadlinePassed && (
            <span className="shrink-0 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
              締切済み
            </span>
          )}
        </div>

        {thread.description && (
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
            {thread.description}
          </p>
        )}

        <div className="mt-3 space-y-1 text-xs text-gray-500">
          {thread.deadlineAt && (
            <p>締切: {formatDateTimeJST(thread.deadlineAt)}</p>
          )}
          {thread.resetTimeJst && (
            <p>毎日 {thread.resetTimeJst} (JST) に自動リセット</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">集計</h2>
        <ResponseSummary responses={threadResponses} />
      </div>

      <ResponsePanel
        threadPublicId={publicId}
        existingResponses={threadResponses}
        isDeadlinePassed={deadlinePassed}
      />

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">
          参加者一覧 ({activeResponses.length}名)
        </h2>
        <ResponseList responses={threadResponses} />
      </div>
    </div>
  );
}
