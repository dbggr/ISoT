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
import { TacticalTable, TacticalTableColumn } from "@/components/tactical/tactical-table"
import { TacticalButton } from "@/components/tactical/tactical-button"
import { StatusIndicator } from "@/components/tactical/status-indicator"
import { TacticalModal, TacticalConfirmationModal } from "@/components/tactical/tactical-modal"
import { ServiceDetailModal } from "@/components/services/service-detail-modal"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

  // State for service detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedServiceForDetail, setSelectedServiceForDetail] = useState<NetworkService | null>(null)

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

  // Handle service detail modal
  const handleServiceDetail = (service: NetworkService) => {
    setSelectedServiceForDetail(service)
    setDetailModalOpen(true)
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

  // Get service status based on type and data
  const getServiceStatus = (service: NetworkService) => {
    // Simple status logic - can be enhanced based on actual service monitoring
    if (service.ipAddress && service.internalPorts?.length > 0) {
      return 'online'
    }
    if (!service.ipAddress) {
      return 'warning'
    }
    return 'offline'
  }

  // Define tactical table columns
  const tacticalColumns: TacticalTableColumn<NetworkService>[] = [
    {
      key: 'select',
      header: '',
      headerClassName: 'w-12',
      render: (_, service) => (
        <Checkbox
          checked={selectedServices.has(service.id)}
          onCheckedChange={(checked) => 
            handleSelectService(service.id, checked as boolean)
          }
          aria-label={`Select ${service.name}`}
          className="h-4 w-4 min-h-4 min-w-4"
        />
      )
    },
    {
      key: 'name',
      header: 'Service Name',
      headerClassName: 'min-w-[150px]',
      render: (name, service) => (
        <Link 
          href={`/services/${service.id}`}
          className="hover:text-orange-500 transition-colors font-mono"
          onClick={() => onServiceSelect?.(service)}
        >
          <HighlightedText 
            text={name} 
            searchTerm={filters.search} 
          />
        </Link>
      )
    },
    {
      key: 'type',
      header: 'Type',
      headerClassName: 'min-w-[100px]',
      render: (type) => (
        <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 font-mono text-xs">
          {formatServiceType(type)}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      headerClassName: 'min-w-[80px]',
      render: (_, service) => (
        <StatusIndicator 
          status={getServiceStatus(service)} 
          label={getServiceStatus(service)}
          showPulse={getServiceStatus(service) === 'online'}
        />
      )
    },
    {
      key: 'ipAddress',
      header: 'IP Addresses',
      headerClassName: 'min-w-[140px] hidden sm:table-cell',
      className: 'hidden sm:table-cell',
      render: (ipAddress) => (
        <div className="font-mono text-sm max-w-[120px] truncate" title={ipAddress || ''}>
          {ipAddress ? formatIpAddresses(ipAddress.split(',')) : <span className="text-neutral-500">NONE</span>}
        </div>
      )
    },
    {
      key: 'internalPorts',
      header: 'Ports',
      headerClassName: 'min-w-[100px] hidden sm:table-cell',
      className: 'hidden sm:table-cell',
      render: (ports) => (
        <div className="font-mono text-sm max-w-[80px] truncate" title={ports?.join(', ') || ''}>
          {ports?.length > 0 ? ports.join('; ') : <span className="text-neutral-500">NONE</span>}
        </div>
      )
    },
    {
      key: 'vlan',
      header: 'VLAN',
      headerClassName: 'min-w-[80px] hidden md:table-cell',
      className: 'hidden md:table-cell',
      render: (vlan) => (
        vlan ? (
          <span className="font-mono text-sm">{vlan}</span>
        ) : (
          <span className="text-neutral-500">-</span>
        )
      )
    },
    {
      key: 'domain',
      header: 'Domain',
      headerClassName: 'min-w-[120px] hidden md:table-cell',
      className: 'hidden md:table-cell',
      render: (domain) => (
        domain ? (
          <div className="font-mono text-sm max-w-[100px] truncate" title={domain}>
            {domain}
          </div>
        ) : (
          <span className="text-neutral-500">-</span>
        )
      )
    },
    {
      key: 'groupId',
      header: 'Group',
      headerClassName: 'min-w-[120px]',
      render: (groupId) => (
        <div className="max-w-[100px] truncate text-orange-500" title={groupsMap[groupId]?.name || 'Unknown'}>
          {groupsMap[groupId]?.name || 'UNKNOWN'}
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      headerClassName: 'min-w-[100px] hidden lg:table-cell',
      className: 'hidden lg:table-cell',
      render: (createdAt) => (
        <span className="text-neutral-400 font-mono text-xs">
          {new Date(createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'w-12',
      render: (_, service) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TacticalButton variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </TacticalButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-neutral-900 border-neutral-700">
            <DropdownMenuItem 
              onClick={() => handleServiceDetail(service)}
              className="touch-target text-white hover:bg-neutral-700 hover:text-orange-400 focus:bg-neutral-700 focus:text-orange-400"
            >
              <Eye className="mr-2 h-4 w-4" />
              VIEW DETAILS
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/services/${service.id}/edit`} className="touch-target text-white hover:bg-neutral-700 hover:text-orange-400 focus:bg-neutral-700 focus:text-orange-400">
                <Edit className="mr-2 h-4 w-4" />
                EDIT
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleServiceDelete(service)}
              className="text-red-400 hover:bg-red-500/20 hover:text-red-300 focus:bg-red-500/20 focus:text-red-300 touch-target"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              DELETE
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  // Loading skeleton
  if (servicesLoading || groupsLoading) {
    return (
      <TacticalTable
        data={[]}
        columns={tacticalColumns}
        loading={true}
        emptyMessage="Loading services data..."
      />
    )
  }

  // Error state
  if (servicesError) {
    return (
      <div className="bg-neutral-900 border border-red-500/50 rounded-lg p-8 text-center">
        <p className="text-red-500 mb-4 font-mono">SYSTEM ERROR: {servicesError}</p>
        <TacticalButton onClick={refetch} variant="primary">
          RETRY OPERATION
        </TacticalButton>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tactical Search and Filter Controls */}
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4">
        <div className="flex flex-col gap-4">
          {/* Local Search Bar for Services */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="SEARCH SERVICES..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-9 touch-target bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-orange-500 focus:ring-orange-500"
            />
            {filters.search && (
              <TacticalButton
                variant="ghost"
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Clear search</span>
              </TacticalButton>
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
                <span className="text-sm text-neutral-400 text-center sm:text-left font-mono">
                  {selectedServices.size} SELECTED
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <TacticalButton variant="secondary" size="sm" className="touch-target w-full sm:w-auto">
                      BULK ACTIONS
                    </TacticalButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-neutral-900 border-neutral-700">
                    <DropdownMenuItem onClick={handleExportSelected} className="text-white hover:text-orange-500">
                      <Download className="mr-2 h-4 w-4" />
                      EXPORT SELECTED
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBulkDelete} className="text-red-500 hover:text-red-400">
                      <Trash2 className="mr-2 h-4 w-4" />
                      DELETE SELECTED
                    </DropdownMenuItem>
                    {groups.length > 0 && (
                      <>
                        <DropdownMenuItem disabled className="text-xs text-neutral-500">
                          <Users className="mr-2 h-4 w-4" />
                          MOVE TO GROUP:
                        </DropdownMenuItem>
                        {groups.map(group => (
                          <DropdownMenuItem 
                            key={group.id}
                            onClick={() => handleBulkGroupChange(group.id)}
                            className="pl-6 text-white hover:text-orange-500"
                          >
                            {group.name.toUpperCase()}
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
      </div>

      {/* Tactical Table */}
      <div className="space-y-4">
        <TacticalTable
          data={services}
          columns={tacticalColumns}
          loading={false}
          onRowClick={onServiceSelect}
          emptyMessage={(() => {
            const emptyState = getEmptyStateMessage(
              hasActiveFilters,
              filters.search,
              activeFilterCount
            )
            return emptyState.title
          })()}
        />

        {/* Tactical Pagination */}
        {services.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-2 bg-neutral-900 border border-neutral-700 rounded-lg p-4">
            <div className="text-sm text-neutral-400 order-2 sm:order-1 font-mono">
              SHOWING {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredAndSortedServices.length)} OF {filteredAndSortedServices.length} SERVICES
              {hasActiveFilters && (
                <span className="ml-1">
                  (FILTERED FROM {allServices.length} TOTAL)
                </span>
              )}
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              <TacticalButton
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="touch-target"
              >
                PREVIOUS
              </TacticalButton>
              <TacticalButton
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage * pageSize >= filteredAndSortedServices.length}
                className="touch-target"
              >
                NEXT
              </TacticalButton>
            </div>
          </div>
        )}

        {/* Empty state with clear filters option */}
        {services.length === 0 && hasActiveFilters && (
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-8 text-center">
            <p className="text-neutral-400 mb-4 font-mono">NO SERVICES MATCH CURRENT FILTERS</p>
            <p className="text-sm text-neutral-500 mb-4">
              Try adjusting your search criteria or clearing filters to see more results.
            </p>
            <TacticalButton variant="secondary" onClick={clearAllFilters}>
              CLEAR ALL FILTERS
            </TacticalButton>
          </div>
        )}
      </div>

      {/* Tactical Confirmation Dialogs */}
      <TacticalConfirmationModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Service"
        description={
          serviceToDelete 
            ? `Are you sure you want to delete "${serviceToDelete.name}"? This action cannot be undone and will permanently remove the service from your network inventory.`
            : "Are you sure you want to delete this service?"
        }
        confirmText="Delete Service"
        cancelText="Cancel"
        onConfirm={confirmServiceDelete}
        variant="danger"
      />

      <TacticalConfirmationModal
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Multiple Services"
        description={`Are you sure you want to delete ${selectedServices.size} selected services? This action cannot be undone and will permanently remove all selected services from your network inventory.`}
        confirmText={`Delete ${selectedServices.size} Services`}
        cancelText="Cancel"
        onConfirm={confirmBulkDelete}
        variant="danger"
      />

      <TacticalConfirmationModal
        open={bulkGroupChangeDialogOpen}
        onOpenChange={setBulkGroupChangeDialogOpen}
        title="Move Services to Group"
        description={`Are you sure you want to move ${selectedServices.size} selected services to the group "${groupsMap[targetGroupId]?.name}"? This will update the group assignment for all selected services.`}
        confirmText={`Move ${selectedServices.size} Services`}
        cancelText="Cancel"
        onConfirm={confirmBulkGroupChange}
        variant="primary"
      />

      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={selectedServiceForDetail}
        group={selectedServiceForDetail ? groupsMap[selectedServiceForDetail.groupId] : undefined}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onEdit={onServiceEdit}
        onDelete={handleServiceDelete}
      />
    </div>
  )
}