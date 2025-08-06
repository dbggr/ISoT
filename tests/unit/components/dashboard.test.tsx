import React from 'react'
import { render, screen } from '@testing-library/react'
import CommandPage from '@/app/command/page'

// Mock the hooks
jest.mock('@/lib/hooks/use-services', () => ({
  useServices: () => ({
    data: [
      {
        id: '1',
        name: 'test-service',
        type: 'web',
        ipAddress: '192.168.1.100',
        vlan: 100,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ],
    loading: false
  })
}))

jest.mock('@/lib/hooks/use-groups', () => ({
  useGroups: () => ({
    data: [
      {
        id: '1',
        name: 'test-group',
        description: 'Test group',
        services: [],
        createdAt: '2024-01-01T00:00:00Z'
      }
    ],
    loading: false
  })
}))

describe('Tactical Dashboard', () => {
  it('renders command center page with tactical layout', () => {
    render(<CommandPage />)
    
    // Check for tactical sections that actually exist
    expect(screen.getByText('SERVICES')).toBeInTheDocument()
    expect(screen.getAllByText('NETWORK GROUPS')).toHaveLength(2) // Stats card and section
    expect(screen.getByText('QUICK ACTIONS')).toBeInTheDocument()
  })

  it('displays infrastructure statistics', () => {
    render(<CommandPage />)
    
    // Check for statistics labels that actually exist
    expect(screen.getByText('ACTIVE SERVICES')).toBeInTheDocument()
    expect(screen.getAllByText('NETWORK GROUPS')).toHaveLength(2) // Stats card and section
    expect(screen.getByText('ACTIVE IPS')).toBeInTheDocument()
    expect(screen.getByText('VLANS')).toBeInTheDocument()
  })

  it('shows network status information', () => {
    render(<CommandPage />)
    
    // Check for actual content descriptions
    expect(screen.getByText('Network services registered')).toBeInTheDocument()
    expect(screen.getByText('Service groups configured')).toBeInTheDocument()
    expect(screen.getByText('IP addresses in use')).toBeInTheDocument()
    expect(screen.getByText('Virtual LANs configured')).toBeInTheDocument()
  })

  it('displays quick stats section', () => {
    render(<CommandPage />)
    
    // Check for actual sections that exist
    expect(screen.getByText('SERVICES')).toBeInTheDocument()
    expect(screen.getAllByText('NETWORK GROUPS')).toHaveLength(2) // Stats card and section
    expect(screen.getByText('Organized service clusters')).toBeInTheDocument()
  })

  it('shows quick actions section', () => {
    render(<CommandPage />)
    
    // Check for quick actions that actually exist
    expect(screen.getByText('QUICK ACTIONS')).toBeInTheDocument()
    expect(screen.getByText('ALL SERVICES')).toBeInTheDocument()
    expect(screen.getByText('ALL GROUPS')).toBeInTheDocument()
    expect(screen.getByText('NEW SERVICE')).toBeInTheDocument()
    expect(screen.getByText('NEW GROUP')).toBeInTheDocument()
  })
})