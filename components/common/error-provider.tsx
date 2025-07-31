"use client"

import React, { createContext, useContext, useCallback, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { isApiError, isNetworkError, isServerError, isValidationError, getErrorMessage } from '@/lib/api'

interface ErrorContextType {
  handleError: (error: unknown, options?: ErrorHandlingOptions) => void
  clearError: () => void
  lastError: unknown
}

interface ErrorHandlingOptions {
  showToast?: boolean
  toastTitle?: string
  logError?: boolean
  silent?: boolean
  retryAction?: () => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [lastError, setLastError] = useState<unknown>(null)
  const { toast } = useToast()

  const handleError = useCallback((error: unknown, options: ErrorHandlingOptions = {}) => {
    const {
      showToast = true,
      toastTitle,
      logError = true,
      silent = false,
      retryAction
    } = options

    setLastError(error)

    // Log error to console in development
    if (logError && process.env.NODE_ENV === 'development') {
      console.error('Error handled by ErrorProvider:', error)
    }

    // Don't show toast if silent mode is enabled
    if (silent) return

    // Show toast notification
    if (showToast) {
      const errorMessage = getErrorMessage(error)
      let title = toastTitle
      let description = errorMessage

      // Customize title based on error type
      if (!title) {
        if (isNetworkError(error)) {
          title = 'Connection Error'
          description = 'Unable to connect to the server. Please check your internet connection.'
        } else if (isServerError(error)) {
          title = 'Server Error'
          description = 'A server error occurred. Please try again later.'
        } else if (isValidationError(error)) {
          title = 'Validation Error'
          description = errorMessage
        } else {
          title = 'Error'
        }
      }

      toast({
        title,
        description,
        variant: 'destructive'
      })
    }

    // TODO: In production, send error to monitoring service
    // if (process.env.NODE_ENV === 'production') {
    //   sendToErrorMonitoring(error)
    // }
  }, [toast])

  const clearError = useCallback(() => {
    setLastError(null)
  }, [])

  return (
    <ErrorContext.Provider value={{ handleError, clearError, lastError }}>
      {children}
    </ErrorContext.Provider>
  )
}

export function useErrorHandler() {
  const context = useContext(ErrorContext)
  if (context === undefined) {
    throw new Error('useErrorHandler must be used within an ErrorProvider')
  }
  return context
}

// Hook for handling async operations with error handling
export function useAsyncError() {
  const { handleError } = useErrorHandler()

  const executeAsync = useCallback(async (
    asyncFn: () => Promise<any>,
    options?: ErrorHandlingOptions
  ): Promise<any | null> => {
    try {
      return await asyncFn()
    } catch (error) {
      handleError(error, options)
      return null
    }
  }, [handleError])

  return { executeAsync }
}

// Hook for wrapping mutation operations
export function useMutationError() {
  const { handleError } = useErrorHandler()

  const handleMutationError = useCallback((error: unknown, operation: string) => {
    let title: string
    let showToast = true

    if (isValidationError(error)) {
      title = `${operation} Failed`
    } else if (isNetworkError(error)) {
      title = 'Connection Error'
    } else if (isServerError(error)) {
      title = 'Server Error'
    } else {
      title = `${operation} Failed`
    }

    handleError(error, {
      showToast,
      toastTitle: title,
      logError: true
    })
  }, [handleError])

  return { handleMutationError }
}