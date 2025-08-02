"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { StatusIndicator, StatusType } from "./status-indicator"

interface TacticalCardProps {
  title: string
  subtitle?: string
  status?: StatusType
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const TacticalCard: React.FC<TacticalCardProps> = ({
  title,
  subtitle,
  status,
  children,
  className,
  onClick
}) => {
  return (
    <Card 
      className={cn(
        "bg-neutral-900 border-neutral-700 transition-all duration-300",
        status === 'warning' && "border-orange-500/50",
        status === 'error' && "border-red-500/50",
        "hover:border-orange-500/50",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
              {title.toUpperCase()}
            </CardTitle>
            {subtitle && (
              <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>
            )}
          </div>
          {status && <StatusIndicator status={status} />}
        </div>
      </CardHeader>
      <CardContent className="text-white">
        {children}
      </CardContent>
    </Card>
  )
}

export { TacticalCard }