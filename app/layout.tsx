import type React from "react"
import type { Metadata } from "next"
import { Geist_Mono as GeistMono } from "next/font/google"
import "./globals.css"

import { AppSidebar } from '@/components/layout/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar-old'
import { Toaster } from '@/components/ui/toast'
import { AccessibilityProvider } from '@/components/common/accessibility-provider'
import { PerformanceMonitor } from '@/components/common/performance-monitor'
import { CacheInitializer } from '@/components/common/cache-initializer'
import { cn } from '@/lib/utils'

const geistMono = GeistMono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: 'Network Source of Truth',
    template: '%s | Network Source of Truth'
  },
  description: 'Infrastructure Source of Truth system for managing network infrastructure information. Centralized platform for tracking network services, groups, and configurations.',
  keywords: [
    'network infrastructure',
    'source of truth',
    'network management',
    'infrastructure as code',
    'network services',
    'VLAN management',
    'IP address management',
    'network topology'
  ],
  authors: [{ name: 'Network Infrastructure Team' }],
  creator: 'Network Infrastructure Team',
  publisher: 'Network Infrastructure Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Network Source of Truth',
    description: 'Infrastructure Source of Truth system for managing network infrastructure information. Centralized platform for tracking network services, groups, and configurations.',
    siteName: 'Network Source of Truth',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Network Source of Truth Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Network Source of Truth',
    description: 'Infrastructure Source of Truth system for managing network infrastructure information.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistMono.className} bg-black text-white antialiased`}>{children}</body>
    </html>
  )
}