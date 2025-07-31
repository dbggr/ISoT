/**
 * API Client for Network Source of Truth Frontend
 * Provides CRUD operations for services and groups with error handling and caching
 */

import {
  NetworkService,
  Group,
  CreateServiceData,
  UpdateServiceData,
  CreateGroupData,
  UpdateGroupData,
  QueryParams,
  ServiceFilters,
  ApiError,
  ApiErrorResponse,
  ApiClientConfig,
  HttpMethod
} from './types'
import { cachedApi, cacheInvalidation } from './cache'

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  public status: number
  public code?: string
  public details?: Record<string, any>

  constructor(error: ApiError) {
    super(error.message)
    this.name = 'ApiClientError'
    this.status = error.status
    this.code = error.code
    this.details = error.details
  }
}

/**
 * API Client class for handling all HTTP requests to the backend
 */
export class ApiClient {
  private baseUrl: string
  private timeout: number
  private retries: number
  private retryDelay: number

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || '/api'
    this.timeout = config.timeout || 10000
    this.retries = config.retries || 3
    this.retryDelay = config.retryDelay || 1000
  }

  /**
   * Generic HTTP request method with error handling and retries
   */
  private async request<T>(
    endpoint: string,
    method: HttpMethod = 'GET',
    data?: any,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    // Handle both browser and Node.js environments
    const baseOrigin = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:3000'
    
    const url = new URL(`${this.baseUrl}${endpoint}`, baseOrigin)
    
    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    // Add timeout signal if available (browser environment)
    if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
      requestOptions.signal = AbortSignal.timeout(this.timeout)
    } else {
      // Fallback for environments without AbortSignal.timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)
      requestOptions.signal = controller.signal
      
      // Clean up timeout after request completes
      const originalFetch = fetch
      const wrappedFetch = async (url: string, options?: RequestInit) => {
        try {
          const response = await originalFetch(url, options)
          clearTimeout(timeoutId)
          return response
        } catch (error) {
          clearTimeout(timeoutId)
          throw error
        }
      }
      
      // Use wrapped fetch for this request
      const response = await wrappedFetch(url.toString(), requestOptions)
      
      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({
          error: 'Unknown error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status
        }))
        
        throw new ApiClientError({
          message: errorData.message || errorData.error,
          status: response.status,
          code: errorData.error,
          details: errorData.details
        })
      }

      // Handle empty responses (like DELETE)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T
      }

      const result = await response.json()
      return result as T
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(data)
    }

    let lastError: Error | null = null
    
    // Retry logic
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await fetch(url.toString(), requestOptions)
        
        if (!response.ok) {
          const errorData: ApiErrorResponse = await response.json().catch(() => ({
            error: 'Unknown error',
            message: `HTTP ${response.status}: ${response.statusText}`,
            status: response.status
          }))
          
          throw new ApiClientError({
            message: errorData.message || errorData.error,
            status: response.status,
            code: errorData.error,
            details: errorData.details
          })
        }

        // Handle empty responses (like DELETE)
        if (response.status === 204 || response.headers.get('content-length') === '0') {
          return {} as T
        }

        const result = await response.json()
        return result as T
        
      } catch (error) {
        lastError = error as Error
        
        // Don't retry on client errors (4xx) or AbortError
        if (error instanceof ApiClientError && error.status >= 400 && error.status < 500) {
          throw error
        }
        
        if (error instanceof Error && error.name === 'AbortError') {
          throw new ApiClientError({
            message: 'Request timeout',
            status: 408,
            code: 'TIMEOUT'
          })
        }

        // Wait before retrying (except on last attempt)
        if (attempt < this.retries) {
          await this.delay(this.retryDelay * Math.pow(2, attempt)) // Exponential backoff
        }
      }
    }

    // If all retries failed, throw the last error
    if (lastError) {
      throw lastError instanceof ApiClientError 
        ? lastError 
        : new ApiClientError({
            message: lastError.message || 'Network error',
            status: 0,
            code: 'NETWORK_ERROR'
          })
    }
    
    // This should never happen, but just in case
    throw new ApiClientError({
      message: 'Unknown error occurred',
      status: 0,
      code: 'UNKNOWN_ERROR'
    })
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Services API Methods

  /**
   * Get all services with optional filtering and pagination (with caching)
   */
  async getServices(params?: QueryParams & ServiceFilters): Promise<NetworkService[]> {
    const queryParams: Record<string, string | number | boolean> = {}
    
    if (params) {
      // Convert QueryParams
      if (params.page) queryParams.page = params.page
      if (params.limit) queryParams.limit = params.limit
      if (params.search) queryParams.search = params.search
      if (params.sort) queryParams.sort = params.sort
      if (params.order) queryParams.order = params.order
      if (params.group_id) queryParams.group_id = params.group_id
      if (params.type) queryParams.type = params.type
      
      // Convert ServiceFilters
      if (params.groupId) queryParams.groupId = params.groupId
      if (params.vlan) queryParams.vlan = params.vlan
      if (params.ipAddress) queryParams.ipAddress = params.ipAddress
      if (params.cidrRange) queryParams.cidrRange = params.cidrRange
      if (params.domain) queryParams.domain = params.domain
      if (params.tags) queryParams.tags = params.tags.join(',')
    }

    // Use cached API for GET requests
    return cachedApi.getServices(
      () => this.request<NetworkService[]>('/services', 'GET', undefined, queryParams),
      params
    )
  }

  /**
   * Get a single service by ID (with caching)
   */
  async getService(id: string): Promise<NetworkService> {
    return cachedApi.getService(
      () => this.request<NetworkService>(`/services/${id}`),
      id
    )
  }

  /**
   * Create a new service (with cache invalidation)
   */
  async createService(data: CreateServiceData): Promise<NetworkService> {
    const result = await this.request<NetworkService>('/services', 'POST', data)
    // Invalidate services cache after creation
    cacheInvalidation.invalidateServices()
    return result
  }

  /**
   * Update an existing service (with cache invalidation)
   */
  async updateService(id: string, data: UpdateServiceData): Promise<NetworkService> {
    const result = await this.request<NetworkService>(`/services/${id}`, 'PUT', data)
    // Invalidate specific service and services list cache
    cacheInvalidation.invalidateService(id)
    return result
  }

  /**
   * Delete a service (with cache invalidation)
   */
  async deleteService(id: string): Promise<void> {
    await this.request<void>(`/services/${id}`, 'DELETE')
    // Invalidate specific service and services list cache
    cacheInvalidation.invalidateService(id)
  }

  // Groups API Methods

  /**
   * Get all groups (with caching)
   */
  async getGroups(): Promise<Group[]> {
    return cachedApi.getGroups(
      () => this.request<Group[]>('/groups')
    )
  }

  /**
   * Get a single group by ID (with caching)
   */
  async getGroup(id: string): Promise<Group> {
    return cachedApi.getGroup(
      () => this.request<Group>(`/groups/${id}`),
      id
    )
  }

  /**
   * Create a new group (with cache invalidation)
   */
  async createGroup(data: CreateGroupData): Promise<Group> {
    const result = await this.request<Group>('/groups', 'POST', data)
    // Invalidate groups cache after creation
    cacheInvalidation.invalidateGroups()
    return result
  }

  /**
   * Update an existing group (with cache invalidation)
   */
  async updateGroup(id: string, data: UpdateGroupData): Promise<Group> {
    const result = await this.request<Group>(`/groups/${id}`, 'PUT', data)
    // Invalidate specific group and groups list cache
    cacheInvalidation.invalidateGroup(id)
    return result
  }

  /**
   * Delete a group (with cache invalidation)
   */
  async deleteGroup(id: string): Promise<void> {
    await this.request<void>(`/groups/${id}`, 'DELETE')
    // Invalidate specific group and groups list cache
    cacheInvalidation.invalidateGroup(id)
  }

  /**
   * Get services for a specific group
   */
  async getGroupServices(groupId: string): Promise<NetworkService[]> {
    return this.request<NetworkService[]>(`/groups/${groupId}/services`)
  }
}

// Default API client instance
export const apiClient = new ApiClient()

// Utility functions for error handling

/**
 * Check if an error is an API client error
 */
export function isApiError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError
}

/**
 * Extract user-friendly error message from any error
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}

/**
 * Check if error is a network/connection error
 */
export function isNetworkError(error: unknown): boolean {
  return isApiError(error) && (error.status === 0 || error.code === 'NETWORK_ERROR')
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  return isApiError(error) && error.status >= 400 && error.status < 500
}

/**
 * Check if error is a server error
 */
export function isServerError(error: unknown): boolean {
  return isApiError(error) && error.status >= 500
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(error: ApiClientError): string[] {
  if (!error.details || !Array.isArray(error.details)) {
    return [error.message]
  }
  
  return error.details.map((detail: any) => 
    typeof detail === 'string' ? detail : detail.message || 'Validation error'
  )
}