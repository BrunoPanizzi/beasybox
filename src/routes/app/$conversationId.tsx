import { createFileRoute, useRouter } from "@tanstack/react-router"

import { getMessages, sendMessage } from "~/actions/conversation"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"

export const Route = createFileRoute("/app/$conversationId")({
  component: RouteComponent,
  loader: ({ params }) =>
    getMessages({ data: { conversationId: params.conversationId } }),
})

function RouteComponent() {
  const { conversationId } = Route.useParams()

  const messages = Route.useLoaderData()

  console.log(messages)

  return (
    <main className="grid h-full min-w-full grid-rows-[1fr_auto_auto] overflow-y-scroll rounded-xl">
      <Chat messages={messages} />
      <hr className="border-stone-700 border-t-2" />
      <ChatInput />
    </main>
  )
}
type Message = {
  id: string
  text: string
  sender: "user" | "assistant"
  timestamp: string
}

type ChatProps = {
  messages: Message[]
}

function Chat({ messages }: ChatProps) {
  return (
    <main className="max-h-full overflow-y-scroll p-4">
      {messages.map((message) => (
        <div key={message.id} className="mb-2">
          {message.sender === "user" ? (
            <UserMessage message={message} />
          ) : (
            <AssistantMessage message={message} />
          )}
        </div>
      ))}
    </main>
  )
}

type AssistantMessageProps = {
  message: Message
}

function AssistantMessage({ message }: AssistantMessageProps) {
  return (
    <div className="flex justify-start">
      <div className="w-fit rounded-md bg-stone-800 px-3 py-1">
        <p>{message.text}</p>
      </div>
    </div>
  )
}

type UserMessageProps = {
  message: Message
}
function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="w-fit rounded-md bg-blue-900 px-3 py-1">
        <p>{message.text}</p>
      </div>
    </div>
  )
}

function ChatInput() {
  const router = useRouter()
  const { conversationId } = Route.useParams()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const text = formData.get("text") as string

        sendMessage({ data: { text, conversationId } })
        router.invalidate()
        e.currentTarget.reset()
      }}
      className="flex w-full items-center gap-2 p-2"
    >
      <Input type="text" name="text" placeholder="Type your message..." />
      <Button type="submit">Send</Button>
    </form>
  )
}
