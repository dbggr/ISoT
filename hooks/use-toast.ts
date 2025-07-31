import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastState {
  toasts: Toast[]
}

let toastState: ToastState = { toasts: [] }
let listeners: Array<(state: ToastState) => void> = []

const generateId = () => Math.random().toString(36).substr(2, 9)

const addToast = (toast: Omit<Toast, 'id'>) => {
  const newToast: Toast = {
    duration: 5000, // Default duration
    ...toast,
    id: generateId(),
  }
  
  toastState.toasts.push(newToast)
  listeners.forEach(listener => listener(toastState))
  
  // Auto remove after specified duration
  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      removeToast(newToast.id)
    }, newToast.duration)
  }
  
  return newToast.id
}

const removeToast = (id: string) => {
  toastState.toasts = toastState.toasts.filter(toast => toast.id !== id)
  listeners.forEach(listener => listener(toastState))
}

export const useToast = () => {
  const [state, setState] = useState<ToastState>(toastState)

  const subscribe = useCallback((listener: (state: ToastState) => void) => {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  }, [])

  const toast = useCallback((toast: Omit<Toast, 'id'>) => {
    return addToast(toast)
  }, [])

  // Convenience methods for different toast types
  const success = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({ 
      title, 
      description, 
      variant: 'success',
      ...options 
    })
  }, [])

  const error = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({ 
      title, 
      description, 
      variant: 'destructive',
      ...options 
    })
  }, [])

  const warning = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({ 
      title, 
      description, 
      variant: 'warning',
      ...options 
    })
  }, [])

  const info = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({ 
      title, 
      description, 
      variant: 'info',
      ...options 
    })
  }, [])

  const dismiss = useCallback((id: string) => {
    removeToast(id)
  }, [])

  const dismissAll = useCallback(() => {
    toastState.toasts = []
    listeners.forEach(listener => listener(toastState))
  }, [])

  // Subscribe to state changes
  React.useEffect(() => {
    const unsubscribe = subscribe(setState)
    return unsubscribe
  }, [subscribe])

  return {
    toast,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
    toasts: state.toasts,
  }
}

// For React import
import * as React from 'react'