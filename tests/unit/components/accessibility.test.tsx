/**
 * Comprehensive accessibility tests for components and features
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccessibilityProvider } from '@/components/common/accessibility-provider'
import { HighlightedText } from '@/components/common/highlighted-text'
import { ConfirmationDialog } from '@/components/common/confirmation-dialog'
import { GlobalSearch } from '@/components/common/global-search'
import { AccessibleTable } from '@/components/common/accessible-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  HighContrastManager, 
  ScreenReaderAnnouncer, 
  FocusManager,
  validateAccessibility 
} from '@/lib/accessibility'
import { be } from 'zod/v4/locales'

// Mock hooks
jest.mock('@/lib/hooks/use-services', () => ({
  useServices: () => ({
    data: [],
    loading: false,
    error: null,
  }),
}))

jest.mock('@/lib/hooks/use-groups', () => ({
  useGroups: () => ({
    data: [],
    loading: false,
    error: null,
  }),
}))

describe('Accessibility Features', () => {
  beforeEach(() => {
    // Clear any existing live regions
    const existingLiveRegions = document.querySelectorAll('[aria-live]')
    existingLiveRegions.forEach(region => region.remove())
  })

  describe('AccessibilityProvider', () => {
    it('should initialize accessibility features', () => {
      render(
        <AccessibilityProvider>
          <div>Test content</div>
        </AccessibilityProvider>
      )

      // Check for skip link
      const skipLink = document.querySelector('a[href="#main-content"]')
      expect(skipLink).toBeInTheDocument()
      expect(skipLink).toHaveTextContent('Skip to main content')

      // Check for live regions
      const liveRegion = document.getElementById('live-region')
      const assertiveLiveRegion = document.getElementById('assertive-live-region')
      
      expect(liveRegion).toBeInTheDocument()
      expect(liveRegion).toHaveAttribute('aria-live', 'polite')
      expect(assertiveLiveRegion).toBeInTheDocument()
      expect(assertiveLiveRegion).toHaveAttribute('aria-live', 'assertive')
    })
  })

  describe('HighlightedText', () => {
    it('should render text with proper accessibility attributes', () => {
      render(
        <HighlightedText 
          text="Network Service" 
          searchTerm="Network" 
          ariaLabel="Network Service with Network highlighted"
        />
      )

      const container = screen.getByLabelText('Network Service with Network highlighted')
      expect(container).toBeInTheDocument()

      // Check for highlighted text
      const mark = document.querySelector('mark')
      expect(mark).toBeInTheDocument()
      expect(mark).toHaveTextContent('Network')
      expect(mark).toHaveAttribute('aria-label', 'highlighted: Network')
    })

    it('should include screen reader announcement for matches', () => {
      render(<HighlightedText text="Network Service Network" searchTerm="Network" />)
      
      const screenReaderText = document.querySelector('.sr-only')
      expect(screenReaderText).toBeInTheDocument()
      expect(screenReaderText).toHaveTextContent('(2 matches found)')
    })

    it('should render plain text when no search term', () => {
      render(<HighlightedText text="Network Service" searchTerm="" />)
      
      const element = screen.getByText('Network Service')
      expect(element).toBeInTheDocument()
      expect(document.querySelector('mark')).not.toBeInTheDocument()
    })
  })

  describe('ConfirmationDialog', () => {
    it('should have proper ARIA attributes', async () => {
      const onConfirm = jest.fn()
      const onOpenChange = jest.fn()

      render(
        <ConfirmationDialog
          open={true}
          onOpenChange={onOpenChange}
          title="Delete Item"
          description="Are you sure you want to delete this item?"
          onConfirm={onConfirm}
        />
      )

      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      expect(dialog).toHaveAttribute('aria-labelledby')
      expect(dialog).toHaveAttribute('aria-describedby')

      const title = screen.getByText('Delete Item')
      expect(title).toBeInTheDocument()

      const description = screen.getByText('Are you sure you want to delete this item?')
      expect(description).toBeInTheDocument()
    })

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup()
      const onConfirm = jest.fn()
      const onOpenChange = jest.fn()

      render(
        <ConfirmationDialog
          open={true}
          onOpenChange={onOpenChange}
          title="Delete Item"
          description="Are you sure?"
          onConfirm={onConfirm}
        />
      )

      // Test Escape key
      await user.keyboard('{Escape}')
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('should handle destructive variant as alertdialog', () => {
      const onConfirm = jest.fn()
      const onOpenChange = jest.fn()

      render(
        <ConfirmationDialog
          open={true}
          onOpenChange={onOpenChange}
          title="Delete Item"
          description="This action cannot be undone"
          onConfirm={onConfirm}
          variant="destructive"
        />
      )

      const dialog = screen.getByRole('alertdialog')
      expect(dialog).toBeInTheDocument()
    })
  })

  describe('GlobalSearch', () => {
    it('should have proper combobox ARIA attributes', () => {
      render(<GlobalSearch />)

      const searchInput = screen.getByRole('searchbox')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('aria-label', 'Search services and groups')
      expect(searchInput).toHaveAttribute('aria-describedby')
      expect(searchInput).toHaveAttribute('autoComplete', 'off')

      const combobox = searchInput.closest('[role="combobox"]')
      expect(combobox).toBeInTheDocument()
      expect(combobox).toHaveAttribute('aria-expanded', 'false')
      expect(combobox).toHaveAttribute('aria-haspopup', 'listbox')
    })

    it('should provide search instructions for screen readers', () => {
      render(<GlobalSearch />)

      const instructions = document.querySelector('.sr-only')
      expect(instructions).toBeInTheDocument()
      expect(instructions).toHaveTextContent('Type at least 2 characters to search. Use arrow keys to navigate results, Enter to select.')
    })
  })

  describe('Accessibility Utilities', () => {
    describe('ScreenReaderAnnouncer', () => {
      it('should create singleton instance', () => {
        const announcer1 = ScreenReaderAnnouncer.getInstance()
        const announcer2 = ScreenReaderAnnouncer.getInstance()
        
        expect(announcer1).toBe(announcer2)
      })

      it('should announce messages', () => {
        const announcer = ScreenReaderAnnouncer.getInstance()
        
        announcer.announce('Test message')
        
        // The announcer creates its own element, so we need to find it
        const announcerElement = document.querySelector('[aria-live="polite"]')
        expect(announcerElement).toBeInTheDocument()
      })
    })

    describe('FocusManager', () => {
      it('should manage focus stack', () => {
        const button1 = document.createElement('button')
        const button2 = document.createElement('button')
        
        document.body.appendChild(button1)
        document.body.appendChild(button2)
        
        button1.focus()
        FocusManager.pushFocus(button2)
        
        expect(document.activeElement).toBe(button2)
        
        FocusManager.popFocus()
        expect(document.activeElement).toBe(button1)
        
        document.body.removeChild(button1)
        document.body.removeChild(button2)
      })

      it('should get focusable elements', () => {
        const container = document.createElement('div')
        container.innerHTML = `
          <button>Button 1</button>
          <a href="#">Link</a>
          <input type="text" />
          <button disabled>Disabled Button</button>
          <div tabindex="-1">Not focusable</div>
          <div tabindex="0">Focusable div</div>
        `
        
        document.body.appendChild(container)
        
        const focusableElements = FocusManager.getFocusableElements(container)
        expect(focusableElements).toHaveLength(4) // button, link, input, focusable div
        
        document.body.removeChild(container)
      })
    })

    describe('validateAccessibility', () => {
      it('should validate ARIA labels', () => {
        const elementWithLabel = document.createElement('button')
        elementWithLabel.setAttribute('aria-label', 'Test button')
        
        const elementWithLabelledBy = document.createElement('button')
        elementWithLabelledBy.setAttribute('aria-labelledby', 'label-id')
        
        const elementWithoutLabel = document.createElement('button')
        
        expect(validateAccessibility.hasAriaLabel(elementWithLabel)).toBe(true)
        expect(validateAccessibility.hasAriaLabel(elementWithLabelledBy)).toBe(true)
        expect(validateAccessibility.hasAriaLabel(elementWithoutLabel)).toBe(false)
      })

      it('should validate keyboard support', () => {
        const button = document.createElement('button')
        const link = document.createElement('a')
        link.href = '#'
        const div = document.createElement('div')
        const focusableDiv = document.createElement('div')
        focusableDiv.tabIndex = 0
        
        expect(validateAccessibility.hasKeyboardSupport(button)).toBe(true)
        expect(validateAccessibility.hasKeyboardSupport(link)).toBe(true)
        expect(validateAccessibility.hasKeyboardSupport(div)).toBe(false)
        expect(validateAccessibility.hasKeyboardSupport(focusableDiv)).toBe(true)
      })
    })
  })

  describe('High Contrast Mode', () => {
    it('should initialize high contrast detection', () => {
      // Mock matchMedia
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

      HighContrastManager.init()
      
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-contrast: high)')
      expect(window.matchMedia).toHaveBeenCalledWith('(forced-colors: active)')
    })
  })
})

describe('Component Accessibility Integration', () => {
  it('should render components with accessibility features', () => {
    render(
      <AccessibilityProvider>
        <div>
          <HighlightedText text="Test Service" searchTerm="Test" />
          <GlobalSearch />
        </div>
      </AccessibilityProvider>
    )

    // Check that components are rendered with accessibility features
    const searchInput = screen.getByRole('searchbox')
    expect(searchInput).toHaveClass('keyboard-focus', 'touch-target')

    const highlightedText = screen.getByText(/Test Service/)
    expect(highlightedText).toBeInTheDocument()
  })
})
descri
be('UI Component Accessibility', () => {
  describe('Button Component', () => {
    it('should have proper ARIA attributes', () => {
      render(<Button aria-label="Save changes">Save</Button>)
      
      const button = screen.getByRole('button', { name: 'Save changes' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-label', 'Save changes')
    })

    it('should handle disabled state properly', () => {
      render(<Button disabled>Disabled Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-disabled', 'true')
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      const mockClick = jest.fn()
      
      render(<Button onClick={mockClick}>Click me</Button>)
      
      const button = screen.getByRole('button')
      button.focus()
      
      await user.keyboard('{Enter}')
      expect(mockClick).toHaveBeenCalled()
      
      await user.keyboard(' ')
      expect(mockClick).toHaveBeenCalledTimes(2)
    })

    it('should have minimum touch target size', () => {
      render(<Button>Touch Target</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('touch-target')
      
      const styles = window.getComputedStyle(button)
      expect(parseInt(styles.minHeight)).toBeGreaterThanOrEqual(44)
    })
  })

  describe('Input Component', () => {
    it('should have proper labeling', () => {
      render(
        <div>
          <label htmlFor="test-input">Test Input</label>
          <Input id="test-input" />
        </div>
      )
      
      const input = screen.getByLabelText('Test Input')
      expect(input).toBeInTheDocument()
    })

    it('should support error states with ARIA', () => {
      render(
        <div>
          <label htmlFor="error-input">Error Input</label>
          <Input 
            id="error-input" 
            aria-invalid="true" 
            aria-describedby="error-message" 
          />
          <div id="error-message">This field is required</div>
        </div>
      )
      
      const input = screen.getByLabelText('Error Input')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby', 'error-message')
    })

    it('should handle focus management', async () => {
      const user = userEvent.setup()
      render(<Input placeholder="Focus test" />)
      
      const input = screen.getByPlaceholderText('Focus test')
      await user.click(input)
      
      expect(input).toHaveFocus()
      expect(input).toHaveClass('focus-visible')
    })
  })

  describe('AccessibleTable Component', () => {
    const mockData = [
      { id: '1', name: 'Item 1', status: 'Active' },
      { id: '2', name: 'Item 2', status: 'Inactive' }
    ]

    const mockColumns = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'status', header: 'Status', sortable: false }
    ]

    it('should have proper table structure and ARIA attributes', () => {
      render(
        <AccessibleTable
          data={mockData}
          columns={mockColumns}
          caption="Test data table"
        />
      )
      
      const table = screen.getByRole('table')
      expect(table).toHaveAttribute('aria-label', 'Test data table')
      
      const caption = screen.getByText('Test data table')
      expect(caption).toBeInTheDocument()
      
      const columnHeaders = screen.getAllByRole('columnheader')
      expect(columnHeaders).toHaveLength(2)
      
      const rows = screen.getAllByRole('row')
      expect(rows).toHaveLength(3) // header + 2 data rows
    })

    it('should support sortable columns with ARIA', async () => {
      const user = userEvent.setup()
      const mockOnSort = jest.fn()
      
      render(
        <AccessibleTable
          data={mockData}
          columns={mockColumns}
          caption="Sortable table"
          onSort={mockOnSort}
        />
      )
      
      const nameHeader = screen.getByRole('columnheader', { name: /name/i })
      expect(nameHeader).toHaveAttribute('aria-sort', 'none')
      
      await user.click(nameHeader)
      expect(mockOnSort).toHaveBeenCalledWith('name', 'asc')
    })

    it('should handle keyboard navigation between cells', async () => {
      const user = userEvent.setup()
      render(
        <AccessibleTable
          data={mockData}
          columns={mockColumns}
          caption="Keyboard navigation table"
        />
      )
      
      const firstCell = screen.getByText('Item 1')
      firstCell.focus()
      
      await user.keyboard('{ArrowRight}')
      expect(screen.getByText('Active')).toHaveFocus()
      
      await user.keyboard('{ArrowDown}')
      expect(screen.getByText('Inactive')).toHaveFocus()
      
      await user.keyboard('{ArrowLeft}')
      expect(screen.getByText('Item 2')).toHaveFocus()
    })

    it('should announce sort changes to screen readers', async () => {
      const user = userEvent.setup()
      const mockOnSort = jest.fn()
      
      render(
        <AccessibleTable
          data={mockData}
          columns={mockColumns}
          caption="Sort announcement table"
          onSort={mockOnSort}
        />
      )
      
      const nameHeader = screen.getByRole('columnheader', { name: /name/i })
      await user.click(nameHeader)
      
      // Check for live region announcement
      const liveRegion = document.querySelector('[aria-live="polite"]')
      expect(liveRegion).toHaveTextContent(/sorted by name ascending/i)
    })

    it('should support row selection with proper ARIA', async () => {
      const user = userEvent.setup()
      const mockOnSelectionChange = jest.fn()
      
      render(
        <AccessibleTable
          data={mockData}
          columns={mockColumns}
          caption="Selectable table"
          selectable={true}
          onSelectionChange={mockOnSelectionChange}
        />
      )
      
      const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i })
      expect(selectAllCheckbox).toBeInTheDocument()
      
      const rowCheckboxes = screen.getAllByRole('checkbox')
      expect(rowCheckboxes).toHaveLength(3) // select all + 2 rows
      
      await user.click(selectAllCheckbox)
      expect(mockOnSelectionChange).toHaveBeenCalledWith(['1', '2'])
    })
  })
})

describe('Keyboard Navigation Tests', () => {
  it('should support tab navigation through interactive elements', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <Button>First Button</Button>
        <Input placeholder="Input field" />
        <Button>Second Button</Button>
      </div>
    )
    
    const firstButton = screen.getByText('First Button')
    const input = screen.getByPlaceholderText('Input field')
    const secondButton = screen.getByText('Second Button')
    
    firstButton.focus()
    expect(firstButton).toHaveFocus()
    
    await user.keyboard('{Tab}')
    expect(input).toHaveFocus()
    
    await user.keyboard('{Tab}')
    expect(secondButton).toHaveFocus()
  })

  it('should support arrow key navigation in menus', async () => {
    const user = userEvent.setup()
    render(
      <div role="menu">
        <div role="menuitem" tabIndex={0}>Menu Item 1</div>
        <div role="menuitem" tabIndex={-1}>Menu Item 2</div>
        <div role="menuitem" tabIndex={-1}>Menu Item 3</div>
      </div>
    )
    
    const firstItem = screen.getByText('Menu Item 1')
    const secondItem = screen.getByText('Menu Item 2')
    const thirdItem = screen.getByText('Menu Item 3')
    
    firstItem.focus()
    expect(firstItem).toHaveFocus()
    
    await user.keyboard('{ArrowDown}')
    expect(secondItem).toHaveFocus()
    
    await user.keyboard('{ArrowDown}')
    expect(thirdItem).toHaveFocus()
    
    await user.keyboard('{ArrowUp}')
    expect(secondItem).toHaveFocus()
  })

  it('should handle escape key to close modals', async () => {
    const user = userEvent.setup()
    const mockOnClose = jest.fn()
    
    render(
      <ConfirmationDialog
        open={true}
        onOpenChange={mockOnClose}
        title="Test Dialog"
        description="Test description"
        onConfirm={jest.fn()}
      />
    )
    
    await user.keyboard('{Escape}')
    expect(mockOnClose).toHaveBeenCalledWith(false)
  })
})

describe('Screen Reader Support', () => {
  it('should provide proper headings hierarchy', () => {
    render(
      <div>
        <h1>Main Title</h1>
        <h2>Section Title</h2>
        <h3>Subsection Title</h3>
      </div>
    )
    
    const h1 = screen.getByRole('heading', { level: 1 })
    const h2 = screen.getByRole('heading', { level: 2 })
    const h3 = screen.getByRole('heading', { level: 3 })
    
    expect(h1).toHaveTextContent('Main Title')
    expect(h2).toHaveTextContent('Section Title')
    expect(h3).toHaveTextContent('Subsection Title')
  })

  it('should provide landmarks for navigation', () => {
    render(
      <div>
        <header>Header content</header>
        <nav aria-label="Main navigation">Navigation</nav>
        <main>Main content</main>
        <aside>Sidebar content</aside>
        <footer>Footer content</footer>
      </div>
    )
    
    expect(screen.getByRole('banner')).toBeInTheDocument() // header
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('complementary')).toBeInTheDocument() // aside
    expect(screen.getByRole('contentinfo')).toBeInTheDocument() // footer
  })

  it('should announce dynamic content changes', async () => {
    const TestComponent = () => {
      const [message, setMessage] = React.useState('')
      
      return (
        <div>
          <button onClick={() => setMessage('Content updated!')}>
            Update Content
          </button>
          <div aria-live="polite" id="live-region">
            {message}
          </div>
        </div>
      )
    }
    
    const user = userEvent.setup()
    render(<TestComponent />)
    
    const button = screen.getByText('Update Content')
    await user.click(button)
    
    const liveRegion = document.getElementById('live-region')
    expect(liveRegion).toHaveTextContent('Content updated!')
    expect(liveRegion).toHaveAttribute('aria-live', 'polite')
  })

  it('should provide status updates for form validation', async () => {
    const TestForm = () => {
      const [error, setError] = React.useState('')
      
      return (
        <form>
          <label htmlFor="email">Email</label>
          <Input 
            id="email" 
            type="email" 
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'email-error' : undefined}
          />
          {error && (
            <div id="email-error" role="alert">
              {error}
            </div>
          )}
          <button 
            type="button" 
            onClick={() => setError('Please enter a valid email')}
          >
            Validate
          </button>
        </form>
      )
    }
    
    const user = userEvent.setup()
    render(<TestForm />)
    
    const validateButton = screen.getByText('Validate')
    await user.click(validateButton)
    
    const errorMessage = screen.getByRole('alert')
    expect(errorMessage).toHaveTextContent('Please enter a valid email')
    
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'email-error')
  })
})

describe('Color and Contrast Accessibility', () => {
  it('should support high contrast mode', () => {
    // Mock high contrast media query
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
    
    render(<Button className="high-contrast:border-2">High Contrast Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('high-contrast:border-2')
  })

  it('should support forced colors mode', () => {
    render(
      <div className="forced-colors:bg-[ButtonFace] forced-colors:text-[ButtonText]">
        Forced colors content
      </div>
    )
    
    const element = screen.getByText('Forced colors content')
    expect(element).toHaveClass('forced-colors:bg-[ButtonFace]')
    expect(element).toHaveClass('forced-colors:text-[ButtonText]')
  })

  it('should not rely solely on color for information', () => {
    render(
      <div>
        <span className="text-red-500" aria-label="Error: Required field">
          * Required
        </span>
        <span className="text-green-500" aria-label="Success: Valid input">
          ✓ Valid
        </span>
      </div>
    )
    
    const errorIndicator = screen.getByLabelText('Error: Required field')
    const successIndicator = screen.getByLabelText('Success: Valid input')
    
    expect(errorIndicator).toBeInTheDocument()
    expect(successIndicator).toBeInTheDocument()
  })
})

describe('Motion and Animation Accessibility', () => {
  it('should respect reduced motion preferences', () => {
    // Mock prefers-reduced-motion media query
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
    
    render(
      <div className="animate-spin motion-reduce:animate-none">
        Loading spinner
      </div>
    )
    
    const spinner = screen.getByText('Loading spinner')
    expect(spinner).toHaveClass('motion-reduce:animate-none')
  })

  it('should provide alternative feedback for animations', () => {
    render(
      <div>
        <div className="animate-pulse" aria-label="Loading content">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    )
    
    const loadingElement = screen.getByLabelText('Loading content')
    const screenReaderText = screen.getByText('Loading...')
    
    expect(loadingElement).toBeInTheDocument()
    expect(screenReaderText).toHaveClass('sr-only')
  })
})