/**
 * Lazy-loaded components for better performance
 * These components are loaded only when needed to reduce initial bundle size
 */

import { lazy, Suspense, ComponentType } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Lazy load heavy table components
export const LazyServicesTable = lazy(() => 
  import('@/components/services/services-table').then(module => ({
    default: module.ServicesTable
  }))
)

export const LazyGroupsTable = lazy(() => 
  import('@/components/groups/groups-table').then(module => ({
    default: module.GroupsTable
  }))
)

// Lazy load form components
export const LazyServiceForm = lazy(() => 
  import('@/components/services/service-form').then(module => ({
    default: module.ServiceForm
  }))
)

export const LazyGroupForm = lazy(() => 
  import('@/components/groups/group-form').then(module => ({
    default: module.GroupForm
  }))
)

// Lazy load advanced filters
export const LazyAdvancedFilters = lazy(() => 
  import('@/components/services/advanced-filters').then(module => ({
    default: module.AdvancedFilters
  }))
)

// Loading skeletons for different component types
export const TableSkeleton = () => (
  <Card>
    <CardHeader>
      <CardTitle>
        <Skeleton className="h-6 w-48" />
      </CardTitle>
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
      <div className="flex justify-between items-center pt-4">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </CardContent>
  </Card>
)

export const FormSkeleton = () => (
  <Card>
    <CardHeader>
      <CardTitle>
        <Skeleton className="h-6 w-32" />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <div className="flex gap-2 pt-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-16" />
        </div>
      </div>
    </CardContent>
  </Card>
)

export const FiltersSkeleton = () => (
  <div className="flex flex-col sm:flex-row gap-2">
    <Skeleton className="h-10 w-full sm:w-48" />
    <Skeleton className="h-10 w-full sm:w-32" />
    <Skeleton className="h-10 w-full sm:w-32" />
  </div>
)

// Higher-order component for lazy loading with custom skeleton
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  LoadingSkeleton: ComponentType = () => <Skeleton className="h-64 w-full" />
) {
  return function LazyComponent(props: P) {
    return (
      <Suspense fallback={<LoadingSkeleton />}>
        <Component {...props} />
      </Suspense>
    )
  }
}

// Wrapped components with appropriate skeletons
export const ServicesTableWithSkeleton = withLazyLoading(LazyServicesTable, TableSkeleton)
export const GroupsTableWithSkeleton = withLazyLoading(LazyGroupsTable, TableSkeleton)
export const ServiceFormWithSkeleton = withLazyLoading(LazyServiceForm, FormSkeleton)
export const GroupFormWithSkeleton = withLazyLoading(LazyGroupForm, FormSkeleton)
export const AdvancedFiltersWithSkeleton = withLazyLoading(LazyAdvancedFilters, FiltersSkeleton)