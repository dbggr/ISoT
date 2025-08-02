"use client"

import Link from "next/link"
import { LucideIcon } from "lucide-react"

interface NavigationSection {
  id: string
  icon: LucideIcon
  label: string
  href: string
  onClick?: () => void
}

interface SidebarNavigationProps {
  sections: NavigationSection[]
  activeSection: string
  collapsed: boolean
}

export function SidebarNavigation({ sections, activeSection, collapsed }: SidebarNavigationProps) {
  return (
    <div className="flex-1 p-4">
      <nav className="space-y-1">
        {sections.map((item) => {
          const commonClasses = `w-full flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-3 rounded-md transition-all duration-200 ${
            activeSection === item.id
              ? "bg-orange-500 text-white shadow-lg"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800"
          }`

          const content = (
            <>
              <item.icon className={`${collapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-200 ${
                activeSection === item.id ? "text-white" : "text-neutral-400"
              }`} />
              {!collapsed && (
                <span className="text-sm font-medium tracking-wider uppercase transition-opacity duration-300">
                  {item.label}
                </span>
              )}
            </>
          )

          // If onClick is provided, render as button (for state-based navigation)
          if (item.onClick) {
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={commonClasses}
                aria-current={activeSection === item.id ? "page" : undefined}
              >
                {content}
              </button>
            )
          }

          // Otherwise render as Link (for route-based navigation)
          return (
            <Link
              key={item.id}
              href={item.href}
              className={commonClasses}
              aria-current={activeSection === item.id ? "page" : undefined}
            >
              {content}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}