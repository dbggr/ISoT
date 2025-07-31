/**
 * Performance monitoring and bundle analysis utilities
 * Provides tools for measuring and optimizing application performance
 */

// Performance metrics interface
interface PerformanceMetrics {
  timestamp: number
  name: string
  duration: number
  type: 'navigation' | 'api' | 'component' | 'custom'
  metadata?: Record<string, any>
}

// Performance observer for collecting metrics
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private observers: PerformanceObserver[] = []
  private isEnabled: boolean = false

  constructor() {
    this.isEnabled = typeof window !== 'undefined' && 'performance' in window
    if (this.isEnabled) {
      this.initializeObservers()
    }
  }

  private initializeObservers() {
    try {
      // Navigation timing observer
      if ('PerformanceObserver' in window) {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming
              this.recordMetric({
                name: 'page_load',
                duration: navEntry.loadEventEnd - navEntry.fetchStart,
                type: 'navigation',
                metadata: {
                  domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
                  firstPaint: this.getFirstPaint(),
                  firstContentfulPaint: this.getFirstContentfulPaint()
                }
              })
            }
          }
        })
        navObserver.observe({ entryTypes: ['navigation'] })
        this.observers.push(navObserver)

        // Resource timing observer
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming
              // Only track significant resources
              if (resourceEntry.duration > 100) {
                this.recordMetric({
                  name: `resource_${this.getResourceType(resourceEntry.name)}`,
                  duration: resourceEntry.duration,
                  type: 'navigation',
                  metadata: {
                    url: resourceEntry.name,
                    size: resourceEntry.transferSize,
                    cached: resourceEntry.transferSize === 0
                  }
                })
              }
            }
          }
        })
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.push(resourceObserver)

        // Measure observer for custom metrics
        const measureObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
              this.recordMetric({
                name: entry.name,
                duration: entry.duration,
                type: 'custom'
              })
            }
          }
        })
        measureObserver.observe({ entryTypes: ['measure'] })
        this.observers.push(measureObserver)
      }
    } catch (error) {
      console.warn('Performance monitoring initialization failed:', error)
    }
  }

  private getFirstPaint(): number | undefined {
    const paintEntries = performance.getEntriesByType('paint')
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')
    return firstPaint?.startTime
  }

  private getFirstContentfulPaint(): number | undefined {
    const paintEntries = performance.getEntriesByType('paint')
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    return fcp?.startTime
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript'
    if (url.includes('.css')) return 'stylesheet'
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) return 'image'
    if (url.includes('/api/')) return 'api'
    return 'other'
  }

  public recordMetric(metric: Omit<PerformanceMetrics, 'timestamp'>) {
    this.metrics.push({
      ...metric,
      timestamp: Date.now()
    })

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }
  }

  /**
   * Measure API call performance
   */
  async measureApiCall<T>(
    name: string,
    apiCall: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now()
    
    try {
      const result = await apiCall()
      const duration = performance.now() - startTime
      
      this.recordMetric({
        name: `api_${name}`,
        duration,
        type: 'api',
        metadata: {
          ...metadata,
          success: true
        }
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      
      this.recordMetric({
        name: `api_${name}`,
        duration,
        type: 'api',
        metadata: {
          ...metadata,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })
      
      throw error
    }
  }

  /**
   * Measure component render performance
   */
  measureComponent(name: string, renderFn: () => void) {
    if (!this.isEnabled) {
      renderFn()
      return
    }

    const markStart = `${name}_start`
    const markEnd = `${name}_end`
    const measureName = `component_${name}`

    performance.mark(markStart)
    renderFn()
    performance.mark(markEnd)
    performance.measure(measureName, markStart, markEnd)
  }

  /**
   * Get performance metrics
   */
  getMetrics(type?: PerformanceMetrics['type']): PerformanceMetrics[] {
    if (type) {
      return this.metrics.filter(metric => metric.type === type)
    }
    return [...this.metrics]
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const apiMetrics = this.getMetrics('api')
    const componentMetrics = this.getMetrics('component')
    const navigationMetrics = this.getMetrics('navigation')

    return {
      api: {
        count: apiMetrics.length,
        averageDuration: apiMetrics.length > 0 
          ? apiMetrics.reduce((sum, m) => sum + m.duration, 0) / apiMetrics.length 
          : 0,
        slowestCall: apiMetrics.reduce((slowest, current) => 
          current.duration > (slowest?.duration || 0) ? current : slowest, null as PerformanceMetrics | null)
      },
      components: {
        count: componentMetrics.length,
        averageRenderTime: componentMetrics.length > 0
          ? componentMetrics.reduce((sum, m) => sum + m.duration, 0) / componentMetrics.length
          : 0
      },
      navigation: {
        pageLoadTime: navigationMetrics.find(m => m.name === 'page_load')?.duration,
        firstPaint: navigationMetrics.find(m => m.name === 'page_load')?.metadata?.firstPaint,
        firstContentfulPaint: navigationMetrics.find(m => m.name === 'page_load')?.metadata?.firstContentfulPaint
      }
    }
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = []
  }

  /**
   * Cleanup observers
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for component performance measurement
export function usePerformanceMonitor(componentName: string) {
  const measureRender = (renderFn: () => void) => {
    performanceMonitor.measureComponent(componentName, renderFn)
  }

  return { measureRender }
}

// Bundle analysis utilities
export const bundleAnalysis = {
  /**
   * Analyze loaded chunks and their sizes
   */
  getLoadedChunks(): Array<{ name: string; size: number }> {
    if (typeof window === 'undefined') return []

    const chunks: Array<{ name: string; size: number }> = []
    const scripts = document.querySelectorAll('script[src]')
    
    scripts.forEach(script => {
      const src = script.getAttribute('src')
      if (src && src.includes('/_next/static/')) {
        // Extract chunk name from Next.js static path
        const match = src.match(/\/_next\/static\/chunks\/(.+)\.js/)
        if (match) {
          chunks.push({
            name: match[1],
            size: 0 // Size would need to be determined from network tab or build analysis
          })
        }
      }
    })

    return chunks
  },

  /**
   * Get resource loading performance
   */
  getResourcePerformance() {
    if (typeof window === 'undefined' || !('performance' in window)) return []

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    
    return resources
      .filter(resource => resource.name.includes('/_next/static/'))
      .map(resource => ({
        name: resource.name.split('/').pop() || 'unknown',
        duration: resource.duration,
        size: resource.transferSize,
        cached: resource.transferSize === 0,
        type: this.getResourceType(resource.name)
      }))
      .sort((a, b) => b.duration - a.duration)
  },

  getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript'
    if (url.includes('.css')) return 'stylesheet'
    if (url.includes('.woff') || url.includes('.ttf')) return 'font'
    return 'other'
  }
}

// Web Vitals measurement
export const webVitals = {
  /**
   * Measure Core Web Vitals
   */
  measureCoreWebVitals() {
    if (typeof window === 'undefined') return

    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          
          performanceMonitor.recordMetric({
            name: 'largest_contentful_paint',
            duration: lastEntry.startTime,
            type: 'navigation',
            metadata: {
              element: lastEntry.element?.tagName,
              url: lastEntry.url
            }
          })
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fidEntry = entry as any
            performanceMonitor.recordMetric({
              name: 'first_input_delay',
              duration: fidEntry.processingStart - fidEntry.startTime,
              type: 'navigation',
              metadata: {
                eventType: fidEntry.name
              }
            })
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // Cumulative Layout Shift (CLS)
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const clsEntry = entry as any
            if (!clsEntry.hadRecentInput) {
              clsValue += clsEntry.value
            }
          }
          
          performanceMonitor.recordMetric({
            name: 'cumulative_layout_shift',
            duration: clsValue,
            type: 'navigation'
          })
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (error) {
        console.warn('Web Vitals measurement failed:', error)
      }
    }
  }
}

// Initialize Web Vitals measurement on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    webVitals.measureCoreWebVitals()
  })
}

// Performance debugging utilities
export const performanceDebug = {
  /**
   * Log performance summary to console
   */
  logSummary() {
    const summary = performanceMonitor.getSummary()
    console.group('🚀 Performance Summary')
    console.log('API Calls:', summary.api)
    console.log('Components:', summary.components)
    console.log('Navigation:', summary.navigation)
    console.log('Bundle Analysis:', bundleAnalysis.getResourcePerformance())
    console.groupEnd()
  },

  /**
   * Export performance data for analysis
   */
  exportData() {
    const data = {
      metrics: performanceMonitor.getMetrics(),
      summary: performanceMonitor.getSummary(),
      resources: bundleAnalysis.getResourcePerformance(),
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}