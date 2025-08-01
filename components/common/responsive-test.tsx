"use client"

/**
 * Component to test responsive behavior and tactical styling
 * This is a development utility to verify the implementation
 */

import { useState } from 'react'
import { Monitor, Users, Target, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ResponsiveTest() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeSection, setActiveSection] = useState("overview")

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-4 border-b border-neutral-700">
        <h1 className="text-xl font-bold text-orange-500 tracking-wider">TACTICAL RESPONSIVE TEST</h1>
        <p className="text-sm text-neutral-400">Testing sidebar functionality and mobile responsiveness</p>
      </div>

      <div className="flex">
        {/* Test Sidebar */}
        <div
          className={`${sidebarCollapsed ? "w-16" : "w-70"} bg-neutral-900 border-r border-neutral-700 transition-all duration-300 h-screen`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-8">
              <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
                <h1 className="text-orange-500 font-bold text-lg tracking-wider">INFRASTRUCTURE</h1>
                <p className="text-neutral-500 text-xs">Source of Truth</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-neutral-400 hover:text-orange-500"
              >
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`}
                />
              </Button>
            </div>

            <nav className="space-y-2">
              {[
                { id: "overview", icon: Monitor, label: "COMMAND" },
                { id: "groups", icon: Users, label: "GROUPS" },
                { id: "services", icon: Target, label: "SERVICES" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${
                    activeSection === item.id
                      ? "bg-orange-500 text-white"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              ))}
            </nav>

            {!sidebarCollapsed && (
              <div className="mt-12 p-4 bg-neutral-800 border border-neutral-700 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-white">SYSTEM ONLINE</span>
                </div>
                <div className="text-xs text-neutral-500">
                  <div>UPTIME: 72:14:33</div>
                  <div>GROUPS: 847 ACTIVE</div>
                  <div>SERVICES: 23 ONGOING</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Test Content */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white tracking-wider mb-2">
              TACTICAL STYLING TEST
            </h2>
            <p className="text-neutral-400">
              Active Section: <span className="text-orange-500 font-mono">{activeSection.toUpperCase()}</span>
            </p>
            <p className="text-neutral-400">
              Sidebar State: <span className="text-orange-500 font-mono">{sidebarCollapsed ? 'COLLAPSED' : 'EXPANDED'}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-neutral-900 border border-neutral-700 p-4 rounded">
              <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">TACTICAL CARD</h3>
              <p className="text-white font-mono">192.168.1.100</p>
              <p className="text-neutral-400 text-xs">Status: <span className="text-orange-500">ACTIVE</span></p>
            </div>

            <div className="bg-neutral-900 border border-neutral-700 p-4 rounded">
              <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">NETWORK STATUS</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-sm">ONLINE</span>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-700 p-4 rounded">
              <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-2">SYSTEM METRICS</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-400">CPU:</span>
                  <span className="text-white font-mono">45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Memory:</span>
                  <span className="text-white font-mono">67%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-neutral-900 border border-neutral-700 rounded">
            <h3 className="text-sm font-medium text-neutral-300 tracking-wider mb-4">RESPONSIVE BREAKPOINTS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-2 bg-neutral-800 rounded">
                <div className="block sm:hidden text-orange-500">Mobile (&lt; 640px)</div>
                <div className="hidden sm:block md:hidden text-orange-500">Small (640px+)</div>
                <div className="hidden md:block lg:hidden text-orange-500">Medium (768px+)</div>
                <div className="hidden lg:block text-orange-500">Large (1024px+)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}