/**
 * Custom hooks for field-level validation with debounced API checks
 * Provides real-time validation feedback for form fields
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient, isApiError } from '../api'
import { 
  validateIPAddress, 
  validatePort, 
  validateVLAN, 
  validateDomain 
} from '../validations'

export interface FieldValidationState {
  isValid: boolean
  isValidating: boolean
  error?: string
  warning?: string
  success?: string
}

/**
 * Debounce utility function
 */
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

/**
 * Generic hook for debounced field validation
 */
export function useFieldValidation<T>(
  value: T,
  validationFn: (value: T) => Promise<FieldValidationState> | FieldValidationState,
  delay: number = 500,
  enabled: boolean = true
): FieldValidationState {
  const [state, setState] = useState<FieldValidationState>({
    isValid: true,
    isValidating: false
  })

  const isMountedRef = useRef(true)

  const debouncedValidate = useCallback(
    debounce(async (val: T) => {
      if (!isMountedRef.current || !enabled) return

      setState(prev => ({ ...prev, isValidating: true }))
      
      try {
        const result = await validationFn(val)
        if (isMountedRef.current) {
          setState(result)
        }
      } catch (error) {
        if (isMountedRef.current) {
          setState({
            isValid: false,
            isValidating: false,
            error: 'Validation failed'
          })
        }
      }
    }, delay),
    [validationFn, delay, enabled]
  )

  useEffect(() => {
    if (!enabled) {
      setState({ isValid: true, isValidating: false })
      return
    }

    if (value !== undefined && value !== null && value !== '') {
      debouncedValidate(value)
    } else {
      setState({ isValid: true, isValidating: false })
    }
  }, [value, debouncedValidate, enabled])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return state
}

/**
 * Hook for validating service names with uniqueness check
 */
export function useServiceNameValidation(
  name: string,
  currentServiceId?: string,
  delay: number = 500
): FieldValidationState {
  const validationFn = useCallback(async (serviceName: string): Promise<FieldValidationState> => {
    // First, validate the format
    if (!serviceName || serviceName.trim() === '') {
      return { isValid: false, isValidating: false, error: 'Service name is required' }
    }

    if (serviceName.length > 100) {
      return { isValid: false, isValidating: false, error: 'Service name must be 100 characters or less' }
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(serviceName)) {
      return { 
        isValid: false, 
        isValidating: false, 
        error: 'Service name can only contain letters, numbers, underscores, and hyphens' 
      }
    }

    // Check uniqueness via API
    try {
      const services = await apiClient.getServices({ search: serviceName })
      const existingService = services.find(s => 
        s.name.toLowerCase() === serviceName.toLowerCase() && 
        s.id !== currentServiceId
      )

      if (existingService) {
        return { 
          isValid: false, 
          isValidating: false, 
          error: 'A service with this name already exists' 
        }
      }

      return { 
        isValid: true, 
        isValidating: false, 
        success: 'Service name is available' 
      }
    } catch (error) {
      // If API call fails, just validate format
      return { 
        isValid: true, 
        isValidating: false, 
        warning: 'Could not verify name uniqueness' 
      }
    }
  }, [currentServiceId])

  return useFieldValidation(name, validationFn, delay)
}

/**
 * Hook for validating group names with uniqueness check
 */
export function useGroupNameValidation(
  name: string,
  currentGroupId?: string,
  delay: number = 500
): FieldValidationState {
  const validationFn = useCallback(async (groupName: string): Promise<FieldValidationState> => {
    // First, validate the format
    if (!groupName || groupName.trim() === '') {
      return { isValid: false, isValidating: false, error: 'Group name is required' }
    }

    if (groupName.length > 100) {
      return { isValid: false, isValidating: false, error: 'Group name must be 100 characters or less' }
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(groupName)) {
      return { 
        isValid: false, 
        isValidating: false, 
        error: 'Group name can only contain letters, numbers, underscores, and hyphens' 
      }
    }

    // Check uniqueness via API
    try {
      const groups = await apiClient.getGroups()
      const existingGroup = groups.find(g => 
        g.name.toLowerCase() === groupName.toLowerCase() && 
        g.id !== currentGroupId
      )

      if (existingGroup) {
        return { 
          isValid: false, 
          isValidating: false, 
          error: 'A group with this name already exists' 
        }
      }

      return { 
        isValid: true, 
        isValidating: false, 
        success: 'Group name is available' 
      }
    } catch (error) {
      // If API call fails, just validate format
      return { 
        isValid: true, 
        isValidating: false, 
        warning: 'Could not verify name uniqueness' 
      }
    }
  }, [currentGroupId])

  return useFieldValidation(name, validationFn, delay)
}

/**
 * Hook for validating IP addresses
 */
export function useIPAddressValidation(
  ipAddress: string,
  delay: number = 300
): FieldValidationState {
  const validationFn = useCallback((ip: string): FieldValidationState => {
    if (!ip || ip.trim() === '') {
      return { isValid: false, isValidating: false, error: 'IP address is required' }
    }

    const result = validateIPAddress(ip)
    if (result.success) {
      return { isValid: true, isValidating: false, success: 'Valid IP address' }
    } else {
      return { 
        isValid: false, 
        isValidating: false, 
        error: result.error?.issues[0]?.message || 'Invalid IP address format' 
      }
    }
  }, [])

  return useFieldValidation(ipAddress, validationFn, delay)
}

/**
 * Hook for validating port numbers
 */
