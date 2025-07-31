"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { ServiceForm } from "@/components/services/service-form"
import { NetworkService } from "@/lib/types"

export default function NewServicePage() {
  const router = useRouter()

  const handleSuccess = (newService: NetworkService) => {
    // Navigate to the new service detail page
    router.push(`/services/${newService.id}`)
  }

  const handleCancel = () => {
    // Navigate back to services list
    router.push('/services')
  }

  return (
    <>
      <PageHeader 
        title="New Service"
        description="Create a new network service"
        action={
          <Button variant="outline" asChild>
            <Link href="/services">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Services
            </Link>
          </Button>
        }
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <ServiceForm
          mode="create"
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </>
  )
}