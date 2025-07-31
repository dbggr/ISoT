"use client"

import Head from 'next/head'
import { usePathname } from 'next/navigation'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  noIndex?: boolean
  canonical?: string
}

export function SEOHead({
  title,
  description,
  keywords = [],
  image = '/og-image.png',
  noIndex = false,
  canonical
}: SEOHeadProps) {
  const pathname = usePathname()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  
  const fullTitle = title 
    ? `${title} | Network Source of Truth`
    : 'Network Source of Truth'
  
  const fullDescription = description || 
    'Infrastructure Source of Truth system for managing network infrastructure information. Centralized platform for tracking network services, groups, and configurations.'
  
  const fullUrl = `${baseUrl}${pathname}`
  const canonicalUrl = canonical ? `${baseUrl}${canonical}` : fullUrl
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`

  const keywordString = [
    'network infrastructure',
    'source of truth',
    'network management',
    'infrastructure as code',
    'network services',
    'VLAN management',
    'IP address management',
    'network topology',
    ...keywords
  ].join(', ')

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={keywordString} />
      <meta name="author" content="Network Infrastructure Team" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${title || 'Network Source of Truth'} Dashboard`} />
      <meta property="og:site_name" content="Network Source of Truth" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Additional Meta Tags */}
      <meta name="format-detection" content="telephone=no, address=no, email=no" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="msapplication-TileColor" content="#ffffff" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Network Source of Truth",
            "description": fullDescription,
            "url": baseUrl,
            "applicationCategory": "NetworkManagement",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "author": {
              "@type": "Organization",
              "name": "Network Infrastructure Team"
            }
          })
        }}
      />
    </Head>
  )
}

// Predefined SEO configurations for common pages
export const seoConfigs = {
  dashboard: {
    title: 'Dashboard',
    description: 'Overview of your network infrastructure. View statistics, recent services, and groups at a glance.',
    keywords: ['dashboard', 'overview', 'statistics', 'network overview']
  },
  services: {
    title: 'Services',
    description: 'Manage network services and their configurations. View, create, edit, and organize network infrastructure services.',
    keywords: ['network services', 'service management', 'IP addresses', 'ports', 'VLAN']
  },
  groups: {
    title: 'Groups',
    description: 'Organize services into logical groups. Create and manage service groups for better organization and access control.',
    keywords: ['service groups', 'organization', 'group management', 'access control']
  },
  serviceDetail: (serviceName: string) => ({
    title: `Service: ${serviceName}`,
    description: `View and manage details for the ${serviceName} network service including IP addresses, ports, VLAN configuration, and group assignment.`,
    keywords: ['service details', 'network service', 'configuration', serviceName.toLowerCase()]
  }),
  groupDetail: (groupName: string) => ({
    title: `Group: ${groupName}`,
    description: `View and manage the ${groupName} service group including associated services and group configuration.`,
    keywords: ['group details', 'service group', 'group management', groupName.toLowerCase()]
  }),
  createService: {
    title: 'Create Service',
    description: 'Add a new network service to your infrastructure. Configure IP addresses, ports, VLAN, domain, and group assignment.',
    keywords: ['create service', 'add service', 'new service', 'service configuration'],
    noIndex: true
  },
  editService: (serviceName: string) => ({
    title: `Edit Service: ${serviceName}`,
    description: `Edit configuration for the ${serviceName} network service. Update IP addresses, ports, VLAN, domain, and group assignment.`,
    keywords: ['edit service', 'update service', 'service configuration', serviceName.toLowerCase()],
    noIndex: true
  }),
  createGroup: {
    title: 'Create Group',
    description: 'Create a new service group to organize your network services. Define group name and description.',
    keywords: ['create group', 'add group', 'new group', 'group organization'],
    noIndex: true
  },
  editGroup: (groupName: string) => ({
    title: `Edit Group: ${groupName}`,
    description: `Edit the ${groupName} service group. Update group name and description.`,
    keywords: ['edit group', 'update group', 'group management', groupName.toLowerCase()],
    noIndex: true
  })
}