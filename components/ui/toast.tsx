"use client"

import * as React from "react"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

export interface ToastProps {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  onClose: (id: string) => void
}

export function Toast({ 
  id, 
  title, 
  description, 
  variant = 'default', 
  action,
  onClose 
}: ToastProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return "border-destructive bg-destructive text-destructive-foreground"
      case 'success':
        return "border-green-200 bg-green-50 text-green-800 border"
      case 'warning':
        return "border-yellow-200 bg-yellow-50 text-yellow-800 border"
      case 'info':
        return "border-blue-200 bg-blue-50 text-blue-800 border"
      default:
        return "border bg-background text-foreground"
    }
  }

  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <AlertCircle className="h-4 w-4" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-start space-x-4 overflow-hidden rounded-md p-6 pr-8 shadow-lg transition-all",
        getVariantStyles()
      )}
    >
      {getIcon() && (
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
      )}
      <div className="grid gap-1 flex-1">
        <div className="text-sm font-semibold">{title}</div>
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
        {action && (
          <Button
            variant="outline"
            size="sm"
            onClick={action.onClick}
            className="mt-2 h-8 w-fit"
          >
            {action.label}
          </Button>
        )}
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="absolute right-2 top-2 h-6 w-6 p-0 opacity-70 hover:opacity-100"
        onClick={() => onClose(id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={dismiss}
        />
      ))}
    </div>
  )
}

// Import the hook
import { useToast } from "@/hooks/use-toast"