/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ErrorBoundary, useErrorBoundary } from '@/components/common/error-boundary'
import { ErrorDisplay } from '@/components/common/error-display'
import { RetryWrapper } from '@/components/common/retry-wrapper'
import { LoadingSpinner, LoadingOverlay } from '@/components/common/loading-spinner'
import { ApiClientError } from '@/lib/api'

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
    dismiss: jest.fn(),
    toasts: []
  })
}))

// Mock the connection status hook
jest.mock('@/hooks/use-connection-status', () => ({
  useConnectionStatus: () => ({
    isOnline: true,
    isSlowConnection: false,
    connectionType: 'wifi',
    lastOnlineAt: new Date(),
    retryCount: 0
  }),
  useRetryWithConnection: () => ({
    retryWithConnectionCheck: jest.fn((fn) => fn()),
    isOnline: true
  })
}))

// Test component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for these tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(screen.getByText('Refresh Page')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn()

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('resets error state when retry button is clicked', () => {
    let shouldThrow = true
    const TestComponent = () => <ThrowError shouldThrow={shouldThrow} />
    
    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Try Again'))
    
    // Change the prop to not throw after retry
    shouldThrow = false
    
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={shouldThrow} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })
})

describe('ErrorDisplay', () => {
  it('renders network error with appropriate styling', () => {
    const networkError = new ApiClientError({
      message: 'Network error',
      status: 0,
      code: 'NETWORK_ERROR'
    })

    render(<ErrorDisplay error={networkError} />)

    expect(screen.getByText('Connection Error')).toBeInTheDocument()
    expect(screen.getByText(/Unable to connect to the server/)).toBeInTheDocument()
  })

  it('renders server error with appropriate styling', () => {
    const serverError = new ApiClientError({
      message: 'Internal server error',
      status: 500,
      code: 'INTERNAL_ERROR'
    })

    render(<ErrorDisplay error={serverError} />)

    expect(screen.getByText('Server Error')).toBeInTheDocument()
    expect(screen.getByText(/A server error occurred/)).toBeInTheDocument()
  })

  it('renders validation error with appropriate styling', () => {
    const validationError = new ApiClientError({
      message: 'Validation failed',
      status: 400,
      code: 'VALIDATION_ERROR'
    })

    render(<ErrorDisplay error={validationError} />)

    expect(screen.getByText('Validation Error')).toBeInTheDocument()
    expect(screen.getByText(/Please check your input and try again/)).toBeInTheDocument()
  })

  it('renders retry button when onRetry is provided', () => {
    const onRetry = jest.fn()
    const error = new Error('Test error')

    render(<ErrorDisplay error={error} onRetry={onRetry} />)

    const retryButton = screen.getByText('Try Again')
    expect(retryButton).toBeInTheDocument()

    fireEvent.click(retryButton)
    expect(onRetry).toHaveBeenCalled()
  })

  it('renders as alert variant', () => {
    const error = new Error('Test error')

    render(<ErrorDisplay error={error} variant="alert" />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders as inline variant', () => {
    const error = new Error('Test error')

    render(<ErrorDisplay error={error} variant="inline" />)

    expect(screen.getByText('Test error')).toBeInTheDocument()
  })
})

describe('RetryWrapper', () => {
  it('renders children when no error and not loading', () => {
    const onRetry = jest.fn()

    render(
      <RetryWrapper onRetry={onRetry} error={null} loading={false}>
        <div>Content loaded</div>
      </RetryWrapper>
    )

    expect(screen.getByText('Content loaded')).toBeInTheDocument()
  })

  it('renders loading spinner when loading', () => {
    const onRetry = jest.fn()

    render(
      <RetryWrapper onRetry={onRetry} error={null} loading={true}>
        <div>Content</div>
      </RetryWrapper>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('renders error display when error occurs', () => {
    const onRetry = jest.fn()
    const error = new Error('Test error')

    render(
      <RetryWrapper onRetry={onRetry} error={error} loading={false}>
        <div>Content</div>
      </RetryWrapper>
    )

    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('shows connection status', () => {
    const onRetry = jest.fn()
    const error = new Error('Test error')

    render(
      <RetryWrapper onRetry={onRetry} error={error} loading={false}>
        <div>Content</div>
      </RetryWrapper>
    )

    expect(screen.getByText('Online')).toBeInTheDocument()
  })

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = jest.fn().mockResolvedValue(undefined)
    const error = new Error('Test error')

    render(
      <RetryWrapper onRetry={onRetry} error={error} loading={false}>
        <div>Content</div>
      </RetryWrapper>
    )

    fireEvent.click(screen.getByText('Try Again'))
    expect(onRetry).toHaveBeenCalled()
  })
})

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    render(<LoadingSpinner />)
    
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('h-6', 'w-6')
  })

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />)
    
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-4', 'w-4')
  })

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />)
    
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toHaveClass('h-8', 'w-8')
  })

  it('renders with text', () => {
    render(<LoadingSpinner text="Loading data..." />)
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })
})

describe('LoadingOverlay', () => {
  it('renders overlay with default text', () => {
    render(<LoadingOverlay />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(document.querySelector('.fixed.inset-0')).toBeInTheDocument()
  })

  it('renders overlay with custom text', () => {
    render(<LoadingOverlay text="Processing..." />)
    
    expect(screen.getByText('Processing...')).toBeInTheDocument()
  })
})

describe('useErrorBoundary hook', () => {
  function TestComponent() {
    const { captureError, resetError } = useErrorBoundary()

    return (
      <div>
        <button onClick={() => captureError(new Error('Hook error'))}>
          Trigger Error
        </button>
        <button onClick={resetError}>Reset</button>
      </div>
    )
  }

  it('captures and throws errors', () => {
    const onError = jest.fn()

    expect(() => {
      render(
        <ErrorBoundary onError={onError}>
          <TestComponent />
        </ErrorBoundary>
      )

      fireEvent.click(screen.getByText('Trigger Error'))
    }).not.toThrow() // ErrorBoundary should catch it

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Hook error' }),
      expect.any(Object)
    )
  })
})