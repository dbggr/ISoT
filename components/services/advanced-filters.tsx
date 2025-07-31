"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter, X, ChevronDown, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NetworkService, Group } from "@/lib/types"
import { useGroups } from "@/lib/hooks/use-groups"
import { 
  KEYBOARD_KEYS, 
  SCREEN_READER_MESSAGES, 
  ScreenReaderAnnouncer,
  generateId,
  FocusManager
} from "@/lib/accessibility"

export interface FilterState {
  search: string
  type: NetworkService['type'] | ''
  groupId: string
  vlanId: string
  ipAddress: string
  domain: string
  portRange: string
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void
  className?: string
}

export function AdvancedFilters({ onFiltersChange, className }: AdvancedFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: groups } = useGroups()
  const popoverRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [announcer] = useState(() => ScreenReaderAnnouncer.getInstance())
  
  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('q') || '',
    type: (searchParams.get('type') as NetworkService['type']) || '',
    groupId: searchParams.get('group') || '',
    vlanId: searchParams.get('vlan') || '',
    ipAddress: searchParams.get('ip') || '',
    domain: searchParams.get('domain') || '',
    portRange: searchParams.get('ports') || ''
  })

  const [isOpen, setIsOpen] = useState(false)
  const filterId = generateId('filters')
  const filtersDescriptionId = generateId('filters-description')

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        // Map internal keys to URL parameter names
        const paramKey = key === 'groupId' ? 'group' : 
                        key === 'vlanId' ? 'vlan' :
                        key === 'ipAddress' ? 'ip' :
                        key === 'portRange' ? 'ports' :
                        key === 'search' ? 'q' : key
        params.set(paramKey, value)
      }
    })

    const newUrl = params.toString() ? `?${params.toString()}` : ''
    const currentUrl = window.location.search
    
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false })
    }

    // Notify parent component
    onFiltersChange(filters)
  }, [filters, router, onFiltersChange])

  // Update filters when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const newFilters: FilterState = {
      search: searchParams.get('q') || '',
      type: (searchParams.get('type') as NetworkService['type']) || '',
      groupId: searchParams.get('group') || '',
      vlanId: searchParams.get('vlan') || '',
      ipAddress: searchParams.get('ip') || '',
      domain: searchParams.get('domain') || '',
      portRange: searchParams.get('ports') || ''
    }
    
    setFilters(newFilters)
  }, [searchParams])

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    
    // Announce filter changes to screen readers
    if (value) {
      announcer.announce(SCREEN_READER_MESSAGES.FILTER_APPLIED)
    } else {
      announcer.announce(SCREEN_READER_MESSAGES.FILTER_CLEARED)
    }
  }

  const clearAllFilters = () => {
    setFilters({
      search: '',
      type: '',
      groupId: '',
      vlanId: '',
      ipAddress: '',
      domain: '',
      portRange: ''
    })
    
    announcer.announce('All filters cleared')
  }

  const clearFilter = (key: keyof FilterState) => {
    updateFilter(key, '')
  }

  // Handle popover keyboard navigation
  const handlePopoverKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === KEYBOARD_KEYS.ESCAPE) {
      setIsOpen(false)
      triggerRef.current?.focus()
    }
  }

  // Handle popover open/close with focus management
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    
    if (open) {
      // Focus will be managed by the popover content
      announcer.announce('Filters panel opened')
    } else {
      // Return focus to trigger
      triggerRef.current?.focus()
      announcer.announce('Filters panel closed')
    }
  }

  // Count active filters (excluding search)
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => key !== 'search' && value
  ).length

  // Get active filter badges
  const getActiveFilterBadges = () => {
    const badges: Array<{ key: keyof FilterState; label: string; value: string }> = []
    
    if (filters.type) {
      badges.push({ key: 'type', label: 'Type', value: filters.type })
    }
    if (filters.groupId) {
      const group = groups.find(g => g.id === filters.groupId)
      badges.push({ key: 'groupId', label: 'Group', value: group?.name || 'Unknown' })
    }
    if (filters.vlanId) {
      badges.push({ key: 'vlanId', label: 'VLAN', value: filters.vlanId })
    }
    if (filters.ipAddress) {
      badges.push({ key: 'ipAddress', label: 'IP', value: filters.ipAddress })
    }
    if (filters.domain) {
      badges.push({ key: 'domain', label: 'Domain', value: filters.domain })
    }
    if (filters.portRange) {
      badges.push({ key: 'portRange', label: 'Ports', value: filters.portRange })
    }
    
    return badges
  }

  const activeFilterBadges = getActiveFilterBadges()

  return (
    <div className={className}>
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        {/* Advanced Filters Popover */}
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button 
              ref={triggerRef}
              variant="outline" 
              size="sm" 
              className="relative keyboard-focus touch-target"
              aria-expanded={isOpen}
              aria-haspopup="dialog"
              aria-controls={filterId}
              aria-describedby={filtersDescriptionId}
            >
              <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
              Filters
              {activeFilterCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                  aria-label={`${activeFilterCount} active filters`}
                >
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown 
                className="ml-2 h-4 w-4" 
                aria-hidden="true"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            ref={popoverRef}
            id={filterId}
            className="w-80" 
            align="start"
            role="dialog"
            aria-labelledby={`${filterId}-title`}
            aria-describedby={filtersDescriptionId}
            onKeyDown={handlePopoverKeyDown}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 id={`${filterId}-title`} className="font-medium">Advanced Filters</h4>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-auto p-1 text-xs keyboard-focus touch-target-sm"
                    aria-label="Clear all filters"
                  >
                    <RotateCcw className="mr-1 h-3 w-3" aria-hidden="true" />
                    Clear all
                  </Button>
                )}
              </div>
              
              <div id={filtersDescriptionId} className="sr-only">
                Use these filters to narrow down the list of services. {activeFilterCount} filters are currently active.
              </div>
              
              <Separator />
              
              {/* Service Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="type-filter">Service Type</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => updateFilter('type', value)}
                >
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="storage">Storage</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Group Filter */}
              <div className="space-y-2">
                <Label htmlFor="group-filter">Group</Label>
                <Select
                  value={filters.groupId}
                  onValueChange={(value) => updateFilter('groupId', value)}
                >
                  <SelectTrigger id="group-filter">
                    <SelectValue placeholder="All groups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All groups</SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* VLAN ID Filter */}
              <div className="space-y-2">
                <Label htmlFor="vlan-filter">VLAN ID</Label>
                <Input
                  id="vlan-filter"
                  type="number"
                  placeholder="e.g., 100"
                  value={filters.vlanId}
                  onChange={(e) => updateFilter('vlanId', e.target.value)}
                  min="1"
                  max="4094"
                />
              </div>

              {/* IP Address Filter */}
              <div className="space-y-2">
                <Label htmlFor="ip-filter">IP Address</Label>
                <Input
                  id="ip-filter"
                  placeholder="e.g., 192.168.1.100"
                  value={filters.ipAddress}
                  onChange={(e) => updateFilter('ipAddress', e.target.value)}
                />
              </div>

              {/* Domain Filter */}
              <div className="space-y-2">
                <Label htmlFor="domain-filter">Domain</Label>
                <Input
                  id="domain-filter"
                  placeholder="e.g., example.com"
                  value={filters.domain}
                  onChange={(e) => updateFilter('domain', e.target.value)}
                />
              </div>

              {/* Port Range Filter */}
              <div className="space-y-2">
                <Label htmlFor="port-filter">Port Range</Label>
                <Input
                  id="port-filter"
                  placeholder="e.g., 80, 443, 8000-8080"
                  value={filters.portRange}
                  onChange={(e) => updateFilter('portRange', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter specific ports (80, 443) or ranges (8000-8080)
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear All Filters Button */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filter Badges */}
      {activeFilterBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {activeFilterBadges.map(({ key, label, value }) => (
            <Badge
              key={key}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span className="text-xs">
                {label}: {value}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter(key)}
                className="h-4 w-4 p-0 hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {label} filter</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}