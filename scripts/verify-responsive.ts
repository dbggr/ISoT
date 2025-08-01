#!/usr/bin/env tsx

/**
 * Script to verify responsive design and tactical styling implementation
 * Tests the main page components and sidebar functionality
 */

import { readFileSync } from 'fs'
import { join } from 'path'

interface TestResult {
  test: string
  passed: boolean
  message: string
}

const results: TestResult[] = []

function addResult(test: string, passed: boolean, message: string) {
  results.push({ test, passed, message })
}

function testFile(filePath: string, testName: string, checks: Array<{ pattern: RegExp; description: string }>) {
  try {
    const content = readFileSync(join(process.cwd(), filePath), 'utf-8')
    
    for (const check of checks) {
      const found = check.pattern.test(content)
      addResult(
        `${testName} - ${check.description}`,
        found,
        found ? 'Found' : 'Missing'
      )
    }
  } catch (error) {
    addResult(testName, false, `File not found: ${filePath}`)
  }
}

// Test main page tactical styling
testFile('app/page.tsx', 'Main Page', [
  { pattern: /INFRASTRUCTURE/, description: 'Tactical header text' },
  { pattern: /bg-neutral-900/, description: 'Dark tactical background' },
  { pattern: /text-orange-500/, description: 'Orange accent color' },
  { pattern: /tracking-wider/, description: 'Tactical text spacing' },
  { pattern: /sidebarCollapsed/, description: 'Sidebar collapse functionality' },
  { pattern: /md:relative/, description: 'Responsive sidebar behavior' },
  { pattern: /fixed.*md:relative/, description: 'Mobile sidebar overlay' }
])

// Test command page tactical styling
testFile('app/command/page.tsx', 'Command Page', [
  { pattern: /useServices/, description: 'Data hooks integration' },
  { pattern: /useGroups/, description: 'Groups data integration' },
  { pattern: /bg-neutral-900/, description: 'Tactical card backgrounds' },
  { pattern: /text-orange-500/, description: 'Orange accent colors' },
  { pattern: /font-mono/, description: 'Monospace technical data' },
  { pattern: /tracking-wider/, description: 'Tactical text spacing' },
  { pattern: /RECENT SERVICES/, description: 'Uppercase tactical labels' }
])

// Test responsive design patterns
testFile('app/page.tsx', 'Responsive Design', [
  { pattern: /w-16.*w-70/, description: 'Sidebar width responsive states' },
  { pattern: /fixed.*md:relative/, description: 'Mobile sidebar positioning' },
  { pattern: /md:hidden/, description: 'Mobile overlay visibility' },
  { pattern: /sm:w-5.*sm:h-5/, description: 'Icon responsive sizing' }
])

// Test tactical theme consistency
testFile('app/page.tsx', 'Tactical Theme', [
  { pattern: /bg-black/, description: 'Black primary background' },
  { pattern: /bg-neutral-900/, description: 'Dark secondary backgrounds' },
  { pattern: /border-neutral-700/, description: 'Neutral borders' },
  { pattern: /text-white/, description: 'White primary text' },
  { pattern: /text-neutral-400/, description: 'Neutral secondary text' },
  { pattern: /hover:text-orange-500/, description: 'Orange hover states' }
])

// Run tests
console.log('🔍 Verifying Tactical Frontend Implementation...\n')

const passed = results.filter(r => r.passed).length
const total = results.length

// Display results
results.forEach(result => {
  const icon = result.passed ? '✅' : '❌'
  console.log(`${icon} ${result.test}: ${result.message}`)
})

console.log(`\n📊 Results: ${passed}/${total} tests passed`)

if (passed === total) {
  console.log('🎉 All tactical styling and responsive design checks passed!')
  process.exit(0)
} else {
  console.log('⚠️  Some checks failed. Review the implementation.')
  process.exit(1)
}