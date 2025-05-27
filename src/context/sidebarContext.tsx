import { createContext, useContext, useState } from "react"

// Sidebar context
type SidebarContextType = {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}
const SidebarContext = createContext<SidebarContextType | null>(null)

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider")
  return ctx
}

export const SidebarProvider = ({
  children,
}: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}
