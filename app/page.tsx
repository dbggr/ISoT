"use client"

import { useState, useMemo } from "react"
import { ChevronRight, Monitor, Target, Users, Bell, RefreshCw, Server, Network, Database, Shield, Activity, Plus, Globe, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import CommandPage from "./command/page"
import GroupsPage from "./groups/page"
import ServicesPage from "./services/page"
import { seoConfigs, SEOHead } from "@/components/common/seo-head"
import { useServices } from "@/lib/hooks/use-services"
import { useGroups } from "@/lib/hooks/use-groups"
import { NetworkService, Group } from "@/lib/types"
import Link from "next/link"

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("overview")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <>
      <SEOHead {...seoConfigs.dashboard} />

      <div className="flex h-screen">
        {/* Sidebar */}
        <div
          className={`${sidebarCollapsed ? "w-16" : "w-70"} bg-neutral-900 border-r border-neutral-700 transition-all duration-300 fixed md:relative z-50 md:z-auto h-full md:h-auto ${!sidebarCollapsed ? "md:block" : ""}`}
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
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`}
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
                  <item.icon className="w-5 h-5 md:w-5 md:h-5 sm:w-6 sm:h-6" />
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

        {/* Mobile Overlay */}
        {!sidebarCollapsed && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarCollapsed(true)} />
        )}

        {/* Main Content */}
        <div className={`flex-1 flex flex-col ${!sidebarCollapsed ? "md:ml-0" : ""}`}>
          {/* Top Toolbar */}
          <div className="h-16 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <div className="text-sm text-neutral-400">
                INFRASTRUCTURE / <span className="text-orange-500">
                  {activeSection === "overview" ? "COMMAND" : 
                   activeSection === "groups" ? "GROUPS" : 
                   activeSection === "services" ? "SERVICES" : "OVERVIEW"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs text-neutral-500">LAST UPDATE: 05/06/2025 20:00 UTC</div>
              <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-orange-500">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-orange-500">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="flex-1 overflow-auto">
            {activeSection === "overview" && <CommandPage />}
            {activeSection === "groups" && <GroupsPage />}
            {activeSection === "services" && <ServicesPage />}
          </div>
        </div>
      </div>
    </>
  )
}
