"use client"

import Link from "next/link"
import { Plus, Users, Server, Network, Shield, Database } from "lucide-react"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/layout/page-header"
import { SEOHead, seoConfigs } from "@/components/common/seo-head"
import { useServices } from "@/lib/hooks/use-services"
import { useGroups } from "@/lib/hooks/use-groups"
import { NetworkService, Group } from "@/lib/types"

// Helper function to get service type icon
function getServiceTypeIcon(type: NetworkService['type']) {
  switch (type) {
    case 'web':
      return Network
    case 'database':
      return Database
    case 'security':
      return Shield
    case 'api':
      return Server
    case 'storage':
      return Database
    case 'monitoring':
      return Network
    default:
      return Server
  }
}

// Helper function to format date
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Stats card component
function StatsCard({ 
  title, 
  value, 
  description, 
  loading 
}: { 
  title: string
  value: number | string
  description: string
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16 mb-1" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

// Recent services component
function RecentServices({ services, loading }: { services: NetworkService[], loading: boolean }) {
  const recentServices = services.slice(0, 5) // Show only 5 most recent

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Services</CardTitle>
        <CardDescription>
          Latest network services added to the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : recentServices.length > 0 ? (
          <div className="space-y-3">
            {recentServices.map((service) => {
              const IconComponent = getServiceTypeIcon(service.type)
              return (
                <div key={service.id} className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Link 
                      href={`/services/${service.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {service.name}
                    </Link>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {service.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(service.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
            {services.length > 5 && (
              <div className="pt-2">
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link href="/services">
                    View all services ({services.length})
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Server className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No services registered yet.</p>
            <Button asChild size="sm" className="mt-3">
              <Link href="/services/new">
                <Plus className="mr-2 h-4 w-4" />
                Add your first service
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Recent groups component
function RecentGroups({ groups, loading }: { groups: Group[], loading: boolean }) {
  const recentGroups = groups.slice(0, 5) // Show only 5 most recent

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Groups</CardTitle>
        <CardDescription>
          Latest service groups created
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : recentGroups.length > 0 ? (
          <div className="space-y-3">
            {recentGroups.map((group) => (
              <div key={group.id} className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                  <Users className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <Link 
                    href={`/groups/${group.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {group.name}
                  </Link>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {group.services?.length || 0} services
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(group.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {groups.length > 5 && (
              <div className="pt-2">
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link href="/groups">
                    View all groups ({groups.length})
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No groups created yet.</p>
            <Button asChild size="sm" className="mt-3">
              <Link href="/groups/new">
                <Plus className="mr-2 h-4 w-4" />
                Create your first group
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  // Fetch data using existing hooks
  const { data: services, loading: servicesLoading } = useServices()
  const { data: groups, loading: groupsLoading } = useGroups()

  // Calculate statistics
  const stats = useMemo(() => {
    const totalServices = services.length
    const totalGroups = groups.length
    
    // Calculate unique IP addresses
    const uniqueIPs = new Set()
    services.forEach(service => {
      service.ip_addresses.forEach(ip => uniqueIPs.add(ip))
    })
    
    // Calculate unique VLANs
    const uniqueVLANs = new Set()
    services.forEach(service => {
      if (service.vlan_id) {
        uniqueVLANs.add(service.vlan_id)
      }
    })

    return {
      totalServices,
      totalGroups,
      activeIPs: uniqueIPs.size,
      vlans: uniqueVLANs.size
    }
  }, [services, groups])

  // Sort services and groups by creation date (most recent first)
  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [services])

  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [groups])

  return (
    <>
      <SEOHead {...seoConfigs.dashboard} />
      <PageHeader 
        title="Dashboard"
        description="Overview of your network infrastructure"
        action={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button asChild variant="outline" className="touch-target">
              <Link href="/groups/new">
                <Users className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Add Group</span>
                <span className="sm:hidden">Group</span>
              </Link>
            </Button>
            <Button asChild className="touch-target">
              <Link href="/services/new">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Add Service</span>
                <span className="sm:hidden">Service</span>
              </Link>
            </Button>
          </div>
        }
      />
      <div className="flex flex-1 flex-col gap-4 container-responsive pt-0">
        {/* Stats Cards - Responsive Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Services"
            value={stats.totalServices}
            description="Network services registered"
            loading={servicesLoading}
          />
          <StatsCard
            title="Total Groups"
            value={stats.totalGroups}
            description="Service groups configured"
            loading={groupsLoading}
          />
          <StatsCard
            title="Active IPs"
            value={stats.activeIPs}
            description="IP addresses in use"
            loading={servicesLoading}
          />
          <StatsCard
            title="VLANs"
            value={stats.vlans}
            description="Virtual LANs configured"
            loading={servicesLoading}
          />
        </div>
        
        {/* Recent Items - Responsive Grid */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <RecentServices services={sortedServices} loading={servicesLoading} />
          <RecentGroups groups={sortedGroups} loading={groupsLoading} />
        </div>
      </div>
    </>
  )
}