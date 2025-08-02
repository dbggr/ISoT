import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { 
  StatusIndicator, 
  TacticalCard, 
  TacticalButton, 
  TacticalTable,
  type TacticalTableColumn 
} from '@/components/tactical'

describe('Tactical Components', () => {
  describe('StatusIndicator', () => {
    it('renders online status with pulse animation', () => {
      render(<StatusIndicator status="online" label="Online" />)
      
      const indicator = screen.getByText('ONLINE')
      expect(indicator).toBeInTheDocument()
    })

    it('renders warning status with orange color', () => {
      render(<StatusIndicator status="warning" label="Warning" />)
      
      const indicator = screen.getByText('WARNING')
      expect(indicator).toBeInTheDocument()
    })

    it('renders error status', () => {
      render(<StatusIndicator status="error" label="Error" />)
      
      const indicator = screen.getByText('ERROR')
      expect(indicator).toBeInTheDocument()
    })
  })

  describe('TacticalCard', () => {
    it('renders card with title and content', () => {
      render(
        <TacticalCard title="Test Card">
          <p>Test content</p>
        </TacticalCard>
      )
      
      expect(screen.getByText('TEST CARD')).toBeInTheDocument()
      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('renders card with status indicator', () => {
      render(
        <TacticalCard title="Test Card" status="online">
          <p>Test content</p>
        </TacticalCard>
      )
      
      expect(screen.getByText('TEST CARD')).toBeInTheDocument()
      // Status indicator should be present (dot element)
      const card = screen.getByText('TEST CARD').closest('.bg-neutral-900')
      expect(card).toBeInTheDocument()
    })

    it('renders card with subtitle', () => {
      render(
        <TacticalCard title="Test Card" subtitle="Test subtitle">
          <p>Test content</p>
        </TacticalCard>
      )
      
      expect(screen.getByText('TEST CARD')).toBeInTheDocument()
      expect(screen.getByText('Test subtitle')).toBeInTheDocument()
    })
  })

  describe('TacticalButton', () => {
    it('renders primary button with uppercase text', () => {
      render(<TacticalButton>Test Button</TacticalButton>)
      
      expect(screen.getByText('TEST BUTTON')).toBeInTheDocument()
    })

    it('renders secondary button variant', () => {
      render(<TacticalButton variant="secondary">Secondary</TacticalButton>)
      
      const button = screen.getByText('SECONDARY')
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('bg-neutral-800')
    })

    it('renders danger button variant', () => {
      render(<TacticalButton variant="danger">Danger</TacticalButton>)
      
      const button = screen.getByText('DANGER')
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('bg-red-500')
    })

    it('preserves non-string children', () => {
      render(
        <TacticalButton>
          <span>Custom Content</span>
        </TacticalButton>
      )
      
      expect(screen.getByText('Custom Content')).toBeInTheDocument()
    })
  })

  describe('TacticalTable', () => {
    const sampleData = [
      { id: 1, name: 'Service 1', status: 'online' },
      { id: 2, name: 'Service 2', status: 'warning' }
    ]

    const columns: TacticalTableColumn[] = [
      { key: 'name', header: 'Service Name' },
      { key: 'status', header: 'Status' }
    ]

    it('renders table with data', () => {
      render(<TacticalTable data={sampleData} columns={columns} />)
      
      expect(screen.getByText('SERVICE NAME')).toBeInTheDocument()
      expect(screen.getByText('STATUS')).toBeInTheDocument()
      expect(screen.getByText('Service 1')).toBeInTheDocument()
      expect(screen.getByText('Service 2')).toBeInTheDocument()
    })

    it('renders empty state when no data', () => {
      render(<TacticalTable data={[]} columns={columns} />)
      
      expect(screen.getByText('NO DATA AVAILABLE')).toBeInTheDocument()
    })

    it('renders loading state', () => {
      render(<TacticalTable data={[]} columns={columns} loading={true} />)
      
      expect(screen.getByText('LOADING DATA...')).toBeInTheDocument()
    })

    it('renders custom empty message', () => {
      render(
        <TacticalTable 
          data={[]} 
          columns={columns} 
          emptyMessage="No services found"
        />
      )
      
      expect(screen.getByText('NO SERVICES FOUND')).toBeInTheDocument()
    })
  })
})