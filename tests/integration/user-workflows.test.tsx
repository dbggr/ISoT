/**
 * End-to-end tests for critical user workflows
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ServiceForm } from '@/components/services/service-form'
import { ServicesTable } from '@/components/services/services-table'
import { GroupForm } from '@/components/groups/group-form'
import { GroupsTable } from '@/components/groups/groups-table'
import { GlobalSearch } from '@/components/common/global-search'
import { useServices, useCreateService, useUpdateService, useDeleteService, useBulkServiceOperations } from '@/lib/hooks/use-services'
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup } from '@/lib/hooks/use-groups'
import { useToast } from '@/hooks/use-toast'
import { NetworkService, Group } from '@/lib/types'

// Mock all hooks
jest.mock('@/lib/hooks/use-services')
jest.mock('@/lib/hooks/use-groups')
jest.mock('@/hooks/use-toast')

const mockUseServices = useServices as jest.MockedFunction<typeof useServices>
const mockUseGroups = useGroups as jest.MockedFunction<typeof useGroups>
const mockUseCreateService = useCreateService as jest.MockedFunction<typeof useCreateService>
const mockUseUpdateService = useUpdateService as jest.MockedFunction<typeof useUpdateService>
const mockUseDeleteService = useDeleteService as jest.MockedFunction<typeof useDeleteService>
const mockUseBulkServiceOperations = useBulkServiceOperations as jest.MockedFunction<typeof useBulkServiceOperations>
const mockUseCreateGroup = useCreateGroup as jest.MockedFunction<typeof useCreateGroup>
const mockUseUpdateGroup = useUpdateGroup as jest.MockedFunction<typeof useUpdateGroup>
const mockUseDeleteGroup = useDeleteGroup as jest.MockedFunction<typeof useDeleteGroup>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

// Mock data
const mockGroups: Group[] = [
  {
    id: 'group-1',
    name: 'storage',
    description: 'Storage services',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'group-2',
    name: 'security',
    description: 'Security services',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

const mockServices: NetworkService[] = [
  {
    id: 'service-1',
    name: 'web-server-01',
    type: 'web',
    ip_addresses: ['192.168.1.10'],
    ports: [80, 443],
    vlan_id: 100,
    domain: 'example.com',
    group_id: 'group-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'service-2',
    name: 'db-server-01',
    type: 'database',
    ip_addresses: ['192.168.1.20'],
    ports: [3306],
    group_id: 'group-2',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  }
]

describe('Critical User Workflows', () => {
  beforeEach(() => {
    // Setup default mock returns
    mockUseGroups.mockReturnValue({
      data: mockGroups,
      loading: false,
      error: null,
      refetch: jest.fn(),
    })

    mockUseServices.mockReturnValue({
      data: mockServices,
      loading: false,
      error: null,
      refetch: jest.fn(),
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      }
    })

    mockUseCreateService.mockReturnValue({
      mutate: jest.fn(),
      loading: false,
      error: null,
      reset: jest.fn(),
    })

    mockUseUpdateService.mockReturnValue({
      mutate: jest.fn(),
      loading: false,
      error: null,
      reset: jest.fn(),
    })

    mockUseDeleteService.mockReturnValue({
      mutate: jest.fn(),
      loading: false,
      error: null,
      reset: jest.fn(),
    })

    mockUseBulkServiceOperations.mockReturnValue({
      bulkDelete: jest.fn(),
      bulkUpdateGroup: jest.fn(),
      loading: false,
      error: null,
      reset: jest.fn(),
    })

    mockUseCreateGroup.mockReturnValue({
      mutate: jest.fn(),
      loading: false,
      error: null,
      reset: jest.fn(),
    })

    mockUseUpdateGroup.mockReturnValue({
      mutate: jest.fn(),
      loading: false,
      error: null,
      reset: jest.fn(),
    })

    mockUseDeleteGroup.mockReturnValue({
      mutate: jest.fn(),
      loading: false,
      error: null,
      reset: jest.fn(),
    })

    mockUseToast.mockReturnValue({
      toast: jest.fn(),
      dismiss: jest.fn(),
      toasts: []
    })

    jest.clearAllMocks()
  })

  describe('Service Management Workflow', () => {
    it('should complete full service lifecycle: create, view, edit, delete', async () => {
      const user = userEvent.setup()
      
      // Step 1: Create a new service
      const mockCreateMutate = jest.fn().mockResolvedValue({
        id: 'new-service',
        name: 'api-server-01',
        type: 'api',
        ip_addresses: ['192.168.1.30'],
        ports: [8080],
        group_id: 'group-1',
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z'
      })

      mockUseCreateService.mockReturnValue({
        mutate: mockCreateMutate,
        loading: false,
        error: null,
        reset: jest.fn(),
      })

      const mockOnSuccess = jest.fn()
      render(<ServiceForm mode="create" onSuccess={mockOnSuccess} />)

      // Fill out the form
      await user.type(screen.getByLabelText(/service name/i), 'api-server-01')
      
      // Select service type
      const typeButton = screen.getByRole('combobox', { name: /service type/i })
      await user.click(typeButton)
      await user.click(screen.getByText('API'))

      // Fill IP address
      const ipInput = screen.getByPlaceholderText('192.168.1.100')
      await user.clear(ipInput)
      await user.type(ipInput, '192.168.1.30')

      // Update port
      const portInput = screen.getByDisplayValue('80')
      await user.clear(portInput)
      await user.type(portInput, '8080')

      // Select group
      const groupButton = screen.getByRole('combobox', { name: /group/i })
      await user.click(groupButton)
      await user.click(screen.getByText('storage'))

      // Submit form
      await user.click(screen.getByRole('button', { name: /create service/i }))

      await waitFor(() => {
        expect(mockCreateMutate).toHaveBeenCalledWith({
          name: 'api-server-01',
          type: 'api',
          ip_addresses: ['192.168.1.30'],
          ports: [8080],
          vlan_id: undefined,
          domain: '',
          group_id: 'group-1',
        })
      })

      expect(mockOnSuccess).toHaveBeenCalled()

      // Step 2: View service in table
      const updatedServices = [...mockServices, {
        id: 'new-service',
        name: 'api-server-01',
        type: 'api' as const,
        ip_addresses: ['192.168.1.30'],
        ports: [8080],
        group_id: 'group-1',
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z'
      }]

      mockUseServices.mockReturnValue({
        data: updatedServices,
        loading: false,
        error: null,
        refetch: jest.fn(),
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          totalPages: 1
        }
      })

      render(<ServicesTable />)
      expect(screen.getByText('api-server-01')).toBeInTheDocument()
      expect(screen.getByText('192.168.1.30')).toBeInTheDocument()

      // Step 3: Edit the service
      const mockUpdateMutate = jest.fn().mockResolvedValue({
        id: 'new-service',
        name: 'api-server-01-updated',
        type: 'api',
        ip_addresses: ['192.168.1.30'],
        ports: [8080],
        group_id: 'group-1',
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z'
      })

      mockUseUpdateService.mockReturnValue({
        mutate: mockUpdateMutate,
        loading: false,
        error: null,
        reset: jest.fn(),
      })

      const serviceToEdit = updatedServices[2]
      render(<ServiceForm mode="edit" service={serviceToEdit} onSuccess={jest.fn()} />)

      // Wait for form to populate
      await waitFor(() => {
        expect(screen.getByDisplayValue('api-server-01')).toBeInTheDocument()
      })

      // Update the name
      const nameInput = screen.getByDisplayValue('api-server-01')
      await user.clear(nameInput)
      await user.type(nameInput, 'api-server-01-updated')

      await user.click(screen.getByRole('button', { name: /update service/i }))

      await waitFor(() => {
        expect(mockUpdateMutate).toHaveBeenCalledWith({
          id: 'new-service',
          data: expect.objectContaining({
            name: 'api-server-01-updated',
          }),
        })
      })

      // Step 4: Delete the service
      const mockDeleteMutate = jest.fn().mockResolvedValue(undefined)
      mockUseDeleteService.mockReturnValue({
        mutate: mockDeleteMutate,
        loading: false,
        error: null,
        reset: jest.fn(),
      })

      render(<ServicesTable />)

      // Find and click delete action
      const actionButtons = screen.getAllByRole('button', { name: /open menu/i })
      await user.click(actionButtons[2]) // Third service (our new one)

      const deleteOption = screen.getByText('Delete')
      await user.click(deleteOption)

      // Confirm deletion
      const confirmButton = screen.getByText('Delete Service')
      await user.click(confirmButton)

      expect(mockDeleteMutate).toHaveBeenCalledWith('new-service')
    })

    it('should handle service creation with validation errors', async () => {
      const user = userEvent.setup()
      
      render(<ServiceForm mode="create" onSuccess={jest.fn()} />)

      // Try to submit without required fields
      await user.click(screen.getByRole('button', { name: /create service/i }))

      await waitFor(() => {
        expect(screen.getByText('Service name is required')).toBeInTheDocument()
        expect(screen.getByText('Group selection is required')).toBeInTheDocument()
      })

      // Fill invalid data
      await user.type(screen.getByLabelText(/service name/i), 'invalid name!')
      
      const ipInput = screen.getByPlaceholderText('192.168.1.100')
      await user.type(ipInput, '999.999.999.999')

      await user.click(screen.getByRole('button', { name: /create service/i }))

      await waitFor(() => {
        expect(screen.getByText(/only letters, numbers, underscores, and hyphens/i)).toBeInTheDocument()
        expect(screen.getByText('Invalid IP address format')).toBeInTheDocument()
      })
    })
  })

  describe('Group Management Workflow', () => {
    it('should complete full group lifecycle: create, view, edit, delete', async () => {
      const user = userEvent.setup()
      
      // Step 1: Create a new group
      const mockCreateMutate = jest.fn().mockResolvedValue({
        id: 'new-group',
        name: 'monitoring',
        description: 'Monitoring services',
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z'
      })

      mockUseCreateGroup.mockReturnValue({
        mutate: mockCreateMutate,
        loading: false,
        error: null,
        reset: jest.fn(),
      })

      const mockOnSuccess = jest.fn()
      render(<GroupForm mode="create" onSuccess={mockOnSuccess} />)

      await user.type(screen.getByLabelText(/group name/i), 'monitoring')
      await user.type(screen.getByLabelText(/description/i), 'Monitoring services')

      await user.click(screen.getByRole('button', { name: /create group/i }))

      await waitFor(() => {
        expect(mockCreateMutate).toHaveBeenCalledWith({
          name: 'monitoring',
          description: 'Monitoring services',
        })
      })

      expect(mockOnSuccess).toHaveBeenCalled()

      // Step 2: View group in table
      const updatedGroups = [...mockGroups, {
        id: 'new-group',
        name: 'monitoring',
        description: 'Monitoring services',
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z'
      }]

      mockUseGroups.mockReturnValue({
        data: updatedGroups,
        loading: false,
        error: null,
        refetch: jest.fn(),
      })

      render(<GroupsTable />)
      expect(screen.getByText('monitoring')).toBeInTheDocument()
      expect(screen.getByText('Monitoring services')).toBeInTheDocument()

      // Step 3: Edit the group
      const mockUpdateMutate = jest.fn().mockResolvedValue({
        id: 'new-group',
        name: 'monitoring-updated',
        description: 'Updated monitoring services',
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z'
      })

      mockUseUpdateGroup.mockReturnValue({
        mutate: mockUpdateMutate,
        loading: false,
        error: null,
        reset: jest.fn(),
      })

      const groupToEdit = updatedGroups[2]
      render(<GroupForm mode="edit" group={groupToEdit} onSuccess={jest.fn()} />)

      await waitFor(() => {
        expect(screen.getByDisplayValue('monitoring')).toBeInTheDocument()
      })

      const nameInput = screen.getByDisplayValue('monitoring')
      await user.clear(nameInput)
      await user.type(nameInput, 'monitoring-updated')

      const descInput = screen.getByDisplayValue('Monitoring services')
      await user.clear(descInput)
      await user.type(descInput, 'Updated monitoring services')

      await user.click(screen.getByRole('button', { name: /update group/i }))

      await waitFor(() => {
        expect(mockUpdateMutate).toHaveBeenCalledWith({
          id: 'new-group',
          data: {
            name: 'monitoring-updated',
            description: 'Updated monitoring services',
          },
        })
      })

      // Step 4: Delete the group
      const mockDeleteMutate = jest.fn().mockResolvedValue(undefined)
      mockUseDeleteGroup.mockReturnValue({
        mutate: mockDeleteMutate,
        loading: false,
        error: null,
        reset: jest.fn(),
      })

      render(<GroupsTable />)

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i })
      await user.click(actionButtons[2]) // Third group (our new one)

      const deleteOption = screen.getByText('Delete')
      await user.click(deleteOption)

      const confirmButton = screen.getByText('Delete Group')
      await user.click(confirmButton)

      expect(mockDeleteMutate).toHaveBeenCalledWith('new-group')
    })
  })

  describe('Bulk Operations Workflow', () => {
    it('should perform bulk service operations', async () => {
      const user = userEvent.setup()
      const mockBulkDelete = jest.fn().mockResolvedValue(undefined)
      const mockBulkUpdateGroup = jest.fn().mockResolvedValue(undefined)

      mockUseBulkServiceOperations.mockReturnValue({
        bulkDelete: mockBulkDelete,
        bulkUpdateGroup: mockBulkUpdateGroup,
        loading: false,
        error: null,
        reset: jest.fn(),
      })

      render(<ServicesTable />)

      // Step 1: Select multiple services
      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1]) // First service
      await user.click(checkboxes[2]) // Second service

      expect(screen.getByText('2 selected')).toBeInTheDocument()

      // Step 2: Bulk group update
      const bulkActionsButton = screen.getByText('Bulk Actions')
      await user.click(bulkActionsButton)

      const moveToGroupOption = screen.getByText('Move to Group:')
      expect(moveToGroupOption).toBeInTheDocument()

      const securityGroupOption = screen.getByText('Security')
      await user.click(securityGroupOption)

      expect(mockBulkUpdateGroup).toHaveBeenCalledWith(['service-1', 'service-2'], 'group-2')

      // Step 3: Bulk delete
      await user.click(bulkActionsButton)
      const deleteOption = screen.getByText('Delete Selected')
      await user.click(deleteOption)

      const confirmButton = screen.getByText('Delete')
      await user.click(confirmButton)

      expect(mockBulkDelete).toHaveBeenCalledWith(['service-1', 'service-2'])
    })

    it('should handle bulk operation errors gracefully', async () => {
      const user = userEvent.setup()
      const mockBulkDelete = jest.fn().mockRejectedValue(new Error('Bulk delete failed'))
      const mockToast = jest.fn()

      mockUseBulkServiceOperations.mockReturnValue({
        bulkDelete: mockBulkDelete,
        bulkUpdateGroup: jest.fn(),
        loading: false,
        error: 'Bulk delete failed',
        reset: jest.fn(),
      })

      mockUseToast.mockReturnValue({
        toast: mockToast,
        dismiss: jest.fn(),
        toasts: []
      })

      render(<ServicesTable />)

      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1])

      const bulkActionsButton = screen.getByText('Bulk Actions')
      await user.click(bulkActionsButton)

      const deleteOption = screen.getByText('Delete Selected')
      await user.click(deleteOption)

      const confirmButton = screen.getByText('Delete')
      await user.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText('Bulk delete failed')).toBeInTheDocument()
      })
    })
  })

  describe('Search and Filter Workflow', () => {
    it('should search and filter services effectively', async () => {
      const user = userEvent.setup()
      
      render(<ServicesTable />)

      // Step 1: Search by name
      const searchInput = screen.getByPlaceholderText('Search services...')
      await user.type(searchInput, 'web')

      expect(searchInput).toHaveValue('web')

      // Step 2: Filter by type
      const typeFilter = screen.getByDisplayValue('All Types')
      await user.selectOptions(typeFilter, 'web')

      expect(typeFilter).toHaveValue('web')

      // Step 3: Filter by group
      const groupFilter = screen.getByDisplayValue('All Groups')
      await user.selectOptions(groupFilter, 'group-1')

      expect(groupFilter).toHaveValue('group-1')

      // Step 4: Clear filters
      const clearButton = screen.getByText('Clear')
      await user.click(clearButton)

      expect(searchInput).toHaveValue('')
      expect(typeFilter).toHaveValue('')
      expect(groupFilter).toHaveValue('')
    })

    it('should use global search across services and groups', async () => {
      const user = userEvent.setup()
      
      render(<GlobalSearch />)

      const searchInput = screen.getByRole('searchbox')
      await user.type(searchInput, 'web')

      expect(searchInput).toHaveValue('web')

      // Should show search results (mocked data would be filtered)
      await waitFor(() => {
        expect(searchInput).toHaveAttribute('aria-expanded', 'true')
      })
    })
  })

  describe('Error Handling Workflow', () => {
    it('should handle API errors gracefully', async () => {
      const user = userEvent.setup()
      const mockRefetch = jest.fn()

      mockUseServices.mockReturnValue({
        data: [],
        loading: false,
        error: 'Failed to load services',
        refetch: mockRefetch,
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      })

      render(<ServicesTable />)

      expect(screen.getByText(/error loading services/i)).toBeInTheDocument()

      const retryButton = screen.getByText('Try Again')
      await user.click(retryButton)

      expect(mockRefetch).toHaveBeenCalled()
    })

    it('should handle form submission errors', async () => {
      const user = userEvent.setup()
      const mockCreateMutate = jest.fn().mockRejectedValue(new Error('Validation failed'))

      mockUseCreateService.mockReturnValue({
        mutate: mockCreateMutate,
        loading: false,
        error: 'Validation failed',
        reset: jest.fn(),
      })

      render(<ServiceForm mode="create" onSuccess={jest.fn()} />)

      await user.type(screen.getByLabelText(/service name/i), 'test-service')
      await user.type(screen.getByPlaceholderText('192.168.1.100'), '192.168.1.100')

      const groupButton = screen.getByRole('combobox', { name: /group/i })
      await user.click(groupButton)
      await user.click(screen.getByText('storage'))

      await user.click(screen.getByRole('button', { name: /create service/i }))

      await waitFor(() => {
        expect(screen.getByText('Validation failed')).toBeInTheDocument()
      })
    })
  })

  describe('Loading States Workflow', () => {
    it('should show loading states during operations', async () => {
      const user = userEvent.setup()

      // Test loading state for services table
      mockUseServices.mockReturnValue({
        data: [],
        loading: true,
        error: null,
        refetch: jest.fn(),
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      })

      render(<ServicesTable />)
      expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)

      // Test loading state for form submission
      mockUseCreateService.mockReturnValue({
        mutate: jest.fn(),
        loading: true,
        error: null,
        reset: jest.fn(),
      })

      render(<ServiceForm mode="create" onSuccess={jest.fn()} />)

      const submitButton = screen.getByRole('button', { name: /creating.../i })
      expect(submitButton).toBeDisabled()
    })
  })
})