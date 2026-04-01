"use client";

import { useEffect, useState, useTransition } from "react";
import { submitResponse, deleteResponse } from "@/actions/response";
import {
  getParticipantToken,
  getSavedDisplayName,
  saveDisplayName,
} from "@/lib/participant";
import { toast } from "sonner";
import type { ResponseStatus, Response } from "@/db/schema";
import { StatusBadge } from "./status-badge";

const STATUS_BUTTONS: {
  status: ResponseStatus;
  label: string;
  className: string;
  activeClassName: string;
}[] = [
  {
    status: "attending",
    label: "参加",
    className:
      "border-green-300 bg-green-50 text-green-800 hover:bg-green-100",
    activeClassName: "border-green-500 bg-green-500 text-white ring-2 ring-green-300",
  },
  {
    status: "absent",
    label: "不参加",
    className: "border-red-300 bg-red-50 text-red-800 hover:bg-red-100",
    activeClassName: "border-red-500 bg-red-500 text-white ring-2 ring-red-300",
  },
  {
    status: "pending",
    label: "保留",
    className:
      "border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100",
    activeClassName:
      "border-yellow-500 bg-yellow-500 text-white ring-2 ring-yellow-300",
  },
];

export function ResponsePanel({
  threadPublicId,
  existingResponses,
  isDeadlinePassed,
}: {
  threadPublicId: string;
  existingResponses: Response[];
  isDeadlinePassed: boolean;
}) {
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setToken(getParticipantToken());
    setName(getSavedDisplayName());
  }, []);

  const myResponse = existingResponses.find(
    (r) => r.participantToken === token && !r.deletedAt
  );

  const handleSubmit = (status: ResponseStatus) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("名前を入力してください");
      return;
    }
    saveDisplayName(trimmedName);

    startTransition(async () => {
      const result = await submitResponse({
        threadPublicId,
        participantToken: token,
        displayName: trimmedName,
        status,
      });
      if (result.success) {
        const label = STATUS_BUTTONS.find((b) => b.status === status)?.label;
        toast.success(`「${label}」で登録しました`);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteResponse({
        threadPublicId,
        participantToken: token,
      });
      if (result.success) {
        toast.success("取り消しました");
      } else {
        toast.error(result.error);
      }
    });
  };

  if (isDeadlinePassed) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-sm font-medium text-gray-600">
          このスレッドは締切済みです
        </p>
        {myResponse && (
          <p className="mt-2 text-sm text-gray-500">
            あなたの状態: <StatusBadge status={myResponse.status} />
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      {myResponse && (
        <div className="flex items-center justify-between rounded-md bg-blue-50 px-3 py-2">
          <span className="text-sm text-blue-800">
            現在の状態: <StatusBadge status={myResponse.status} />
          </span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            取り消す
          </button>
        </div>
      )}

      <div>
        <label
          htmlFor="displayName"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          名前 <span className="text-red-500">*</span>
        </label>
        <input
          id="displayName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          placeholder="名前を入力"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {STATUS_BUTTONS.map((btn) => {
          const isActive = myResponse?.status === btn.status;
          return (
            <button
              key={btn.status}
              type="button"
              onClick={() => handleSubmit(btn.status)}
              disabled={isPending}
              className={`rounded-lg border-2 px-4 py-4 text-lg font-bold transition disabled:opacity-50 ${
                isActive ? btn.activeClassName : btn.className
              }`}
            >
              {btn.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
