import { db } from "@/db";
import { threads, responses } from "@/db/schema";
import { eq, isNull, isNotNull, and, lt, or } from "drizzle-orm";
import { getNowJST, getJSTDateStr } from "@/lib/date";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expectedToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { hours, minutes, dateStr } = getNowJST();
  const currentTimeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  // Find threads with reset_time_jst <= current time AND last_reset_at before today
  const todayStart = new Date(`${dateStr}T00:00:00+09:00`);

  const targetsResult = await db
    .select()
    .from(threads)
    .where(
      and(
        isNotNull(threads.resetTimeJst),
        or(
          isNull(threads.lastResetAt),
          lt(threads.lastResetAt, todayStart)
        )
      )
    );

  // Filter by reset time (only reset if current time >= reset time)
  const targets = targetsResult.filter((t) => {
    if (!t.resetTimeJst) return false;
    return t.resetTimeJst <= currentTimeStr;
  });

  const now = new Date();
  let resetCount = 0;

  for (const thread of targets) {
    await db
      .update(responses)
      .set({ deletedAt: now })
      .where(
        and(eq(responses.threadId, thread.id), isNull(responses.deletedAt))
      );

    await db
      .update(threads)
      .set({ lastResetAt: now, updatedAt: now })
      .where(eq(threads.id, thread.id));

    resetCount++;
  }

  return Response.json({
    ok: true,
    currentTimeJST: currentTimeStr,
    dateJST: dateStr,
    threadsChecked: targetsResult.length,
    threadsReset: resetCount,
  });
}
