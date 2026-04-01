"use client";

import { useActionState, useState } from "react";
import { createThread, updateThread } from "@/actions/thread";
import { CopyUrlButton } from "./copy-url-button";
import type { Thread } from "@/db/schema";

type CreateResult =
  | { success: true; publicId: string; manageToken: string }
  | { success: false; error: string }
  | null;

type UpdateResult =
  | { success: true }
  | { success: false; error: string }
  | null;

export function CreateThreadForm() {
  const [result, formAction, isPending] = useActionState<CreateResult, FormData>(
    async (_prev, formData) => {
      return await createThread(formData);
    },
    null
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  if (result?.success) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h2 className="mb-4 text-lg font-bold text-green-800">
            スレッドを作成しました
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                公開URL（参加者に共有）
              </label>
              <CopyUrlButton
                url={`${appUrl}/thread/${result.publicId}`}
                label="コピー"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                管理URL（あなた専用）
              </label>
              <CopyUrlButton
                url={`${appUrl}/manage/${result.manageToken}`}
                label="コピー"
              />
              <p className="mt-1 text-xs text-red-600">
                ※ このURLを知っている人だけが編集・リセットできます。安全に保管してください。
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <a
              href={`/thread/${result.publicId}`}
              className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              スレッドを見る
            </a>
            <a
              href="/"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              一覧に戻る
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {result && !result.success && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {result.error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={100}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          placeholder="例: 4/5 フットサル参加確認"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
          説明
        </label>
        <textarea
          id="description"
          name="description"
          maxLength={2000}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          placeholder="例: 集合場所: ○○体育館 19:00〜"
        />
      </div>

      <div>
        <label htmlFor="resetTimeJst" className="mb-1 block text-sm font-medium text-gray-700">
          毎日自動リセット時刻（JST）
        </label>
        <input
          id="resetTimeJst"
          name="resetTimeJst"
          type="time"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-500">
          設定すると、毎日この時刻に参加状態がリセットされます
        </p>
      </div>

      <div>
        <label htmlFor="deadlineAt" className="mb-1 block text-sm font-medium text-gray-700">
          締切日時
        </label>
        <input
          id="deadlineAt"
          name="deadlineAt"
          type="datetime-local"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-500">
          締切後は参加状態の変更ができなくなります
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "作成中..." : "スレッドを作成"}
      </button>
    </form>
  );
}

export function EditThreadForm({
  thread,
  manageToken,
}: {
  thread: Thread;
  manageToken: string;
}) {
  const [result, formAction, isPending] = useActionState<UpdateResult, FormData>(
    async (_prev, formData) => {
      return await updateThread(manageToken, formData);
    },
    null
  );

  const deadlineValue = thread.deadlineAt
    ? new Date(thread.deadlineAt.getTime() + 9 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16)
    : "";

  return (
    <form action={formAction} className="space-y-5">
      {result && !result.success && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {result.error}
        </div>
      )}
      {result?.success && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          更新しました
        </div>
      )}

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={100}
          defaultValue={thread.title}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
          説明
        </label>
        <textarea
          id="description"
          name="description"
          maxLength={2000}
          rows={3}
          defaultValue={thread.description ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="resetTimeJst" className="mb-1 block text-sm font-medium text-gray-700">
          毎日自動リセット時刻（JST）
        </label>
        <input
          id="resetTimeJst"
          name="resetTimeJst"
          type="time"
          defaultValue={thread.resetTimeJst ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="deadlineAt" className="mb-1 block text-sm font-medium text-gray-700">
          締切日時
        </label>
        <input
          id="deadlineAt"
          name="deadlineAt"
          type="datetime-local"
          defaultValue={deadlineValue}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "更新中..." : "スレッドを更新"}
      </button>
    </form>
  );
}
