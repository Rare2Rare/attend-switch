"use server";

import { db } from "@/db";
import { threads, responses } from "@/db/schema";
import { submitResponseSchema } from "@/lib/validators";
import { isDeadlinePassed } from "@/lib/date";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitResponse(data: {
  threadPublicId: string;
  participantToken: string;
  displayName: string;
  status: "attending" | "absent" | "pending";
  comment?: string;
  passphrase?: string;
}) {
  const parsed = submitResponseSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const { threadPublicId, participantToken, displayName, status } = parsed.data;
  const comment = data.comment?.slice(0, 200) || null;
  const passphrase = data.passphrase?.replace(/\D/g, "").slice(0, 4) || null;

  const thread = await db.query.threads.findFirst({
    where: eq(threads.publicId, threadPublicId),
  });

  if (!thread) {
    return { success: false as const, error: "スレッドが見つかりません" };
  }

  if (isDeadlinePassed(thread.deadlineAt)) {
    return { success: false as const, error: "このスレッドは締切済みです" };
  }

  // Upsert: find existing active response for this participant
  const existing = await db
    .select()
    .from(responses)
    .where(
      and(
        eq(responses.threadId, thread.id),
        eq(responses.participantToken, participantToken),
        isNull(responses.deletedAt)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(responses)
      .set({
        status,
        displayName: displayName.trim(),
        comment,
        ...(passphrase ? { passphrase } : {}),
        updatedAt: new Date(),
      })
      .where(eq(responses.id, existing[0].id));
  } else {
    await db.insert(responses).values({
      threadId: thread.id,
      participantToken,
      displayName: displayName.trim(),
      status,
      comment,
      passphrase,
    });
  }

  await db
    .update(threads)
    .set({ updatedAt: new Date() })
    .where(eq(threads.id, thread.id));

  revalidatePath(`/thread/${threadPublicId}`);
  revalidatePath("/");

  return { success: true as const };
}

export async function deleteResponse(data: {
  threadPublicId: string;
  participantToken: string;
}) {
  const thread = await db.query.threads.findFirst({
    where: eq(threads.publicId, data.threadPublicId),
  });

  if (!thread) {
    return { success: false as const, error: "スレッドが見つかりません" };
  }

  if (isDeadlinePassed(thread.deadlineAt)) {
    return { success: false as const, error: "このスレッドは締切済みです" };
  }

  const existing = await db
    .select()
    .from(responses)
    .where(
      and(
        eq(responses.threadId, thread.id),
        eq(responses.participantToken, data.participantToken),
        isNull(responses.deletedAt)
      )
    )
    .limit(1);

  if (existing.length === 0) {
    return { success: false as const, error: "参加データが見つかりません" };
  }

  await db
    .update(responses)
    .set({ deletedAt: new Date() })
    .where(eq(responses.id, existing[0].id));

  revalidatePath(`/thread/${data.threadPublicId}`);
  revalidatePath("/");

  return { success: true as const };
}

export async function claimResponse(data: {
  threadPublicId: string;
  displayName: string;
  passphrase: string;
}) {
  const thread = await db.query.threads.findFirst({
    where: eq(threads.publicId, data.threadPublicId),
  });

  if (!thread) {
    return { success: false as const, error: "スレッドが見つかりません" };
  }

  const trimmedName = data.displayName.trim();
  const passphrase = data.passphrase.replace(/\D/g, "").slice(0, 4);

  if (!trimmedName || passphrase.length !== 4) {
    return { success: false as const, error: "名前と4桁の合言葉を入力してください" };
  }

  const existing = await db
    .select()
    .from(responses)
    .where(
      and(
        eq(responses.threadId, thread.id),
        eq(responses.displayName, trimmedName),
        eq(responses.passphrase, passphrase),
        isNull(responses.deletedAt)
      )
    )
    .limit(1);

  if (existing.length === 0) {
    return { success: false as const, error: "名前または合言葉が一致しません" };
  }

  return {
    success: true as const,
    participantToken: existing[0].participantToken,
  };
}
