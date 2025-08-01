"use client"

import { useMemo } from "react"
import { useServices } from "@/lib/hooks/use-services"
import { useGroups } from "@/lib/hooks/use-groups"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Server, Network, Database, Shield, Activity, Users, Globe, Cpu } from "lucide-react"
import Link from "next/link"
import { NetworkService, Group } from "@/lib/types"

// Helper function to get service type icon
function getServiceTypeIcon(type: NetworkService['type']) {
  if (!type) return Server
  
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
      return Activity
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

function RecentServices({ services, loading }: { services: NetworkService[], loading: boolean }) {
  const recentServices = services.slice(0, 5) // Show only 5 most recent

  return (
    <Card className="lg:col-span-1 bg-neutral-900 border-neutral-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">SERVICES</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded bg-neutral-700" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-32 bg-neutral-700" />
                  <Skeleton className="h-3 w-24 bg-neutral-700" />
                </div>
              </div>
            ))}
          </div>
        ) : recentServices.length > 0 ? (
          <div className="space-y-3">
            {recentServices.map((service) => {
              const Icon = getServiceTypeIcon(service.type)
              return (
                <div key={service.id} className="flex items-center space-x-3 p-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 transition-colors duration-200 border border-neutral-700/50">
                  <div className="p-2 rounded-lg bg-orange-500 shadow-lg">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <Link 
                        href={`/services/${service.id}`}
                        className="text-sm font-medium text-white hover:text-orange-500 transition-colors duration-200 truncate"
                      >
                        {service.name}
                      </Link>
                      <Badge 
                        variant="outline" 
                        className="text-xs border-orange-500/30 text-orange-500 bg-orange-500/10"
                      >
                        {service.type ? service.type.toUpperCase() : 'UNKNOWN'}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-400 truncate font-mono">
                      {service.ipAddress || 'No IP'} • {formatDate(service.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Server className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400 text-sm">No services found</p>
            <p className="text-neutral-500 text-xs">Create your first service to get started</p>
          </div>
        )}
        
        {!loading && recentServices.length > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-700/50">
            <Link href="/services">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-neutral-900/50 border-orange-500/30 text-orange-500 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all duration-200 backdrop-blur-sm"
              >
                VIEW ALL SERVICES
                <Plus className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Tactical Stats card component
function TacticalStatsCard({ 
  title, 
  value, 
  description, 
  loading,
  icon: Icon
}: { 
  title: string
  value: number | string
  description: string
  loading: boolean
  icon: any
}) {
  return (
    <Card className="bg-neutral-900 border-neutral-700 hover:border-orange-500/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">{title.toUpperCase()}</CardTitle>
        <div className="p-2 rounded-lg bg-orange-500 shadow-lg">
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16 mb-1 bg-neutral-700" />
        ) : (
          <div className="text-2xl font-bold text-white font-mono">
            {value}
          </div>
        )}
        <p className="text-xs text-neutral-400">{description}</p>
      </CardContent>
    </Card>
  )
}

// Tactical Recent groups component
function RecentGroups({ groups, loading }: { groups: Group[], loading: boolean }) {
  const recentGroups = groups.slice(0, 5) // Show only 5 most recent

  return (
    <Card className="bg-neutral-900 border-neutral-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">NETWORK GROUPS</CardTitle>
        <CardDescription className="text-neutral-400">
          Organized service clusters
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded bg-neutral-700" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-32 bg-neutral-700" />
                  <Skeleton className="h-3 w-24 bg-neutral-700" />
                </div>
              </div>
            ))}
          </div>
        ) : recentGroups.length > 0 ? (
          <div className="space-y-3">
            {recentGroups.map((group) => (
              <div key={group.id} className="flex items-center space-x-3 p-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 transition-colors duration-200 border border-neutral-700/50">
                <div className="p-2 rounded-lg bg-orange-500 shadow-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <Link 
                      href={`/groups/${group.id}`}
                      className="text-sm font-medium text-white hover:text-orange-500 transition-colors duration-200 truncate"
                    >
                      {group.name}
                    </Link>
                    <Badge 
                      variant="outline" 
                      className="text-xs border-orange-500/30 text-orange-500 bg-orange-500/10"
                    >
                      {group.services?.length || 0} SERVICES
                    </Badge>
                  </div>
                  <p className="text-xs text-neutral-400 truncate font-mono">
                    {group.description || 'No description'} • {formatDate(group.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400 text-sm">No groups found</p>
            <p className="text-neutral-500 text-xs">Create your first group to organize services</p>
          </div>
        )}
        
        {!loading && recentGroups.length > 0 && (
          <div className="mt-4 pt-4 border-t border-neutral-700/50">
            <Link href="/groups">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-neutral-900/50 border-orange-500/30 text-orange-500 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all duration-200 backdrop-blur-sm"
              >
                VIEW ALL GROUPS
                <Plus className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function CommandPage() {
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
      if (service.ipAddress) {
        uniqueIPs.add(service.ipAddress)
      }
    })
    
    // Calculate unique VLANs
    const uniqueVLANs = new Set()
    services.forEach(service => {
      if (service.vlan) {
        uniqueVLANs.add(service.vlan)
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
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [services])

  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [groups])

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TacticalStatsCard
          title="Active Services"
          value={stats.totalServices}
          description="Network services registered"
          loading={servicesLoading}
          icon={Network}
        />
        <TacticalStatsCard
          title="Network Groups"
          value={stats.totalGroups}
          description="Service groups configured"
          loading={groupsLoading}
          icon={Users}
        />
        <TacticalStatsCard
          title="Active IPs"
          value={stats.activeIPs}
          description="IP addresses in use"
          loading={servicesLoading}
          icon={Globe}
        />
        <TacticalStatsCard
          title="VLANs"
          value={stats.vlans}
          description="Virtual LANs configured"
          loading={servicesLoading}
          icon={Cpu}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentServices services={sortedServices} loading={servicesLoading} />
        <RecentGroups groups={sortedGroups} loading={groupsLoading} />
      </div>

      {/* Quick Actions */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">QUICK ACTIONS</CardTitle>
          <CardDescription className="text-neutral-400">
            Rapid access to common operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/services">
              <Button 
                variant="outline" 
                className="w-full h-auto p-4 flex flex-col items-center gap-2 bg-neutral-900/50 border-orange-500/30 text-orange-500 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all duration-200 backdrop-blur-sm"
              >
                <Server className="h-6 w-6" />
                <span className="text-sm font-medium tracking-wider">ALL SERVICES</span>
                <span className="text-xs text-neutral-400">Manage network services</span>
              </Button>
            </Link>
            
            <Link href="/groups">
              <Button 
                variant="outline" 
                className="w-full h-auto p-4 flex flex-col items-center gap-2 bg-neutral-900/50 border-orange-500/30 text-orange-500 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all duration-200 backdrop-blur-sm"
              >
                <Users className="h-6 w-6" />
                <span className="text-sm font-medium tracking-wider">ALL GROUPS</span>
                <span className="text-xs text-neutral-400">Organize services</span>
              </Button>
            </Link>
            
            <Link href="/services/new">
              <Button 
                variant="outline" 
                className="w-full h-auto p-4 flex flex-col items-center gap-2 bg-neutral-900/50 border-orange-500/30 text-orange-500 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all duration-200 backdrop-blur-sm"
              >
                <Plus className="h-6 w-6" />
                <span className="text-sm font-medium tracking-wider">NEW SERVICE</span>
                <span className="text-xs text-neutral-400">Add network service</span>
              </Button>
            </Link>
            
            <Link href="/groups/new">
              <Button 
                variant="outline" 
                className="w-full h-auto p-4 flex flex-col items-center gap-2 bg-neutral-900/50 border-orange-500/30 text-orange-500 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all duration-200 backdrop-blur-sm"
              >
                <Users className="h-6 w-6" />
                <span className="text-sm font-medium tracking-wider">NEW GROUP</span>
                <span className="text-xs text-neutral-400">Create service group</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
