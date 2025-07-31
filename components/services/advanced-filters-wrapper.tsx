"use client"

import { Suspense } from "react"
import { AdvancedFilters, FilterState } from "./advanced-filters"
import { Skeleton } from "@/components/ui/skeleton"

interface AdvancedFiltersWrapperProps {
  onFiltersChange: (filters: FilterState) => void
  className?: string
}

function AdvancedFiltersLoading() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-9 w-20" />
      <Skeleton className="h-9 w-16" />
    </div>
  )
}

export function AdvancedFiltersWrapper({ onFiltersChange, className }: AdvancedFiltersWrapperProps) {
  return (
    <Suspense fallback={<AdvancedFiltersLoading />}>
      <AdvancedFilters onFiltersChange={onFiltersChange} className={className} />
    </Suspense>
  )
}