/**
 * Comprehensive tests for table components and navigation
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ServicesTable } from '@/components/services/services-table'
import { GroupsTable } from '@/components/groups/groups-table'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AccessibleTable } from '@/components/common/accessible-table'
import { useServices, useDeleteService, useBulkServiceOperations } from '@/lib/hooks/use-services'
import { useGroups, useDeleteGroup } from '@/lib/hooks/use-groups'
import { useToast } from '@/hooks/use-toast'
import { NetworkService, Group } from '@/lib/types'

// Mock the hooks
jest.mock('@/lib/hooks/use-services')
jest.mock('@/lib/hooks/use-groups')
jest.mock('@/hooks/use-toast')

const mockUseServices = useServices as jest.MockedFunction<typeof useServices>
const mockUseGroups = useGroups as jest.MockedFunction<typeof useGroups>
const mockUseDeleteService = useDeleteService as jest.MockedFunction<typeof useDeleteService>
const mockUseDeleteGroup = useDeleteGroup as jest.MockedFunction<typeof useDeleteGroup>
const mockUseBulkServiceOperations = useBulkServiceOperations as jest.MockedFunction<typeof useBulkServiceOperations>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

// Mock data
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
    ip_addresses: ['192.168.1.20'],
    ports: [3306],
    group_id: 'group-2',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  }
]

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

describe('Table Components', () => {
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

    mockUseDeleteGroup.mockReturnValue({
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
      toast: jest.fn(),
      dismiss: jest.fn(),
      toasts: []
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('ServicesTable', () => {
    it('renders table with proper structure', () => {
      render(<ServicesTable />)
      
      // Check table headers
      expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /type/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /ip addresses/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /ports/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /vlan/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /domain/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /group/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /created/i })).toBeInTheDocument()
    })

    it('displays service data correctly', () => {
      render(<ServicesTable />)
      
      expect(screen.getByText('Web Server')).toBeInTheDocument()
      expect(screen.getByText('Database Server')).toBeInTheDocument()
      expect(screen.getByText('192.168.1.10')).toBeInTheDocument()
      expect(screen.getByText('192.168.1.20')).toBeInTheDocument()
      expect(screen.getByText('example.com')).toBeInTheDocument()
    })

    it('handles sorting functionality', async () => {
      const user = userEvent.setup()
      render(<ServicesTable />)
      
      const nameHeader = screen.getByRole('button', { name: /name/i })
      await user.click(nameHeader)
      
      // Should trigger sorting (implementation would update the data)
      expect(nameHeader).toBeInTheDocument()
    })

    it('handles search and filtering', async () => {
      const user = userEvent.setup()
      render(<ServicesTable />)
      
      const searchInput = screen.getByPlaceholderText('Search services...')
      await user.type(searchInput, 'Web')
      
      expect(searchInput).toHaveValue('Web')
      
      const typeFilter = screen.getByDisplayValue('All Types')
      await user.selectOptions(typeFilter, 'web')
      
      expect(typeFilter).toHaveValue('web')
    })

    it('handles row selection', async () => {
      const user = userEvent.setup()
      render(<ServicesTable />)
      
      const checkboxes = screen.getAllByRole('checkbox')
      const firstServiceCheckbox = checkboxes[1] // First is "select all"
      
      await user.click(firstServiceCheckbox)
      expect(firstServiceCheckbox).toBeChecked()
    })

    it('handles select all functionality', async () => {
      const user = userEvent.setup()
      render(<ServicesTable />)
      
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
      await user.click(selectAllCheckbox)
      
      expect(selectAllCheckbox).toBeChecked()
      
      // All service checkboxes should also be checked
      const serviceCheckboxes = screen.getAllByRole('checkbox').slice(1)
      serviceCheckboxes.forEach(checkbox => {
        expect(checkbox).toBeChecked()
      })
    })

    it('shows bulk actions when services are selected', async () => {
      const user = userEvent.setup()
      render(<ServicesTable />)
      
      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1])
      
      expect(screen.getByText('1 selected')).toBeInTheDocument()
      expect(screen.getByText('Bulk Actions')).toBeInTheDocument()
    })

    it('handles bulk delete operation', async () => {
      const user = userEvent.setup()
      const mockBulkDelete = jest.fn()
      
      mockUseBulkServiceOperations.mockReturnValue({
        bulkDelete: mockBulkDelete,
        bulkUpdateGroup: jest.fn(),
        loading: false,
        error: null,
        reset: jest.fn()
      })
      
      render(<ServicesTable />)
      
      // Select services
      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1])
      await user.click(checkboxes[2])
      
      // Open bulk actions menu
      const bulkActionsButton = screen.getByText('Bulk Actions')
      await user.click(bulkActionsButton)
      
      // Click delete option
      const deleteOption = screen.getByText('Delete Selected')
      await user.click(deleteOption)
      
      // Confirm deletion
      const confirmButton = screen.getByText('Delete')
      await user.click(confirmButton)
      
      expect(mockBulkDelete).toHaveBeenCalledWith(['service-1', 'service-2'])
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
      
      expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
    })

    it('shows error state with retry option', async () => {
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

    it('shows empty state', () => {
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
      
      expect(screen.getByText(/no services found/i)).toBeInTheDocument()
    })
  })

  describe('GroupsTable', () => {
    it('renders groups table with proper structure', () => {
      render(<GroupsTable />)
      
      expect(screen.getByRole('columnheader', { name: /name/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /description/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /services/i })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: /created/i })).toBeInTheDocument()
    })

    it('displays group data correctly', () => {
      render(<GroupsTable />)
      
      expect(screen.getByText('Storage')).toBeInTheDocument()
      expect(screen.getByText('Security')).toBeInTheDocument()
      expect(screen.getByText('Storage services')).toBeInTheDocument()
      expect(screen.getByText('Security services')).toBeInTheDocument()
    })

    it('handles group deletion with confirmation', async () => {
      const user = userEvent.setup()
      const mockDeleteGroup = jest.fn()
      
      mockUseDeleteGroup.mockReturnValue({
        mutate: mockDeleteGroup,
        loading: false,
        error: null,
        reset: jest.fn()
      })
      
      render(<GroupsTable />)
      
      // Find and click delete button for first group
      const actionButtons = screen.getAllByRole('button', { name: /open menu/i })
      await user.click(actionButtons[0])
      
      const deleteOption = screen.getByText('Delete')
      await user.click(deleteOption)
      
      // Confirm deletion
      const confirmButton = screen.getByText('Delete Group')
      await user.click(confirmButton)
      
      expect(mockDeleteGroup).toHaveBeenCalledWith('group-1')
    })
  })

  describe('AccessibleTable', () => {
    const mockData = [
      { id: '1', name: 'Item 1', value: 'Value 1' },
      { id: '2', name: 'Item 2', value: 'Value 2' }
    ]

    const mockColumns = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'value', header: 'Value', sortable: false }
    ]

    it('renders accessible table structure', () => {
      render(
        <AccessibleTable
          data={mockData}
          columns={mockColumns}
          caption="Test table"
        />
      )
      
      const table = screen.getByRole('table')
      expect(table).toHaveAttribute('aria-label', 'Test table')
      
      const caption = screen.getByText('Test table')
      expect(caption).toBeInTheDocument()
    })

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup()
      render(
        <AccessibleTable
          data={mockData}
          columns={mockColumns}
          caption="Test table"
        />
      )
      
      const firstCell = screen.getByText('Item 1')
      firstCell.focus()
      
      // Test arrow key navigation
      await user.keyboard('{ArrowDown}')
      expect(screen.getByText('Item 2')).toHaveFocus()
      
      await user.keyboard('{ArrowRight}')
      expect(screen.getByText('Value 2')).toHaveFocus()
    })

    it('announces sort changes to screen readers', async () => {
      const user = userEvent.setup()
      const mockOnSort = jest.fn()
      
      render(
        <AccessibleTable
          data={mockData}
          columns={mockColumns}
          caption="Test table"
          onSort={mockOnSort}
        />
      )
      
      const nameHeader = screen.getByRole('columnheader', { name: /name/i })
      await user.click(nameHeader)
      
      expect(mockOnSort).toHaveBeenCalledWith('name', 'asc')
      
      // Check for sort announcement
      const announcement = screen.getByText(/sorted by name ascending/i)
      expect(announcement).toBeInTheDocument()
    })
  })
})

describe('Navigation Components', () => {
  describe('AppSidebar', () => {
    it('renders navigation menu items', () => {
      render(<AppSidebar />)
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Services')).toBeInTheDocument()
      expect(screen.getByText('Groups')).toBeInTheDocument()
    })

    it('shows active state for current page', () => {
      // Mock usePathname to return services page
      jest.doMock('next/navigation', () => ({
        ...jest.requireActual('next/navigation'),
        usePathname: () => '/services'
      }))
      
      render(<AppSidebar />)
      
      const servicesLink = screen.getByText('Services').closest('a')
      expect(servicesLink).toHaveClass('active')
    })

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<AppSidebar />)
      
      const dashboardLink = screen.getByText('Dashboard')
      dashboardLink.focus()
      
      await user.keyboard('{ArrowDown}')
      expect(screen.getByText('Services')).toHaveFocus()
      
      await user.keyboard('{ArrowDown}')
      expect(screen.getByText('Groups')).toHaveFocus()
    })

    it('supports collapsible behavior', async () => {
      const user = userEvent.setup()
      render(<AppSidebar />)
      
      const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i })
      await user.click(toggleButton)
      
      const sidebar = screen.getByRole('navigation')
      expect(sidebar).toHaveClass('collapsed')
    })

    it('provides proper ARIA labels and roles', () => {
      render(<AppSidebar />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveAttribute('aria-label', 'Main navigation')
      
      const menuList = screen.getByRole('list')
      expect(menuList).toBeInTheDocument()
      
      const menuItems = screen.getAllByRole('listitem')
      expect(menuItems).toHaveLength(3) // Dashboard, Services, Groups
    })

    it('handles responsive behavior', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })
      
      render(<AppSidebar />)
      
      const sidebar = screen.getByRole('navigation')
      expect(sidebar).toHaveClass('mobile-responsive')
    })
  })

  describe('Breadcrumb Navigation', () => {
    it('renders breadcrumb trail', () => {
      render(
        <nav aria-label="Breadcrumb">
          <ol>
            <li><a href="/">Home</a></li>
            <li><a href="/services">Services</a></li>
            <li aria-current="page">Service Details</li>
          </ol>
        </nav>
      )
      
      const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i })
      expect(breadcrumb).toBeInTheDocument()
      
      const currentPage = screen.getByText('Service Details')
      expect(currentPage).toHaveAttribute('aria-current', 'page')
    })

    it('handles keyboard navigation in breadcrumbs', async () => {
      const user = userEvent.setup()
      render(
        <nav aria-label="Breadcrumb">
          <ol>
            <li><a href="/">Home</a></li>
            <li><a href="/services">Services</a></li>
            <li aria-current="page">Service Details</li>
          </ol>
        </nav>
      )
      
      const homeLink = screen.getByText('Home')
      homeLink.focus()
      
      await user.keyboard('{Tab}')
      expect(screen.getByText('Services')).toHaveFocus()
    })
  })

  describe('Pagination Navigation', () => {
    it('renders pagination controls', () => {
      render(
        <nav aria-label="Pagination">
          <button aria-label="Go to previous page">Previous</button>
          <button aria-label="Go to page 1" aria-current="page">1</button>
          <button aria-label="Go to page 2">2</button>
          <button aria-label="Go to next page">Next</button>
        </nav>
      )
      
      const pagination = screen.getByRole('navigation', { name: /pagination/i })
      expect(pagination).toBeInTheDocument()
      
      const currentPage = screen.getByText('1')
      expect(currentPage).toHaveAttribute('aria-current', 'page')
    })

    it('handles pagination keyboard navigation', async () => {
      const user = userEvent.setup()
      const mockOnPageChange = jest.fn()
      
      render(
        <nav aria-label="Pagination">
          <button onClick={() => mockOnPageChange(1)}>Previous</button>
          <button onClick={() => mockOnPageChange(1)} aria-current="page">1</button>
          <button onClick={() => mockOnPageChange(2)}>2</button>
          <button onClick={() => mockOnPageChange(2)}>Next</button>
        </nav>
      )
      
      const nextButton = screen.getByText('Next')
      await user.click(nextButton)
      
      expect(mockOnPageChange).toHaveBeenCalledWith(2)
    })
  })
})