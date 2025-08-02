"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export type StatusType = 'online' | 'warning' | 'error' | 'offline' | 'maintenance'

interface StatusIndicatorProps {
  status: StatusType
  label?: string
  showPulse?: boolean
  className?: string
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  showPulse = true,
  className
}) => {
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case 'online':
        return {
          color: 'bg-white',
          textColor: 'text-white',
          badgeColor: 'bg-white/20 text-white border-white/30'
        }
      case 'warning':
        return {
          color: 'bg-orange-500',
          textColor: 'text-orange-500',
          badgeColor: 'bg-orange-500/20 text-orange-500 border-orange-500/30'
        }
      case 'error':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-500',
          badgeColor: 'bg-red-500/20 text-red-500 border-red-500/30'
        }
      case 'maintenance':
        return {
          color: 'bg-neutral-500',
          textColor: 'text-neutral-300',
          badgeColor: 'bg-neutral-500/20 text-neutral-300 border-neutral-500/30'
        }
      default: // offline
        return {
          color: 'bg-neutral-500',
          textColor: 'text-neutral-400',
          badgeColor: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div 
        className={cn(
          "w-2 h-2 rounded-full",
          config.color,
          showPulse && status === 'online' && "animate-pulse"
        )} 
      />
      {label && (
        <Badge 
          variant="outline"
          className={cn(
            "text-xs font-medium tracking-wider border",
            config.badgeColor
          )}
        >
          {label.toUpperCase()}
        </Badge>
      )}
    </div>
  )
}

export { StatusIndicator }