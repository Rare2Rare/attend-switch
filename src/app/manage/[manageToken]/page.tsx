import { db } from "@/db";
import { threads, responses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EditThreadForm } from "@/components/thread-form";
import { ResponseList, ResponseSummary } from "@/components/response-list";
import { CopyUrlButton } from "@/components/copy-url-button";
import { ManageActions } from "@/components/manage-actions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ManagePage({
  params,
}: {
  params: Promise<{ manageToken: string }>;
}) {
  const { manageToken } = await params;

  const thread = await db.query.threads.findFirst({
    where: eq(threads.manageToken, manageToken),
  });

  if (!thread) {
    notFound();
  }

  const threadResponses = await db
    .select()
    .from(responses)
    .where(eq(responses.threadId, thread.id));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">管理ページ</h1>
        <p className="mt-1 text-sm text-gray-500">
          「{thread.title}」の管理
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700">URL</h2>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            公開URL（参加者に共有）
          </label>
          <CopyUrlButton
            url={`${appUrl}/thread/${thread.publicId}`}
            label="コピー"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            管理URL（あなた専用）
          </label>
          <CopyUrlButton
            url={`${appUrl}/manage/${manageToken}`}
            label="コピー"
          />
          <p className="mt-1 text-xs text-red-500">
            ※ このURLを知っている人だけが管理操作できます
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">集計</h2>
        <ResponseSummary responses={threadResponses} />
      </div>

      <ManageActions
        manageToken={manageToken}
        responses={threadResponses}
      />

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">
          参加者一覧
        </h2>
        <ResponseList responses={threadResponses} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">
          スレッド編集
        </h2>
        <EditThreadForm thread={thread} manageToken={manageToken} />
      </div>
    </div>
  );
}
