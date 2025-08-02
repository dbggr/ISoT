#!/usr/bin/env tsx

/**
 * Verification script for tactical services page transformation
 * Tests the implementation of task 5: Transform services page to tactical table design
 */

import { execSync } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

interface VerificationResult {
  component: string
  status: 'PASS' | 'FAIL' | 'WARNING'
  message: string
}

const results: VerificationResult[] = []

function addResult(component: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string) {
  results.push({ component, status, message })
}

function checkFileExists(filePath: string, description: string): boolean {
  if (existsSync(filePath)) {
    addResult(description, 'PASS', `File exists: ${filePath}`)
    return true
  } else {
    addResult(description, 'FAIL', `File missing: ${filePath}`)
    return false
  }
}

function checkFileContains(filePath: string, searchStrings: string[], description: string): boolean {
  if (!existsSync(filePath)) {
    addResult(description, 'FAIL', `File not found: ${filePath}`)
    return false
  }

  const content = readFileSync(filePath, 'utf-8')
  const missingStrings = searchStrings.filter(str => !content.includes(str))
  
  if (missingStrings.length === 0) {
    addResult(description, 'PASS', `All required content found in ${filePath}`)
    return true
  } else {
    addResult(description, 'FAIL', `Missing content in ${filePath}: ${missingStrings.join(', ')}`)
    return false
  }
}

function main() {
  console.log('🔍 VERIFYING TACTICAL SERVICES PAGE TRANSFORMATION')
  console.log('=' .repeat(60))

  // Check if services page has been updated with tactical styling
  checkFileContains(
    'app/services/page.tsx',
    [
      'NETWORK SERVICES',
      'TacticalButton',
      'Target',
      'bg-black',
      'border-neutral-700',
      'tracking-wider'
    ],
    'Services Page Tactical Header'
  )

  // Check if services table has been transformed
  checkFileContains(
    'components/services/services-table.tsx',
    [
      'TacticalTable',
      'TacticalButton',
      'StatusIndicator',
      'TacticalConfirmationModal',
      'ServiceDetailModal',
      'bg-neutral-900',
      'border-neutral-700'
    ],
    'Services Table Tactical Components'
  )

  // Check if service detail modal exists
  checkFileExists(
    'components/services/service-detail-modal.tsx',
    'Service Detail Modal Component'
  )

  // Check if service detail modal has tactical styling
  checkFileContains(
    'components/services/service-detail-modal.tsx',
    [
      'TacticalModal',
      'TacticalButton',
      'StatusIndicator',
      'bg-neutral-900',
      'text-orange-500',
      'tracking-wider',
      'font-mono'
    ],
    'Service Detail Modal Tactical Styling'
  )

  // Check if advanced filters have been updated with tactical styling
  checkFileContains(
    'components/services/advanced-filters.tsx',
    [
      'TacticalButton',
      'bg-neutral-900',
      'border-neutral-700',
      'text-orange-500',
      'tracking-wider',
      'ADVANCED FILTERS'
    ],
    'Advanced Filters Tactical Styling'
  )

  // Check if tactical components are being used
  checkFileContains(
    'components/services/services-table.tsx',
    [
      'TacticalTableColumn',
      'getServiceStatus',
      'formatServiceType',
      'Badge.*bg-orange-500/20',
      'font-mono'
    ],
    'Tactical Table Implementation'
  )

  // Verify tactical styling patterns
  checkFileContains(
    'components/services/services-table.tsx',
    [
      'bg-neutral-800',
      'text-white',
      'hover:text-orange-500',
      'placeholder:text-neutral-500',
      'focus:border-orange-500'
    ],
    'Tactical Color Scheme'
  )

  // Check if service type badges use tactical styling
  checkFileContains(
    'components/services/services-table.tsx',
    [
      'bg-orange-500/20',
      'text-orange-500',
      'border-orange-500/30',
      'formatServiceType'
    ],
    'Service Type Badges Tactical Styling'
  )

  // Check if status indicators are implemented
  checkFileContains(
    'components/services/services-table.tsx',
    [
      'StatusIndicator',
      'getServiceStatus',
      'showPulse',
      'online',
      'warning',
      'offline'
    ],
    'Status Indicators Implementation'
  )

  // Summary
  console.log('\n📊 VERIFICATION SUMMARY')
  console.log('=' .repeat(60))
  
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const warnings = results.filter(r => r.status === 'WARNING').length
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️'
    console.log(`${icon} ${result.component}: ${result.message}`)
  })
  
  console.log('\n' + '=' .repeat(60))
  console.log(`✅ PASSED: ${passed}`)
  console.log(`❌ FAILED: ${failed}`)
  console.log(`⚠️  WARNINGS: ${warnings}`)
  console.log(`📊 TOTAL: ${results.length}`)
  
  if (failed === 0) {
    console.log('\n🎉 ALL TACTICAL SERVICES PAGE REQUIREMENTS VERIFIED!')
    console.log('✨ Task 5: Transform services page to tactical table design - COMPLETE')
  } else {
    console.log('\n🔧 SOME REQUIREMENTS NEED ATTENTION')
    console.log('Please review the failed checks above.')
  }

  // Check if the app compiles without errors
  try {
    console.log('\n🔨 CHECKING COMPILATION...')
    execSync('npm run build', { stdio: 'pipe' })
    addResult('Build Check', 'PASS', 'Application compiles successfully')
    console.log('✅ Application compiles successfully')
  } catch (error) {
    addResult('Build Check', 'FAIL', 'Application has compilation errors')
    console.log('❌ Application has compilation errors')
    console.log('Please fix compilation errors before proceeding.')
  }
}

if (require.main === module) {
  main()
}