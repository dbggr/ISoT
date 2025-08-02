"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Trash2, Globe, Network, Server, Shield, Monitor, Target, Users, Eye } from "lucide-react"
import TemplatePage from "@/components/template/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
  const serviceGroup = groups.find(group => group.id === service?.groupId)

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
      <TemplatePage
        title="INFRASTRUCTURE"
        sections={[
          { id: "overview", icon: Monitor, label: "COMMAND", href: "/" },
          { id: "groups", icon: Users, label: "GROUPS", href: "/groups" },
          { id: "services", icon: Target, label: "SERVICES", href: "/services" },
        ]}
        currentSection="services"
        showSystemStatus={true}
        breadcrumb="VIEW"
      >
        <div className="p-6">
          {/* Loading Header */}
          <div className="border-b border-neutral-700 bg-neutral-800/50 backdrop-blur-sm rounded-lg mb-6">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-20" />
                </div>
              </div>
            </div>
          </div>

          {/* Loading Content */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-neutral-900 border-neutral-700">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-700">
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
      </TemplatePage>
    )
  }

  // Error state
  if (serviceError || !service) {
    return (
      <TemplatePage
        title="INFRASTRUCTURE"
        sections={[
          { id: "overview", icon: Monitor, label: "COMMAND", href: "/" },
          { id: "groups", icon: Users, label: "GROUPS", href: "/groups" },
          { id: "services", icon: Target, label: "SERVICES", href: "/services" },
        ]}
        currentSection="services"
        showSystemStatus={true}
        breadcrumb="VIEW"
      >
        <div className="p-6">
          {/* Error Header */}
          <div className="border-b border-neutral-700 bg-neutral-800/50 backdrop-blur-sm rounded-lg mb-6">
            <div className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 shadow-lg">
                  <Server className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
                    Service Not Found
                  </h1>
                  <p className="text-sm text-neutral-400">Unable to load the requested service</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Content */}
          <div className="max-w-4xl">
            <Card className="bg-neutral-900 border-neutral-700">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2 text-white">Service Not Found</h3>
                  <p className="text-neutral-400 mb-4">
                    {serviceError || "The requested service could not be found."}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => router.back()}
                      className="bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Go Back
                    </Button>
                    <Button 
                      asChild
                      className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                    >
                      <Link href="/services">
                        View All Services
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TemplatePage>
    )
  }

  const ServiceTypeIcon = serviceTypeIcons[service.type]

  return (
    <TemplatePage
      title="INFRASTRUCTURE"
      sections={[
        { id: "overview", icon: Monitor, label: "COMMAND", href: "/" },
        { id: "groups", icon: Users, label: "GROUPS", href: "/groups" },
        { id: "services", icon: Target, label: "SERVICES", href: "/services" },
      ]}
      currentSection="services"
      showSystemStatus={true}
      breadcrumb="VIEW"
    >
      <div className="p-6">
        {/* Service Detail Header */}
        <div className="border-b border-neutral-700 bg-neutral-800/50 backdrop-blur-sm rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
                  <ServiceTypeIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    {service.name}
                  </h1>
                  <p className="text-sm text-neutral-400">
                    {formatServiceType(service.type)} Service • {serviceGroup?.name || 'Unknown Group'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  asChild
                  variant="outline"
                  className="bg-neutral-800 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 font-medium tracking-wider"
                >
                  <Link href={`/services/${service.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    EDIT
                  </Link>
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="bg-neutral-800 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 font-medium tracking-wider"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  DELETE
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Service Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader className="border-b border-neutral-700">
              <CardTitle className="flex items-center gap-2 text-white">
                <ServiceTypeIcon className="h-5 w-5 text-orange-500" />
                BASIC INFORMATION
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Core service details and identification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div>
                <label className="text-sm font-medium text-neutral-300 tracking-wider">SERVICE NAME</label>
                <p className="text-lg font-semibold text-white font-mono">{service.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-neutral-300 tracking-wider">SERVICE TYPE</label>
                <div className="mt-1">
                  <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">
                    {formatServiceType(service.type).toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-neutral-300 tracking-wider">GROUP</label>
                <p className="text-sm">
                  {serviceGroup ? (
                    <Link 
                      href={`/groups/${serviceGroup.id}`}
                      className="text-orange-400 hover:text-orange-300 hover:underline"
                    >
                      {serviceGroup.name}
                    </Link>
                  ) : (
                    <span className="text-neutral-400">Unknown Group</span>
                  )}
                </p>
                {serviceGroup?.description && (
                  <p className="text-xs text-neutral-400 mt-1">
                    {serviceGroup.description}
                  </p>
                )}
              </div>

              {service.domain && (
                <div>
                  <label className="text-sm font-medium text-neutral-300 tracking-wider">DOMAIN</label>
                  <p className="font-mono text-sm text-white bg-neutral-800 px-2 py-1 rounded">{service.domain}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Network Configuration */}
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader className="border-b border-neutral-700">
              <CardTitle className="flex items-center gap-2 text-white">
                <Network className="h-5 w-5 text-orange-500" />
                NETWORK CONFIGURATION
              </CardTitle>
              <CardDescription className="text-neutral-400">
                Network settings and connectivity details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div>
                <label className="text-sm font-medium text-neutral-300 tracking-wider">
                  IP ADDRESSES ({service.ipAddress ? service.ipAddress.split(',').length : 0})
                </label>
                <div className="mt-1 space-y-1">
                  {service.ipAddress ? service.ipAddress.split(',').map((ip, index) => (
                    <p key={index} className="font-mono text-sm bg-neutral-800 px-2 py-1 rounded text-white">
                      {ip.trim()}
                    </p>
                  )) : (
                    <p className="text-sm text-neutral-400">No IP addresses configured</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-300 tracking-wider">
                  INTERNAL PORTS ({service.internalPorts?.length || 0})
                </label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {service.internalPorts?.map((port, index) => (
                    <Badge key={index} className="bg-neutral-800 border-neutral-700 text-white font-mono">
                      {port}
                    </Badge>
                  )) || (
                    <p className="text-sm text-neutral-400">No ports configured</p>
                  )}
                </div>
              </div>

              {service.vlan && (
                <div>
                  <label className="text-sm font-medium text-neutral-300 tracking-wider">VLAN ID</label>
                  <p className="font-mono text-sm bg-neutral-800 px-2 py-1 rounded inline-block text-white">
                    {service.vlan}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Metadata */}
        <Card className="bg-neutral-900 border-neutral-700 mt-6">
          <CardHeader className="border-b border-neutral-700">
            <CardTitle className="text-white">METADATA</CardTitle>
            <CardDescription className="text-neutral-400">
              Service creation and modification timestamps
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-neutral-300 tracking-wider">CREATED</label>
                <p className="text-sm text-white font-mono">{formatDate(service.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-300 tracking-wider">LAST UPDATED</label>
                <p className="text-sm text-white font-mono">{formatDate(service.updatedAt)}</p>
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
    </TemplatePage>
  )
}