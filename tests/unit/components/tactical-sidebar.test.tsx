/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Dashboard from '@/app/page'

// Mock the child components to focus on sidebar testing
jest.mock('@/app/command/page', () => {
  return function MockCommandPage() {
    return <div data-testid="command-page">Command Page</div>
  }
})

jest.mock('@/app/groups/page', () => {
  return function MockGroupsPage() {
    return <div data-testid="groups-page">Groups Page</div>
  }
})

jest.mock('@/app/services/page', () => {
  return function MockServicesPage() {
    return <div data-testid="services-page">Services Page</div>
  }
})

// Mock the hooks
jest.mock('@/lib/hooks/use-services', () => ({
  useServices: () => ({
    services: [],
    loading: false,
    error: null,
    refetch: jest.fn()
  })
}))

jest.mock('@/lib/hooks/use-groups', () => ({
  useGroups: () => ({
    groups: [],
    loading: false,
    error: null,
    refetch: jest.fn()
  })
}))

describe('Tactical Sidebar', () => {
  beforeEach(() => {
    // Mock window.matchMedia for responsive tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  })

  it('renders tactical sidebar with proper header styling', () => {
    render(<Dashboard />)
    
    // Check for tactical header elements - use role to be more specific
    expect(screen.getByRole('heading', { name: 'INFRASTRUCTURE' })).toBeInTheDocument()
    expect(screen.getByText('Source of Truth')).toBeInTheDocument()
    
    // Verify header has tactical styling classes - get the h1 specifically
    const header = screen.getByRole('heading', { name: 'INFRASTRUCTURE' })
    expect(header).toHaveClass('text-orange-500', 'font-bold', 'tracking-wider', 'uppercase')
  })

  it('displays tactical navigation items with uppercase labels', () => {
    render(<Dashboard />)
    
    // Check for tactical navigation items by finding links with specific text
    const commandLink = screen.getByRole('link', { current: 'page' })
    const groupsLink = screen.getByRole('link', { name: /groups/i })
    const servicesLink = screen.getByRole('link', { name: /services/i })
    
    expect(commandLink).toBeInTheDocument()
    expect(groupsLink).toBeInTheDocument()
    expect(servicesLink).toBeInTheDocument()
    
    // Verify navigation items have tactical styling - check for the span inside the link
    const commandSpan = commandLink.querySelector('span')
    expect(commandSpan).toHaveClass('tracking-wider', 'uppercase')
  })

  it('shows active state styling with orange background', () => {
    render(<Dashboard />)
    
    // The overview/command section should be active by default
    const commandLink = screen.getByRole('link', { current: 'page' })
    expect(commandLink).toHaveClass('bg-orange-500', 'text-white')
    expect(commandLink).toHaveAttribute('aria-current', 'page')
  })

  it('handles sidebar collapse/expand functionality', () => {
    render(<Dashboard />)
    
    // Find the collapse button
    const collapseButton = screen.getByLabelText('Collapse sidebar')
    expect(collapseButton).toBeInTheDocument()
    
    // Initially sidebar should be expanded (text visible) - get the heading specifically
    expect(screen.getByRole('heading', { name: 'INFRASTRUCTURE' })).toBeVisible()
    
    // Click to collapse
    fireEvent.click(collapseButton)
    
    // After collapse, the button should change to expand
    expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument()
  })

  it('displays system status panel with tactical styling', () => {
    render(<Dashboard />)
    
    // Check for system status elements that actually exist
    expect(screen.getByText('SYSTEM ONLINE')).toBeInTheDocument()
    expect(screen.getByText('GROUPS:')).toBeInTheDocument()
    expect(screen.getByText('SERVICES:')).toBeInTheDocument()
    expect(screen.getByText('STATUS:')).toBeInTheDocument()
    expect(screen.getByText('OPERATIONAL')).toBeInTheDocument()
    expect(screen.getByText('OPERATIONAL')).toBeInTheDocument()
    
    // Verify tactical styling
    const systemStatus = screen.getByText('SYSTEM ONLINE')
    expect(systemStatus).toHaveClass('font-medium', 'tracking-wider', 'uppercase')
  })

  it('displays navigation links with proper hrefs', () => {
    render(<Dashboard />)
    
    // Initially should show command page
    expect(screen.getByTestId('command-page')).toBeInTheDocument()
    
    // Check navigation links have correct hrefs - get the navigation ones specifically
    const commandLink = screen.getByRole('link', { current: 'page' })
    const groupsLink = screen.getByRole('link', { name: /groups/i })
    const servicesLink = screen.getByRole('link', { name: /services/i })
    
    expect(commandLink).toHaveAttribute('href', '/')
    expect(groupsLink).toHaveAttribute('href', '/groups')
    expect(servicesLink).toHaveAttribute('href', '/services')
    
    // Check that command link is active
    expect(commandLink).toHaveAttribute('aria-current', 'page')
    expect(commandLink).toHaveClass('bg-orange-500', 'text-white')
  })

  it('has proper accessibility attributes', () => {
    render(<Dashboard />)
    
    // Check for accessibility attributes
    const collapseButton = screen.getByLabelText('Collapse sidebar')
    expect(collapseButton).toHaveAttribute('aria-label')
    
    // Get the navigation link specifically (the one with aria-current)
    const activeLink = screen.getByRole('link', { current: 'page' })
    expect(activeLink).toHaveAttribute('aria-current', 'page')
  })

  it('applies tactical transition classes for smooth animations', () => {
    render(<Dashboard />)
    
    // Check for transition classes on navigation links - get the active one specifically
    const commandLink = screen.getByRole('link', { current: 'page' })
    expect(commandLink).toHaveClass('transition-all', 'duration-200')
    
    // Check for transition classes on collapse button
    const collapseButton = screen.getByLabelText('Collapse sidebar')
    expect(collapseButton).toHaveClass('transition-colors', 'duration-200')
  })
})