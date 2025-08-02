/**
 * Custom hooks for services data management
 * Provides data fetching, caching, and mutation operations for network services
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient, isApiError, getErrorMessage } from '../api'
import { performanceMonitor } from '../performance'
import { 
  NetworkService, 
  CreateServiceData, 
  UpdateServiceData, 
  QueryParams, 
  ServiceFilters 
} from '../types'

// Hook state interfaces
interface UseServicesState {
  data: NetworkService[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface UseServiceState {
  service: NetworkService | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UseMutationState<T> {
  mutate: (data: T) => Promise<NetworkService | void>
  loading: boolean
  error: string | null
  reset: () => void
}

/**
 * Hook for fetching multiple services with pagination, filtering, and sorting
 */
export function useServices(params?: QueryParams & ServiceFilters): UseServicesState {
  const [data, setData] = useState<NetworkService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // Use ref to track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true)

  const fetchServices = useCallback(async () => {
    if (!isMountedRef.current) return

    try {
      setLoading(true)
      setError(null)
      
      const services = await performanceMonitor.measureApiCall(
        'getServices',
        () => apiClient.getServices(params),
        { params }
      )
      
      if (isMountedRef.current) {
        setData(services)
        
        // Update pagination based on params and response
        setPagination(prev => ({
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: services.length, // This would come from API response in real implementation
          totalPages: Math.ceil(services.length / (params?.limit || 10))
        }))
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(getErrorMessage(err))
        setData([])
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [params])

  useEffect(() => {
    fetchServices()
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMountedRef.current = false
    }
  }, [fetchServices])

  // Reset mounted ref when component mounts
  useEffect(() => {
    isMountedRef.current = true
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchServices,
    pagination
  }
}

/**
 * Hook for fetching a single service by ID
 */
export function useService(id: string): UseServiceState {
  const [service, setService] = useState<NetworkService | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  const fetchService = useCallback(async () => {
    if (!id || !isMountedRef.current) {
      if (isMountedRef.current) {
        setLoading(false)
      }
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const serviceData = await performanceMonitor.measureApiCall(
        'getService',
        () => apiClient.getService(id),
        { serviceId: id }
      )
      
      if (isMountedRef.current) {
        setService(serviceData)
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(getErrorMessage(err))
        setService(null)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [id])

  useEffect(() => {
    fetchService()
    
    return () => {
      isMountedRef.current = false
    }
  }, [fetchService])

  useEffect(() => {
    isMountedRef.current = true
  }, [])

  return {
    service,
    loading,
    error,
    refetch: fetchService
  }
}

/**
 * Hook for creating a new service
 */
export function useCreateService(): UseMutationState<CreateServiceData> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (data: CreateServiceData): Promise<NetworkService> => {
    try {
      setLoading(true)
      setError(null)
      
      const newService = await apiClient.createService(data)
      return newService
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setError(null)
    setLoading(false)
  }, [])

  return {
    mutate,
    loading,
    error,
    reset
  }
}

/**
 * Hook for updating an existing service
 */
export function useUpdateService(): UseMutationState<{ id: string; data: UpdateServiceData }> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async ({ id, data }: { id: string; data: UpdateServiceData }): Promise<NetworkService> => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedService = await apiClient.updateService(id, data)
      return updatedService
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setError(null)
    setLoading(false)
  }, [])

  return {
    mutate,
    loading,
    error,
    reset
  }
}

/**
 * Hook for deleting a service
 */
export function useDeleteService(): UseMutationState<string> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      await apiClient.deleteService(id)
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setError(null)
    setLoading(false)
  }, [])

  return {
    mutate,
    loading,
    error,
    reset
  }
}

/**
 * Hook for bulk operations on services
 */
export function useBulkServiceOperations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bulkDelete = useCallback(async (ids: string[]): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      // Execute all delete operations in parallel
      await Promise.all(ids.map(id => apiClient.deleteService(id)))
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkUpdateGroup = useCallback(async (ids: string[], groupId: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      // Execute all update operations in parallel
      await Promise.all(ids.map(id => 
        apiClient.updateService(id, { groupId: groupId })
      ))
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setError(null)
    setLoading(false)
  }, [])

  return {
    bulkDelete,
    bulkUpdateGroup,
    loading,
    error,
    reset
  }
}