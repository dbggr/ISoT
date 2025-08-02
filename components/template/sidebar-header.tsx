"use client"

import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarHeaderProps {
  title: string
  collapsed: boolean
  onToggleCollapse: () => void
}

export function SidebarHeader({ title, collapsed, onToggleCollapse }: SidebarHeaderProps) {
  return (
    <div className="p-4 border-b border-neutral-700">
      <div className="flex items-center justify-between mb-2">
        <div className={`${collapsed ? "hidden" : "block"} transition-opacity duration-300`}>
          <h1 className="text-orange-500 font-bold text-lg tracking-wider uppercase">{title}</h1>
          <p className="text-neutral-400 text-xs tracking-wide">Source of Truth</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="text-neutral-400 hover:text-orange-500 transition-colors duration-200"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`}
          />
        </Button>
      </div>
    </div>
  )
}