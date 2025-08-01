/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { PageHeader } from '@/components/layout/page-header'
import { SidebarProvider } from '@/components/ui/sidebar-old'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/test',
}))

// Mock the mobile hook
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    {children}
  </SidebarProvider>
)

describe('Layout Components', () => {
  describe('AppSidebar', () => {
    it('renders navigation items', () => {
      render(
        <TestWrapper>
          <AppSidebar />
        </TestWrapper>
      )
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Services')).toBeInTheDocument()
      expect(screen.getByText('Groups')).toBeInTheDocument()
    })

    it('displays the application title', () => {
      render(
        <TestWrapper>
          <AppSidebar />
        </TestWrapper>
      )
      
      expect(screen.getByText('Network SoT')).toBeInTheDocument()
      expect(screen.getByText('Infrastructure Management')).toBeInTheDocument()
    })
  })

  describe('PageHeader', () => {
    it('renders with default title from breadcrumbs', () => {
      render(
        <TestWrapper>
          <PageHeader />
        </TestWrapper>
      )
      
      expect(screen.getByRole('heading', { name: 'Services' })).toBeInTheDocument()
    })

    it('renders with custom title and description', () => {
      render(
        <TestWrapper>
          <PageHeader 
            title="Custom Title" 
            description="Custom description" 
          />
        </TestWrapper>
      )
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
      expect(screen.getByText('Custom description')).toBeInTheDocument()
    })

    it('renders breadcrumb navigation', () => {
      render(
        <TestWrapper>
          <PageHeader />
        </TestWrapper>
      )
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getAllByText('Services')).toHaveLength(2) // One in breadcrumb, one in title
    })

    it('renders action buttons when provided', () => {
      const action = <button>Test Action</button>
      render(
        <TestWrapper>
          <PageHeader action={action} />
        </TestWrapper>
      )
      
      expect(screen.getByText('Test Action')).toBeInTheDocument()
    })
  })
})