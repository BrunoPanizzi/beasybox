import { createFileRoute, useRouter } from "@tanstack/react-router"
import { ChevronRight } from "lucide-react"
import Markdown from "react-markdown"
import { useRef, useEffect } from "react"
import { format } from "date-fns"

import { cn } from "~/utils/cn"

import type { Message } from "~/services/ConversationService"
import {
  getMessages,
  sendMessage,
  getAssistantResponse,
  getConversation,
} from "~/actions/conversation"

import { useSidebar } from "~/context/sidebarContext"

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
      <ChatInput />
      <span className="col-span-full py-1 text-center text-xs">
        Feito com ❤️ por{" "}
        <a
          className="text-emerald-300 hover:underline"
          href="https://brunopanizzi.dev.br"
          target="_blank"
          rel="noopener noreferrer"
          title="Bruno Panizzi"
          aria-label="Bruno Panizzi"
        >
          Bruno Panizzi
        </a>
      </span>
    </main>
  )
}

function ChatHeader() {
  const { conversation } = Route.useLoaderData()
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <header className="relative col-span-full grid h-12 grid-cols-subgrid place-items-center border-zinc-700 border-b-2 bg-zinc-800/50 md:h-14">
      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute flex aspect-square h-full items-center justify-center place-self-start bg-zinc-800 transition-all hover:bg-emerald-800/50"
          aria-label="Expandir barra lateral"
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
      <p>{isUser ? "Você" : "Assistente"}</p>
      <p>{format(message.timestamp, "HH:mm")}</p>
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
        "prose dark:prose-invert prose-zinc col-start-2 col-end-3 break-words py-1",
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
    <div className="col-span-full grid grid-cols-subgrid border-zinc-700 border-y-2 ">
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
        className="col-start-2 col-end-3 flex w-full items-center gap-4"
      >
        <input
          className="w-full border-transparent border-x-2 bg-zinc-800 px-3 py-2 ring-2 ring-zinc-700 transition-all hover:ring-emerald-500/50 focus-visible:outline-none focus-visible:ring-emerald-500"
          type="text"
          name="text"
          placeholder="Digite sua mensagem..."
        />
        <button
          className="border-transparent border-x-2 bg-zinc-800 px-4 py-2 ring-2 ring-zinc-700 transition-all hover:bg-emerald-700/25 hover:ring-emerald-500/50 focus-visible:outline-none focus-visible:ring-emerald-500 "
          type="submit"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
