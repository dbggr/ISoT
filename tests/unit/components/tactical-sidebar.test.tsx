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
    
    // Check for tactical header elements
    expect(screen.getByText('INFRASTRUCTURE')).toBeInTheDocument()
    expect(screen.getByText('Source of Truth')).toBeInTheDocument()
    
    // Verify header has tactical styling classes
    const header = screen.getByText('INFRASTRUCTURE')
    expect(header).toHaveClass('text-orange-500', 'font-bold', 'tracking-wider', 'uppercase')
  })

  it('displays tactical navigation items with uppercase labels', () => {
    render(<Dashboard />)
    
    // Check for tactical navigation items by finding buttons with specific text
    const commandButton = screen.getByRole('button', { name: /command/i })
    const groupsButton = screen.getByRole('button', { name: /groups/i })
    const servicesButton = screen.getByRole('button', { name: /services/i })
    
    expect(commandButton).toBeInTheDocument()
    expect(groupsButton).toBeInTheDocument()
    expect(servicesButton).toBeInTheDocument()
    
    // Verify navigation items have tactical styling - check for the span inside the button
    const commandSpan = commandButton.querySelector('span')
    expect(commandSpan).toHaveClass('tracking-wider', 'uppercase')
  })

  it('shows active state styling with orange background', () => {
    render(<Dashboard />)
    
    // The overview/command section should be active by default
    const commandButton = screen.getByRole('button', { name: /command/i })
    expect(commandButton).toHaveClass('bg-orange-500', 'text-white')
    expect(commandButton).toHaveAttribute('aria-current', 'page')
  })

  it('handles sidebar collapse/expand functionality', () => {
    render(<Dashboard />)
    
    // Find the collapse button
    const collapseButton = screen.getByLabelText('Collapse sidebar')
    expect(collapseButton).toBeInTheDocument()
    
    // Initially sidebar should be expanded (text visible)
    expect(screen.getByText('INFRASTRUCTURE')).toBeVisible()
    
    // Click to collapse
    fireEvent.click(collapseButton)
    
    // After collapse, the button should change to expand
    expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument()
  })

  it('displays system status panel with tactical styling', () => {
    render(<Dashboard />)
    
    // Check for system status elements
    expect(screen.getByText('SYSTEM ONLINE')).toBeInTheDocument()
    expect(screen.getByText('UPTIME:')).toBeInTheDocument()
    expect(screen.getByText('GROUPS:')).toBeInTheDocument()
    expect(screen.getByText('SERVICES:')).toBeInTheDocument()
    expect(screen.getByText('STATUS:')).toBeInTheDocument()
    expect(screen.getByText('OPERATIONAL')).toBeInTheDocument()
    
    // Verify tactical styling
    const systemStatus = screen.getByText('SYSTEM ONLINE')
    expect(systemStatus).toHaveClass('font-medium', 'tracking-wider', 'uppercase')
  })

  it('switches between sections when navigation items are clicked', () => {
    render(<Dashboard />)
    
    // Initially should show command page
    expect(screen.getByTestId('command-page')).toBeInTheDocument()
    
    // Click on groups navigation
    const groupsButton = screen.getByRole('button', { name: /groups/i })
    fireEvent.click(groupsButton)
    
    // Should now show groups page and update active state
    expect(screen.getByTestId('groups-page')).toBeInTheDocument()
    expect(groupsButton).toHaveClass('bg-orange-500', 'text-white')
    
    // Click on services navigation
    const servicesButton = screen.getByRole('button', { name: /services/i })
    fireEvent.click(servicesButton)
    
    // Should now show services page and update active state
    expect(screen.getByTestId('services-page')).toBeInTheDocument()
    expect(servicesButton).toHaveClass('bg-orange-500', 'text-white')
  })

  it('has proper accessibility attributes', () => {
    render(<Dashboard />)
    
    // Check for accessibility attributes
    const collapseButton = screen.getByLabelText('Collapse sidebar')
    expect(collapseButton).toHaveAttribute('aria-label')
    
    const activeButton = screen.getByRole('button', { name: /command/i })
    expect(activeButton).toHaveAttribute('aria-current', 'page')
  })

  it('applies tactical transition classes for smooth animations', () => {
    render(<Dashboard />)
    
    // Check for transition classes on navigation buttons
    const commandButton = screen.getByRole('button', { name: /command/i })
    expect(commandButton).toHaveClass('transition-all', 'duration-200')
    
    // Check for transition classes on collapse button
    const collapseButton = screen.getByLabelText('Collapse sidebar')
    expect(collapseButton).toHaveClass('transition-colors', 'duration-200')
  })
})