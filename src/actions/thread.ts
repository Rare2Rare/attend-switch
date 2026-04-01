"use server";

import { db } from "@/db";
import { threads, responses } from "@/db/schema";
import { generatePublicId, generateManageToken } from "@/lib/id";
import { createThreadSchema, updateThreadSchema } from "@/lib/validators";
import { eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createThread(formData: FormData) {
  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    resetTimeJst: formData.get("resetTimeJst") as string,
    deadlineAt: formData.get("deadlineAt") as string,
  };

  const parsed = createThreadSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const { title, description, resetTimeJst, deadlineAt } = parsed.data;

  const publicId = generatePublicId();
  const manageToken = generateManageToken();

  await db.insert(threads).values({
    publicId,
    manageToken,
    title: title.trim(),
    description: description?.trim() || null,
    resetTimeJst: resetTimeJst || null,
    deadlineAt: deadlineAt ? new Date(deadlineAt) : null,
  });

  revalidatePath("/");

  return { success: true as const, publicId, manageToken };
}

export async function updateThread(manageToken: string, formData: FormData) {
  const thread = await db.query.threads.findFirst({
    where: eq(threads.manageToken, manageToken),
  });

  if (!thread) {
    return { success: false as const, error: "スレッドが見つかりません" };
  }

  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    resetTimeJst: formData.get("resetTimeJst") as string,
    deadlineAt: formData.get("deadlineAt") as string,
  };

  const parsed = updateThreadSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const { title, description, resetTimeJst, deadlineAt } = parsed.data;

  await db
    .update(threads)
    .set({
      title: title.trim(),
      description: description?.trim() || null,
      resetTimeJst: resetTimeJst || null,
      deadlineAt: deadlineAt ? new Date(deadlineAt) : null,
      updatedAt: new Date(),
    })
    .where(eq(threads.id, thread.id));

  revalidatePath(`/thread/${thread.publicId}`);
  revalidatePath(`/manage/${manageToken}`);
  revalidatePath("/");

  return { success: true as const };
}

export async function resetThread(manageToken: string) {
  const thread = await db.query.threads.findFirst({
    where: eq(threads.manageToken, manageToken),
  });

  if (!thread) {
    return { success: false as const, error: "スレッドが見つかりません" };
  }

  const now = new Date();

  // Soft delete all active responses
  const result = await db
    .update(responses)
    .set({ deletedAt: now })
    .where(eq(responses.threadId, thread.id));

  await db
    .update(threads)
    .set({ lastResetAt: now, updatedAt: now })
    .where(eq(threads.id, thread.id));

  revalidatePath(`/thread/${thread.publicId}`);
  revalidatePath(`/manage/${manageToken}`);
  revalidatePath("/");

  return { success: true as const };
}

export async function deleteResponseByAdmin(
  manageToken: string,
  responseId: string
) {
  const thread = await db.query.threads.findFirst({
    where: eq(threads.manageToken, manageToken),
  });

  if (!thread) {
    return { success: false as const, error: "スレッドが見つかりません" };
  }

  await db
    .update(responses)
    .set({ deletedAt: new Date() })
    .where(eq(responses.id, responseId));

  revalidatePath(`/thread/${thread.publicId}`);
  revalidatePath(`/manage/${manageToken}`);
  revalidatePath("/");

  return { success: true as const };
}
