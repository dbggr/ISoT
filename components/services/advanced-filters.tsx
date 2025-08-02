"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter, X, ChevronDown, RotateCcw } from "lucide-react"

import { TacticalButton } from "@/components/tactical/tactical-button"
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
    // Convert "all" back to empty string for filtering logic
    const filterValue = value === "all" ? "" : value
    setFilters(prev => ({ ...prev, [key]: filterValue }))
    
    // Announce filter changes to screen readers
    if (filterValue) {
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
            <TacticalButton 
              ref={triggerRef}
              variant="secondary" 
              size="sm" 
              className="relative keyboard-focus touch-target"
              aria-expanded={isOpen}
              aria-haspopup="dialog"
              aria-controls={filterId}
              aria-describedby={filtersDescriptionId}
            >
              <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
              FILTERS
              {activeFilterCount > 0 && (
                <Badge 
                  className="ml-2 h-5 w-5 rounded-full p-0 text-xs bg-orange-500/20 text-orange-500 border-orange-500/30"
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
            </TacticalButton>
          </PopoverTrigger>
          <PopoverContent 
            ref={popoverRef}
            id={filterId}
            className="w-80 bg-neutral-900 border-neutral-700" 
            align="start"
            role="dialog"
            aria-labelledby={`${filterId}-title`}
            aria-describedby={filtersDescriptionId}
            onKeyDown={handlePopoverKeyDown}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 id={`${filterId}-title`} className="font-medium text-white tracking-wider">ADVANCED FILTERS</h4>
                {activeFilterCount > 0 && (
                  <TacticalButton
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-auto p-1 text-xs keyboard-focus touch-target-sm"
                    aria-label="Clear all filters"
                  >
                    <RotateCcw className="mr-1 h-3 w-3" aria-hidden="true" />
                    CLEAR ALL
                  </TacticalButton>
                )}
              </div>
              
              <div id={filtersDescriptionId} className="sr-only">
                Use these filters to narrow down the list of services. {activeFilterCount} filters are currently active.
              </div>
              
              <Separator />
              
              {/* Service Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="type-filter" className="text-neutral-300 tracking-wider text-xs">SERVICE TYPE</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => updateFilter('type', value)}
                >
                  <SelectTrigger id="type-filter" className="bg-neutral-800 border-neutral-700 text-white focus:border-orange-500">
                    <SelectValue placeholder="ALL TYPES" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    <SelectItem value="all" className="text-white hover:bg-neutral-700">ALL TYPES</SelectItem>
                    <SelectItem value="web" className="text-white hover:bg-neutral-700">WEB</SelectItem>
                    <SelectItem value="database" className="text-white hover:bg-neutral-700">DATABASE</SelectItem>
                    <SelectItem value="api" className="text-white hover:bg-neutral-700">API</SelectItem>
                    <SelectItem value="storage" className="text-white hover:bg-neutral-700">STORAGE</SelectItem>
                    <SelectItem value="security" className="text-white hover:bg-neutral-700">SECURITY</SelectItem>
                    <SelectItem value="monitoring" className="text-white hover:bg-neutral-700">MONITORING</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Group Filter */}
              <div className="space-y-2">
                <Label htmlFor="group-filter" className="text-neutral-300 tracking-wider text-xs">GROUP</Label>
                <Select
                  value={filters.groupId}
                  onValueChange={(value) => updateFilter('groupId', value)}
                >
                  <SelectTrigger id="group-filter" className="bg-neutral-800 border-neutral-700 text-white focus:border-orange-500">
                    <SelectValue placeholder="ALL GROUPS" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700">
                    <SelectItem value="all" className="text-white hover:bg-neutral-700">ALL GROUPS</SelectItem>
                    {groups.map(group => (
                      <SelectItem key={group.id} value={group.id} className="text-white hover:bg-neutral-700">
                        {group.name.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* VLAN ID Filter */}
              <div className="space-y-2">
                <Label htmlFor="vlan-filter" className="text-neutral-300 tracking-wider text-xs">VLAN ID</Label>
                <Input
                  id="vlan-filter"
                  type="number"
                  placeholder="100"
                  value={filters.vlanId}
                  onChange={(e) => updateFilter('vlanId', e.target.value)}
                  min="1"
                  max="4094"
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-orange-500 font-mono"
                />
              </div>

              {/* IP Address Filter */}
              <div className="space-y-2">
                <Label htmlFor="ip-filter" className="text-neutral-300 tracking-wider text-xs">IP ADDRESS</Label>
                <Input
                  id="ip-filter"
                  placeholder="192.168.1.100"
                  value={filters.ipAddress}
                  onChange={(e) => updateFilter('ipAddress', e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-orange-500 font-mono"
                />
              </div>

              {/* Domain Filter */}
              <div className="space-y-2">
                <Label htmlFor="domain-filter" className="text-neutral-300 tracking-wider text-xs">DOMAIN</Label>
                <Input
                  id="domain-filter"
                  placeholder="example.com"
                  value={filters.domain}
                  onChange={(e) => updateFilter('domain', e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-orange-500 font-mono"
                />
              </div>

              {/* Port Range Filter */}
              <div className="space-y-2">
                <Label htmlFor="port-filter" className="text-neutral-300 tracking-wider text-xs">PORT RANGE</Label>
                <Input
                  id="port-filter"
                  placeholder="80, 443, 8000-8080"
                  value={filters.portRange}
                  onChange={(e) => updateFilter('portRange', e.target.value)}
                  className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-orange-500 font-mono"
                />
                <p className="text-xs text-neutral-500">
                  ENTER SPECIFIC PORTS (80, 443) OR RANGES (8000-8080)
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear All Filters Button */}
        {activeFilterCount > 0 && (
          <TacticalButton
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-neutral-400 hover:text-orange-500"
          >
            <X className="mr-1 h-4 w-4" />
            CLEAR ALL
          </TacticalButton>
        )}
      </div>

      {/* Active Filter Badges */}
      {activeFilterBadges.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {activeFilterBadges.map(({ key, label, value }) => (
            <Badge
              key={key}
              className="flex items-center gap-1 pr-1 bg-orange-500/20 text-orange-500 border-orange-500/30"
            >
              <span className="text-xs font-mono">
                {label.toUpperCase()}: {value.toUpperCase()}
              </span>
              <TacticalButton
                variant="ghost"
                size="sm"
                onClick={() => clearFilter(key)}
                className="h-4 w-4 p-0 hover:bg-orange-500/20 text-orange-500 hover:text-white"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {label} filter</span>
              </TacticalButton>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}