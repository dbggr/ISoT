"use client"

import * as React from "react"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { useToast } from "@/hooks/use-toast"

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
        return "border-red-500/30 bg-red-500/10 text-red-400 border backdrop-blur-sm"
      case 'success':
        return "border-green-500/30 bg-green-500/10 text-green-400 border backdrop-blur-sm"
      case 'warning':
        return "border-orange-500/30 bg-orange-500/10 text-orange-400 border backdrop-blur-sm"
      case 'info':
        return "border-orange-500/30 bg-orange-500/10 text-orange-400 border backdrop-blur-sm"
      default:
        return "border-neutral-700 bg-neutral-900 text-white border backdrop-blur-sm"
    }
  }

  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'info':
        return <Info className="h-4 w-4 text-orange-500" />
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
        <div className="text-sm font-semibold tracking-wider uppercase">{title}</div>
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
        {action && (
          <Button
            variant="outline"
            size="sm"
            onClick={action.onClick}
            className="mt-2 h-8 w-fit bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white"
          >
            {action.label.toUpperCase()}
          </Button>
        )}
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="absolute right-2 top-2 h-6 w-6 p-0 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors duration-200 z-10 cursor-pointer"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          console.log('Toast close clicked:', id) // Debug log
          onClose(id)
        }}
        aria-label="Close notification"
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
        <ToastWithTimer
          key={toast.id}
          {...toast}
          onClose={dismiss}
        />
      ))}
    </div>
  )
}

// Individual toast component with its own timer
function ToastWithTimer(props: ToastProps) {
  React.useEffect(() => {
    if (props.duration && props.duration > 0) {
      const timer = setTimeout(() => {
        props.onClose(props.id)
      }, props.duration)
      
      return () => clearTimeout(timer)
    }
  }, [props.id, props.duration, props.onClose])

  return <Toast {...props} />
}

