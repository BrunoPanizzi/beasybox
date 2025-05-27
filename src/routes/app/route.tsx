import {
  createFileRoute,
  Link,
  Outlet,
  useRouter,
} from "@tanstack/react-router"
import {
  Edit2Icon,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import type React from "react"
import { createContext, useContext, useState } from "react"
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
import { SidebarProvider, useSidebar } from "~/context/sidebarContext"

export const Route = createFileRoute("/app")({
  component: () => <RouteComponent />,
  loader: () => getConversations(),
})

function RouteComponent() {
  return (
    <SidebarProvider>
      <div className="grid h-screen max-h-screen grid-cols-[auto_auto_1fr] ">
        <div className="relative min-h-full">
          <SideBar />
        </div>
        <div className="h-full w-0 " />
        <Outlet />
      </div>
    </SidebarProvider>
  )
}

function SideBar() {
  const router = useRouter()
  const conversations = Route.useLoaderData()
  const { collapsed, setCollapsed } = useSidebar()

  if (collapsed) return

  return (
    <aside className="group absolute top-0 bottom-0 left-0 z-10 h-full w-72 border-zinc-700 border-r-2 bg-zinc-900 shadow-[0_0_0_100vw_rgba(0,0,0,0.5)] md:relative md:shadow-none">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="-translate-x-full -translate-y-1/2 -z-30 absolute top-1/2 left-[calc(100%+2px)] bg-zinc-800/50 p-3 transition-all hover:bg-emerald-800/50 group-hover:z-10 group-hover:translate-x-0"
        aria-label="Collapse sidebar"
      >
        <ChevronLeft />
      </button>

      <div className="h-14 border-zinc-700 border-b-2">
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
          className="h-full min-w-full bg-zinc-800/50 px-6 py-2 font-semibold text-zinc-200 transition-colors hover:bg-emerald-500/50 hover:text-emerald-100"
        >
          New chat
        </button>
      </div>

      <div className={collapsed ? "flex flex-col items-center pt-4" : "pt-4"}>
        {conversations.map((conv) => (
          <Link
            key={conv.id}
            params={{ conversationId: conv.id }}
            to="/app/$conversationId"
            className={
              collapsed
                ? "group my-1 flex h-12 w-12 items-center justify-center rounded border-transparent border-y-2 text-zinc-200 transition-colors hover:bg-zinc-700/50"
                : "group flex items-center justify-between border-transparent border-y-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-700/50"
            }
            activeProps={{
              className:
                "bg-emerald-700/25 data-[status=active]:border-emerald-200/25 data-[status=active]:hover:bg-emerald-700/40 text-zinc-100 font-semibold",
            }}
            title={conv.title}
          >
            {collapsed ? (
              <span className="truncate text-xs">
                {conv.title.slice(0, 2).toUpperCase()}
              </span>
            ) : (
              <span className="truncate p-2 pl-6">{conv.title}</span>
            )}

            {!collapsed && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="p-3 opacity-0 transition-all hover:bg-zinc-700/50 group-hover:opacity-100 data-[state='open']:bg-zinc-700/50 data-[state='open']:opacity-100"
                    tabIndex={-1}
                    aria-label="Conversation actions"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                    }}
                  >
                    <MoreVertical size={18} className="text-zinc-400" />
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
                    <Edit2Icon size={16} className="text-zinc-400" />
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
            )}
          </Link>
        ))}
      </div>
    </aside>
  )
}
