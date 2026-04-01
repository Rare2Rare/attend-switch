import { z } from "zod/v4";

export const createThreadSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(100, "タイトルは100文字以内です"),
  description: z
    .string()
    .max(2000, "説明は2000文字以内です")
    .optional()
    .or(z.literal("")),
  resetTimeJst: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "HH:MM形式で入力してください")
    .optional()
    .or(z.literal("")),
  deadlineAt: z.string().optional().or(z.literal("")),
});

export const updateThreadSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(100, "タイトルは100文字以内です"),
  description: z
    .string()
    .max(2000, "説明は2000文字以内です")
    .optional()
    .or(z.literal("")),
  resetTimeJst: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "HH:MM形式で入力してください")
    .optional()
    .or(z.literal("")),
  deadlineAt: z.string().optional().or(z.literal("")),
});

export const submitResponseSchema = z.object({
  threadPublicId: z.string().min(1),
  participantToken: z.string().min(1),
  displayName: z
    .string()
    .min(1, "名前を入力してください")
    .max(50, "名前は50文字以内です"),
  status: z.enum(["attending", "absent", "pending"]),
});
