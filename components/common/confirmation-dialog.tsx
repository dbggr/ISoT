"use client"

import { ReactNode, useState, useEffect, useRef } from "react"
import { AlertTriangle, Loader2, Info, AlertCircle, CheckCircle } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  KEYBOARD_KEYS, 
  FocusManager, 
  generateId,
  ScreenReaderAnnouncer 
} from "@/lib/accessibility"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  loading?: boolean
  variant?: "default" | "destructive" | "warning" | "info"
  disabled?: boolean
  showWarning?: boolean
  warningMessage?: string
  requireConfirmation?: boolean
  confirmationText?: string
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  loading = false,
  variant = "default",
  disabled = false,
  showWarning = false,
  warningMessage,
  requireConfirmation = false,
  confirmationText
}: ConfirmationDialogProps) {
  const [confirmationInput, setConfirmationInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [announcer] = useState(() => ScreenReaderAnnouncer.getInstance())
  const dialogId = generateId('dialog')
  const titleId = generateId('dialog-title')
  const descriptionId = generateId('dialog-description')

  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return <AlertTriangle className="h-5 w-5 text-destructive" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />
      default:
        return null
    }
  }

  const isConfirmationValid = !requireConfirmation || 
    (confirmationText && confirmationInput.toLowerCase() === confirmationText.toLowerCase())

  // Focus management
  useEffect(() => {
    if (open) {
      // Focus the appropriate element when dialog opens
      const focusTarget = requireConfirmation && inputRef.current 
        ? inputRef.current 
        : variant === "destructive" 
          ? cancelButtonRef.current 
          : confirmButtonRef.current

      setTimeout(() => {
        focusTarget?.focus()
      }, 100)

      // Announce dialog opening
      announcer.announce(`${title} dialog opened`)
    }
  }, [open, requireConfirmation, variant, title, announcer])

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!dialogRef.current) return

    switch (event.key) {
      case KEYBOARD_KEYS.ESCAPE:
        if (!loading) {
          handleOpenChange(false)
        }
        break
      case KEYBOARD_KEYS.TAB:
        // Let the browser handle tab navigation, but ensure focus stays within dialog
        FocusManager.trapFocus(dialogRef.current, event.nativeEvent)
        break
    }
  }

  const handleConfirm = async () => {
    if (requireConfirmation && !isConfirmationValid) {
      const errorMsg = `Please type "${confirmationText}" to confirm`
      setError(errorMsg)
      announcer.announce(errorMsg, 'assertive')
      inputRef.current?.focus()
      return
    }

    try {
      setError(null)
      announcer.announce('Processing request...')
      await onConfirm()
      if (!loading) {
        announcer.announce('Action completed successfully')
        onOpenChange(false)
        setConfirmationInput("")
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An error occurred'
      setError(errorMsg)
      announcer.announce(`Error: ${errorMsg}`, 'assertive')
      console.error('Confirmation action failed:', error)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmationInput("")
      setError(null)
      announcer.announce('Dialog closed')
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        ref={dialogRef}
        className="sm:max-w-[500px] focus-trap"
        onKeyDown={handleKeyDown}
        role={variant === "destructive" ? "alertdialog" : "dialog"}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <DialogHeader>
          <DialogTitle id={titleId} className="flex items-center gap-2">
            {getIcon()}
            {title}
          </DialogTitle>
          <DialogDescription id={descriptionId} className="text-left">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {showWarning && warningMessage && (
            <Alert variant="destructive" role="alert" aria-live="polite">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>{warningMessage}</AlertDescription>
            </Alert>
          )}

          {requireConfirmation && confirmationText && (
            <div className="space-y-2">
              <label 
                htmlFor={`${dialogId}-confirmation-input`}
                className="text-sm font-medium"
              >
                Type <code className="bg-muted px-1 py-0.5 rounded text-sm">{confirmationText}</code> to confirm:
              </label>
              <input
                ref={inputRef}
                id={`${dialogId}-confirmation-input`}
                type="text"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md keyboard-focus touch-target"
                placeholder={confirmationText}
                disabled={loading}
                aria-required="true"
                aria-invalid={!isConfirmationValid}
                aria-describedby={error ? `${dialogId}-error` : undefined}
              />
            </div>
          )}

          {error && (
            <Alert 
              id={`${dialogId}-error`}
              variant="destructive" 
              role="alert" 
              aria-live="assertive"
            >
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            ref={cancelButtonRef}
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
            className="keyboard-focus touch-target"
            aria-label={`${cancelText} and close dialog`}
          >
            {cancelText}
          </Button>
          <Button
            ref={confirmButtonRef}
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={loading || disabled || !isConfirmationValid}
            className="keyboard-focus touch-target"
            aria-label={`${confirmText}${requireConfirmation ? ' (requires confirmation text)' : ''}`}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Specialized confirmation dialogs for common use cases

interface DeleteConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemName: string
  itemType: string
  onConfirm: () => void | Promise<void>
  loading?: boolean
  associatedItems?: string[]
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  itemName,
  itemType,
  onConfirm,
  loading = false,
  associatedItems = []
}: DeleteConfirmationProps) {
  const hasAssociatedItems = associatedItems.length > 0

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${itemType}`}
      description={
        <div className="space-y-2">
          <p>Are you sure you want to delete <strong>{itemName}</strong>?</p>
          {hasAssociatedItems && (
            <p className="text-sm text-muted-foreground">
              This action will also affect {associatedItems.length} associated item{associatedItems.length > 1 ? 's' : ''}:
            </p>
          )}
          {hasAssociatedItems && (
            <ul className="text-sm text-muted-foreground list-disc list-inside max-h-32 overflow-y-auto">
              {associatedItems.slice(0, 10).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
              {associatedItems.length > 10 && (
                <li>...and {associatedItems.length - 10} more</li>
              )}
            </ul>
          )}
        </div>
      }
      confirmText="Delete"
      onConfirm={onConfirm}
      loading={loading}
      variant="destructive"
      showWarning={hasAssociatedItems}
      warningMessage={hasAssociatedItems ? "This action cannot be undone." : undefined}
      requireConfirmation={hasAssociatedItems}
      confirmationText={hasAssociatedItems ? "DELETE" : undefined}
    />
  )
}

interface BulkDeleteConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemCount: number
  itemType: string
  onConfirm: () => void | Promise<void>
  loading?: boolean
}

export function BulkDeleteConfirmationDialog({
  open,
  onOpenChange,
  itemCount,
  itemType,
  onConfirm,
  loading = false
}: BulkDeleteConfirmationProps) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${itemCount} ${itemType}${itemCount > 1 ? 's' : ''}`}
      description={
        <div className="space-y-2">
          <p>Are you sure you want to delete <strong>{itemCount}</strong> selected {itemType}{itemCount > 1 ? 's' : ''}?</p>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone and will permanently remove all selected items.
          </p>
        </div>
      }
      confirmText={`Delete ${itemCount} item${itemCount > 1 ? 's' : ''}`}
      onConfirm={onConfirm}
      loading={loading}
      variant="destructive"
      showWarning={true}
      warningMessage="This action cannot be undone."
      requireConfirmation={itemCount > 5}
      confirmationText={itemCount > 5 ? "DELETE" : undefined}
    />
  )
}

interface UnsavedChangesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void | Promise<void>
  onDiscard: () => void
  loading?: boolean
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onSave,
  onDiscard,
  loading = false
}: UnsavedChangesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Unsaved Changes
          </DialogTitle>
          <DialogDescription>
            You have unsaved changes. What would you like to do?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onDiscard()
              onOpenChange(false)
            }}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Discard Changes
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Continue Editing
          </Button>
          <Button
            onClick={async () => {
              await onSave()
              onOpenChange(false)
            }}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}