"use client"

import { TopNavbar } from "./top-navbar"

interface NavigationSection {
  id: string
  label: string
}

interface MainContentProps {
  title: string
  activeSection?: NavigationSection
  sidebarCollapsed: boolean
  breadcrumb?: string
  children: React.ReactNode
}

export function MainContent({ title, activeSection, sidebarCollapsed, breadcrumb, children }: MainContentProps) {
  return (
    <div className={`flex-1 flex flex-col ${!sidebarCollapsed ? "md:ml-0" : ""}`}>
      <TopNavbar
        title={title}
        activeSection={activeSection}
        sidebarCollapsed={sidebarCollapsed}
        breadcrumb={breadcrumb}
      />
      
      {/* Dashboard Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}