/**
 * Integration tests for data hooks
 */

import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { 
  useServices, 
  useService, 
  useCreateService, 
  useUpdateService, 
  useDeleteService,
  useBulkServiceOperations 
} from '../../lib/hooks/use-services'
import { 
  useGroups, 
  useGroup, 
  useCreateGroup, 
  useUpdateGroup, 
  useDeleteGroup 
} from '../../lib/hooks/use-groups'
import { ApiClient } from '../../lib/api'
import { NetworkService, Group } from '../../lib/types'

// Mock the API client
jest.mock('../../lib/api')
const MockedApiClient = ApiClient as jest.MockedClass<typeof ApiClient>

describe('Data Hooks Integration Tests', () => {
  let mockApiClient: jest.Mocked<ApiClient>

  beforeEach(() => {
    mockApiClient = {
      getServices: jest.fn(),
      getService: jest.fn(),
      createService: jest.fn(),
      updateService: jest.fn(),
      deleteService: jest.fn(),
      getGroups: jest.fn(),
      getGroup: jest.fn(),
      createGroup: jest.fn(),
      updateGroup: jest.fn(),
      deleteGroup: jest.fn(),
    } as any

    MockedApiClient.mockImplementation(() => mockApiClient)
    jest.clearAllMocks()
  })

  describe('Services Hooks Integration', () => {
    const mockService: NetworkService = {
      id: 'service-1',
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

    describe('useServices with pagination and filtering', () => {
      it('should handle pagination correctly', async () => {
        const page1Services = [mockService]
        const page2Services = [{ ...mockService, id: 'service-2', name: 'Service 2' }]

        mockApiClient.getServices
          .mockResolvedValueOnce(page1Services)
          .mockResolvedValueOnce(page2Services)

        const { result, rerender } = renderHook(
          ({ page }) => useServices({ page, limit: 1 }),
          { initialProps: { page: 1 } }
        )

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        expect(result.current.data).toEqual(page1Services)
        expect(mockApiClient.getServices).toHaveBeenCalledWith({ page: 1, limit: 1 })

        // Change to page 2
        rerender({ page: 2 })

        await waitFor(() => {
          expect(result.current.data).toEqual(page2Services)
        })

        expect(mockApiClient.getServices).toHaveBeenCalledWith({ page: 2, limit: 1 })
      })

      it('should handle search and filtering', async () => {
        const filteredServices = [mockService]
        mockApiClient.getServices.mockResolvedValue(filteredServices)

        const { result } = renderHook(() => 
          useServices({ search: 'test', type: 'web', group_id: 'group-1' })
        )

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        expect(mockApiClient.getServices).toHaveBeenCalledWith({
          search: 'test',
          type: 'web',
          group_id: 'group-1'
        })
        expect(result.current.data).toEqual(filteredServices)
      })

      it('should handle sorting', async () => {
        const sortedServices = [mockService]
        mockApiClient.getServices.mockResolvedValue(sortedServices)

        const { result } = renderHook(() => 
          useServices({ sort: 'name', order: 'desc' })
        )

        await waitFor(() => {
          expect(result.current.loading).toBe(false)
        })

        expect(mockApiClient.getServices).toHaveBeenCalledWith({
          sort: 'name',
          order: 'desc'
        })
      })
    })

    describe('CRUD operations integration', () => {
      it('should create, read, update, and delete service', async () => {
        // Create
        const createHook = renderHook(() => useCreateService())
        const newServiceData = {
          name: 'New Service',
          type: 'web' as const,
          ip_addresses: ['192.168.1.2'],
          ports: [80],
          group_id: 'group-1'
        }
        const createdService = { ...mockService, ...newServiceData }
        mockApiClient.createService.mockResolvedValue(createdService)

        let result: NetworkService | undefined
        await act(async () => {
          result = await createHook.result.current.mutate(newServiceData)
        })

        expect(result).toEqual(createdService)
        expect(mockApiClient.createService).toHaveBeenCalledWith(newServiceData)

        // Read
        const readHook = renderHook(() => useService(createdService.id))
        mockApiClient.getService.mockResolvedValue(createdService)

        await waitFor(() => {
          expect(readHook.result.current.loading).toBe(false)
        })

        expect(readHook.result.current.service).toEqual(createdService)
        expect(mockApiClient.getService).toHaveBeenCalledWith(createdService.id)

        // Update
        const updateHook = renderHook(() => useUpdateService())
        const updateData = { name: 'Updated Service' }
        const updatedService = { ...createdService, ...updateData }
        mockApiClient.updateService.mockResolvedValue(updatedService)

        let updateResult: NetworkService | undefined
        await act(async () => {
          updateResult = await updateHook.result.current.mutate({
            id: createdService.id,
            data: updateData
          })
        })

        expect(updateResult).toEqual(updatedService)
        expect(mockApiClient.updateService).toHaveBeenCalledWith(createdService.id, updateData)

        // Delete
        const deleteHook = renderHook(() => useDeleteService())
        mockApiClient.deleteService.mockResolvedValue(undefined)

        await act(async () => {
          await deleteHook.result.current.mutate(createdService.id)
        })

        expect(mockApiClient.deleteService).toHaveBeenCalledWith(createdService.id)
      })
    })

    describe('Bulk operations integration', () => {
      it('should perform bulk delete with progress tracking', async () => {
        const { result } = renderHook(() => useBulkServiceOperations())
        const serviceIds = ['service-1', 'service-2', 'service-3']
        
        mockApiClient.deleteService.mockResolvedValue(undefined)

        await act(async () => {
          await result.current.bulkDelete(serviceIds)
        })

        expect(mockApiClient.deleteService).toHaveBeenCalledTimes(3)
        serviceIds.forEach(id => {
          expect(mockApiClient.deleteService).toHaveBeenCalledWith(id)
        })
      })

      it('should handle partial failures in bulk operations', async () => {
        const { result } = renderHook(() => useBulkServiceOperations())
        const serviceIds = ['service-1', 'service-2', 'service-3']
        
        mockApiClient.deleteService
          .mockResolvedValueOnce(undefined)
          .mockRejectedValueOnce(new Error('Delete failed'))
          .mockResolvedValueOnce(undefined)

        await act(async () => {
          try {
            await result.current.bulkDelete(serviceIds)
          } catch (error) {
            // Expected to throw due to partial failure
          }
        })

        expect(mockApiClient.deleteService).toHaveBeenCalledTimes(3)
        expect(result.current.error).toBeTruthy()
      })

      it('should perform bulk group updates', async () => {
        const { result } = renderHook(() => useBulkServiceOperations())
        const serviceIds = ['service-1', 'service-2']
        const newGroupId = 'new-group'
        
        mockApiClient.updateService.mockResolvedValue(mockService)

        await act(async () => {
          await result.current.bulkUpdateGroup(serviceIds, newGroupId)
        })

        expect(mockApiClient.updateService).toHaveBeenCalledTimes(2)
        serviceIds.forEach(id => {
          expect(mockApiClient.updateService).toHaveBeenCalledWith(id, { group_id: newGroupId })
        })
      })
    })
  })

  describe('Groups Hooks Integration', () => {
    const mockGroup: Group = {
      id: 'group-1',
      name: 'Test Group',
      description: 'Test group description',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    describe('Groups CRUD integration', () => {
      it('should create, read, update, and delete group', async () => {
        // Create
        const createHook = renderHook(() => useCreateGroup())
        const newGroupData = {
          name: 'New Group',
          description: 'New group description'
        }
        const createdGroup = { ...mockGroup, ...newGroupData }
        mockApiClient.createGroup.mockResolvedValue(createdGroup)

        let result: Group | undefined
        await act(async () => {
          result = await createHook.result.current.mutate(newGroupData)
        })

        expect(result).toEqual(createdGroup)
        expect(mockApiClient.createGroup).toHaveBeenCalledWith(newGroupData)

        // Read all groups
        const groupsHook = renderHook(() => useGroups())
        mockApiClient.getGroups.mockResolvedValue([createdGroup])

        await waitFor(() => {
          expect(groupsHook.result.current.loading).toBe(false)
        })

        expect(groupsHook.result.current.data).toEqual([createdGroup])

        // Read single group
        const groupHook = renderHook(() => useGroup(createdGroup.id))
        mockApiClient.getGroup.mockResolvedValue(createdGroup)

        await waitFor(() => {
          expect(groupHook.result.current.loading).toBe(false)
        })

        expect(groupHook.result.current.group).toEqual(createdGroup)

        // Update
        const updateHook = renderHook(() => useUpdateGroup())
        const updateData = { name: 'Updated Group' }
        const updatedGroup = { ...createdGroup, ...updateData }
        mockApiClient.updateGroup.mockResolvedValue(updatedGroup)

        let updateResult: Group | undefined
        await act(async () => {
          updateResult = await updateHook.result.current.mutate({
            id: createdGroup.id,
            data: updateData
          })
        })

        expect(updateResult).toEqual(updatedGroup)
        expect(mockApiClient.updateGroup).toHaveBeenCalledWith(createdGroup.id, updateData)

        // Delete
        const deleteHook = renderHook(() => useDeleteGroup())
        mockApiClient.deleteGroup.mockResolvedValue(undefined)

        await act(async () => {
          await deleteHook.result.current.mutate(createdGroup.id)
        })

        expect(mockApiClient.deleteGroup).toHaveBeenCalledWith(createdGroup.id)
      })
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle network errors gracefully', async () => {
      mockApiClient.getServices.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useServices())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Network error')
      expect(result.current.data).toEqual([])
    })

    it('should handle API errors with proper error messages', async () => {
      const apiError = new Error('Service not found')
      apiError.name = 'ApiClientError'
      mockApiClient.getService.mockRejectedValue(apiError)

      const { result } = renderHook(() => useService('nonexistent'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Service not found')
      expect(result.current.service).toBe(null)
    })

    it('should retry failed requests', async () => {
      mockApiClient.getServices
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce([])

      const { result } = renderHook(() => useServices())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockApiClient.getServices).toHaveBeenCalledTimes(2)
      expect(result.current.data).toEqual([])
      expect(result.current.error).toBe(null)
    })
  })

  describe('Cache and State Management', () => {
    it('should cache data and avoid unnecessary requests', async () => {
      mockApiClient.getServices.mockResolvedValue([])

      const { result, rerender } = renderHook(() => useServices())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockApiClient.getServices).toHaveBeenCalledTimes(1)

      // Rerender with same parameters should not trigger new request
      rerender()

      expect(mockApiClient.getServices).toHaveBeenCalledTimes(1)
    })

    it('should invalidate cache when parameters change', async () => {
      mockApiClient.getServices.mockResolvedValue([])

      const { result, rerender } = renderHook(
        ({ search }) => useServices({ search }),
        { initialProps: { search: 'test1' } }
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockApiClient.getServices).toHaveBeenCalledWith({ search: 'test1' })

      // Change search parameter
      rerender({ search: 'test2' })

      await waitFor(() => {
        expect(mockApiClient.getServices).toHaveBeenCalledWith({ search: 'test2' })
      })

      expect(mockApiClient.getServices).toHaveBeenCalledTimes(2)
    })
  })
})