/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { SidebarProvider } from '@/components/ui/sidebar'

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

