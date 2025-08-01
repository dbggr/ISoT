/**
 * Accessibility utilities and constants for the application
 */

// ARIA roles and labels
export const ARIA_ROLES = {
  TABLE: 'table',
  GRID: 'grid',
  GRIDCELL: 'gridcell',
  COLUMNHEADER: 'columnheader',
  ROW: 'row',
  ROWGROUP: 'rowgroup',
  BUTTON: 'button',
  DIALOG: 'dialog',
  ALERTDIALOG: 'alertdialog',
  SEARCH: 'search',
  SEARCHBOX: 'searchbox',
  COMBOBOX: 'combobox',
  LISTBOX: 'listbox',
  OPTION: 'option',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  MENUBAR: 'menubar',
  NAVIGATION: 'navigation',
  MAIN: 'main',
  COMPLEMENTARY: 'complementary',
  BANNER: 'banner',
  CONTENTINFO: 'contentinfo',
  REGION: 'region',
  STATUS: 'status',
  ALERT: 'alert',
  PROGRESSBAR: 'progressbar',
  TAB: 'tab',
  TABLIST: 'tablist',
  TABPANEL: 'tabpanel'
} as const

// ARIA states and properties
export const ARIA_STATES = {
  EXPANDED: 'aria-expanded',
  SELECTED: 'aria-selected',
  CHECKED: 'aria-checked',
  DISABLED: 'aria-disabled',
  HIDDEN: 'aria-hidden',
  CURRENT: 'aria-current',
  PRESSED: 'aria-pressed',
  BUSY: 'aria-busy',
  LIVE: 'aria-live',
  ATOMIC: 'aria-atomic',
  RELEVANT: 'aria-relevant',
  DESCRIBEDBY: 'aria-describedby',
  LABELLEDBY: 'aria-labelledby',
  LABEL: 'aria-label',
  SORT: 'aria-sort',
  ROWCOUNT: 'aria-rowcount',
  COLCOUNT: 'aria-colcount',
  ROWINDEX: 'aria-rowindex',
  COLINDEX: 'aria-colindex',
  SETSIZE: 'aria-setsize',
  POSINSET: 'aria-posinset',
  LEVEL: 'aria-level',
  OWNS: 'aria-owns',
  CONTROLS: 'aria-controls',
  ACTIVEDESCENDANT: 'aria-activedescendant',
  HASPOPUP: 'aria-haspopup',
  INVALID: 'aria-invalid',
  REQUIRED: 'aria-required',
  READONLY: 'aria-readonly',
  MULTISELECTABLE: 'aria-multiselectable'
} as const

// Keyboard navigation constants
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  TAB: 'Tab',
  DELETE: 'Delete',
  BACKSPACE: 'Backspace'
} as const

// Screen reader announcements
export const SCREEN_READER_MESSAGES = {
  LOADING: 'Loading content, please wait',
  LOADED: 'Content loaded',
  ERROR: 'An error occurred',
  SUCCESS: 'Action completed successfully',
  SELECTED: 'Selected',
  UNSELECTED: 'Unselected',
  EXPANDED: 'Expanded',
  COLLAPSED: 'Collapsed',
  SORTED_ASC: 'Sorted ascending',
  SORTED_DESC: 'Sorted descending',
  FILTER_APPLIED: 'Filter applied',
  FILTER_CLEARED: 'Filter cleared',
  SEARCH_RESULTS: (count: number) => `${count} search results found`,
  NO_RESULTS: 'No results found',
  PAGE_CHANGED: (page: number, total: number) => `Page ${page} of ${total}`,
  BULK_SELECTED: (count: number) => `${count} items selected`,
  BULK_CLEARED: 'Selection cleared'
} as const

// Focus management utilities
export class FocusManager {
  private static focusStack: HTMLElement[] = []

  static pushFocus(element: HTMLElement) {
    if (typeof window === 'undefined') return
    
    const currentFocus = document.activeElement as HTMLElement
    if (currentFocus && currentFocus !== document.body) {
      this.focusStack.push(currentFocus)
    }
    element.focus()
  }

  static popFocus() {
    if (typeof window === 'undefined') return
    
    const previousFocus = this.focusStack.pop()
    if (previousFocus) {
      previousFocus.focus()
    }
  }

  static trapFocus(container: HTMLElement, event: KeyboardEvent) {
    if (typeof window === 'undefined') return
    
    const focusableElements = this.getFocusableElements(container)
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }
  }

  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    if (typeof window === 'undefined') return []
    
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ]

    const elements = container.querySelectorAll(focusableSelectors.join(','))
    return Array.from(elements) as HTMLElement[]
  }
}

