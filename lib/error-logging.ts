"use client"

import { ErrorInfo } from 'react'

export interface ErrorLog {
  id: string
  timestamp: string
  error: {
    name: string
    message: string
    stack?: string
  }
  errorInfo?: {
    componentStack: string
  }
  userAgent: string
  url: string
  userId?: string
  sessionId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  context?: Record<string, any>
}

export interface PerformanceMetric {
  id: string
  timestamp: string
  metric: string
  value: number
  url: string
  sessionId: string
  context?: Record<string, any>
}

class ErrorLogger {
  private sessionId: string
  private isProduction: boolean

  constructor() {
    this.sessionId = this.generateSessionId()
    this.isProduction = process.env.NODE_ENV === 'production'
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const errorMessage = error.message.toLowerCase()
    const errorName = error.name.toLowerCase()

    // Critical errors
    if (errorName.includes('syntaxerror') || 
        errorName.includes('referenceerror') ||
        errorMessage.includes('network error') ||
        errorMessage.includes('failed to fetch')) {
      return 'critical'
    }

    // High severity errors
    if (errorName.includes('typeerror') ||
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('forbidden')) {
      return 'high'
    }

    // Medium severity errors
    if (errorMessage.includes('validation') ||
        errorMessage.includes('not found') ||
        errorMessage.includes('timeout')) {
      return 'medium'
    }

    return 'low'
  }

  logError(error: Error, errorInfo?: ErrorInfo, context?: Record<string, any>): void {
    const errorLog: ErrorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo: errorInfo ? {
        componentStack: errorInfo.componentStack || ''
      } : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      sessionId: this.sessionId,
      severity: this.getSeverity(error),
      context
    }

    // Log to console in development
    if (!this.isProduction) {
      console.group(`🚨 Error Log [${errorLog.severity.toUpperCase()}]`)
      console.error('Error:', error)
      console.log('Error Info:', errorInfo)
      console.log('Context:', context)
      console.log('Session ID:', this.sessionId)
      console.groupEnd()
    }

    // Store in localStorage for debugging
    this.storeErrorLocally(errorLog)

    // In production, you would send this to your monitoring service
    if (this.isProduction) {
      this.sendToMonitoringService(errorLog)
    }
  }

  logPerformanceMetric(metric: string, value: number, context?: Record<string, any>): void {
    const performanceMetric: PerformanceMetric = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      metric,
      value,
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      sessionId: this.sessionId,
      context
    }

    if (!this.isProduction) {
      console.log(`📊 Performance Metric: ${metric} = ${value}ms`, context)
    }

    this.storePerformanceLocally(performanceMetric)

    if (this.isProduction) {
      this.sendPerformanceToMonitoringService(performanceMetric)
    }
  }

  private storeErrorLocally(errorLog: ErrorLog): void {
    try {
      const existingLogs = JSON.parse(localStorage.getItem('nsot_error_logs') || '[]')
      existingLogs.push(errorLog)
      
      // Keep only last 50 errors
      if (existingLogs.length > 50) {
        existingLogs.splice(0, existingLogs.length - 50)
      }
      
      localStorage.setItem('nsot_error_logs', JSON.stringify(existingLogs))
    } catch (e) {
      console.warn('Failed to store error log locally:', e)
    }
  }

  private storePerformanceLocally(metric: PerformanceMetric): void {
    try {
      const existingMetrics = JSON.parse(localStorage.getItem('nsot_performance_metrics') || '[]')
      existingMetrics.push(metric)
      
      // Keep only last 100 metrics
      if (existingMetrics.length > 100) {
        existingMetrics.splice(0, existingMetrics.length - 100)
      }
      
      localStorage.setItem('nsot_performance_metrics', JSON.stringify(existingMetrics))
    } catch (e) {
      console.warn('Failed to store performance metric locally:', e)
    }
  }

  private async sendToMonitoringService(errorLog: ErrorLog): Promise<void> {
    try {
      // In a real application, you would send this to services like:
      // - Sentry
      // - LogRocket
      // - Datadog
      // - Custom logging endpoint
      
      // Example implementation:
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog),
      })
    } catch (e) {
      console.warn('Failed to send error to monitoring service:', e)
    }
  }

  private async sendPerformanceToMonitoringService(metric: PerformanceMetric): Promise<void> {
    try {
      await fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
      })
    } catch (e) {
      console.warn('Failed to send performance metric to monitoring service:', e)
    }
  }

  getStoredErrors(): ErrorLog[] {
    try {
      return JSON.parse(localStorage.getItem('nsot_error_logs') || '[]')
    } catch (e) {
      return []
    }
  }

  getStoredMetrics(): PerformanceMetric[] {
    try {
      return JSON.parse(localStorage.getItem('nsot_performance_metrics') || '[]')
    } catch (e) {
      return []
    }
  }

  clearStoredLogs(): void {
    try {
      localStorage.removeItem('nsot_error_logs')
      localStorage.removeItem('nsot_performance_metrics')
    } catch (e) {
      console.warn('Failed to clear stored logs:', e)
    }
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger()

// React hook for error logging
export function useErrorLogger() {
  const logError = (error: Error, context?: Record<string, any>) => {
    errorLogger.logError(error, undefined, context)
  }

  const logPerformance = (metric: string, value: number, context?: Record<string, any>) => {
    errorLogger.logPerformanceMetric(metric, value, context)
  }

  return { logError, logPerformance }
}

// Global error handler for unhandled errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorLogger.logError(event.error, undefined, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: 'unhandled_error'
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
    errorLogger.logError(error, undefined, {
      type: 'unhandled_promise_rejection'
    })
  })
}