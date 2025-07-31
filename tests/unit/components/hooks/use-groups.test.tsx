/**
 * Tests for groups hooks
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { 
  useGroups, 
  useGroup, 
  useGroupServices,
  useCreateGroup, 
  useUpdateGroup, 
  useDeleteGroup,
  useGroupDeletionCheck 
} from '../../../../lib/hooks/use-groups'
import { apiClient } from '../../../../lib/api'
import { Group, NetworkService, CreateGroupData, UpdateGroupData } from '../../../../lib/types'

// Mock the API client
jest.mock('../../../../lib/api', () => ({
  apiClient: {
    getGroups: jest.fn(),
    getGroup: jest.fn(),
    getGroupServices: jest.fn(),
    createGroup: jest.fn(),
    updateGroup: jest.fn(),
    deleteGroup: jest.fn(),
  },
  getErrorMessage: jest.fn((error) => error.message || 'Unknown error'),
}))

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Mock data
const mockGroup: Group = {
  id: 'group-1',
  name: 'Test Group',
  description: 'A test group',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

const mockGroups: Group[] = [mockGroup]

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

describe('useGroups', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch groups successfully', async () => {
    mockApiClient.getGroups.mockResolvedValue(mockGroups)

    const { result } = renderHook(() => useGroups())

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toEqual([])
    expect(result.current.error).toBe(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockGroups)
    expect(result.current.error).toBe(null)
    expect(mockApiClient.getGroups).toHaveBeenCalledWith()
  })

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch groups'
    mockApiClient.getGroups.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useGroups())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual([])
    expect(result.current.error).toBe(errorMessage)
  })

  it('should refetch data when refetch is called', async () => {
    mockApiClient.getGroups.mockResolvedValue(mockGroups)

    const { result } = renderHook(() => useGroups())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockApiClient.getGroups).toHaveBeenCalledTimes(1)

    await act(async () => {
      await result.current.refetch()
    })

    expect(mockApiClient.getGroups).toHaveBeenCalledTimes(2)
  })
})

describe('useGroup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch single group successfully', async () => {
    mockApiClient.getGroup.mockResolvedValue(mockGroup)

    const { result } = renderHook(() => useGroup('group-1'))

    expect(result.current.loading).toBe(true)
    expect(result.current.group).toBe(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.group).toEqual(mockGroup)
    expect(result.current.error).toBe(null)
    expect(mockApiClient.getGroup).toHaveBeenCalledWith('group-1')
  })

  it('should handle fetch error', async () => {
    const errorMessage = 'Group not found'
    mockApiClient.getGroup.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useGroup('group-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.group).toBe(null)
    expect(result.current.error).toBe(errorMessage)
  })

  it('should not fetch when id is empty', async () => {
    const { result } = renderHook(() => useGroup(''))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockApiClient.getGroup).not.toHaveBeenCalled()
  })
})

describe('useGroupServices', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch group services successfully', async () => {
    mockApiClient.getGroupServices.mockResolvedValue(mockServices)

    const { result } = renderHook(() => useGroupServices('group-1'))

    expect(result.current.loading).toBe(true)
    expect(result.current.services).toEqual([])

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.services).toEqual(mockServices)
    expect(result.current.error).toBe(null)
    expect(mockApiClient.getGroupServices).toHaveBeenCalledWith('group-1')
  })

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch group services'
    mockApiClient.getGroupServices.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useGroupServices('group-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.services).toEqual([])
    expect(result.current.error).toBe(errorMessage)
  })
})

describe('useCreateGroup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create group successfully', async () => {
    mockApiClient.createGroup.mockResolvedValue(mockGroup)

    const { result } = renderHook(() => useCreateGroup())

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)

    const createData: CreateGroupData = {
      name: 'New Group',
      description: 'A new group'
    }

    let createdGroup: Group | undefined

    await act(async () => {
      createdGroup = await result.current.mutate(createData)
    })

    expect(createdGroup).toEqual(mockGroup)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(mockApiClient.createGroup).toHaveBeenCalledWith(createData)
  })

  it('should handle create error', async () => {
    const errorMessage = 'Group name already exists'
    mockApiClient.createGroup.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useCreateGroup())

    const createData: CreateGroupData = {
      name: 'Existing Group'
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
    const { result } = renderHook(() => useCreateGroup())

    act(() => {
      result.current.reset()
    })

    expect(result.current.error).toBe(null)
    expect(result.current.loading).toBe(false)
  })
})

describe('useUpdateGroup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update group successfully', async () => {
    const updatedGroup = { ...mockGroup, name: 'Updated Group' }
    mockApiClient.updateGroup.mockResolvedValue(updatedGroup)

    const { result } = renderHook(() => useUpdateGroup())

    const updateData: UpdateGroupData = { name: 'Updated Group' }

    let updated: Group | undefined

    await act(async () => {
      updated = await result.current.mutate({ id: 'group-1', data: updateData })
    })

    expect(updated).toEqual(updatedGroup)
    expect(mockApiClient.updateGroup).toHaveBeenCalledWith('group-1', updateData)
  })
})

describe('useDeleteGroup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should delete group successfully', async () => {
    mockApiClient.deleteGroup.mockResolvedValue(undefined)

    const { result } = renderHook(() => useDeleteGroup())

    await act(async () => {
      await result.current.mutate('group-1')
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(mockApiClient.deleteGroup).toHaveBeenCalledWith('group-1')
  })
})

describe('useGroupDeletionCheck', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should allow deletion when no services are associated', async () => {
    mockApiClient.getGroupServices.mockResolvedValue([])

    const { result } = renderHook(() => useGroupDeletionCheck('group-1'))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.canDelete).toBe(true)
    expect(result.current.associatedServices).toEqual([])
    expect(result.current.error).toBe(null)
  })

  it('should prevent deletion when services are associated', async () => {
    mockApiClient.getGroupServices.mockResolvedValue(mockServices)

    const { result } = renderHook(() => useGroupDeletionCheck('group-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.canDelete).toBe(false)
    expect(result.current.associatedServices).toEqual(mockServices)
    expect(result.current.error).toBe(null)
  })

  it('should handle error during deletion check', async () => {
    const errorMessage = 'Failed to check group services'
    mockApiClient.getGroupServices.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useGroupDeletionCheck('group-1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.canDelete).toBe(false)
    expect(result.current.associatedServices).toEqual([])
    expect(result.current.error).toBe(errorMessage)
  })
})