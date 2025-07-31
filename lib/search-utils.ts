/**
 * Utilities for search functionality including highlighting and filtering
 */

import { NetworkService, Group } from './types'

/**
 * Highlight search terms in text - returns array of parts for React rendering
 */
export function highlightSearchTerm(text: string, searchTerm: string): Array<{ text: string; isHighlight: boolean }> {
  if (!searchTerm.trim() || !text) return [{ text, isHighlight: false }]

  // Simple case-insensitive search without regex special characters
  const lowerText = text.toLowerCase()
  const lowerTerm = searchTerm.toLowerCase()
  const index = lowerText.indexOf(lowerTerm)
  
  if (index === -1) {
    return [{ text, isHighlight: false }]
  }
  
  const parts = []
  if (index > 0) {
    parts.push({ text: text.slice(0, index), isHighlight: false })
  }
  parts.push({ text: text.slice(index, index + searchTerm.length), isHighlight: true })
  if (index + searchTerm.length < text.length) {
    parts.push({ text: text.slice(index + searchTerm.length), isHighlight: false })
  }
  
  return parts
}

/**
 * Check if a service matches the search criteria
 */
export function matchesServiceSearch(service: NetworkService, searchTerm: string): boolean {
  if (!searchTerm.trim()) return true

  const term = searchTerm.toLowerCase()
  
  return (
    service.name.toLowerCase().includes(term) ||
    service.type.toLowerCase().includes(term) ||
    service.ip_addresses.some(ip => ip.toLowerCase().includes(term)) ||
    service.ports.some(port => port.toString().includes(term)) ||
    (service.domain && service.domain.toLowerCase().includes(term)) ||
    (service.vlan_id !== undefined && service.vlan_id.toString().includes(term))
  )
}

/**
 * Check if a group matches the search criteria
 */
export function matchesGroupSearch(group: Group, searchTerm: string): boolean {
  if (!searchTerm.trim()) return true

  const term = searchTerm.toLowerCase()
  
  return (
    group.name.toLowerCase().includes(term) ||
    (group.description !== undefined && group.description.toLowerCase().includes(term))
  )
}

/**
 * Filter services based on advanced filter criteria
 */
export function filterServices(
  services: NetworkService[], 
  filters: {
    search?: string
    type?: NetworkService['type'] | ''
    groupId?: string
    vlanId?: string
    ipAddress?: string
    domain?: string
    portRange?: string
  }
): NetworkService[] {
  return services.filter(service => {
    // Search filter
    if (filters.search && !matchesServiceSearch(service, filters.search)) {
      return false
    }

    // Type filter
    if (filters.type && service.type !== filters.type) {
      return false
    }

    // Group filter
    if (filters.groupId && service.group_id !== filters.groupId) {
      return false
    }

    // VLAN filter
    if (filters.vlanId) {
      const vlanFilter = parseInt(filters.vlanId)
      if (isNaN(vlanFilter) || service.vlan_id !== vlanFilter) {
        return false
      }
    }

    // IP address filter
    if (filters.ipAddress) {
      const ipFilter = filters.ipAddress.toLowerCase()
      if (!service.ip_addresses.some(ip => ip.toLowerCase().includes(ipFilter))) {
        return false
      }
    }

    // Domain filter
    if (filters.domain) {
      const domainFilter = filters.domain.toLowerCase()
      if (!service.domain || !service.domain.toLowerCase().includes(domainFilter)) {
        return false
      }
    }

    // Port range filter
    if (filters.portRange) {
      if (!matchesPortRange(service.ports, filters.portRange)) {
        return false
      }
    }

    return true
  })
}

/**
 * Check if service ports match the port range filter
 */
function matchesPortRange(servicePorts: number[], portRangeFilter: string): boolean {
  const ranges = portRangeFilter.split(',').map(range => range.trim())
  
  return ranges.some(range => {
    if (range.includes('-')) {
      // Handle range (e.g., "8000-8080")
      const [start, end] = range.split('-').map(p => parseInt(p.trim()))
      if (isNaN(start) || isNaN(end)) return false
      
      return servicePorts.some(port => port >= start && port <= end)
    } else {
      // Handle single port (e.g., "80")
      const port = parseInt(range)
      if (isNaN(port)) return false
      
      return servicePorts.includes(port)
    }
  })
}

/**
 * Sort services by relevance to search term
 */
