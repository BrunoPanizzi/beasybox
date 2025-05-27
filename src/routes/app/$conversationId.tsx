import { createFileRoute, useRouter } from "@tanstack/react-router"
import Markdown from "react-markdown"
import { useRef, useEffect } from "react"

import {
  getMessages,
  sendMessage,
  getAssistantResponse,
  getConversation,
} from "~/actions/conversation"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { cn } from "~/utils/cn"
import { useSidebar } from "~/context/sidebarContext"
import { ChevronRight } from "lucide-react"
import type { Message } from "~/services/ConversationService"

export const Route = createFileRoute("/app/$conversationId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { conversationId } = params

    const [conversation, messages] = await Promise.all([
      getConversation({ data: { id: conversationId } }),
      getMessages({ data: { conversationId } }),
    ])

    return { conversation, messages }
  },
})

function RouteComponent() {
  const { messages } = Route.useLoaderData()

  return (
    <main className="grid h-full min-w-0 max-w-[100vw] grid-cols-[1fr_auto_1fr] grid-rows-[auto_1fr_auto_auto] gap-x-4 overflow-y-scroll">
      <ChatHeader />
      <Chat messages={messages} />
      <hr className="col-span-full border-zinc-700 border-t-2" />
      <ChatInput />
    </main>
  )
}

function ChatHeader() {
  const { conversation } = Route.useLoaderData()
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <header className="relative col-span-full grid h-14 grid-cols-subgrid place-items-center border-zinc-700 border-b-2 bg-zinc-800/50">
      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute flex aspect-square h-full items-center justify-center place-self-start bg-zinc-800 transition-all hover:bg-emerald-800/50"
          aria-label="Expand sidebar"
        >
          <ChevronRight />
        </button>
      )}
      <span className="col-start-2 col-end-2">
        <h2 className="font-semibold text-lg text-zinc-300">
          {conversation.title}
        </h2>
      </span>
    </header>
  )
}

type ChatProps = {
  messages: Message[]
}

function Chat({ messages }: ChatProps) {
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  })

  return (
    <div
      ref={chatRef}
      className="col-span-full grid h-fit max-h-full grid-cols-subgrid overflow-y-scroll scroll-smooth pb-64"
    >
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  )
}

type ChatMessageProps = {
  message: Message
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === "user"
  return (
    <div
      className={cn(
        "col-span-full grid grid-cols-subgrid items-start overflow-clip",
        isUser ? "bg-emerald-500/5" : "bg-zinc-900 py-4",
      )}
    >
      <ChatMeta message={message} isUser={isUser} />
      <ChatBubble message={message} isUser={isUser} />
    </div>
  )
}

type ChatMetaProps = {
  message: Message
  isUser: boolean
}

function ChatMeta({ message, isUser }: ChatMetaProps) {
  return (
    <div
      className={cn(
        "sticky top-0 row-start-1 row-end-1 hidden flex-col justify-center whitespace-nowrap text-xs text-zinc-500 md:flex",
        isUser
          ? "col-start-3 col-end-4 items-start"
          : "col-start-1 col-end-2 items-end py-1",
      )}
    >
      <p>{isUser ? "You" : "Assistant"}</p>
      <p>{new Date(message.timestamp).toLocaleTimeString()}</p>
    </div>
  )
}

type ChatBubbleProps = {
  message: Message
  isUser: boolean
}

function ChatBubble({ message, isUser }: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "prose dark:prose-invert prose-zinc col-start-2 col-end-3 py-1",
        {
          "justify-self-end border-emerald-700 border-r-4 pr-2 text-end":
            isUser,
        },
      )}
    >
      <Markdown>{message.text}</Markdown>
    </div>
  )
}

function ChatInput() {
  const router = useRouter()
  const { conversationId } = Route.useParams()

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const text = formData.get("text") as string
        e.currentTarget.reset()

        const message = await sendMessage({ data: { text, conversationId } })
        router.invalidate()

        const aiMessage = await getAssistantResponse({
          data: { conversationId },
        })

        router.invalidate()
      }}
      className="col-start-2 col-end-3 flex w-full items-center gap-2 py-2"
    >
      <Input type="text" name="text" placeholder="Type your message..." />
      <Button type="submit">Send</Button>
    </form>
  )
}
