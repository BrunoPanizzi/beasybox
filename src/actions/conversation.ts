import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import OpenAI from "openai"

import { env } from "~/utils/env"

import ConversationService from "~/services/ConversationService"

const gemini = new OpenAI({
  apiKey: env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
})

export const getConversations = createServerFn({
  method: "GET",
}).handler(async () => {
  const conversations = await ConversationService.listConversations()
  return conversations
})

export const getConversation = createServerFn({
  method: "GET",
})
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { id } = data
    const conversation = await ConversationService.getConversation(id)

    if (!conversation) {
      throw new Error("Conversation not found")
    }

    return conversation
  })

const createConversationSchema = z.object({
  title: z.string().min(1, "Title cannot be empty"),
})

export const createConversation = createServerFn({
  method: "POST",
})
  .validator(createConversationSchema)
  .handler(async ({ data }) => {
    const { title } = data
    const conversation = await ConversationService.createConversation(title)
    return conversation
  })

export const getMessages = createServerFn({
  method: "GET",
})
  .validator(z.object({ conversationId: z.string() }))
  .handler(async ({ data }) => {
    const { conversationId } = data
    const messages = await ConversationService.getMessages(conversationId)
    return messages
  })

const sendMessageSchema = z.object({
  text: z.string().min(1, "Message cannot be empty"),
  conversationId: z.string(),
})

export const sendMessage = createServerFn({ method: "POST" })
  .validator(sendMessageSchema)
  .handler(async ({ data }) => {
    const { text, conversationId } = data
    const message = await ConversationService.addMessage(
      conversationId,
      text,
      "user",
    )

    return message
  })

export const getAssistantResponse = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      conversationId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const { conversationId } = data
    const messages = await ConversationService.getMessages(conversationId)

    if (messages.length === 0) {
      throw new Error("No messages found in the conversation")
    }

    const response = await gemini.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      })),
    })

    const assistantMessage = response.choices[0].message.content

    if (!assistantMessage) {
      throw new Error("No response from the assistant")
    }

    const message = await ConversationService.addMessage(
      conversationId,
      assistantMessage,
      "assistant",
    )

    return message
  })

export const deleteConversation = createServerFn({
  method: "POST",
})
  .validator(z.object({ conversationId: z.string() }))
  .handler(async ({ data }) => {
    const { conversationId } = data
    const success = await ConversationService.deleteConversation(conversationId)
    if (!success) {
      throw new Error("Failed to delete conversation")
    }
    return { success: true }
  })

export const updateConversationTitle = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      id: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const { id } = data

    // generate title with AI
    const messages = await ConversationService.getMessages(id)
    if (messages.length === 0) {
      throw new Error("No messages found in the conversation")
    }

    const content: string = `Gere um título curto de poucas palavras, para a seguinte conversa

    ${JSON.stringify(messages, null, 2)}`

    const response = await gemini.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "system",
          content: content,
        },
        { role: "user", content: "Diga apenas o título" },
      ],
      max_completion_tokens: 100,
    })

    console.dir(response, { depth: null })

    const title = response.choices[0].message.content

    if (!title) {
      throw new Error("Failed to generate conversation title")
    }

    const conversation = await ConversationService.updateConversation(id, title)
    if (!conversation) {
      throw new Error("Failed to update conversation title")
    }
    return conversation
  })
