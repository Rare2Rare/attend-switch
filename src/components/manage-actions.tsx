"use client";

import { useTransition } from "react";
import { resetThread, deleteResponseByAdmin } from "@/actions/thread";
import { toast } from "sonner";
import { StatusBadge } from "./status-badge";
import { formatDateTimeJST } from "@/lib/date";
import type { Response } from "@/db/schema";

export function ManageActions({
  manageToken,
  responses,
}: {
  manageToken: string;
  responses: Response[];
}) {
  const [isPending, startTransition] = useTransition();

  const active = responses.filter((r) => !r.deletedAt);

  const handleReset = () => {
    if (!confirm("すべての参加データをリセットしますか？この操作は取り消せません。")) {
      return;
    }
    startTransition(async () => {
      const result = await resetThread(manageToken);
      if (result.success) {
        toast.success("リセットしました");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDeleteResponse = (responseId: string, name: string) => {
    if (!confirm(`${name}さんの参加データを削除しますか？`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteResponseByAdmin(manageToken, responseId);
      if (result.success) {
        toast.success("削除しました");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleExportCSV = () => {
    const header = "名前,状態,最終更新\n";
    const statusLabels: Record<string, string> = {
      attending: "参加",
      absent: "不参加",
      pending: "保留",
    };
    const rows = active
      .map(
        (r) =>
          `"${r.displayName}","${statusLabels[r.status] ?? r.status}","${formatDateTimeJST(r.updatedAt)}"`
      )
      .join("\n");

    const bom = "\uFEFF";
    const blob = new Blob([bom + header + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participants.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSVをダウンロードしました");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleReset}
          disabled={isPending || active.length === 0}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? "処理中..." : "全データリセット"}
        </button>
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={active.length === 0}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          CSV出力
        </button>
      </div>

      {active.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            個別削除
          </h2>
          <div className="divide-y divide-gray-100">
            {active.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-2 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{r.displayName}</span>
                  <StatusBadge status={r.status} />
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteResponse(r.id, r.displayName)}
                  disabled={isPending}
                  className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
