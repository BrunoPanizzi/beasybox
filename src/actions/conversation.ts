import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import ConversationService from "~/services/ConversationService"

export const getConversations = createServerFn({
  method: "GET",
}).handler(async () => {
  const conversations = await ConversationService.listConversations()
  return conversations
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
