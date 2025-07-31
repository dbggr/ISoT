"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import {
  LayoutDashboard,
  Server,
  Users,
  Settings,
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
} from "@/components/ui/sidebar"
import { KEYBOARD_KEYS, ARIA_STATES } from "@/lib/accessibility"

// Menu items for navigation
const items = [
  {
    title: "Dashboard",
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
    >
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div 
            className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
            role="img"
            aria-label="Network Source of Truth logo"
          >
            <Settings className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Network SoT</span>
            <span className="truncate text-xs">Infrastructure Management</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu 
              ref={navigationRef}
              onKeyDown={handleKeyDown}
              role="menubar"
              aria-label="Main navigation menu"
            >
              {items.map((item, index) => (
                <SidebarMenuItem key={item.title} role="none">
                  <SidebarMenuButton 
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className="keyboard-focus touch-target"
                  >
                    <Link 
                      href={item.url}
                      role="menuitem"
                      aria-current={pathname === item.url ? 'page' : undefined}
                      aria-label={`${item.title} ${pathname === item.url ? '(current page)' : ''}`}
                      tabIndex={index === 0 ? 0 : -1}
                    >
                      <item.icon aria-hidden="true" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div 
          className="p-2 text-xs text-muted-foreground"
          role="contentinfo"
          aria-label="Application version"
        >
          Network Source of Truth v1.0
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}