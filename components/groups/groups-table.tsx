"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react"

import { getEmptyStateMessage } from "@/lib/search-utils"
import { HighlightedText } from "@/components/common/highlighted-text"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Group } from "@/lib/types"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"

interface GroupsTableProps {
  groups: Group[]
  loading?: boolean
  onDelete?: (group: Group) => void
}

type SortField = 'name' | 'description' | 'created_at' | 'service_count'
type SortDirection = 'asc' | 'desc'

export function GroupsTable({ groups, loading = false, onDelete }: GroupsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [deleteGroup, setDeleteGroup] = useState<Group | null>(null)

  // Filter groups based on search term
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groups

    const term = searchTerm.toLowerCase()
    return groups.filter(group => 
      group.name.toLowerCase().includes(term) ||
      (group.description && group.description.toLowerCase().includes(term))
    )
  }, [groups, searchTerm])

  // Sort filtered groups
  const sortedGroups = useMemo(() => {
    return [...filteredGroups].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'description':
          aValue = (a.description || '').toLowerCase()
          bValue = (b.description || '').toLowerCase()
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'service_count':
          aValue = a.services?.length || 0
          bValue = b.services?.length || 0
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredGroups, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />
  }

  const handleDeleteClick = (group: Group) => {
    setDeleteGroup(group)
  }

  const handleDeleteConfirm = () => {
    if (deleteGroup && onDelete) {
      onDelete(deleteGroup)
      setDeleteGroup(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            className="max-w-sm"
            disabled
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted animate-pulse rounded w-16" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-muted animate-pulse rounded w-20" />
                  </TableCell>
                  <TableCell>
                    <div className="h-8 bg-muted animate-pulse rounded w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search - Mobile Responsive */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-sm touch-target"
        />
      </div>

      {/* Responsive Table Container */}
      <div className="rounded-md border table-responsive">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                  className="h-auto p-0 font-semibold touch-target"
                >
                  Name
                  {getSortIcon('name')}
                </Button>
              </TableHead>
              <TableHead className="min-w-[150px] hidden sm:table-cell">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('description')}
                  className="h-auto p-0 font-semibold touch-target"
                >
                  Description
                  {getSortIcon('description')}
                </Button>
              </TableHead>
              <TableHead className="min-w-[100px]">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('service_count')}
                  className="h-auto p-0 font-semibold touch-target"
                >
                  Services
                  {getSortIcon('service_count')}
                </Button>
              </TableHead>
              <TableHead className="min-w-[100px] hidden md:table-cell">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('created_at')}
                  className="h-auto p-0 font-semibold touch-target"
                >
                  Created
                  {getSortIcon('created_at')}
                </Button>
              </TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedGroups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {(() => {
                    const emptyState = getEmptyStateMessage(
                      !!searchTerm,
                      searchTerm,
                      searchTerm ? 1 : 0
                    )
                    return (
                      <div>
                        <div className="text-muted-foreground mb-2">
                          {emptyState.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {emptyState.description}
                        </div>
                      </div>
                    )
                  })()}
                </TableCell>
              </TableRow>
            ) : (
              sortedGroups.map((group) => (
                <TableRow key={group.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <Link 
                      href={`/groups/${group.id}`}
                      className="hover:underline touch-target block"
                    >
                      <div className="max-w-[100px] truncate" title={group.name}>
                        <HighlightedText 
                          text={group.name} 
                          searchTerm={searchTerm} 
                        />
                      </div>
                    </Link>
                    {/* Show description on mobile when hidden column */}
                    {group.description && (
                      <div className="text-xs text-muted-foreground mt-1 sm:hidden">
                        <div className="max-w-[120px] truncate" title={group.description}>
                          <HighlightedText 
                            text={group.description} 
                            searchTerm={searchTerm} 
                          />
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden sm:table-cell">
                    <div className="max-w-[140px] truncate" title={group.description || ''}>
                      {group.description ? (
                        <HighlightedText 
                          text={group.description} 
                          searchTerm={searchTerm} 
                        />
                      ) : (
                        '-'
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {group.services?.length || 0} services
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">
                    {formatDate(group.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 touch-target">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem asChild>
                          <Link href={`/groups/${group.id}`} className="touch-target">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/groups/${group.id}/edit`} className="touch-target">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(group)}
                          className="text-destructive touch-target"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={!!deleteGroup}
        onOpenChange={(open) => !open && setDeleteGroup(null)}
        title="Delete Group"
        description={
          deleteGroup ? (
            <>
              Are you sure you want to delete the group "{deleteGroup.name}"?
              {deleteGroup.services && deleteGroup.services.length > 0 && (
                <div className="mt-2 p-2 bg-destructive/10 rounded text-sm">
                  <strong>Warning:</strong> This group has {deleteGroup.services.length} associated service(s). 
                  You must reassign or remove these services before deleting the group.
                </div>
              )}
            </>
          ) : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
        disabled={deleteGroup?.services && deleteGroup.services.length > 0}
      />
    </div>
  )
}