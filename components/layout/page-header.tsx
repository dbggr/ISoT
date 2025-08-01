"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar-old"
import { Separator } from "@/components/ui/separator"
import { GlobalSearch } from "@/components/common/global-search"
import { Skeleton } from "@/components/ui/skeleton"

interface PageHeaderProps {
  title?: string | React.ReactNode
  description?: string
  action?: React.ReactNode
}

interface Breadcrumb {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

// Helper function to generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: Breadcrumb[] = [
    { label: 'Dashboard', href: '/', icon: Home }
  ]

  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    // Convert segment to readable label
    let label = segment.charAt(0).toUpperCase() + segment.slice(1)
    
    // Handle specific routes
    if (segment === 'services') {
      label = 'Services'
    } else if (segment === 'groups') {
      label = 'Groups'
    } else if (segment === 'new') {
      label = 'New'
    } else if (segment.length === 36 && segment.includes('-')) {
      // This looks like a UUID, we'll show it as "Details" for now
      label = 'Details'
    }

    breadcrumbs.push({
      label,
      href: currentPath,
    })
  })

  return breadcrumbs
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)

  // If no title is provided, use the last breadcrumb as the title
  const pageTitle = title || breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard'

  return (
    <header className="flex min-h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex-col sm:flex-row bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
      <div className="flex items-center gap-2 px-4 w-full sm:w-auto">
        <SidebarTrigger className="-ml-1 touch-friendly text-gray-300 hover:text-pink-400" />
        <Separator orientation="vertical" className="mr-2 h-4 hidden sm:block bg-gray-700" />
        
        {/* Breadcrumb Navigation - Hidden on mobile, shown on tablet+ */}
        <nav className="hidden sm:flex items-center space-x-1 text-sm text-gray-400">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={breadcrumb.href} className="flex items-center">
              {index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-gray-600" />}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-pink-400 flex items-center gap-1">
                  {breadcrumb.icon && <breadcrumb.icon className="h-4 w-4" />}
                  {breadcrumb.label}
                </span>
              ) : (
                <Link 
                  href={breadcrumb.href}
                  className="hover:text-pink-400 transition-colors flex items-center gap-1 touch-friendly text-gray-400"
                >
                  {breadcrumb.icon && <breadcrumb.icon className="h-4 w-4" />}
                  {breadcrumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Page Title, Search, and Action - Responsive layout */}
      <div className="flex flex-1 items-start sm:items-center justify-between px-4 w-full flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-100">
            {typeof pageTitle === 'string' ? pageTitle : pageTitle}
          </h1>
          {description && (
            <p className="text-sm text-gray-400 hidden sm:block">{description}</p>
          )}
        </div>
        
        {/* Global Search - Hidden on dashboard, shown on other pages */}
        {pathname !== '/' && (
          <div className="w-full sm:w-80 order-first sm:order-none">
            <Suspense fallback={<Skeleton className="h-10 w-full bg-gray-800" />}>
              <GlobalSearch 
                placeholder="Search services and groups..."
                className="w-full"
              />
            </Suspense>
          </div>
        )}
        
        {action && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {action}
          </div>
        )}
      </div>
    </header>
  )
}