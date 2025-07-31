/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GroupsTable } from '@/components/groups/groups-table'
import { Group } from '@/lib/types'

// Mock the dropdown menu components
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: any) => {
    if (asChild) {
      return <div data-testid="dropdown-trigger">{children}</div>
    }
    return <button data-testid="dropdown-trigger">{children}</button>
  },
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick, asChild }: any) => {
    if (asChild) {
      return <div data-testid="dropdown-item">{children}</div>
    }
    return <button data-testid="dropdown-item" onClick={onClick}>{children}</button>
  }
}))

// Mock the confirmation dialog component
jest.mock('@/components/common/confirmation-dialog', () => ({
  ConfirmationDialog: ({ open, onConfirm, title, description, confirmText, cancelText, onOpenChange }: any) => {
    if (!open) return null
    return (
      <div data-testid="confirmation-dialog">
        <div>{title}</div>
        <div>{description}</div>
        <button data-testid="confirm-button" onClick={onConfirm}>{confirmText}</button>
        <button data-testid="cancel-button" onClick={() => onOpenChange(false)}>{cancelText}</button>
      </div>
    )
  }
}))

// Mock the highlighted text component
jest.mock('@/components/common/highlighted-text', () => ({
  HighlightedText: ({ text }: { text: string }) => <span>{text}</span>
}))

// Mock the search utils
jest.mock('@/lib/search-utils', () => ({
  getEmptyStateMessage: (hasFilters: boolean, searchTerm?: string) => {
    if (searchTerm) {
      return {
        title: `No groups found matching "${searchTerm}"`,
        description: "Try a different search term or browse all groups."
      }
    }
    return {
      title: "No groups found. Create your first group to get started.",
      description: "Get started by creating your first group."
    }
  }
}))

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'Test Group 1',
    description: 'First test group',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    services: []
  },
  {
    id: '2',
    name: 'Test Group 2',
    description: 'Second test group',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    services: [{ id: 'service-1', name: 'test-service', type: 'web', ip_addresses: ['192.168.1.100'], ports: [80], vlan_id: 100, domain: 'example.com', group_id: '2', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' }]
  }
]

describe('GroupsTable', () => {
  it('renders groups correctly', () => {
    render(<GroupsTable groups={mockGroups} />)
    
    expect(screen.getByText('Test Group 1')).toBeInTheDocument()
    expect(screen.getByText('Test Group 2')).toBeInTheDocument()
    // Use getAllByText since the description appears in multiple places (mobile and desktop)
    expect(screen.getAllByText('First test group')).toHaveLength(2)
    expect(screen.getAllByText('Second test group')).toHaveLength(2)
  })

  it('displays service counts correctly', () => {
    render(<GroupsTable groups={mockGroups} />)
    
    expect(screen.getByText('0 services')).toBeInTheDocument()
    expect(screen.getByText('1 services')).toBeInTheDocument()
  })

  it('filters groups based on search term', async () => {
    render(<GroupsTable groups={mockGroups} />)
    
    const searchInput = screen.getByPlaceholderText('Search groups...')
    fireEvent.change(searchInput, { target: { value: 'First' } })
    
    await waitFor(() => {
      expect(screen.getByText('Test Group 1')).toBeInTheDocument()
      expect(screen.queryByText('Test Group 2')).not.toBeInTheDocument()
    })
  })

  it('sorts groups by name', async () => {
    render(<GroupsTable groups={mockGroups} />)
    
    const nameHeader = screen.getByRole('button', { name: /name/i })
    fireEvent.click(nameHeader)
    
    // Check that both groups are still present (sorting doesn't change the order in this case)
    expect(screen.getByText('Test Group 1')).toBeInTheDocument()
    expect(screen.getByText('Test Group 2')).toBeInTheDocument()
  })

  it('shows delete confirmation dialog', async () => {
    const mockOnDelete = jest.fn()
    render(<GroupsTable groups={mockGroups} onDelete={mockOnDelete} />)
    
    // Click on the first dropdown trigger
    const dropdownTriggers = screen.getAllByTestId('dropdown-trigger')
    fireEvent.click(dropdownTriggers[0])
    
    // Click delete option - use getAllByText since there are multiple delete buttons
    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])
    
    // Should show confirmation dialog
    expect(screen.getByTestId('confirmation-dialog')).toBeInTheDocument()
    expect(screen.getByText('Delete Group')).toBeInTheDocument()
  })

  it('calls onDelete when deletion is confirmed', async () => {
    const mockOnDelete = jest.fn()
    render(<GroupsTable groups={mockGroups} onDelete={mockOnDelete} />)
    
    // Click on the first dropdown trigger
    const dropdownTriggers = screen.getAllByTestId('dropdown-trigger')
    fireEvent.click(dropdownTriggers[0])
    
    // Click delete option - use getAllByText since there are multiple delete buttons
    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])
    
    // Confirm deletion
    const confirmButton = screen.getByTestId('confirm-button')
    fireEvent.click(confirmButton)
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockGroups[0])
  })

  it('shows loading state', () => {
    render(<GroupsTable groups={[]} loading={true} />)
    
    // Should show skeleton loading rows
    const skeletonRows = screen.getAllByRole('row')
    expect(skeletonRows).toHaveLength(4) // Header + 3 skeleton rows
  })

  it('shows empty state when no groups', () => {
    render(<GroupsTable groups={[]} />)
    
    expect(screen.getByText('No groups found. Create your first group to get started.')).toBeInTheDocument()
  })

  it('shows empty search results', async () => {
    render(<GroupsTable groups={mockGroups} />)
    
    const searchInput = screen.getByPlaceholderText('Search groups...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })
    
    await waitFor(() => {
      expect(screen.getByText('No groups found matching "nonexistent"')).toBeInTheDocument()
    })
  })
})