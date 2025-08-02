"use client"

import { LucideIcon } from "lucide-react"
import { SidebarHeader } from "./sidebar-header"
import { SidebarNavigation } from "./sidebar-navigation"
import { SystemStatusPanel } from "./system-status-panel"

interface NavigationSection {
  id: string
  icon: LucideIcon
  label: string
  href: string
}

interface SystemData {
  uptime?: string
  groups?: string
  services?: string
  status?: string
}

interface SidebarProps {
  title: string
  sections: NavigationSection[]
  activeSection: string
  collapsed: boolean
  onToggleCollapse: () => void
  showSystemStatus: boolean
  systemData: SystemData
}

export function Sidebar({
  title,
  sections,
  activeSection,
  collapsed,
  onToggleCollapse,
  showSystemStatus,
  systemData
}: SidebarProps) {
  return (
    <>
      {/* Sidebar */}
      <div
        className={`${collapsed ? "w-16" : "w-70"} bg-neutral-900 border-r border-neutral-700 transition-all duration-300 ease-in-out fixed md:relative z-50 md:z-auto h-full md:h-auto ${!collapsed ? "md:block" : ""}`}
      >
        <div className="flex flex-col h-full">
          <SidebarHeader
            title={title}
            collapsed={collapsed}
            onToggleCollapse={onToggleCollapse}
          />
          
          <SidebarNavigation
            sections={sections}
            activeSection={activeSection}
            collapsed={collapsed}
          />
          
          <SystemStatusPanel
            collapsed={collapsed}
            show={showSystemStatus}
            systemData={systemData}
          />
        </div>
      </div>

      {/* Mobile Overlay */}
      {!collapsed && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onToggleCollapse} />
      )}
    </>
  )
}