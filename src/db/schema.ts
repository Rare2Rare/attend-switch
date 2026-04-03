import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const responseStatusEnum = pgEnum("response_status", [
  "attending",
  "absent",
  "pending",
]);

export const threads = pgTable("threads", {
  id: uuid("id").defaultRandom().primaryKey(),
  publicId: varchar("public_id", { length: 16 }).notNull().unique(),
  manageToken: varchar("manage_token", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").notNull().default(true),
  resetTimeJst: varchar("reset_time_jst", { length: 5 }),
  deadlineAt: timestamp("deadline_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastResetAt: timestamp("last_reset_at", { withTimezone: true }),
});

export const responses = pgTable(
  "responses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    threadId: uuid("thread_id")
      .notNull()
      .references(() => threads.id, { onDelete: "cascade" }),
    participantToken: varchar("participant_token", { length: 64 }).notNull(),
    displayName: varchar("display_name", { length: 50 }).notNull(),
    status: responseStatusEnum("status").notNull().default("pending"),
    comment: varchar("comment", { length: 200 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("uq_thread_participant_active")
      .on(table.threadId, table.participantToken)
      .where(sql`${table.deletedAt} IS NULL`),
  ]
);

export type Thread = typeof threads.$inferSelect;
export type NewThread = typeof threads.$inferInsert;
export type Response = typeof responses.$inferSelect;
export type NewResponse = typeof responses.$inferInsert;
export type ResponseStatus = "attending" | "absent" | "pending";
