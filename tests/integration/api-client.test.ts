/**
 * Integration tests for API client functionality
 */

import { ApiClient, ApiClientError } from '../../lib/api'
import { NetworkService, Group, CreateServiceData, UpdateServiceData } from '../../lib/types'

// Mock fetch for testing
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('API Client Integration Tests', () => {
  let apiClient: ApiClient

  beforeEach(() => {
    apiClient = new ApiClient()
    jest.clearAllMocks()
  })

  describe('Services API', () => {
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

    describe('getServices', () => {
      it('should fetch services successfully', async () => {
        const mockResponse = {
          data: [mockService],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1
          }
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        } as Response)

        const result = await apiClient.getServices()

        expect(mockFetch).toHaveBeenCalledWith('/api/services', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: expect.any(AbortSignal),
        })
        expect(result).toEqual([mockService])
      })

      it('should handle query parameters', async () => {
        const mockResponse = { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } }
        
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        } as Response)

        const params = { page: 2, limit: 20, search: 'test', type: 'web' as const }
        await apiClient.getServices(params)

        expect(mockFetch).toHaveBeenCalledWith(
          '/api/services?page=2&limit=20&search=test&type=web',
          expect.any(Object)
        )
      })

      it('should handle API errors', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Internal server error' }),
        } as Response)

        await expect(apiClient.getServices()).rejects.toThrow(ApiClientError)
      })

      it('should handle network errors', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'))

        await expect(apiClient.getServices()).rejects.toThrow('Network error')
      })
    })

    describe('getService', () => {
      it('should fetch single service successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: mockService }),
        } as Response)

        const result = await apiClient.getService('service-1')

        expect(mockFetch).toHaveBeenCalledWith('/api/services/service-1', expect.any(Object))
        expect(result).toEqual(mockService)
      })

      it('should handle 404 errors', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ error: 'Service not found' }),
        } as Response)

        await expect(apiClient.getService('nonexistent')).rejects.toThrow(ApiClientError)
      })
    })

    describe('createService', () => {
      it('should create service successfully', async () => {
        const createData: CreateServiceData = {
          name: 'New Service',
          type: 'web',
          ip_addresses: ['192.168.1.2'],
          ports: [80],
          group_id: 'group-1'
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => ({ data: { ...mockService, ...createData } }),
        } as Response)

        const result = await apiClient.createService(createData)

        expect(mockFetch).toHaveBeenCalledWith('/api/services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createData),
          signal: expect.any(AbortSignal),
        })
        expect(result.name).toBe(createData.name)
      })

      it('should handle validation errors', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ 
            error: 'Validation failed',
            details: { name: 'Name is required' }
          }),
        } as Response)

        const invalidData = {} as CreateServiceData

        await expect(apiClient.createService(invalidData)).rejects.toThrow(ApiClientError)
      })
    })

    describe('updateService', () => {
      it('should update service successfully', async () => {
        const updateData: UpdateServiceData = { name: 'Updated Service' }
        const updatedService = { ...mockService, ...updateData }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: updatedService }),
        } as Response)

        const result = await apiClient.updateService('service-1', updateData)

        expect(mockFetch).toHaveBeenCalledWith('/api/services/service-1', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
          signal: expect.any(AbortSignal),
        })
        expect(result.name).toBe(updateData.name)
      })
    })

    describe('deleteService', () => {
      it('should delete service successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 204,
          json: async () => ({}),
        } as Response)

        await apiClient.deleteService('service-1')

        expect(mockFetch).toHaveBeenCalledWith('/api/services/service-1', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: expect.any(AbortSignal),
        })
      })
    })
  })

  describe('Groups API', () => {
    const mockGroup: Group = {
      id: 'group-1',
      name: 'Test Group',
      description: 'Test group description',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    describe('getGroups', () => {
      it('should fetch groups successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: [mockGroup] }),
        } as Response)

        const result = await apiClient.getGroups()

        expect(mockFetch).toHaveBeenCalledWith('/api/groups', expect.any(Object))
        expect(result).toEqual([mockGroup])
      })
    })

    describe('createGroup', () => {
      it('should create group successfully', async () => {
        const createData = {
          name: 'New Group',
          description: 'New group description'
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => ({ data: { ...mockGroup, ...createData } }),
        } as Response)

        const result = await apiClient.createGroup(createData)

        expect(mockFetch).toHaveBeenCalledWith('/api/groups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createData),
          signal: expect.any(AbortSignal),
        })
        expect(result.name).toBe(createData.name)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle timeout errors', async () => {
      const timeoutClient = new ApiClient({ timeout: 100 })
      
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 200))
      )

      await expect(timeoutClient.getServices()).rejects.toThrow('Request timeout')
    })

    it('should retry failed requests', async () => {
      const retryClient = new ApiClient({ retries: 2 })
      
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: [] }),
        } as Response)

      const result = await retryClient.getServices()

      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(result).toEqual([])
    })

    it('should not retry on 4xx errors', async () => {
      const retryClient = new ApiClient({ retries: 2 })
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad request' }),
      } as Response)

      await expect(retryClient.getServices()).rejects.toThrow(ApiClientError)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('Request Cancellation', () => {
    it('should cancel requests when abort signal is triggered', async () => {
      const controller = new AbortController()
      
      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(new Error('Request aborted'))
          })
        })
      )

      const requestPromise = apiClient.getServices()
      controller.abort()

      await expect(requestPromise).rejects.toThrow('Request aborted')
    })
  })
})