/**
 * Tests for services hooks
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { 
  useServices, 
  useService, 
  useCreateService, 
  useUpdateService, 
  useDeleteService,
  useBulkServiceOperations 
} from '../../../../lib/hooks/use-services'
import { apiClient } from '../../../../lib/api'
import { NetworkService, CreateServiceData, UpdateServiceData } from '../../../../lib/types'

// Mock the API client
jest.mock('../../../../lib/api', () => ({
  apiClient: {
    getServices: jest.fn(),
    getService: jest.fn(),
    createService: jest.fn(),
    updateService: jest.fn(),
    deleteService: jest.fn(),
  },
  getErrorMessage: jest.fn((error) => error.message || 'Unknown error'),
}))

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

// Mock data
const mockService: NetworkService = {
  id: '1',
  name: 'Test Service',
  type: 'web',
  ip_addresses: ['192.168.1.1'],
  ports: [80, 443],
  vlan_id: 100,
  domain: 'test.example.com',
  group_id: 'group-1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

const mockServices: NetworkService[] = [mockService]

describe('useServices', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch services successfully', async () => {
    mockApiClient.getServices.mockResolvedValue(mockServices)

    const { result } = renderHook(() => useServices())

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toEqual([])
    expect(result.current.error).toBe(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockServices)
    expect(result.current.error).toBe(null)
    expect(mockApiClient.getServices).toHaveBeenCalledWith(undefined)
  })

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch services'
    mockApiClient.getServices.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useServices())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual([])
    expect(result.current.error).toBe(errorMessage)
  })

  it('should pass query parameters to API', async () => {
    mockApiClient.getServices.mockResolvedValue(mockServices)
    const params = { page: 2, limit: 20, search: 'test' }

    renderHook(() => useServices(params))

    await waitFor(() => {
      expect(mockApiClient.getServices).toHaveBeenCalledWith(params)
    })
  })

  it('should refetch data when refetch is called', async () => {
    mockApiClient.getServices.mockResolvedValue(mockServices)

    const { result } = renderHook(() => useServices())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockApiClient.getServices).toHaveBeenCalledTimes(1)

    await act(async () => {
      await result.current.refetch()
    })

    expect(mockApiClient.getServices).toHaveBeenCalledTimes(2)
  })
})

describe('useService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch single service successfully', async () => {
    mockApiClient.getService.mockResolvedValue(mockService)

    const { result } = renderHook(() => useService('1'))

    expect(result.current.loading).toBe(true)
    expect(result.current.service).toBe(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.service).toEqual(mockService)
    expect(result.current.error).toBe(null)
    expect(mockApiClient.getService).toHaveBeenCalledWith('1')
  })

  it('should handle fetch error', async () => {
    const errorMessage = 'Service not found'
    mockApiClient.getService.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useService('1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.service).toBe(null)
    expect(result.current.error).toBe(errorMessage)
  })

  it('should not fetch when id is empty', async () => {
    const { result } = renderHook(() => useService(''))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockApiClient.getService).not.toHaveBeenCalled()
  })
})

describe('useCreateService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create service successfully', async () => {
    mockApiClient.createService.mockResolvedValue(mockService)

    const { result } = renderHook(() => useCreateService())

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)

    const createData: CreateServiceData = {
      name: 'New Service',
      type: 'web',
      ip_addresses: ['192.168.1.2'],
      ports: [80],
      group_id: 'group-1'
    }

    let createdService: NetworkService | undefined

    await act(async () => {
      createdService = await result.current.mutate(createData)
    })

    expect(createdService).toEqual(mockService)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(mockApiClient.createService).toHaveBeenCalledWith(createData)
  })

  it('should handle create error', async () => {
    const errorMessage = 'Validation failed'
    mockApiClient.createService.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useCreateService())

    const createData: CreateServiceData = {
      name: 'New Service',
      type: 'web',
      ip_addresses: ['192.168.1.2'],
      ports: [80],
      group_id: 'group-1'
    }

    await act(async () => {
      try {
        await result.current.mutate(createData)
      } catch (error) {
        // Expected to throw
      }
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(errorMessage)
  })

  it('should reset error state', async () => {
    const { result } = renderHook(() => useCreateService())

    // Set error state
    act(() => {
      result.current.reset()
    })

    expect(result.current.error).toBe(null)
    expect(result.current.loading).toBe(false)
  })
})

describe('useUpdateService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update service successfully', async () => {
    const updatedService = { ...mockService, name: 'Updated Service' }
    mockApiClient.updateService.mockResolvedValue(updatedService)

    const { result } = renderHook(() => useUpdateService())

    const updateData: UpdateServiceData = { name: 'Updated Service' }

    let updated: NetworkService | undefined

    await act(async () => {
      updated = await result.current.mutate({ id: '1', data: updateData })
    })

    expect(updated).toEqual(updatedService)
    expect(mockApiClient.updateService).toHaveBeenCalledWith('1', updateData)
  })
})

describe('useDeleteService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should delete service successfully', async () => {
    mockApiClient.deleteService.mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteService())

    await act(async () => {
      await result.current.mutate('1')
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(mockApiClient.deleteService).toHaveBeenCalledWith('1')
  })
})

describe('useBulkServiceOperations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should perform bulk delete successfully', async () => {
    mockApiClient.deleteService.mockResolvedValue(undefined)

    const { result } = renderHook(() => useBulkServiceOperations())

    const ids = ['1', '2', '3']

    await act(async () => {
      await result.current.bulkDelete(ids)
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(mockApiClient.deleteService).toHaveBeenCalledTimes(3)
    ids.forEach(id => {
      expect(mockApiClient.deleteService).toHaveBeenCalledWith(id)
    })
  })

  it('should perform bulk group update successfully', async () => {
    mockApiClient.updateService.mockResolvedValue(mockService)

    const { result } = renderHook(() => useBulkServiceOperations())

    const ids = ['1', '2', '3']
    const newGroupId = 'new-group'

    await act(async () => {
      await result.current.bulkUpdateGroup(ids, newGroupId)
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(mockApiClient.updateService).toHaveBeenCalledTimes(3)
    ids.forEach(id => {
      expect(mockApiClient.updateService).toHaveBeenCalledWith(id, { group_id: newGroupId })
    })
  })
})