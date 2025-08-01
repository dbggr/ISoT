"use client"

import { Suspense } from "react"
import Link from "next/link"
import { Plus, Server } from "lucide-react"

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
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)] pointer-events-none" />
      <PageHeader 
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg">
              <Server className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Network Services
              </h1>
              <p className="text-sm text-gray-400">Manage network services and their configurations</p>
            </div>
          </div>
        }
        description="Manage network services and their configurations"
                  action={
            <Button asChild className="touch-target w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg transition-all duration-200 text-white">
              <Link href="/services/new">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Add Service</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </Button>
          }
      />
      <div className="flex flex-1 flex-col gap-4 container-responsive pt-0 relative z-10">
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