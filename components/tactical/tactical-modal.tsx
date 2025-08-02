"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { TacticalButton } from "./tactical-button"
import { XIcon } from "lucide-react"

interface TacticalModalProps {
  title: string
  description?: string
  children: React.ReactNode
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
  footer?: React.ReactNode
}

const TacticalModal: React.FC<TacticalModalProps> = ({
  title,
  description,
  children,
  trigger,
  open,
  onOpenChange,
  className,
  size = 'md',
  showCloseButton = true,
  footer
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'sm:max-w-sm'
      case 'md':
        return 'sm:max-w-md'
      case 'lg':
        return 'sm:max-w-lg'
      case 'xl':
        return 'sm:max-w-xl'
      default:
        return 'sm:max-w-md'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent 
        className={cn(
          "bg-neutral-900 border-neutral-700 text-white",
          getSizeClasses(),
          className
        )}
        showCloseButton={false}
      >
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-white tracking-wider">
              {title.toUpperCase()}
            </DialogTitle>
            {showCloseButton && (
              <TacticalButton
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange?.(false)}
                className="h-8 w-8 p-0 hover:bg-neutral-800"
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </TacticalButton>
            )}
          </div>
          {description && (
            <DialogDescription className="text-sm text-neutral-400">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="py-4">
          {children}
        </div>

        {footer && (
          <DialogFooter className="gap-2">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Convenience components for common modal patterns
interface ConfirmationModalProps {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
  variant?: 'danger' | 'warning' | 'primary'
}

const TacticalConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  open,
  onOpenChange,
  variant = 'primary'
}) => {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const getConfirmVariant = () => {
    switch (variant) {
      case 'danger':
        return 'danger'
      case 'warning':
        return 'primary' // Use primary for warning
      default:
        return 'primary'
    }
  }

  return (
    <TacticalModal
      title={title}
      description={description}
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      footer={
        <div className="flex gap-2 w-full">
          <TacticalButton
            variant="secondary"
            onClick={handleCancel}
            className="flex-1"
          >
            {cancelText}
          </TacticalButton>
          <TacticalButton
            variant={getConfirmVariant()}
            onClick={handleConfirm}
            className="flex-1"
          >
            {confirmText}
          </TacticalButton>
        </div>
      }
    >
      <div className="text-center py-4">
        <p className="text-neutral-300">{description}</p>
      </div>
    </TacticalModal>
  )
}

export { TacticalModal, TacticalConfirmationModal }