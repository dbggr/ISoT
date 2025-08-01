"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import {
  LayoutDashboard,
  Server,
  Users,
  Settings,
  Zap,
  Network,
  Shield,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar-old"
import { KEYBOARD_KEYS, ARIA_STATES } from "@/lib/accessibility"

// Menu items for navigation
const items = [
  {
    title: "Network Grid",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Services",
    url: "/services",
    icon: Server,
  },
  {
    title: "Groups",
    url: "/groups",
    icon: Users,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const navigationRef = useRef<HTMLUListElement>(null)

  // Handle keyboard navigation within sidebar
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!navigationRef.current) return

    const focusableElements = navigationRef.current.querySelectorAll(
      'a[href], button:not([disabled])'
    ) as NodeListOf<HTMLElement>

    const currentIndex = Array.from(focusableElements).findIndex(
      el => el === document.activeElement
    )

    switch (event.key) {
      case KEYBOARD_KEYS.ARROW_DOWN:
        event.preventDefault()
        const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0
        focusableElements[nextIndex]?.focus()
        break
      case KEYBOARD_KEYS.ARROW_UP:
        event.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1
        focusableElements[prevIndex]?.focus()
        break
      case KEYBOARD_KEYS.HOME:
        event.preventDefault()
        focusableElements[0]?.focus()
        break
      case KEYBOARD_KEYS.END:
        event.preventDefault()
        focusableElements[focusableElements.length - 1]?.focus()
        break
    }
  }

  return (
    <Sidebar 
      collapsible="icon" 
      {...props}
      role="navigation"
      aria-label="Main navigation"
      className="bg-gradient-to-b from-gray-900 to-black border-r border-gray-800"
    >
      <SidebarHeader className="border-b border-gray-800">
        <div className="flex items-center gap-2 px-2 py-1">
          <div 
            className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg"
            role="img"
            aria-label="Network Source of Truth logo"
          >
            <Zap className="size-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              ISoT
            </span>
            <span className="text-xs text-gray-400">Infrastructure</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 text-xs font-medium px-2 py-1">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu ref={navigationRef} onKeyDown={handleKeyDown}>
              {items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link 
                        href={item.url}
                        className={`group relative flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-all duration-200 ${
                          isActive 
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg' 
                            : 'text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className={`size-4 transition-colors duration-200 ${
                          isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'
                        }`} />
                        <span className="truncate">{item.title}</span>
                        {isActive && (
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-800">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex aspect-square size-6 items-center justify-center rounded bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm">
            <Shield className="size-3 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-200">System Status</span>
            <span className="text-xs text-green-400">Online</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}