"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/layout/page-header"
import { ServiceForm } from "@/components/services/service-form"
import { useService } from "@/lib/hooks/use-services"
import { NetworkService } from "@/lib/types"

export default function EditServicePage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string
  
  const { service, loading: serviceLoading, error: serviceError } = useService(serviceId)

  const handleSuccess = (updatedService: NetworkService) => {
    // Navigate back to the service detail page
    router.push(`/services/${updatedService.id}`)
  }

  const handleCancel = () => {
    // Navigate back to the service detail page
    router.push(`/services/${serviceId}`)
  }

  // Loading state
  if (serviceLoading) {
    return (
      <>
        <PageHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  // Error state
  if (serviceError || !service) {
    return (
      <>
        <PageHeader title="Edit Service" />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Service Not Found</h3>
                <p className="text-muted-foreground mb-4">
                  {serviceError || "The requested service could not be found."}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                  </Button>
                  <Button asChild>
                    <Link href="/services">
                      View All Services
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader 
        title={`Edit ${service.name}`}
        description="Update service configuration and settings"
        action={
          <Button variant="outline" asChild>
            <Link href={`/services/${service.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Service
            </Link>
          </Button>
        }
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <ServiceForm
          mode="edit"
          service={service}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </>
  )
}