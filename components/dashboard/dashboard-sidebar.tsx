"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Globe, MessageSquare, User, Settings, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { useMobile } from "@/hooks/use-mobile"

export function DashboardSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const isMobile = useMobile()

  if (isMobile) {
    return null
  }

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/explore",
      label: "Explore",
      icon: Globe,
      active: pathname === "/dashboard/explore",
    },
    {
      href: "/dashboard/messages",
      label: "Messages",
      icon: MessageSquare,
      active: pathname === "/dashboard/messages",
    },
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: User,
      active: pathname === "/dashboard/profile",
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      active: pathname === "/dashboard/settings",
    },
  ]

  return (
    <aside className={`border-r bg-background transition-all ${collapsed ? "w-[70px]" : "w-[240px]"}`}>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto py-6">
          <nav className="grid gap-2 px-2">
            {routes.map((route) => (
              <Link key={route.href} href={route.href}>
                <Button
                  variant={route.active ? "secondary" : "ghost"}
                  className={`w-full ${collapsed ? "justify-center" : "justify-start"} gap-2`}
                >
                  <route.icon className="h-5 w-5" />
                  {!collapsed && <span>{route.label}</span>}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t p-2">
          <Button variant="ghost" className="w-full justify-center" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </aside>
  )
}
