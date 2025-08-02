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
    
    // Check for main page header
    expect(screen.getByText('COMMAND CENTER')).toBeInTheDocument()
    expect(screen.getByText('Infrastructure monitoring and control dashboard')).toBeInTheDocument()
    
    // Check for tactical sections
    expect(screen.getByText('INFRASTRUCTURE OVERVIEW')).toBeInTheDocument()
    expect(screen.getByText('ACTIVITY LOG')).toBeInTheDocument()
    expect(screen.getByText('NETWORK STATUS')).toBeInTheDocument()
    expect(screen.getByText('SYSTEM METRICS')).toBeInTheDocument()
    expect(screen.getByText('QUICK STATS')).toBeInTheDocument()
  })

  it('displays infrastructure statistics', () => {
    render(<CommandPage />)
    
    // Check for statistics labels
    expect(screen.getByText('SERVICES')).toBeInTheDocument()
    expect(screen.getByText('GROUPS')).toBeInTheDocument()
    expect(screen.getByText('ACTIVE IPS')).toBeInTheDocument()
    expect(screen.getByText('VLANS')).toBeInTheDocument()
  })

  it('shows network status information', () => {
    render(<CommandPage />)
    
    // Check for network status elements
    expect(screen.getByText('NETWORK ONLINE')).toBeInTheDocument()
    expect(screen.getByText('CONNECTION RATE')).toBeInTheDocument()
    expect(screen.getByText('LATENCY')).toBeInTheDocument()
    expect(screen.getByText('THROUGHPUT')).toBeInTheDocument()
    expect(screen.getByText('UPTIME')).toBeInTheDocument()
  })

  it('displays quick stats section', () => {
    render(<CommandPage />)
    
    // Check for quick stats elements
    expect(screen.getByText('NEW SERVICES (24H)')).toBeInTheDocument()
    expect(screen.getByText('NEW GROUPS (24H)')).toBeInTheDocument()
    expect(screen.getByText('SERVICE DISTRIBUTION')).toBeInTheDocument()
  })

  it('shows quick actions section', () => {
    render(<CommandPage />)
    
    // Check for quick actions
    expect(screen.getByText('QUICK ACTIONS')).toBeInTheDocument()
    expect(screen.getByText('ALL SERVICES')).toBeInTheDocument()
    expect(screen.getByText('ALL GROUPS')).toBeInTheDocument()
    expect(screen.getByText('NEW SERVICE')).toBeInTheDocument()
    expect(screen.getByText('NEW GROUP')).toBeInTheDocument()
  })
})