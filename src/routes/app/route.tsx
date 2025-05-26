import {
  createFileRoute,
  Link,
  Outlet,
  useRouter,
} from "@tanstack/react-router"

import { createConversation, getConversations } from "~/actions/conversation"
import { Button } from "~/components/ui/button"

export const Route = createFileRoute("/app")({
  component: RouteComponent,
  loader: () => getConversations(),
})

function RouteComponent() {
  return (
    <div className="grid h-screen max-h-screen grid-cols-[auto_auto_1fr] ">
      <SideBar />
      <div className="h-full w-0 border-stone-700 border-l-2" />
      <Outlet />
    </div>
  )
}

export function SideBar() {
  const router = useRouter()
  const conversations = Route.useLoaderData()

  return (
    <aside className="w-64 rounded-xl ">
      <div className="p-2">
        <Button
          type="button"
          onClick={() => {
            console.log("create new conversation")
            createConversation({ data: { title: "New Conversation" } })
            router.invalidate()
          }}
          size="lg"
          className="w-full"
        >
          New chat
        </Button>
      </div>

      <hr className="border-stone-700 border-t-2" />

      <div className="space-y-2 p-2">
        {conversations.map((conv) => (
          <Link
            params={{ conversationId: conv.id }}
            to="/app/$conversationId"
            key={conv.id}
            className="block px-6 py-2 text-stone-200 transition-colors hover:bg-stone-950/75"
          >
            {conv.title}
          </Link>
        ))}
      </div>
    </aside>
  )
}
