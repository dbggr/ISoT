"use client"

import * as React from "react"
import { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Filter,
  X,
  Download,
  Users
} from "lucide-react"

import { NetworkService, Group, QueryParams } from "@/lib/types"
import { useServices, useDeleteService, useBulkServiceOperations } from "@/lib/hooks/use-services"
import { useGroups } from "@/lib/hooks/use-groups"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { GlobalSearch } from "@/components/common/global-search"
import { AdvancedFiltersWrapper } from "@/components/services/advanced-filters-wrapper"
import { FilterState } from "@/components/services/advanced-filters"
import { HighlightedText } from "@/components/common/highlighted-text"
import { 
  filterServices, 
  sortServicesByRelevance, 
  getEmptyStateMessage 
} from "@/lib/search-utils"
import { 
  KEYBOARD_KEYS, 
  ARIA_STATES, 
  SCREEN_READER_MESSAGES, 
  ScreenReaderAnnouncer,
  generateId 
} from "@/lib/accessibility"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

// Types for sorting and filtering
type SortField = 'name' | 'type' | 'group' | 'createdAt'
type SortOrder = 'asc' | 'desc'

interface SortConfig {
  field: SortField
  order: SortOrder
}

interface ServicesTableProps {
  onServiceSelect?: (service: NetworkService) => void
  onServiceEdit?: (service: NetworkService) => void
  onServiceDelete?: (service: NetworkService) => void
  onBulkDelete?: (serviceIds: string[]) => void
  onBulkGroupChange?: (serviceIds: string[], groupId: string) => void
}

