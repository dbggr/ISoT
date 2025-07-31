/**
 * Custom hooks for groups data management
 * Provides data fetching, caching, and mutation operations for groups
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient, getErrorMessage } from '../api'
import { performanceMonitor } from '../performance'
import { 
  Group, 
  NetworkService,
  CreateGroupData, 
  UpdateGroupData 
} from '../types'

// Hook state interfaces
interface UseGroupsState {
  data: Group[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UseGroupState {
  group: Group | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UseGroupServicesState {
  services: NetworkService[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UseMutationState<T, R = Group> {
  mutate: (data: T) => Promise<R>
  loading: boolean
  error: string | null
  reset: () => void
}

/**
 * Hook for fetching all groups
 */
export function useGroups(): UseGroupsState {
  const [data, setData] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  const fetchGroups = useCallback(async () => {
    if (!isMountedRef.current) return

    try {
      setLoading(true)
      setError(null)
      
      const groups = await performanceMonitor.measureApiCall(
        'getGroups',
        () => apiClient.getGroups()
      )
      
      if (isMountedRef.current) {
        setData(groups)
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
  }, [])

  useEffect(() => {
    fetchGroups()
    
    return () => {
      isMountedRef.current = false
    }
  }, [fetchGroups])

  useEffect(() => {
    isMountedRef.current = true
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchGroups
  }
}

/**
 * Hook for fetching a single group by ID
 */
export function useGroup(id: string): UseGroupState {
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  const fetchGroup = useCallback(async () => {
    if (!id || !isMountedRef.current) {
      if (isMountedRef.current) {
        setLoading(false)
      }
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const groupData = await performanceMonitor.measureApiCall(
        'getGroup',
        () => apiClient.getGroup(id),
        { groupId: id }
      )
      
      if (isMountedRef.current) {
        setGroup(groupData)
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(getErrorMessage(err))
        setGroup(null)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [id])

  useEffect(() => {
    fetchGroup()
    
    return () => {
      isMountedRef.current = false
    }
  }, [fetchGroup])

  useEffect(() => {
    isMountedRef.current = true
  }, [])

  return {
    group,
    loading,
    error,
    refetch: fetchGroup
  }
}

/**
 * Hook for fetching services associated with a specific group
 */
export function useGroupServices(groupId: string): UseGroupServicesState {
  const [services, setServices] = useState<NetworkService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  const fetchGroupServices = useCallback(async () => {
    if (!groupId || !isMountedRef.current) return

    try {
      setLoading(true)
      setError(null)
      
      const groupServices = await apiClient.getGroupServices(groupId)
      
      if (isMountedRef.current) {
        setServices(groupServices)
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(getErrorMessage(err))
        setServices([])
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [groupId])

  useEffect(() => {
    fetchGroupServices()
    
    return () => {
      isMountedRef.current = false
    }
  }, [fetchGroupServices])

  useEffect(() => {
    isMountedRef.current = true
  }, [])

  return {
    services,
    loading,
    error,
    refetch: fetchGroupServices
  }
}

/**
 * Hook for creating a new group
 */
export function useCreateGroup(): UseMutationState<CreateGroupData> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (data: CreateGroupData): Promise<Group> => {
    try {
      setLoading(true)
      setError(null)
      
      const newGroup = await apiClient.createGroup(data)
      return newGroup
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
 * Hook for updating an existing group
 */
export function useUpdateGroup(): UseMutationState<{ id: string; data: UpdateGroupData }> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async ({ id, data }: { id: string; data: UpdateGroupData }): Promise<Group> => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedGroup = await apiClient.updateGroup(id, data)
      return updatedGroup
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
 * Hook for deleting a group
 */
export function useDeleteGroup(): UseMutationState<string, void> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      await apiClient.deleteGroup(id)
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
 * Hook for checking if a group can be safely deleted
 * Returns information about associated services
 */
export function useGroupDeletionCheck(groupId: string) {
  const [canDelete, setCanDelete] = useState(false)
  const [associatedServices, setAssociatedServices] = useState<NetworkService[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkDeletion = useCallback(async () => {
    if (!groupId) return

    try {
      setLoading(true)
      setError(null)
      
      const services = await apiClient.getGroupServices(groupId)
      setAssociatedServices(services)
      setCanDelete(services.length === 0)
    } catch (err) {
      setError(getErrorMessage(err))
      setCanDelete(false)
      setAssociatedServices([])
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    checkDeletion()
  }, [checkDeletion])

  return {
    canDelete,
    associatedServices,
    loading,
    error,
    refetch: checkDeletion
  }
}