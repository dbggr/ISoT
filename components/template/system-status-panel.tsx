"use client"

import { useEffect, useState } from "react"
import { useGroups } from "@/lib/hooks/use-groups"
import { useServices } from "@/lib/hooks/use-services"

interface SystemData {
  uptime?: string
  groups?: string
  services?: string
  status?: string
}

interface SystemStatusPanelProps {
  collapsed: boolean
  show: boolean
  systemData?: SystemData
}

export function SystemStatusPanel({ collapsed, show, systemData }: SystemStatusPanelProps) {
  // Fetch real data from hooks
  const { data: groups, loading: groupsLoading } = useGroups()
  const { data: services, loading: servicesLoading } = useServices()

  if (collapsed || !show) return null

  // Calculate dynamic counts
  const groupsCount = groupsLoading ? "..." : `${groups?.length || 0} ACTIVE`
  const servicesCount = servicesLoading ? "..." : `${services?.length || 0} ONLINE`
  const systemStatus = (groupsLoading || servicesLoading) ? "LOADING" : "OPERATIONAL"

  return (
    <div className="p-4 border-t border-neutral-700">
      <div className="p-4 bg-neutral-800 border border-neutral-700 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-white font-medium tracking-wider uppercase">SYSTEM ONLINE</span>
        </div>
        <div className="space-y-1 text-xs text-neutral-500 font-mono">
          <div className="flex justify-between">
            <span>GROUPS:</span>
            <span className="text-orange-500">{systemData?.groups || groupsCount}</span>
          </div>
          <div className="flex justify-between">
            <span>SERVICES:</span>
            <span className="text-orange-500">{systemData?.services || servicesCount}</span>
          </div>
          <div className="flex justify-between">
            <span>STATUS:</span>
            <span className="text-green-400">{systemData?.status || systemStatus}</span>
          </div>
        </div>
      </div>
    </div>
  )
}