export function ServicesTable({
  onServiceSelect,
  onServiceEdit,
  onServiceDelete,
  onBulkDelete,
  onBulkGroupChange
}: ServicesTableProps) {
  const searchParams = useSearchParams()
  
  // State for sorting and selection
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', order: 'asc' })
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  
  // Filter state managed by AdvancedFilters component
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: '',
    groupId: '',
    vlanId: '',
    ipAddress: '',
    domain: '',
    portRange: ''
  })
  
  // State for delete confirmation dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [bulkGroupChangeDialogOpen, setBulkGroupChangeDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<NetworkService | null>(null)
  const [targetGroupId, setTargetGroupId] = useState<string>('')

  // Fetch all data (filtering will be done client-side for better search experience)
  const { data: allServices, loading: servicesLoading, error: servicesError, refetch } = useServices()
  const { data: groups, loading: groupsLoading } = useGroups()

  // Create groups lookup map
  const groupsMap = useMemo(() => {
    return groups.reduce((acc, group) => {
      acc[group.id] = group
      return acc
    }, {} as Record<string, Group>)
  }, [groups])

  // Apply filters and sorting client-side
  const filteredAndSortedServices = useMemo(() => {
    let filtered = filterServices(allServices, filters)
    
    // Apply search-based relevance sorting if there's a search term
    if (filters.search) {
      filtered = sortServicesByRelevance(filtered, filters.search)
    } else {
      // Apply regular sorting
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number
        let bValue: string | number

        switch (sortConfig.field) {
          case 'name':
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case 'type':
            aValue = a.type.toLowerCase()
            bValue = b.type.toLowerCase()
            break
          case 'group':
            aValue = (groupsMap[a.groupId]?.name || '').toLowerCase()
            bValue = (groupsMap[b.groupId]?.name || '').toLowerCase()
            break
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime()
            bValue = new Date(b.createdAt).getTime()
            break
          default:
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
        }

        if (aValue < bValue) return sortConfig.order === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.order === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [allServices, filters, sortConfig, groupsMap])

  // Paginate results
  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredAndSortedServices.slice(startIndex, startIndex + pageSize)
  }, [filteredAndSortedServices, currentPage, pageSize])

  // Use paginated services for display
  const services = paginatedServices
  
  // Delete operations
  const deleteService = useDeleteService()
  const bulkOperations = useBulkServiceOperations()
  
  // Toast notifications
  const { toast } = useToast()

  // Handle sorting
  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Handle row selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedServices(new Set(services.map(service => service.id)))
    } else {
      setSelectedServices(new Set())
    }
  }

  const handleSelectService = (serviceId: string, checked: boolean) => {
    const newSelected = new Set(selectedServices)
    if (checked) {
      newSelected.add(serviceId)
    } else {
      newSelected.delete(serviceId)
    }
    setSelectedServices(newSelected)
  }

  // Handle individual service delete
  const handleServiceDelete = (service: NetworkService) => {
    setServiceToDelete(service)
    setDeleteDialogOpen(true)
  }

  const confirmServiceDelete = async () => {
    if (!serviceToDelete) return
    
    try {
      await deleteService.mutate(serviceToDelete.id)
      await refetch() // Refresh the services list
      onServiceDelete?.(serviceToDelete)
      
      toast({
        title: "Service Deleted",
        description: `Successfully deleted "${serviceToDelete.name}".`
      })
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: `Failed to delete "${serviceToDelete.name}". Please try again.`,
        variant: "destructive"
      })
      console.error('Failed to delete service:', error)
    } finally {
      setDeleteDialogOpen(false)
      setServiceToDelete(null)
    }
  }

  // Handle bulk operations
  const handleBulkDelete = () => {
    if (selectedServices.size > 0) {
      setBulkDeleteDialogOpen(true)
    }
  }

  const confirmBulkDelete = async () => {
    if (selectedServices.size === 0) return
    
    const selectedCount = selectedServices.size
    
    try {
      await bulkOperations.bulkDelete(Array.from(selectedServices))
      await refetch() // Refresh the services list
      onBulkDelete?.(Array.from(selectedServices))
      
      toast({
        title: "Services Deleted",
        description: `Successfully deleted ${selectedCount} services.`
      })
      
      setSelectedServices(new Set())
    } catch (error) {
      toast({
        title: "Bulk Delete Failed",
        description: `Failed to delete ${selectedCount} services. Some services may have been deleted. Please refresh and try again.`,
        variant: "destructive"
      })
      console.error('Failed to bulk delete services:', error)
    } finally {
      setBulkDeleteDialogOpen(false)
    }
  }

  const handleBulkGroupChange = (groupId: string) => {
    if (selectedServices.size === 0) return
    
    setTargetGroupId(groupId)
    setBulkGroupChangeDialogOpen(true)
  }

  const confirmBulkGroupChange = async () => {
    if (selectedServices.size === 0 || !targetGroupId) return
    
    const selectedCount = selectedServices.size
    const targetGroup = groupsMap[targetGroupId]
    
    try {
      await bulkOperations.bulkUpdateGroup(Array.from(selectedServices), targetGroupId)
      await refetch() // Refresh the services list
      onBulkGroupChange?.(Array.from(selectedServices), targetGroupId)
      
      toast({
        title: "Group Assignment Updated",
        description: `Successfully moved ${selectedCount} services to "${targetGroup?.name || 'Unknown Group'}".`
      })
      
      setSelectedServices(new Set())
    } catch (error) {
      toast({
        title: "Group Assignment Failed",
        description: `Failed to move ${selectedCount} services to "${targetGroup?.name || 'Unknown Group'}". Please try again.`,
        variant: "destructive"
      })
      console.error('Failed to bulk update group:', error)
    } finally {
      setBulkGroupChangeDialogOpen(false)
      setTargetGroupId('')
    }
  }

  // Export functionality
  const handleExportSelected = () => {
    if (selectedServices.size === 0) return
    
    const selectedServiceData = services.filter(service => 
      selectedServices.has(service.id)
    )
    
    const csvContent = generateCSV(selectedServiceData)
    downloadCSV(csvContent, `network-services-${new Date().toISOString().split('T')[0]}.csv`)
    
    toast({
      title: "Export Successful",
      description: `Exported ${selectedServices.size} services to CSV file.`
    })
    
    setSelectedServices(new Set())
  }

  const generateCSV = (services: NetworkService[]): string => {
    const headers = [
      'Name',
      'Type', 
      'IP Addresses',
      'Ports',
      'VLAN ID',
      'Domain',
      'Group',
      'Created At'
    ]
    
    const rows = services.map(service => [
      service.name,
      service.type,
      service.ipAddress || '',
      service.internalPorts?.join('; ') || '',
      service.vlan || '',
      service.domain || '',
      groupsMap[service.groupId]?.name || 'Unknown',
      new Date(service.createdAt).toISOString()
    ])
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
    
    return csvContent
  }

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Clear all filters
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
    setCurrentPage(1)
  }

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '')
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => value !== '').length

  // Format data for display
  const formatIpAddresses = (addresses: string[]) => {
    if (addresses.length === 0) return "None"
    if (addresses.length === 1) return addresses[0]
    return `${addresses[0]} (+${addresses.length - 1})`
  }

  const formatPorts = (ports: number[]) => {
    if (ports.length === 0) return "None"
    if (ports.length === 1) return ports[0].toString()
    return `${ports[0]} (+${ports.length - 1})`
  }

  const formatServiceType = (type: NetworkService['type']) => {
    if (!type) return 'Unknown'
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  // Render sort icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortConfig.field !== field) return null
    return sortConfig.order === 'asc' ? 
      <ChevronUp className="ml-1 h-4 w-4" /> : 
      <ChevronDown className="ml-1 h-4 w-4" />
  }

  // Loading skeleton
  if (servicesLoading || groupsLoading) {
    return (
      <Card className="border-0 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-gray-100">Network Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-64 bg-gray-700" />
              <Skeleton className="h-10 w-32 bg-gray-700" />
              <Skeleton className="h-10 w-32 bg-gray-700" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full bg-gray-700" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (servicesError) {
    return (
      <Card className="border-0 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-gray-100">Network Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">Error loading services: {servicesError}</p>
            <Button onClick={refetch} variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all duration-200">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-gray-100">Network Services</CardTitle>
        
        {/* Enhanced Search and Filter Controls */}
        <div className="flex flex-col gap-4">
          {/* Local Search Bar for Services */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search services..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-9 touch-target bg-gray-800 border-gray-700 text-gray-300"
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-muted"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
          
          {/* Advanced Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-start sm:justify-between">
            <AdvancedFiltersWrapper 
              onFiltersChange={setFilters}
              className="flex-1"
            />

            {/* Bulk Actions - Full width on mobile */}
            {selectedServices.size > 0 && (
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <span className="text-sm text-muted-foreground text-center sm:text-left">
                  {selectedServices.size} selected
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="touch-target w-full sm:w-auto bg-gray-900/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50">
                      Bulk Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleExportSelected}>
                      <Download className="mr-2 h-4 w-4" />
                      Export Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBulkDelete}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Selected
                    </DropdownMenuItem>
                    {groups.length > 0 && (
                      <>
                        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                          <Users className="mr-2 h-4 w-4" />
                          Move to Group:
                        </DropdownMenuItem>
                        {groups.map(group => (
                          <DropdownMenuItem 
                            key={group.id}
                            onClick={() => handleBulkGroupChange(group.id)}
                            className="pl-6"
                          >
                            {group.name}
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {services.length === 0 ? (
          <div className="text-center py-8">
            {(() => {
              const emptyState = getEmptyStateMessage(
                hasActiveFilters,
                filters.search,
                activeFilterCount
              )
              return (
                <>
                  <p className="text-muted-foreground mb-4">
                    {emptyState.title}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {emptyState.description}
                  </p>
                  {emptyState.showClearFilters && (
                    <Button variant="outline" onClick={clearAllFilters} className="bg-gray-900/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50">
                      Clear All Filters
                    </Button>
                  )}
                </>
              )
            })()}
          </div>
        ) : (
          <>
            {/* Responsive Table Container with Horizontal Scroll */}
            <div className="table-responsive">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 sticky left-0 bg-background z-10">
                      <Checkbox
                        checked={selectedServices.size === services.length && services.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all services"
                        className="touch-target"
                      />
                    </TableHead>
                    <TableHead className="min-w-[150px] sticky left-12 bg-background z-10">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSort('name')}
                        className="h-auto p-0 font-medium touch-target"
                      >
                        Name
                        <SortIcon field="name" />
                      </Button>
                    </TableHead>
                    <TableHead className="min-w-[100px]">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSort('type')}
                        className="h-auto p-0 font-medium touch-target"
                      >
                        Type
                        <SortIcon field="type" />
                      </Button>
                    </TableHead>
                    <TableHead className="min-w-[140px] hidden sm:table-cell">IP Addresses</TableHead>
                    <TableHead className="min-w-[100px] hidden sm:table-cell">Ports</TableHead>
                    <TableHead className="min-w-[80px] hidden md:table-cell">VLAN</TableHead>
                    <TableHead className="min-w-[120px] hidden md:table-cell">Domain</TableHead>
                    <TableHead className="min-w-[120px]">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSort('group')}
                        className="h-auto p-0 font-medium touch-target"
                      >
                        Group
                        <SortIcon field="group" />
                      </Button>
                    </TableHead>
                    <TableHead className="min-w-[100px] hidden lg:table-cell">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSort('createdAt')}
                        className="h-auto p-0 font-medium touch-target"
                      >
                        Created
                        <SortIcon field="createdAt" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-12 sticky right-0 bg-background z-10">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow 
                      key={service.id}
                      data-state={selectedServices.has(service.id) ? "selected" : undefined}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="sticky left-0 bg-background z-10">
                        <Checkbox
                          checked={selectedServices.has(service.id)}
                          onCheckedChange={(checked) => 
                            handleSelectService(service.id, checked as boolean)
                          }
                          aria-label={`Select ${service.name}`}
                          className="touch-target"
                        />
                      </TableCell>
                      <TableCell className="font-medium sticky left-12 bg-background z-10">
                        <Link 
                          href={`/services/${service.id}`}
                          className="hover:underline touch-target block"
                          onClick={() => onServiceSelect?.(service)}
                        >
                          <HighlightedText 
                            text={service.name} 
                            searchTerm={filters.search} 
                          />
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground">
                          {formatServiceType(service.type)}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm hidden sm:table-cell">
                        <div className="max-w-[120px] truncate" title={service.ipAddress || ''}>
                          {service.ipAddress ? formatIpAddresses(service.ipAddress.split(',')) : "None"}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm hidden sm:table-cell">
                        <div className="max-w-[80px] truncate" title={service.internalPorts?.join(', ') || ''}>
                          {service.internalPorts?.join('; ') || 'None'}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {service.vlan ? (
                          <span className="font-mono text-sm">{service.vlan}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {service.domain ? (
                          <div className="font-mono text-sm max-w-[100px] truncate" title={service.domain}>
                            {service.domain}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[100px] truncate" title={groupsMap[service.groupId]?.name || 'Unknown'}>
                          {groupsMap[service.groupId]?.name || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden lg:table-cell">
                        {new Date(service.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="sticky right-0 bg-background z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="touch-target">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem asChild>
                              <Link href={`/services/${service.id}`} className="touch-target">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/services/${service.id}/edit`} className="touch-target">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleServiceDelete(service)}
                              className="text-destructive touch-target"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-2">
              <div className="text-sm text-muted-foreground order-2 sm:order-1">
                Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredAndSortedServices.length)} of {filteredAndSortedServices.length} services
                {hasActiveFilters && (
                  <span className="ml-1">
                    (filtered from {allServices.length} total)
                  </span>
                )}
              </div>
              <div className="flex gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="touch-target"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage * pageSize >= filteredAndSortedServices.length}
                  className="touch-target"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* Individual Service Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Service"
        description={
          serviceToDelete ? (
            <>
              Are you sure you want to delete <strong>{serviceToDelete.name}</strong>? 
              This action cannot be undone and will permanently remove the service 
              from your network inventory.
            </>
          ) : (
            "Are you sure you want to delete this service?"
          )
        }
        confirmText="Delete Service"
        cancelText="Cancel"
        onConfirm={confirmServiceDelete}
        loading={deleteService.loading}
        variant="destructive"
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Multiple Services"
        description={
          bulkOperations.loading ? (
            <>
              <div className="flex items-center space-x-2 mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive"></div>
                <span>Deleting services...</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Please wait while we delete {selectedServices.size} services. This may take a moment.
              </p>
            </>
          ) : (
            <>
              Are you sure you want to delete <strong>{selectedServices.size}</strong> selected services? 
              This action cannot be undone and will permanently remove all selected services 
              from your network inventory.
            </>
          )
        }
        confirmText={bulkOperations.loading ? "Deleting..." : `Delete ${selectedServices.size} Services`}
        cancelText="Cancel"
        onConfirm={confirmBulkDelete}
        loading={bulkOperations.loading}
        variant="destructive"
      />

      {/* Bulk Group Change Confirmation Dialog */}
      <ConfirmationDialog
        open={bulkGroupChangeDialogOpen}
        onOpenChange={setBulkGroupChangeDialogOpen}
        title="Move Services to Group"
        description={
          bulkOperations.loading ? (
            <>
              <div className="flex items-center space-x-2 mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Moving services...</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Please wait while we move {selectedServices.size} services to "{groupsMap[targetGroupId]?.name}". This may take a moment.
              </p>
            </>
          ) : (
            <>
              Are you sure you want to move <strong>{selectedServices.size}</strong> selected services 
              to the group <strong>"{groupsMap[targetGroupId]?.name}"</strong>?
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                This will update the group assignment for all selected services.
              </div>
            </>
          )
        }
        confirmText={bulkOperations.loading ? "Moving..." : `Move ${selectedServices.size} Services`}
        cancelText="Cancel"
        onConfirm={confirmBulkGroupChange}
        loading={bulkOperations.loading}
      />
    </Card>
  )
}