export function usePortValidation(
  port: number | string,
  delay: number = 300
): FieldValidationState {
  const validationFn = useCallback((portValue: number | string): FieldValidationState => {
    const portNumber = typeof portValue === 'string' ? parseInt(portValue) : portValue

    if (isNaN(portNumber)) {
      return { isValid: false, isValidating: false, error: 'Port must be a number' }
    }

    const result = validatePort(portNumber)
    if (result.success) {
      return { isValid: true, isValidating: false, success: 'Valid port number' }
    } else {
      return { 
        isValid: false, 
        isValidating: false, 
        error: result.error?.issues[0]?.message || 'Invalid port number' 
      }
    }
  }, [])

  return useFieldValidation(port, validationFn, delay)
}

/**
 * Hook for validating VLAN IDs
 */
export function useVLANValidation(
  vlan: number | string | undefined,
  delay: number = 300
): FieldValidationState {
  const validationFn = useCallback((vlanValue: number | string | undefined): FieldValidationState => {
    if (vlanValue === undefined || vlanValue === '') {
      return { isValid: true, isValidating: false } // VLAN is optional
    }

    const vlanNumber = typeof vlanValue === 'string' ? parseInt(vlanValue) : vlanValue

    if (isNaN(vlanNumber)) {
      return { isValid: false, isValidating: false, error: 'VLAN ID must be a number' }
    }

    const result = validateVLAN(vlanNumber)
    if (result.success) {
      return { isValid: true, isValidating: false, success: 'Valid VLAN ID' }
    } else {
      return { 
        isValid: false, 
        isValidating: false, 
        error: result.error?.issues[0]?.message || 'Invalid VLAN ID' 
      }
    }
  }, [])

  return useFieldValidation(vlan, validationFn, delay)
}

/**
 * Hook for validating domain names
 */
export function useDomainValidation(
  domain: string | undefined,
  delay: number = 300
): FieldValidationState {
  const validationFn = useCallback((domainValue: string | undefined): FieldValidationState => {
    if (!domainValue || domainValue.trim() === '') {
      return { isValid: true, isValidating: false } // Domain is optional
    }

    const result = validateDomain(domainValue)
    if (result.success) {
      return { isValid: true, isValidating: false, success: 'Valid domain format' }
    } else {
      return { 
        isValid: false, 
        isValidating: false, 
        error: result.error?.issues[0]?.message || 'Invalid domain format' 
      }
    }
  }, [])

  return useFieldValidation(domain, validationFn, delay)
}

/**
 * Hook for validating arrays of IP addresses
 */
export function useIPAddressArrayValidation(
  ipAddresses: string[],
  delay: number = 500
): FieldValidationState {
  const validationFn = useCallback((ips: string[]): FieldValidationState => {
    if (!ips || ips.length === 0) {
      return { isValid: false, isValidating: false, error: 'At least one IP address is required' }
    }

    const validIps = ips.filter(ip => ip.trim() !== '')
    
    if (validIps.length === 0) {
      return { isValid: false, isValidating: false, error: 'At least one valid IP address is required' }
    }

    if (validIps.length > 10) {
      return { isValid: false, isValidating: false, error: 'Maximum 10 IP addresses allowed' }
    }

    // Validate each IP address
    for (const ip of validIps) {
      const result = validateIPAddress(ip)
      if (!result.success) {
        return { 
          isValid: false, 
          isValidating: false, 
          error: `Invalid IP address: ${ip}` 
        }
      }
    }

    // Check for duplicates
    const uniqueIps = new Set(validIps.map(ip => ip.toLowerCase()))
    if (uniqueIps.size !== validIps.length) {
      return { 
        isValid: false, 
        isValidating: false, 
        error: 'Duplicate IP addresses are not allowed' 
      }
    }

    return { 
      isValid: true, 
      isValidating: false, 
      success: `${validIps.length} valid IP address${validIps.length > 1 ? 'es' : ''}` 
    }
  }, [])

  return useFieldValidation(ipAddresses, validationFn, delay)
}

/**
 * Hook for validating arrays of port numbers
 */
export function usePortArrayValidation(
  ports: number[],
  delay: number = 500
): FieldValidationState {
  const validationFn = useCallback((portArray: number[]): FieldValidationState => {
    if (!portArray || portArray.length === 0) {
      return { isValid: false, isValidating: false, error: 'At least one port is required' }
    }

    const validPorts = portArray.filter(port => !isNaN(port) && port > 0)
    
    if (validPorts.length === 0) {
      return { isValid: false, isValidating: false, error: 'At least one valid port is required' }
    }

    if (validPorts.length > 50) {
      return { isValid: false, isValidating: false, error: 'Maximum 50 ports allowed' }
    }

    // Validate each port
    for (const port of validPorts) {
      const result = validatePort(port)
      if (!result.success) {
        return { 
          isValid: false, 
          isValidating: false, 
          error: `Invalid port: ${port}` 
        }
      }
    }

    // Check for duplicates
    const uniquePorts = new Set(validPorts)
    if (uniquePorts.size !== validPorts.length) {
      return { 
        isValid: false, 
        isValidating: false, 
        error: 'Duplicate ports are not allowed' 
      }
    }

    return { 
      isValid: true, 
      isValidating: false, 
      success: `${validPorts.length} valid port${validPorts.length > 1 ? 's' : ''}` 
    }
  }, [])

  return useFieldValidation(ports, validationFn, delay)
}