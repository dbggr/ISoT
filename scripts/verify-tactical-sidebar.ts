#!/usr/bin/env tsx

/**
 * Verification script for tactical sidebar styling
 * Tests the implementation of task 3: Update sidebar navigation with full tactical styling
 */

import { readFileSync } from 'fs'
import { join } from 'path'

interface SidebarRequirement {
  id: string
  description: string
  test: (content: string) => boolean
  requirement: string
}

const sidebarRequirements: SidebarRequirement[] = [
  {
    id: '2.1',
    description: 'Enhanced sidebar header with proper "INFRASTRUCTURE" and "Source of Truth" styling',
    test: (content) => {
      return content.includes('text-orange-500 font-bold text-lg tracking-wider uppercase') &&
             content.includes('INFRASTRUCTURE') &&
             content.includes('Source of Truth') &&
             content.includes('text-neutral-400 text-xs tracking-wide')
    },
    requirement: 'Enhance sidebar header with proper "INFRASTRUCTURE" and "Source of Truth" styling'
  },
  {
    id: '2.2',
    description: 'Tactical navigation items with uppercase labels and tracking-wider text',
    test: (content) => {
      return content.includes('tracking-wider uppercase') &&
             content.includes('COMMAND') &&
             content.includes('GROUPS') &&
             content.includes('SERVICES')
    },
    requirement: 'Implement tactical navigation items with uppercase labels and tracking-wider text'
  },
  {
    id: '2.3',
    description: 'Proper active state styling with orange background and white text',
    test: (content) => {
      return content.includes('bg-orange-500 text-white') &&
             content.includes('shadow-lg') &&
             content.includes('aria-current')
    },
    requirement: 'Add proper active state styling with orange background and white text'
  },
  {
    id: '2.4',
    description: 'Collapse/expand functionality with tactical animations',
    test: (content) => {
      return content.includes('transition-all duration-300 ease-in-out') &&
             content.includes('transition-transform duration-300') &&
             content.includes('transition-opacity duration-300') &&
             content.includes('aria-label')
    },
    requirement: 'Ensure collapse/expand functionality works with tactical animations'
  },
  {
    id: '2.5',
    description: 'System status panel with online indicator and metrics',
    test: (content) => {
      return content.includes('SYSTEM ONLINE') &&
             content.includes('animate-pulse') &&
             content.includes('font-mono') &&
             content.includes('UPTIME:') &&
             content.includes('GROUPS:') &&
             content.includes('SERVICES:') &&
             content.includes('STATUS:') &&
             content.includes('OPERATIONAL')
    },
    requirement: 'Add system status panel with online indicator and metrics'
  },
  {
    id: '7.4',
    description: 'Responsive sidebar behavior for mobile',
    test: (content) => {
      return content.includes('fixed md:relative') &&
             content.includes('z-50 md:z-auto') &&
             content.includes('Mobile Overlay')
    },
    requirement: 'Ensure responsive behavior works across device sizes'
  },
  {
    id: '7.5',
    description: 'Smooth transitions and tactical animations',
    test: (content) => {
      return content.includes('transition-all duration-200') &&
             content.includes('transition-colors duration-200') &&
             content.includes('ease-in-out')
    },
    requirement: 'Implement smooth transitions maintaining tactical theme'
  }
]

function verifySidebarImplementation(): void {
  console.log('🔍 Verifying Tactical Sidebar Implementation...\n')

  try {
    const pageContent = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf-8')
    
    let passedTests = 0
    let totalTests = sidebarRequirements.length

    sidebarRequirements.forEach((req) => {
      const passed = req.test(pageContent)
      const status = passed ? '✅' : '❌'
      
      console.log(`${status} Requirement ${req.id}: ${req.description}`)
      if (passed) {
        passedTests++
      } else {
        console.log(`   Expected: ${req.requirement}`)
      }
    })

    console.log(`\n📊 Results: ${passedTests}/${totalTests} requirements met`)
    
    if (passedTests === totalTests) {
      console.log('🎉 All tactical sidebar requirements implemented successfully!')
    } else {
      console.log('⚠️  Some requirements need attention.')
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ Error reading files:', error)
    process.exit(1)
  }
}

// Additional checks for tactical styling consistency
function verifyTacticalStyling(): void {
  console.log('\n🎨 Verifying Tactical Styling Consistency...\n')

  try {
    const pageContent = readFileSync(join(process.cwd(), 'app/page.tsx'), 'utf-8')
    
    const stylingChecks = [
      {
        name: 'Dark theme colors',
        test: () => pageContent.includes('bg-neutral-900') && pageContent.includes('border-neutral-700')
      },
      {
        name: 'Orange accent colors',
        test: () => pageContent.includes('text-orange-500') && pageContent.includes('bg-orange-500')
      },
      {
        name: 'Monospace fonts for technical data',
        test: () => pageContent.includes('font-mono')
      },
      {
        name: 'Uppercase tactical labels',
        test: () => pageContent.includes('uppercase') && pageContent.includes('tracking-wider')
      },
      {
        name: 'Proper accessibility attributes',
        test: () => pageContent.includes('aria-label') && pageContent.includes('aria-current')
      }
    ]

    stylingChecks.forEach((check) => {
      const passed = check.test()
      const status = passed ? '✅' : '❌'
      console.log(`${status} ${check.name}`)
    })

  } catch (error) {
    console.error('❌ Error verifying styling:', error)
  }
}

if (require.main === module) {
  verifySidebarImplementation()
  verifyTacticalStyling()
}

export { verifySidebarImplementation, verifyTacticalStyling }