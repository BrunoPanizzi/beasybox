import { desc, eq } from "drizzle-orm"

import { db } from "../persistance"
import { conversations, messages } from "../persistance/schema"

export type Conversation = {
  id: string
  title: string
  createdAt: string
  updatedAt?: string
}

export type SenderType = "user" | "assistant"

export type Message = {
  id: string
  conversationId: string
  text: string
  sender: SenderType
  timestamp: string
}

class ConversationService {
  async listConversations(): Promise<Conversation[]> {
    const rows = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.createdAt))

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      createdAt: row.createdAt.toISOString(),
    }))
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const rows = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
    const row = rows[0]
    if (!row) return undefined
    return {
      id: row.id,
      title: row.title,
      createdAt: row.createdAt.toISOString(),
    }
  }

  async createConversation(title: string): Promise<Conversation> {
    const [row] = await db.insert(conversations).values({ title }).returning()
    return {
      id: row.id,
      title: row.title,
      createdAt: row.createdAt.toISOString(),
    }
  }

  async updateConversation(
    id: string,
    title: string,
  ): Promise<Conversation | undefined> {
    const [row] = await db
      .update(conversations)
      .set({ title })
      .where(eq(conversations.id, id))
      .returning()
    if (!row) return undefined
    return {
      id: row.id,
      title: row.title,
      createdAt: row.createdAt.toISOString(),
    }
  }

  async deleteConversation(id: string): Promise<boolean> {
    const rows = await db
      .delete(conversations)
      .where(eq(conversations.id, id))
      .returning()
    return rows.length > 0
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const rows = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
    return rows.map((row) => ({
      id: row.id,
      conversationId: row.conversationId,
      text: row.text,
      sender: row.sender as SenderType,
      timestamp: row.timestamp.toISOString(),
    }))
  }

  async addMessage(
    conversationId: string,
    text: string,
    sender: SenderType,
  ): Promise<Message> {
    const [row] = await db
      .insert(messages)
      .values({
        conversationId,
        text,
        sender,
      })
      .returning()

    return {
      id: row.id,
      conversationId: row.conversationId,
      text: row.text,
      sender: row.sender as SenderType,
      timestamp: row.timestamp.toISOString(),
    }
  }
}

export default new ConversationService()