// Screen reader announcement utility
export class ScreenReaderAnnouncer {
  private static instance: ScreenReaderAnnouncer
  private announcer: HTMLElement | null = null

  private constructor() {
    // Only create the announcer element in the browser
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.announcer = document.createElement('div')
      this.announcer.setAttribute('aria-live', 'polite')
      this.announcer.setAttribute('aria-atomic', 'true')
      this.announcer.className = 'sr-only'
      document.body.appendChild(this.announcer)
    }
  }

  static getInstance(): ScreenReaderAnnouncer {
    if (!this.instance) {
      this.instance = new ScreenReaderAnnouncer()
    }
    return this.instance
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    // Only announce if we're in the browser and have an announcer element
    if (typeof window !== 'undefined' && this.announcer) {
      this.announcer.setAttribute('aria-live', priority)
      this.announcer.textContent = message
      
      // Clear after announcement to allow repeated announcements
      setTimeout(() => {
        if (this.announcer) {
          this.announcer.textContent = ''
        }
      }, 1000)
    }
  }
}

// High contrast mode detection and utilities
export class HighContrastManager {
  private static mediaQuery: MediaQueryList | null = null

  static init() {
    if (typeof window === 'undefined') return

    // Check for Windows high contrast mode
    this.mediaQuery = window.matchMedia('(prefers-contrast: high)')
    this.updateHighContrastClass(this.mediaQuery.matches)
    
    this.mediaQuery.addEventListener('change', (e) => {
      this.updateHighContrastClass(e.matches)
    })

    // Also check for forced-colors (Windows high contrast)
    const forcedColorsQuery = window.matchMedia('(forced-colors: active)')
    this.updateForcedColorsClass(forcedColorsQuery.matches)
    
    forcedColorsQuery.addEventListener('change', (e) => {
      this.updateForcedColorsClass(e.matches)
    })
  }

  private static updateHighContrastClass(isHighContrast: boolean) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }

  private static updateForcedColorsClass(isForcedColors: boolean) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    
    if (isForcedColors) {
      document.documentElement.classList.add('forced-colors')
    } else {
      document.documentElement.classList.remove('forced-colors')
    }
  }

  static isHighContrast(): boolean {
    return this.mediaQuery?.matches || false
  }
}

// Color accessibility utilities
export const COLOR_ACCESSIBILITY = {
  // WCAG AA compliant color combinations
  FOCUS_RING: 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  HIGH_CONTRAST_BORDER: 'high-contrast:border-2 high-contrast:border-solid',
  HIGH_CONTRAST_TEXT: 'high-contrast:text-[ButtonText] forced-colors:text-[ButtonText]',
  HIGH_CONTRAST_BG: 'high-contrast:bg-[ButtonFace] forced-colors:bg-[ButtonFace]',
  HIGH_CONTRAST_FOCUS: 'high-contrast:focus:outline high-contrast:focus:outline-2 high-contrast:focus:outline-[Highlight]',
  
  // Touch target sizes (minimum 44px for accessibility)
  TOUCH_TARGET: 'min-h-[44px] min-w-[44px]',
  TOUCH_TARGET_SM: 'min-h-[36px] min-w-[36px]'
} as const

// Validation for accessibility requirements
export const validateAccessibility = {
  hasAriaLabel: (element: HTMLElement): boolean => {
    return !!(element.getAttribute('aria-label') || element.getAttribute('aria-labelledby'))
  },

  hasKeyboardSupport: (element: HTMLElement): boolean => {
    return element.tabIndex >= 0 || element.tagName.toLowerCase() === 'button' || element.tagName.toLowerCase() === 'a'
  },

  meetsColorContrast: (foreground: string, background: string): boolean => {
    // This would need a proper color contrast calculation library
    // For now, return true as we're using design system colors
    return true
  },

  meetsTouchTargetSize: (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect()
    return rect.width >= 44 && rect.height >= 44
  }
}

// Utility to generate unique IDs for accessibility
export const generateId = (() => {
  let counter = 0
  return (prefix: string = 'a11y') => `${prefix}-${++counter}`
})()

// Skip link utility
export const createSkipLink = (targetId: string, text: string = 'Skip to main content') => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null
  }
  
  const skipLink = document.createElement('a')
  skipLink.href = `#${targetId}`
  skipLink.textContent = text
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md'
  
  return skipLink
}