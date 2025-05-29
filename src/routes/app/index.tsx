import { createFileRoute, redirect } from "@tanstack/react-router"
import { createConversation, getConversations } from "~/actions/conversation"

export const Route = createFileRoute("/app/")({
  component: () => null,
  loader: async () => {
    const conversations = await getConversations()

    let conversationId = conversations[0]?.id

    if (!conversationId) {
      const conversation = await createConversation({
        data: { title: "Nova conversa" },
      })
      conversationId = conversation.id
    }

    return redirect({
      to: "/app/$conversationId",
      params: { conversationId },
    })
  },
})
