"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Trash2, Globe, Network, Server, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/layout/page-header"
import { useService, useDeleteService } from "@/lib/hooks/use-services"
import { useGroups } from "@/lib/hooks/use-groups"
import { NetworkService } from "@/lib/types"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { useState } from "react"

// Service type icons mapping
const serviceTypeIcons = {
  web: Globe,
  database: Server,
  api: Network,
  storage: Server,
  security: Shield,
  monitoring: Network,
} as const

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  const { service, loading: serviceLoading, error: serviceError, refetch } = useService(serviceId)
  const { data: groups, loading: groupsLoading } = useGroups()
  const deleteService = useDeleteService()

  // Find the group for this service
  const serviceGroup = groups.find(group => group.id === service?.group_id)

  const handleDelete = async () => {
    if (!service) return
    
    try {
      await deleteService.mutate(service.id)
      router.push('/services')
    } catch (error) {
      // Error is handled by the hook
      console.error('Failed to delete service:', error)
    }
  }

  const formatServiceType = (type: NetworkService['type']) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Loading state
  if (serviceLoading || groupsLoading) {
    return (
      <>
        <PageHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    )
  }

  // Error state
  if (serviceError || !service) {
    return (
      <>
        <PageHeader title="Service Not Found" />
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

  const ServiceTypeIcon = serviceTypeIcons[service.type]

  return (
    <>
      <PageHeader 
        title={service.name}
        description="Service details and configuration"
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/services">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Services
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/services/${service.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleteService.loading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />
      
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        {/* Service Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ServiceTypeIcon className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Core service details and identification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Service Name</label>
                <p className="text-lg font-semibold">{service.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Service Type</label>
                <div className="mt-1">
                  <Badge variant="secondary" className="text-sm">
                    {formatServiceType(service.type)}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Group</label>
                <p className="text-sm">
                  {serviceGroup ? (
                    <Link 
                      href={`/groups/${serviceGroup.id}`}
                      className="text-primary hover:underline"
                    >
                      {serviceGroup.name}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">Unknown Group</span>
                  )}
                </p>
                {serviceGroup?.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {serviceGroup.description}
                  </p>
                )}
              </div>

              {service.domain && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Domain</label>
                  <p className="font-mono text-sm">{service.domain}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Network Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Network Configuration
              </CardTitle>
              <CardDescription>
                Network settings and connectivity details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  IP Addresses ({service.ip_addresses.length})
                </label>
                <div className="mt-1 space-y-1">
                  {service.ip_addresses.map((ip, index) => (
                    <p key={index} className="font-mono text-sm bg-muted px-2 py-1 rounded">
                      {ip}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Ports ({service.ports.length})
                </label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {service.ports.map((port, index) => (
                    <Badge key={index} variant="outline" className="font-mono">
                      {port}
                    </Badge>
                  ))}
                </div>
              </div>

              {service.vlan_id && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">VLAN ID</label>
                  <p className="font-mono text-sm bg-muted px-2 py-1 rounded inline-block">
                    {service.vlan_id}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>
              Service creation and modification timestamps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{formatDate(service.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{formatDate(service.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Service"
        description={
          <>
            Are you sure you want to delete <strong>{service.name}</strong>? 
            This action cannot be undone and will permanently remove the service 
            from your network inventory.
          </>
        }
        confirmText="Delete Service"
        cancelText="Cancel"
        onConfirm={handleDelete}
        loading={deleteService.loading}
        variant="destructive"
      />
    </>
  )
}