export function sortServicesByRelevance(
  services: NetworkService[], 
  searchTerm: string
): NetworkService[] {
  if (!searchTerm.trim()) return services

  const term = searchTerm.toLowerCase()

  return [...services].sort((a, b) => {
    const aScore = getServiceRelevanceScore(a, term)
    const bScore = getServiceRelevanceScore(b, term)
    
    return bScore - aScore
  })
}

/**
 * Calculate relevance score for a service based on search term
 */
function getServiceRelevanceScore(service: NetworkService, searchTerm: string): number {
  let score = 0
  
  // Exact name match gets highest score
  if (service.name.toLowerCase() === searchTerm) {
    score += 100
  } else if (service.name.toLowerCase().startsWith(searchTerm)) {
    score += 50
  } else if (service.name.toLowerCase().includes(searchTerm)) {
    score += 25
  }
  
  // Type match
  if (service.type.toLowerCase().includes(searchTerm)) {
    score += 20
  }
  
  // Domain match
  if (service.domain && service.domain.toLowerCase().includes(searchTerm)) {
    score += 15
  }
  
  // IP address match
  if (service.ip_addresses.some(ip => ip.includes(searchTerm))) {
    score += 10
  }
  
  // Port match
  if (service.ports.some(port => port.toString().includes(searchTerm))) {
    score += 5
  }
  
  // VLAN match
  if (service.vlan_id !== undefined && service.vlan_id.toString().includes(searchTerm)) {
    score += 5
  }
  
  return score
}

/**
 * Sort groups by relevance to search term
 */
export function sortGroupsByRelevance(groups: Group[], searchTerm: string): Group[] {
  if (!searchTerm.trim()) return groups

  const term = searchTerm.toLowerCase()

  return [...groups].sort((a, b) => {
    const aScore = getGroupRelevanceScore(a, term)
    const bScore = getGroupRelevanceScore(b, term)
    
    return bScore - aScore
  })
}

/**
 * Calculate relevance score for a group based on search term
 */
function getGroupRelevanceScore(group: Group, searchTerm: string): number {
  let score = 0
  
  // Exact name match gets highest score
  if (group.name.toLowerCase() === searchTerm) {
    score += 100
  } else if (group.name.toLowerCase().startsWith(searchTerm)) {
    score += 50
  } else if (group.name.toLowerCase().includes(searchTerm)) {
    score += 25
  }
  
  // Description match
  if (group.description && group.description.toLowerCase().includes(searchTerm)) {
    score += 15
  }
  
  return score
}

/**
 * Generate search suggestions based on existing data
 */
export function generateSearchSuggestions(
  services: NetworkService[], 
  groups: Group[], 
  currentQuery: string
): string[] {
  const suggestions = new Set<string>()
  const query = currentQuery.toLowerCase()

  // Add service names that start with the query
  services.forEach(service => {
    if (service.name.toLowerCase().startsWith(query) && service.name.toLowerCase() !== query) {
      suggestions.add(service.name)
    }
  })

  // Add group names that start with the query
  groups.forEach(group => {
    if (group.name.toLowerCase().startsWith(query) && group.name.toLowerCase() !== query) {
      suggestions.add(group.name)
    }
  })

  // Add service types that start with the query
  const serviceTypes = ['web', 'database', 'api', 'storage', 'security', 'monitoring']
  serviceTypes.forEach(type => {
    if (type.startsWith(query) && type !== query) {
      suggestions.add(type)
    }
  })

  return Array.from(suggestions).slice(0, 5)
}

/**
 * Create empty state message based on filters
 */
export function getEmptyStateMessage(
  hasFilters: boolean,
  searchTerm?: string,
  filterCount?: number
): {
  title: string
  description: string
  showClearFilters: boolean
} {
  if (searchTerm && hasFilters) {
    return {
      title: `No results found for "${searchTerm}"`,
      description: `Try adjusting your search term or clearing some filters. You have ${filterCount || 0} active filters.`,
      showClearFilters: true
    }
  }
  
  if (searchTerm) {
    return {
      title: `No results found for "${searchTerm}"`,
      description: "Try a different search term or browse all items.",
      showClearFilters: false
    }
  }
  
  if (hasFilters) {
    return {
      title: "No items match your filters",
      description: `Try adjusting your filters. You have ${filterCount || 0} active filters.`,
      showClearFilters: true
    }
  }
  
  return {
    title: "No items found",
    description: "Get started by creating your first item.",
    showClearFilters: false
  }
}