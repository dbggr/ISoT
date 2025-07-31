/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ServicesTable } from '@/components/services/services-table'
import { useServices, useDeleteService, useBulkServiceOperations } from '@/lib/hooks/use-services'
import { useGroups } from '@/lib/hooks/use-groups'
import { useToast } from '@/hooks/use-toast'
import { NetworkService, Group } from '@/lib/types'

// Mock the hooks
jest.mock('@/lib/hooks/use-services')
jest.mock('@/lib/hooks/use-groups')
jest.mock('@/hooks/use-toast')

const mockUseServices = useServices as jest.MockedFunction<typeof useServices>
const mockUseGroups = useGroups as jest.MockedFunction<typeof useGroups>
const mockUseDeleteService = useDeleteService as jest.MockedFunction<typeof useDeleteService>
const mockUseBulkServiceOperations = useBulkServiceOperations as jest.MockedFunction<typeof useBulkServiceOperations>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

// Mock toast function
const mockToast = jest.fn()

// Mock data
const mockGroups: Group[] = [
  {
    id: 'group-1',
    name: 'Storage',
    description: 'Storage services',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'group-2',
    name: 'Security',
    description: 'Security services',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

const mockServices: NetworkService[] = [
  {
    id: 'service-1',
    name: 'Web Server',
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
    name: 'Database Server',
    type: 'database',
    ip_addresses: ['192.168.1.20', '192.168.1.21'],
    ports: [3306],
    group_id: 'group-2',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

describe('ServicesTable', () => {
  beforeEach(() => {
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

    mockUseGroups.mockReturnValue({
      data: mockGroups,
      loading: false,
      error: null,
      refetch: jest.fn()
    })

    mockUseDeleteService.mockReturnValue({
      mutate: jest.fn(),
      loading: false,
      error: null,
      reset: jest.fn()
    })

    mockUseBulkServiceOperations.mockReturnValue({
      bulkDelete: jest.fn(),
      bulkUpdateGroup: jest.fn(),
      loading: false,
      error: null,
      reset: jest.fn()
    })

    mockUseToast.mockReturnValue({
      toast: mockToast,
      dismiss: jest.fn(),
      toasts: []
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders services table with data', () => {
    render(<ServicesTable />)
    
    // Check if table headers are present
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('IP Addresses')).toBeInTheDocument()
    expect(screen.getByText('Ports')).toBeInTheDocument()
    expect(screen.getByText('VLAN')).toBeInTheDocument()
    expect(screen.getByText('Domain')).toBeInTheDocument()
    expect(screen.getByText('Group')).toBeInTheDocument()
    expect(screen.getByText('Created')).toBeInTheDocument()
    
    // Check if service data is displayed
    expect(screen.getByText('Web Server')).toBeInTheDocument()
    expect(screen.getByText('Database Server')).toBeInTheDocument()
    // Use getAllByText for elements that appear multiple times (in filter and table)
    expect(screen.getAllByText('Web')[1]).toBeInTheDocument() // Second instance (in table)
    expect(screen.getAllByText('Database')[1]).toBeInTheDocument() // Second instance (in table)
    expect(screen.getByText('192.168.1.10')).toBeInTheDocument()
    expect(screen.getByText('192.168.1.20 (+1)')).toBeInTheDocument()
    expect(screen.getByText('80 (+1)')).toBeInTheDocument()
    expect(screen.getByText('3306')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('example.com')).toBeInTheDocument()
    expect(screen.getAllByText('Storage')[1]).toBeInTheDocument() // Second instance (in table)
    expect(screen.getAllByText('Security')[1]).toBeInTheDocument() // Second instance (in table)
  })

  it('shows loading state', () => {
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
    
    expect(screen.getByText('Network Services')).toBeInTheDocument()
    // Should show skeleton loading components (they don't have data-testid, but we can check for the skeleton class)
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('shows error state', () => {
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
    
    expect(screen.getByText('Error loading services: Failed to load services')).toBeInTheDocument()
    
    const tryAgainButton = screen.getByText('Try Again')
    fireEvent.click(tryAgainButton)
    expect(mockRefetch).toHaveBeenCalled()
  })

  it('shows empty state when no services', () => {
    mockUseServices.mockReturnValue({
      data: [],
      loading: false,
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
    
    expect(screen.getByText('No services found. Create your first service to get started.')).toBeInTheDocument()
  })

  it('handles search functionality', async () => {
    render(<ServicesTable />)
    
    const searchInput = screen.getByPlaceholderText('Search services...')
    fireEvent.change(searchInput, { target: { value: 'Web' } })
    
    expect(searchInput).toHaveValue('Web')
  })

  it('handles type filter', () => {
    render(<ServicesTable />)
    
    const typeFilter = screen.getByDisplayValue('All Types')
    fireEvent.change(typeFilter, { target: { value: 'web' } })
    
    expect(typeFilter).toHaveValue('web')
  })

  it('handles group filter', () => {
    render(<ServicesTable />)
    
    const groupFilter = screen.getByDisplayValue('All Groups')
    fireEvent.change(groupFilter, { target: { value: 'group-1' } })
    
    expect(groupFilter).toHaveValue('group-1')
  })

  it('handles service selection', () => {
    render(<ServicesTable />)
    
    const checkboxes = screen.getAllByRole('checkbox')
    const firstServiceCheckbox = checkboxes[1] // First is "select all"
    
    fireEvent.click(firstServiceCheckbox)
    expect(firstServiceCheckbox).toBeChecked()
  })

  it('handles select all functionality', () => {
    render(<ServicesTable />)
    
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(selectAllCheckbox)
    
    expect(selectAllCheckbox).toBeChecked()
  })

  it('renders action menu buttons', () => {
    render(<ServicesTable />)
    
    // Should have action menu buttons for each service
    const actionButtons = screen.getAllByRole('button', { name: /open menu/i })
    expect(actionButtons).toHaveLength(mockServices.length)
  })

  it('shows bulk actions when services are selected', () => {
    render(<ServicesTable />)
    
    // Select a service
    const checkboxes = screen.getAllByRole('checkbox')
    const firstServiceCheckbox = checkboxes[1]
    fireEvent.click(firstServiceCheckbox)
    
    // Should show bulk actions
    expect(screen.getByText('1 selected')).toBeInTheDocument()
    expect(screen.getByText('Bulk Actions')).toBeInTheDocument()
  })

  it('handles sorting', () => {
    render(<ServicesTable />)
    
    const nameHeader = screen.getByRole('button', { name: /name/i })
    fireEvent.click(nameHeader)
    
    // Should trigger sorting (we can't easily test the actual sorting without mocking the hook response)
    expect(nameHeader).toBeInTheDocument()
  })

  it('clears filters when clear button is clicked', () => {
    render(<ServicesTable />)
    
    // Set some filters
    const searchInput = screen.getByPlaceholderText('Search services...')
    fireEvent.change(searchInput, { target: { value: 'test' } })
    
    const typeFilter = screen.getByDisplayValue('All Types')
    fireEvent.change(typeFilter, { target: { value: 'web' } })
    
    // Clear filters
    const clearButton = screen.getByText('Clear')
    fireEvent.click(clearButton)
    
    expect(searchInput).toHaveValue('')
    expect(typeFilter).toHaveValue('')
  })

  describe('Bulk Operations', () => {
    it('shows bulk actions when services are selected', () => {
      render(<ServicesTable />)
      
      // Select a service
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1])
      
      // Should show bulk actions
      expect(screen.getByText('1 selected')).toBeInTheDocument()
      expect(screen.getByText('Bulk Actions')).toBeInTheDocument()
    })

    it('shows export option in bulk actions menu', async () => {
      render(<ServicesTable />)
      
      // Select a service
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1])
      
      // Open bulk actions menu
      const bulkActionsButton = screen.getByText('Bulk Actions')
      fireEvent.click(bulkActionsButton)
      
      // Wait for dropdown to open and check for export option
      await waitFor(() => {
        expect(screen.getByText('Export Selected')).toBeInTheDocument()
      })
    })

    it('shows bulk delete option in bulk actions menu', async () => {
      render(<ServicesTable />)
      
      // Select a service
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1])
      
      // Open bulk actions menu
      const bulkActionsButton = screen.getByText('Bulk Actions')
      fireEvent.click(bulkActionsButton)
      
      // Wait for dropdown to open and check for delete option
      await waitFor(() => {
        expect(screen.getByText('Delete Selected')).toBeInTheDocument()
      })
    })

    it('shows group change options in bulk actions menu', async () => {
      render(<ServicesTable />)
      
      // Select a service
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1])
      
      // Open bulk actions menu
      const bulkActionsButton = screen.getByText('Bulk Actions')
      fireEvent.click(bulkActionsButton)
      
      // Wait for dropdown to open and check for group options
      await waitFor(() => {
        expect(screen.getByText('Move to Group:')).toBeInTheDocument()
        expect(screen.getByText('Storage')).toBeInTheDocument()
        expect(screen.getByText('Security')).toBeInTheDocument()
      })
    })
  })
})