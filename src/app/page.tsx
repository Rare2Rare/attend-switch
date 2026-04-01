import { db } from "@/db";
import { threads, responses } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { ThreadCard } from "@/components/thread-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const threadRows = await db
    .select({
      thread: threads,
      attendingCount: sql<number>`count(case when ${responses.status} = 'attending' and ${responses.deletedAt} is null then 1 end)::int`,
      absentCount: sql<number>`count(case when ${responses.status} = 'absent' and ${responses.deletedAt} is null then 1 end)::int`,
      pendingCount: sql<number>`count(case when ${responses.status} = 'pending' and ${responses.deletedAt} is null then 1 end)::int`,
    })
    .from(threads)
    .leftJoin(responses, eq(threads.id, responses.threadId))
    .where(eq(threads.isPublic, true))
    .groupBy(threads.id)
    .orderBy(desc(threads.updatedAt));

  const threadList = threadRows.map((row) => ({
    ...row.thread,
    attendingCount: row.attendingCount ?? 0,
    absentCount: row.absentCount ?? 0,
    pendingCount: row.pendingCount ?? 0,
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">スレッド一覧</h1>
        <a
          href="/create"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          新規作成
        </a>
      </div>

      {threadList.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          <p>まだスレッドがありません</p>
          <a
            href="/create"
            className="mt-2 inline-block text-sm text-blue-600 hover:underline"
          >
            最初のスレッドを作成する
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {threadList.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </div>
      )}
    </div>
  );
}
