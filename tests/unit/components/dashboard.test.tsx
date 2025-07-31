/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import HomePage from '../../../app/page'

// Mock the hooks
jest.mock('../../../lib/hooks/use-services', () => ({
  useServices: jest.fn()
}))

jest.mock('../../../lib/hooks/use-groups', () => ({
  useGroups: jest.fn()
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

// Mock PageHeader component
jest.mock('../../../components/layout/page-header', () => ({
  PageHeader: ({ title, description, action }: any) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
      {action}
    </div>
  )
}))

import { useServices } from '../../../lib/hooks/use-services'
import { useGroups } from '../../../lib/hooks/use-groups'

const mockUseServices = useServices as jest.MockedFunction<typeof useServices>
const mockUseGroups = useGroups as jest.MockedFunction<typeof useGroups>

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    mockUseServices.mockReturnValue({
      data: [],
      loading: true,
      error: null,
      refetch: jest.fn(),
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    })

    mockUseGroups.mockReturnValue({
      data: [],
      loading: true,
      error: null,
      refetch: jest.fn()
    })

    render(<HomePage />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Overview of your network infrastructure')).toBeInTheDocument()
    
    // Check for loading skeletons in stats cards - they should be present
    const statSkeletons = document.querySelectorAll('.grid.gap-4.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4 [data-slot="skeleton"]')
    expect(statSkeletons.length).toBeGreaterThan(0) // Should have stat card skeletons
  })

  it('renders empty state correctly', async () => {
    mockUseServices.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    })

    mockUseGroups.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: jest.fn()
    })

    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getAllByText('0')).toHaveLength(4) // All stats should be 0
      expect(screen.getByText('No services registered yet.')).toBeInTheDocument()
      expect(screen.getByText('No groups created yet.')).toBeInTheDocument()
    })
  })

  it('renders data correctly', async () => {
    const mockServices = [
      {
        id: '1',
        name: 'Test Service',
        type: 'web' as const,
        ip_addresses: ['192.168.1.1'],
        ports: [80, 443],
        vlan_id: 100,
        domain: 'test.com',
        group_id: 'group1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]

    const mockGroups = [
      {
        id: 'group1',
        name: 'Test Group',
        description: 'Test Description',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        services: mockServices
      }
    ]

    mockUseServices.mockReturnValue({
      data: mockServices,
      loading: false,
      error: null,
      refetch: jest.fn(),
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
    })

    mockUseGroups.mockReturnValue({
      data: mockGroups,
      loading: false,
      error: null,
      refetch: jest.fn()
    })

    render(<HomePage />)

    await waitFor(() => {
      // Check stats - there are multiple "1"s on the page, so we check for specific content
      expect(screen.getAllByText('1')).toHaveLength(4) // All stats should be 1
      
      // Check recent items
      expect(screen.getByText('Test Service')).toBeInTheDocument()
      expect(screen.getByText('Test Group')).toBeInTheDocument()
    })
  })

  it('calculates statistics correctly', async () => {
    const mockServices = [
      {
        id: '1',
        name: 'Service 1',
        type: 'web' as const,
        ip_addresses: ['192.168.1.1', '192.168.1.2'],
        ports: [80],
        vlan_id: 100,
        group_id: 'group1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Service 2',
        type: 'database' as const,
        ip_addresses: ['192.168.1.1', '192.168.1.3'], // One duplicate IP
        ports: [3306],
        vlan_id: 200,
        group_id: 'group1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]

    mockUseServices.mockReturnValue({
      data: mockServices,
      loading: false,
      error: null,
      refetch: jest.fn(),
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
    })

    mockUseGroups.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: jest.fn()
    })

    render(<HomePage />)

    await waitFor(() => {
      // Should show 2 services
      const serviceElements = screen.getAllByText('2')
      expect(serviceElements.length).toBeGreaterThan(0)
      
      // Should show 3 unique IPs (192.168.1.1, 192.168.1.2, 192.168.1.3)
      const ipElements = screen.getAllByText('3')
      expect(ipElements.length).toBeGreaterThan(0)
      
      // Should show 2 VLANs (100, 200)
      const vlanElements = screen.getAllByText('2')
      expect(vlanElements.length).toBeGreaterThan(0)
    })
  })

  it('renders action buttons correctly', () => {
    mockUseServices.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: jest.fn(),
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    })

    mockUseGroups.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: jest.fn()
    })

    render(<HomePage />)

    expect(screen.getByRole('link', { name: /Add Group/i })).toHaveAttribute('href', '/groups/new')
    expect(screen.getByRole('link', { name: /Add Service/i })).toHaveAttribute('href', '/services/new')
  })
})