"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  X
} from "lucide-react"

import { TacticalTable, TacticalTableColumn } from "@/components/tactical/tactical-table"
import { TacticalButton } from "@/components/tactical/tactical-button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NetworkService } from "@/lib/types"

interface GroupServicesTableProps {
  services: NetworkService[]
  loading?: boolean
  onDelete?: (service: NetworkService) => void
}

export function GroupServicesTable({ services, loading = false, onDelete }: GroupServicesTableProps) {
  const [filters, setFilters] = useState({
    search: '',
  })

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    if (!filters.search) return services

    const term = filters.search.toLowerCase()
    return services.filter(service => 
      service.name?.toLowerCase().includes(term) ||
      service.type?.toLowerCase().includes(term) ||
      (service.domain && service.domain.toLowerCase().includes(term)) ||
      service.ipAddress?.includes(term)
    )
  }, [services, filters.search])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
  }

  // Define tactical table columns
  const tacticalColumns: TacticalTableColumn<NetworkService>[] = [
    {
      key: 'name',
      header: 'Service Name',
      headerClassName: 'min-w-[150px]',
      render: (name, service) => (
        <Link 
          href={`/services/${service.id}`}
          className="text-orange-400 hover:text-orange-300 hover:underline font-mono font-medium transition-colors duration-200"
        >
          {name}
        </Link>
      )
    },
    {
      key: 'type',
      header: 'Type',
      headerClassName: 'w-[100px]',
      render: (type) => (
        <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 font-mono">
          {type ? type.toUpperCase() : 'UNKNOWN'}
        </Badge>
      )
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      headerClassName: 'min-w-[140px]',
      render: (ipAddress) => (
        <span className="text-neutral-300 font-mono text-sm">
          {ipAddress || '-'}
        </span>
      )
    },
    {
      key: 'internalPorts',
      header: 'Ports',
      headerClassName: 'min-w-[120px]',
      render: (internalPorts) => (
        <div className="flex flex-wrap gap-1">
          {internalPorts?.slice(0, 3).map((port: number, index: number) => (
            <Badge key={index} className="bg-neutral-800 border-neutral-700 text-white font-mono text-xs">
              {port}
            </Badge>
          ))}
          {internalPorts && internalPorts.length > 3 && (
            <Badge className="bg-neutral-800 border-neutral-700 text-neutral-400 font-mono text-xs">
              +{internalPorts.length - 3}
            </Badge>
          )}
          {(!internalPorts || internalPorts.length === 0) && (
            <span className="text-neutral-400 text-sm">-</span>
          )}
        </div>
      )
    },
    {
      key: 'domain',
      header: 'Domain',
      headerClassName: 'min-w-[140px]',
      render: (domain) => (
        <span className="text-neutral-300 font-mono text-sm">
          {domain || '-'}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      headerClassName: 'w-[120px]',
      render: (createdAt) => (
        <span className="text-neutral-400 font-mono text-sm">
          {formatDate(createdAt)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'w-[80px]',
      render: (_, service) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TacticalButton
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-neutral-400 hover:text-orange-500 hover:bg-orange-500/20"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </TacticalButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-neutral-800 border-neutral-700">
            <DropdownMenuItem asChild>
              <Link href={`/services/${service.id}`} className="text-white hover:bg-neutral-700">
                <Eye className="mr-2 h-4 w-4" />
                VIEW
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/services/${service.id}/edit`} className="text-white hover:bg-neutral-700">
                <Edit className="mr-2 h-4 w-4" />
                EDIT
              </Link>
            </DropdownMenuItem>
            {onDelete && (
              <DropdownMenuItem 
                onClick={() => onDelete(service)}
                className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                DELETE
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  // Loading skeleton
  if (loading) {
    return (
      <TacticalTable
        data={[]}
        columns={tacticalColumns}
        loading={true}
        emptyMessage="Loading services data..."
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Tactical Search Controls */}
      <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4">
        <div className="flex flex-col gap-4">
          {/* Local Search Bar for Services */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="SEARCH SERVICES IN THIS GROUP..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-9 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-orange-500 focus:ring-orange-500"
            />
            {filters.search && (
              <TacticalButton
                variant="ghost"
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              >
                <X className="h-3 w-3" />
              </TacticalButton>
            )}
          </div>
        </div>
      </div>

      {/* Tactical Table */}
      <TacticalTable
        data={filteredServices}
        columns={tacticalColumns}
        loading={loading}
        emptyMessage={filters.search ? "NO SERVICES MATCH YOUR SEARCH CRITERIA" : "NO SERVICES FOUND IN THIS GROUP"}
      />
    </div>
  )
}