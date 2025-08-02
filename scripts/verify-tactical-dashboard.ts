#!/usr/bin/env tsx

/**
 * Verification script for Task 4: Redesign dashboard/command center page with tactical layout
 * 
 * This script verifies that all required sections are implemented:
 * 1. Infrastructure overview section with service and group statistics
 * 2. Activity log section with terminal-like styling and timestamps
 * 3. Network status section with connection and performance metrics
 * 4. Metrics chart with grid background and orange line visualization
 * 5. Quick stats section with service breakdowns and recent activity
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const COMMAND_PAGE_PATH = join(process.cwd(), 'app/command/page.tsx')

function verifyTacticalDashboard() {
  console.log('🔍 Verifying Tactical Dashboard Implementation...\n')
  
  try {
    const content = readFileSync(COMMAND_PAGE_PATH, 'utf-8')
    
    const checks = [
      {
        name: '1. Infrastructure Overview Section',
        test: () => content.includes('InfrastructureOverview') && 
                   content.includes('Network resource statistics') &&
                   content.includes('SERVICE BREAKDOWN'),
        requirement: 'Task requirement 1: Create infrastructure overview section with service and group statistics'
      },
      {
        name: '2. Activity Log Section',
        test: () => content.includes('ActivityLog') && 
                   content.includes('terminal-like styling') &&
                   content.includes('formatTimestamp') &&
                   content.includes('bg-black border border-neutral-700') &&
                   content.includes('font-mono'),
        requirement: 'Task requirement 2: Implement activity log section with terminal-like styling and timestamps'
      },
      {
        name: '3. Network Status Section',
        test: () => content.includes('NetworkStatus') && 
                   content.includes('Connection and performance metrics') &&
                   content.includes('NETWORK ONLINE') &&
                   content.includes('CONNECTION RATE') &&
                   content.includes('LATENCY') &&
                   content.includes('THROUGHPUT') &&
                   content.includes('UPTIME'),
        requirement: 'Task requirement 3: Build network status section with connection and performance metrics'
      },
      {
        name: '4. Metrics Chart Section',
        test: () => content.includes('MetricsChart') && 
                   content.includes('Service activity over time') &&
                   content.includes('Grid Background') &&
                   content.includes('stroke="#f97316"') &&
                   content.includes('pattern id="grid"'),
        requirement: 'Task requirement 4: Add metrics chart with grid background and orange line visualization'
      },
      {
        name: '5. Quick Stats Section',
        test: () => content.includes('QuickStats') && 
                   content.includes('Recent activity and breakdowns') &&
                   content.includes('NEW SERVICES (24H)') &&
                   content.includes('NEW GROUPS (24H)') &&
                   content.includes('SERVICE DISTRIBUTION'),
        requirement: 'Task requirement 5: Create quick stats section with service breakdowns and recent activity'
      },
      {
        name: '6. Tactical Layout Grid',
        test: () => content.includes('lg:grid-cols-12') &&
                   content.includes('lg:col-span-4') &&
                   content.includes('lg:col-span-8'),
        requirement: 'Proper tactical grid layout as specified in design'
      },
      {
        name: '7. TacticalCard Usage',
        test: () => content.includes('TacticalCard') &&
                   content.includes('from "@/components/tactical"'),
        requirement: 'Uses tactical components for consistent styling'
      },
      {
        name: '8. Status Indicators',
        test: () => content.includes('StatusIndicator') &&
                   content.includes('status="online"'),
        requirement: 'Requirements 8.1, 8.3: Tactical status indicators'
      },
      {
        name: '9. Monospace Typography',
        test: () => content.includes('font-mono') &&
                   content.includes('tracking-wider'),
        requirement: 'Tactical typography with monospace fonts for technical data'
      },
      {
        name: '10. Orange Accent Colors',
        test: () => content.includes('text-orange-500') &&
                   content.includes('bg-orange-500'),
        requirement: 'Consistent orange accent color usage'
      }
    ]
    
    let passedChecks = 0
    let totalChecks = checks.length
    
    checks.forEach((check, index) => {
      const passed = check.test()
      const status = passed ? '✅' : '❌'
      console.log(`${status} ${check.name}`)
      console.log(`   ${check.requirement}`)
      
      if (passed) {
        passedChecks++
      } else {
        console.log(`   ⚠️  Check failed - feature may not be properly implemented`)
      }
      console.log()
    })
    
    console.log(`📊 Summary: ${passedChecks}/${totalChecks} checks passed`)
    
    if (passedChecks === totalChecks) {
      console.log('🎉 All tactical dashboard requirements implemented successfully!')
      return true
    } else {
      console.log('⚠️  Some requirements may need attention')
      return false
    }
    
  } catch (error) {
    console.error('❌ Error reading command page file:', error)
    return false
  }
}

// Run verification
const success = verifyTacticalDashboard()
process.exit(success ? 0 : 1)