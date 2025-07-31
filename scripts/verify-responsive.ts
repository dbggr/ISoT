#!/usr/bin/env tsx

/**
 * Responsive Design Verification Script
 * 
 * This script verifies that the application meets responsive design requirements
 * by checking CSS classes, component implementations, and accessibility features.
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

interface ResponsiveCheck {
  name: string
  description: string
  check: () => boolean | { passed: boolean; details: string }
  severity: 'error' | 'warning' | 'info'
}

interface CheckResult {
  name: string
  description: string
  passed: boolean
  severity: 'error' | 'warning' | 'info'
  details?: string
}

class ResponsiveVerifier {
  private projectRoot: string
  private results: CheckResult[] = []

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot
  }

  private readFile(filePath: string): string {
    try {
      return readFileSync(join(this.projectRoot, filePath), 'utf-8')
    } catch (error) {
      return ''
    }
  }

  private findFiles(dir: string, extensions: string[]): string[] {
    const files: string[] = []
    
    const scanDir = (currentDir: string) => {
      try {
        const items = readdirSync(join(this.projectRoot, currentDir))
        
        for (const item of items) {
          const fullPath = join(currentDir, item)
          const absolutePath = join(this.projectRoot, fullPath)
          
          if (statSync(absolutePath).isDirectory()) {
            // Skip node_modules and .next directories
            if (!item.startsWith('.') && item !== 'node_modules') {
              scanDir(fullPath)
            }
          } else if (extensions.includes(extname(item))) {
            files.push(fullPath)
          }
        }
      } catch (error) {
        // Directory doesn't exist or can't be read
      }
    }
    
    scanDir(dir)
    return files
  }

  private checkTailwindConfig(): boolean {
    const tailwindConfig = this.readFile('tailwind.config.js')
    
    // Check for responsive breakpoints
    const hasBreakpoints = tailwindConfig.includes('screens') || 
                          tailwindConfig.includes('sm:') ||
                          tailwindConfig.includes('md:') ||
                          tailwindConfig.includes('lg:')
    
    return hasBreakpoints
  }

  private checkGlobalCSS(): { passed: boolean; details: string } {
    const globalCSS = this.readFile('app/globals.css')
    const issues: string[] = []
    
    // Check for responsive utilities
    if (!globalCSS.includes('container-responsive')) {
      issues.push('Missing container-responsive utility')
    }
    
    if (!globalCSS.includes('touch-target')) {
      issues.push('Missing touch-target utility')
    }
    
    if (!globalCSS.includes('@media')) {
      issues.push('No media queries found')
    }
    
    if (!globalCSS.includes('prefers-reduced-motion')) {
      issues.push('Missing reduced motion support')
    }
    
    if (!globalCSS.includes('prefers-contrast')) {
      issues.push('Missing high contrast support')
    }
    
    return {
      passed: issues.length === 0,
      details: issues.length > 0 ? `Issues found: ${issues.join(', ')}` : 'All responsive CSS utilities present'
    }
  }

  private checkComponentResponsiveness(): { passed: boolean; details: string } {
    const componentFiles = this.findFiles('components', ['.tsx', '.ts'])
    const issues: string[] = []
    let responsiveComponents = 0
    
    for (const file of componentFiles) {
      const content = this.readFile(file)
      
      // Check for responsive classes
      const hasResponsiveClasses = /\b(sm:|md:|lg:|xl:|2xl:)/.test(content)
      const hasTouchTargets = content.includes('touch-target')
      const hasContainerResponsive = content.includes('container-responsive')
      
      if (hasResponsiveClasses || hasTouchTargets || hasContainerResponsive) {
        responsiveComponents++
      }
      
      // Check for common responsive issues
      if (content.includes('fixed') && content.includes('w-') && !hasResponsiveClasses) {
        issues.push(`${file}: Fixed width without responsive classes`)
      }
      
      if (content.includes('Button') && !content.includes('touch-target') && !hasTouchTargets) {
        issues.push(`${file}: Button without touch-target class`)
      }
    }
    
    return {
      passed: responsiveComponents > 0 && issues.length === 0,
      details: `${responsiveComponents} responsive components found. ${issues.length > 0 ? 'Issues: ' + issues.slice(0, 3).join(', ') : 'No issues found'}`
    }
  }

  private checkPageResponsiveness(): { passed: boolean; details: string } {
    const pageFiles = this.findFiles('app', ['.tsx'])
    const issues: string[] = []
    let responsivePages = 0
    
    for (const file of pageFiles) {
      if (file.includes('layout.tsx') || file.includes('loading.tsx') || file.includes('error.tsx')) {
        continue
      }
      
      const content = this.readFile(file)
      
      // Check for responsive classes
      const hasResponsiveClasses = /\b(sm:|md:|lg:|xl:|2xl:)/.test(content)
      const hasContainerResponsive = content.includes('container-responsive')
      const hasSEOHead = content.includes('SEOHead')
      
      if (hasResponsiveClasses || hasContainerResponsive) {
        responsivePages++
      }
      
      if (!hasSEOHead && content.includes('export default function')) {
        issues.push(`${file}: Missing SEOHead component`)
      }
    }
    
    return {
      passed: responsivePages > 0,
      details: `${responsivePages} responsive pages found. ${issues.length > 0 ? 'SEO issues: ' + issues.length : 'All pages have proper responsive design'}`
    }
  }

  private checkAccessibilityFeatures(): { passed: boolean; details: string } {
    const files = this.findFiles('components', ['.tsx'])
    const features: string[] = []
    
    for (const file of files) {
      const content = this.readFile(file)
      
      if (content.includes('aria-')) {
        features.push('ARIA attributes')
      }
      
      if (content.includes('role=')) {
        features.push('ARIA roles')
      }
      
      if (content.includes('tabIndex') || content.includes('tabindex')) {
        features.push('Tab navigation')
      }
      
      if (content.includes('sr-only')) {
        features.push('Screen reader support')
      }
      
      if (content.includes('focus:') || content.includes('focus-visible:')) {
        features.push('Focus management')
      }
    }
    
    const uniqueFeatures = [...new Set(features)]
    
    return {
      passed: uniqueFeatures.length >= 3,
      details: `Accessibility features found: ${uniqueFeatures.join(', ')}`
    }
  }

  private checkMobileOptimizations(): { passed: boolean; details: string } {
    const files = this.findFiles('components', ['.tsx'])
    const optimizations: string[] = []
    
    for (const file of files) {
      const content = this.readFile(file)
      
      if (content.includes('touch-target')) {
        optimizations.push('Touch targets')
      }
      
      if (content.includes('overflow-x-auto') || content.includes('table-responsive')) {
        optimizations.push('Horizontal scrolling')
      }
      
      if (content.includes('hidden') && content.includes('sm:') || content.includes('md:')) {
        optimizations.push('Responsive visibility')
      }
      
      if (content.includes('Suspense') || content.includes('lazy')) {
        optimizations.push('Lazy loading')
      }
      
      if (content.includes('VirtualTable') || content.includes('virtual')) {
        optimizations.push('Virtualization')
      }
    }
    
    const uniqueOptimizations = [...new Set(optimizations)]
    
    return {
      passed: uniqueOptimizations.length >= 2,
      details: `Mobile optimizations found: ${uniqueOptimizations.join(', ')}`
    }
  }

  private checkPerformanceOptimizations(): { passed: boolean; details: string } {
    const nextConfig = this.readFile('next.config.js')
    const packageJson = this.readFile('package.json')
    
    const optimizations: string[] = []
    
    if (nextConfig.includes('experimental') && nextConfig.includes('appDir')) {
      optimizations.push('App Router')
    }
    
    if (packageJson.includes('next/image')) {
      optimizations.push('Image optimization')
    }
    
    const lazyComponents = this.readFile('components/common/lazy-components.tsx')
    if (lazyComponents.includes('lazy(')) {
      optimizations.push('Component lazy loading')
    }
    
    const cacheFile = this.readFile('lib/cache.ts')
    if (cacheFile.includes('LRU') || cacheFile.includes('cache')) {
      optimizations.push('API caching')
    }
    
    return {
      passed: optimizations.length >= 2,
      details: `Performance optimizations: ${optimizations.join(', ')}`
    }
  }

  private runCheck(check: ResponsiveCheck): CheckResult {
    try {
      const result = check.check()
      
      if (typeof result === 'boolean') {
        return {
          name: check.name,
          description: check.description,
          passed: result,
          severity: check.severity
        }
      } else {
        return {
          name: check.name,
          description: check.description,
          passed: result.passed,
          severity: check.severity,
          details: result.details
        }
      }
    } catch (error) {
      return {
        name: check.name,
        description: check.description,
        passed: false,
        severity: 'error',
        details: `Check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  public verify(): CheckResult[] {
    const checks: ResponsiveCheck[] = [
      {
        name: 'Tailwind Configuration',
        description: 'Check if Tailwind CSS is properly configured with responsive breakpoints',
        check: () => this.checkTailwindConfig(),
        severity: 'error'
      },
      {
        name: 'Global CSS Utilities',
        description: 'Verify responsive utilities are defined in global CSS',
        check: () => this.checkGlobalCSS(),
        severity: 'error'
      },
      {
        name: 'Component Responsiveness',
        description: 'Check if components use responsive design patterns',
        check: () => this.checkComponentResponsiveness(),
        severity: 'warning'
      },
      {
        name: 'Page Responsiveness',
        description: 'Verify pages implement responsive layouts',
        check: () => this.checkPageResponsiveness(),
        severity: 'warning'
      },
      {
        name: 'Accessibility Features',
        description: 'Check for accessibility features that support responsive design',
        check: () => this.checkAccessibilityFeatures(),
        severity: 'warning'
      },
      {
        name: 'Mobile Optimizations',
        description: 'Verify mobile-specific optimizations are implemented',
        check: () => this.checkMobileOptimizations(),
        severity: 'info'
      },
      {
        name: 'Performance Optimizations',
        description: 'Check for performance optimizations that benefit responsive design',
        check: () => this.checkPerformanceOptimizations(),
        severity: 'info'
      }
    ]

    this.results = checks.map(check => this.runCheck(check))
    return this.results
  }

  public printResults(): void {
    console.log('\n🔍 Responsive Design Verification Results\n')
    console.log('=' .repeat(50))
    
    const errors = this.results.filter(r => !r.passed && r.severity === 'error')
    const warnings = this.results.filter(r => !r.passed && r.severity === 'warning')
    const infos = this.results.filter(r => !r.passed && r.severity === 'info')
    const passed = this.results.filter(r => r.passed)
    
    // Print summary
    console.log(`\n📊 Summary:`)
    console.log(`✅ Passed: ${passed.length}`)
    console.log(`❌ Errors: ${errors.length}`)
    console.log(`⚠️  Warnings: ${warnings.length}`)
    console.log(`ℹ️  Info: ${infos.length}`)
    
    // Print detailed results
    for (const result of this.results) {
      const icon = result.passed ? '✅' : 
                   result.severity === 'error' ? '❌' : 
                   result.severity === 'warning' ? '⚠️' : 'ℹ️'
      
      console.log(`\n${icon} ${result.name}`)
      console.log(`   ${result.description}`)
      
      if (result.details) {
        console.log(`   Details: ${result.details}`)
      }
    }
    
    // Print recommendations
    if (errors.length > 0 || warnings.length > 0) {
      console.log('\n💡 Recommendations:')
      
      if (errors.length > 0) {
        console.log('   • Fix all errors before deploying to production')
      }
      
      if (warnings.length > 0) {
        console.log('   • Address warnings to improve responsive design')
      }
      
      console.log('   • Test on multiple devices and screen sizes')
      console.log('   • Use browser dev tools to simulate different viewports')
      console.log('   • Consider using the ResponsiveTest component for debugging')
    }
    
    console.log('\n' + '='.repeat(50))
    
    // Exit with appropriate code
    if (errors.length > 0) {
      process.exit(1)
    } else if (warnings.length > 0) {
      process.exit(0) // Warnings don't fail the build
    } else {
      console.log('\n🎉 All responsive design checks passed!')
      process.exit(0)
    }
  }
}

// Run the verification if this script is executed directly
if (require.main === module) {
  const verifier = new ResponsiveVerifier()
  const results = verifier.verify()
  verifier.printResults()
}

export { ResponsiveVerifier, type CheckResult }