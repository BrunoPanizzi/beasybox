import { pgTable, text, uuid, timestamp, pgEnum } from "drizzle-orm/pg-core"

export const conversations = pgTable("conversations", {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  createdAt: timestamp({ mode: "date" }).notNull().defaultNow(),
})

export const senderType = pgEnum("sender_type", ["user", "assistant"])

export const messages = pgTable("messages", {
  id: uuid().primaryKey().defaultRandom(),
  conversationId: uuid().notNull(),
  text: text().notNull(),
  sender: senderType().notNull(),
  timestamp: timestamp({ mode: "date" }).notNull().defaultNow(),
})
