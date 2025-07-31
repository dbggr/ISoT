"use client"

import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { ServicesTableWithSkeleton } from "@/components/common/lazy-components"
import { SEOHead, seoConfigs } from "@/components/common/seo-head"
import { NetworkService } from "@/lib/types"

export default function ServicesPage() {
  // Handle service actions
  const handleServiceSelect = (service: NetworkService) => {
    // This will be handled by the Link in the table
    console.log('Service selected:', service.name)
  }

  const handleServiceEdit = (service: NetworkService) => {
    // Navigate to edit page
    window.location.href = `/services/${service.id}/edit`
  }

  const handleServiceDelete = (service: NetworkService) => {
    // This will be handled by the ServicesTable component
    console.log('Delete service:', service.name)
  }

  const handleBulkDelete = (serviceIds: string[]) => {
    // TODO: Show confirmation dialog and delete multiple services
    console.log('Bulk delete services:', serviceIds)
  }

  const handleBulkGroupChange = (serviceIds: string[], groupId: string) => {
    // TODO: Update group for multiple services
    console.log('Bulk group change:', serviceIds, 'to group:', groupId)
  }

  return (
    <>
      <SEOHead {...seoConfigs.services} />
      <PageHeader 
        title="Services"
        description="Manage network services and their configurations"
        action={
          <Button asChild className="touch-target w-full sm:w-auto">
            <Link href="/services/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Service</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </Button>
        }
      />
      <div className="flex flex-1 flex-col gap-4 container-responsive pt-0">
        <ServicesTableWithSkeleton
          onServiceSelect={handleServiceSelect}
          onServiceEdit={handleServiceEdit}
          onServiceDelete={handleServiceDelete}
          onBulkDelete={handleBulkDelete}
          onBulkGroupChange={handleBulkGroupChange}
        />
      </div>
    </>
  )
}