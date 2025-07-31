"use client"

import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { isApiError, isNetworkError, isServerError, isValidationError, getErrorMessage } from '@/lib/api'

interface ErrorDisplayProps {
  error: unknown
  onRetry?: () => void
  retryText?: string
  className?: string
  variant?: 'card' | 'alert' | 'inline'
  showDetails?: boolean
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  retryText = 'Try Again',
  className,
  variant = 'card',
  showDetails = false
}: ErrorDisplayProps) {
  const errorMessage = getErrorMessage(error)
  const isNetwork = isNetworkError(error)
  const isServer = isServerError(error)
  const isValidation = isValidationError(error)

  const getErrorIcon = () => {
    if (isNetwork) return <WifiOff className="h-5 w-5" />
    return <AlertTriangle className="h-5 w-5" />
  }

  const getErrorTitle = () => {
    if (isNetwork) return 'Connection Error'
    if (isServer) return 'Server Error'
    if (isValidation) return 'Validation Error'
    return 'Error'
  }

  const getErrorDescription = () => {
    if (isNetwork) {
      return 'Unable to connect to the server. Please check your internet connection and try again.'
    }
    if (isServer) {
      return 'A server error occurred. Please try again later or contact support if the problem persists.'
    }
    if (isValidation) {
      return 'Please check your input and try again.'
    }
    return errorMessage
  }

  if (variant === 'alert') {
    return (
      <Alert variant="destructive" className={className}>
        {getErrorIcon()}
        <AlertTitle>{getErrorTitle()}</AlertTitle>
        <AlertDescription className="mt-2">
          {getErrorDescription()}
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-2 h-8"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              {retryText}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-sm text-destructive ${className}`}>
        {getErrorIcon()}
        <span>{errorMessage}</span>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="h-6 px-2">
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  // Default card variant
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          {getErrorIcon()}
          {getErrorTitle()}
        </CardTitle>
        <CardDescription>
          {getErrorDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showDetails && isApiError(error) && (
          <details className="text-sm">
            <summary className="cursor-pointer font-medium">Error Details</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              Status: {error.status}
              {error.code && `\nCode: ${error.code}`}
              {error.details && `\nDetails: ${JSON.stringify(error.details, null, 2)}`}
            </pre>
          </details>
        )}
        {onRetry && (
          <Button onClick={onRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            {retryText}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// Specialized error components
export function NetworkErrorDisplay({ onRetry }: { onRetry?: () => void }) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <WifiOff className="h-5 w-5" />
          No Internet Connection
        </CardTitle>
        <CardDescription>
          Please check your internet connection and try again.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {onRetry && (
          <Button onClick={onRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function ServerErrorDisplay({ onRetry }: { onRetry?: () => void }) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Server Error
        </CardTitle>
        <CardDescription>
          Something went wrong on our end. Please try again later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {onRetry && (
          <Button onClick={onRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// Empty state component (not an error, but related)
export function EmptyState({ 
  title, 
  description, 
  action,
  icon: Icon = AlertTriangle 
}: {
  title: string
  description: string
  action?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Icon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-center mb-4 max-w-sm">
          {description}
        </p>
        {action}
      </CardContent>
    </Card>
  )
}