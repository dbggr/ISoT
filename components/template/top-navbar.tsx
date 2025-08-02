"use client"

import Link from "next/link"

interface NavigationSection {
  id: string
  label: string
}

interface TopNavbarProps {
  title: string
  activeSection?: NavigationSection
  sidebarCollapsed: boolean
  breadcrumb?: string
}

// Helper function to get the href for each section
const getSectionHref = (sectionId: string): string => {
  switch (sectionId) {
    case 'overview':
      return '/'
    case 'groups':
      return '/groups'
    case 'services':
      return '/services'
    default:
      return '/'
  }
}

export function TopNavbar({ title, activeSection, sidebarCollapsed, breadcrumb }: TopNavbarProps) {
  return (
    <div className="h-16 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="text-sm text-neutral-400">
          <Link href="/" className="text-neutral-400 hover:text-orange-400 hover:underline transition-colors duration-200">
            {title}
          </Link>
          <span className="mx-2">/</span>
          {activeSection && (
            <>
              <Link 
                href={getSectionHref(activeSection.id)} 
                className="text-orange-500 hover:text-orange-400 hover:underline transition-colors duration-200"
              >
                {activeSection.label}
              </Link>
              {breadcrumb && (
                <>
                  <span className="mx-2">/</span>
                  <span className="text-neutral-300">{breadcrumb}</span>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-xs text-neutral-500">
          VERSION: {process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0"}
        </div>
      </div>
    </div>
  )
}