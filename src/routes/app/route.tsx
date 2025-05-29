import {
  createFileRoute,
  Link,
  Outlet,
  useRouter,
} from "@tanstack/react-router"
import { Edit2Icon, Trash2, MoreVertical, ChevronLeft } from "lucide-react"

import {
  createConversation,
  deleteConversation,
  getConversations,
  updateConversationTitle,
} from "~/actions/conversation"

import type { Conversation } from "~/services/ConversationService"

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
      <div className="grid h-screen max-h-screen grid-cols-[auto_1fr] ">
        <div className="min-h-full">
          <SideBar />
        </div>
        <Outlet />
      </div>
    </SidebarProvider>
  )
}

function SideBar() {
  const conversations = Route.useLoaderData()
  const { collapsed } = useSidebar()

  if (collapsed) return

  return (
    <aside className="absolute top-0 bottom-0 left-0 z-10 h-full w-72 border-zinc-700 border-r-2 bg-zinc-900 shadow-[0_0_0_100vw_rgba(0,0,0,0.5)] md:relative md:shadow-none">
      <CloseSidebarButton />
      <NewChatButton />
      <ConversationList />
    </aside>
  )
}

function CloseSidebarButton() {
  const { setCollapsed } = useSidebar()
  return (
    <button
      type="button"
      onClick={() => setCollapsed(true)}
      className="-translate-y-1/2 absolute top-1/2 left-[calc(100%+2px)] bg-zinc-800 p-3 backdrop-blur-md transition-all hover:bg-emerald-800/50"
      aria-label="Fechar barra lateral"
    >
      <ChevronLeft />
    </button>
  )
}

function NewChatButton() {
  const router = useRouter()

  return (
    <div className="h-12 border-zinc-700 border-b-2 md:h-14">
      <button
        type="button"
        onClick={async () => {
          const { id } = await createConversation({
            data: { title: "Nova conversa" },
          })

          router.navigate({
            to: "/app/$conversationId",
            params: { conversationId: id },
          })

          router.invalidate()
        }}
        className="h-full min-w-full bg-zinc-800/50 px-6 py-2 font-semibold text-zinc-200 transition-colors hover:bg-emerald-500/50 hover:text-emerald-100"
      >
        Nova conversa
      </button>
    </div>
  )
}

function ConversationList() {
  const conversations = Route.useLoaderData()
  const { collapsed } = useSidebar()

  return (
    <div className={collapsed ? "flex flex-col items-center pt-4" : "pt-4"}>
      {conversations.map((conv) => (
        <ConversationItem key={conv.id} conversation={conv} />
      ))}
    </div>
  )
}

type ConversationItemProps = {
  conversation: Conversation
}

function ConversationItem({ conversation }: ConversationItemProps) {
  const router = useRouter()

  return (
    <Link
      params={{ conversationId: conversation.id }}
      to="/app/$conversationId"
      className="group flex items-center justify-between border-transparent border-y-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-700/50"
      activeProps={{
        className:
          "bg-emerald-700/25 data-[status=active]:border-emerald-200/25 data-[status=active]:hover:bg-emerald-700/40 text-zinc-100 font-semibold",
      }}
      title={conversation.title}
    >
      <span className="truncate p-2 pl-6">{conversation.title}</span>

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
                data: { id: conversation.id },
              })
              router.invalidate()
            }}
          >
            <Edit2Icon size={16} className="text-zinc-400" />
            Atualizar nome
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={async (e) => {
              e.stopPropagation()
              e.preventDefault()

              await deleteConversation({
                data: { conversationId: conversation.id },
              })

              router.navigate({ to: "/app" })
              router.invalidate()
            }}
            className="text-red-500 hover:bg-red-700/25"
          >
            <Trash2 size={16} className="text-red-400" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Link>
  )
}
