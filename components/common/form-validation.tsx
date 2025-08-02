"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Enhanced form field validation state
export interface FieldValidationState {
  isValid: boolean
  isValidating: boolean
  error?: string
  warning?: string
  success?: string
}

// Props for validation display component
interface ValidationDisplayProps {
  state: FieldValidationState
  className?: string
  showSuccess?: boolean
}

/**
 * Enhanced validation display component for form fields
 */
export function ValidationDisplay({ 
  state, 
  className,
  showSuccess = true 
}: ValidationDisplayProps) {
  if (state.isValidating) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Validating...</span>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-destructive", className)}>
        <AlertCircle className="h-3 w-3" />
        <span>{state.error}</span>
      </div>
    )
  }

  if (state.warning) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-yellow-600", className)}>
        <AlertCircle className="h-3 w-3" />
        <span>{state.warning}</span>
      </div>
    )
  }

  if (showSuccess && state.success) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-green-600", className)}>
        <CheckCircle className="h-3 w-3" />
        <span>{state.success}</span>
      </div>
    )
  }

  return null
}

// Props for form validation summary
interface FormValidationSummaryProps {
  errors: string[]
  warnings?: string[]
  className?: string
}

/**
 * Form validation summary component for displaying multiple validation errors
 */
export function FormValidationSummary({ 
  errors, 
  warnings = [], 
  className 
}: FormValidationSummaryProps) {
  if (errors.length === 0 && warnings.length === 0) {
    return null
  }

  return (
    <div className={cn("space-y-2", className)}>
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">
                {errors.length === 1 ? 'Please fix the following error:' : 'Please fix the following errors:'}
              </div>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {warnings.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">
                {warnings.length === 1 ? 'Warning:' : 'Warnings:'}
              </div>
              <ul className="list-disc list-inside space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="text-sm">{warning}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Hook for debounced validation
export function useDebounceValidation<T>(
  value: T,
  validationFn: (value: T) => Promise<FieldValidationState>,
  delay: number = 500
): FieldValidationState {
  const [state, setState] = useState<FieldValidationState>({
    isValid: true,
    isValidating: false
  })

  const debouncedValidate = useCallback(
    debounce(async (val: T) => {
      setState(prev => ({ ...prev, isValidating: true }))
      try {
        const result = await validationFn(val)
        setState(result)
      } catch (error) {
        setState({
          isValid: false,
          isValidating: false,
          error: 'Validation failed'
        })
      }
    }, delay),
    [validationFn, delay]
  )

  useEffect(() => {
    if (value !== undefined && value !== null && value !== '') {
      debouncedValidate(value)
    } else {
      setState({ isValid: true, isValidating: false })
    }
  }, [value, debouncedValidate])

  return state
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Form submission state interface
export interface FormSubmissionState {
  isSubmitting: boolean
  error?: string
  success?: string
  fieldErrors?: Record<string, string>
}

// Props for form submission feedback
interface FormSubmissionFeedbackProps {
  state: FormSubmissionState
  className?: string
}

/**
 * Form submission feedback component
 */
export function FormSubmissionFeedback({ 
  state, 
  className 
}: FormSubmissionFeedbackProps) {
  if (state.isSubmitting) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Submitting...</span>
      </div>
    )
  }

  if (state.error) {
    return (
      <Alert variant="destructive" className={cn("border-red-500/30 bg-red-500/10 text-red-400", className)}>
        <AlertCircle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-red-400">{state.error}</AlertDescription>
      </Alert>
    )
  }

  if (state.success) {
    return (
      <Alert className={cn("border-green-500/30 bg-green-500/10 text-green-400", className)}>
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-400">{state.success}</AlertDescription>
      </Alert>
    )
  }

  return null
}

// Hook for managing form submission state
export function useFormSubmission() {
  const [state, setState] = useState<FormSubmissionState>({
    isSubmitting: false
  })

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setState(prev => ({ ...prev, isSubmitting, error: undefined, success: undefined }))
  }, [])

  const setError = useCallback((error: string, fieldErrors?: Record<string, string>) => {
    setState(prev => ({ ...prev, isSubmitting: false, error, fieldErrors, success: undefined }))
  }, [])

  const setSuccess = useCallback((success: string) => {
    setState(prev => ({ ...prev, isSubmitting: false, success, error: undefined, fieldErrors: undefined }))
  }, [])

  const reset = useCallback(() => {
    setState({ isSubmitting: false })
  }, [])

  return {
    state,
    setSubmitting,
    setError,
    setSuccess,
    reset
  }
}