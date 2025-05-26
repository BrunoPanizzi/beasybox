import {
  createFileRoute,
  Link,
  Outlet,
  useRouter,
} from "@tanstack/react-router"
import { Edit2Icon, Trash2 } from "lucide-react"

import {
  createConversation,
  deleteConversation,
  getConversations,
  updateConversationTitle,
} from "~/actions/conversation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"

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
    <aside className="w-72 rounded-xl ">
      <div className="">
        <button
          type="button"
          onClick={async () => {
            const { id } = await createConversation({
              data: { title: "New Conversation" },
            })
            router.navigate({
              to: "/app/$conversationId",
              params: { conversationId: id },
            })
            router.invalidate()
          }}
          className="w-full bg-stone-700/25 px-6 py-4 font-semibold text-stone-200 transition-colors hover:bg-stone-700/50"
        >
          New chat
        </button>
      </div>

      <hr className="border-stone-700 border-t-2" />

      <div className="pt-4">
        {conversations.map((conv) => (
          <Link
            key={conv.id}
            params={{ conversationId: conv.id }}
            to="/app/$conversationId"
            className="group flex items-center justify-between border-transparent border-y-2 text-sm text-stone-200 transition-colors hover:bg-stone-700/50"
            activeProps={{
              className:
                "bg-stone-700/25 data-[status=active]:border-stone-700 text-stone-100 font-semibold",
            }}
          >
            <span className="p-2 pl-6 ">{conv.title}</span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-3 opacity-0 transition-all hover:bg-stone-700/50 group-hover:opacity-100 data-[state='open']:bg-stone-700/50 data-[state='open']:opacity-100"
                  tabIndex={-1}
                  aria-label="Conversation actions"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                >
                  <MoreVertical size={18} className="text-stone-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={4}>
                <DropdownMenuItem
                  onClick={async (e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    await updateConversationTitle({
                      data: { id: conv.id },
                    })
                    router.invalidate()
                  }}
                >
                  <Edit2Icon size={16} className="text-stone-400" />
                  Rename
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={async (e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    await deleteConversation({
                      data: { conversationId: conv.id },
                    })
                    router.navigate({ to: "/app" })
                    router.invalidate()
                  }}
                  className="text-red-500 hover:bg-red-700/25"
                >
                  <Trash2 size={16} className="text-red-400" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Link>
        ))}
      </div>
    </aside>
  )
}
