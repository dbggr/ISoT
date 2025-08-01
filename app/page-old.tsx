"use client"

import Link from "next/link"
import { Plus, Users, Server, Network, Shield, Database, Activity, Zap, Globe, Cpu } from "lucide-react"
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

// Cyberpunk Stats card component
function StatsCard({ 
  title, 
  value, 
  description, 
  loading,
  icon: Icon,
  color = "cyan"
}: { 
  title: string
  value: number | string
  description: string
  loading: boolean
  icon: any
  color?: "cyan" | "pink" | "green" | "purple" | "yellow"
}) {
  const colorClasses = {
    cyan: "from-cyan-500 to-blue-500",
    pink: "from-pink-500 to-rose-500", 
    green: "from-green-500 to-emerald-500",
    purple: "from-purple-500 to-violet-500",
    yellow: "from-yellow-500 to-orange-500"
  }

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 group">
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[color]} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      
      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/20 via-transparent to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
        <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        {loading ? (
          <Skeleton className="h-8 w-16 mb-1 bg-gray-700" />
        ) : (
          <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {value}
          </div>
        )}
        <p className="text-xs text-gray-400">{description}</p>
      </CardContent>
    </Card>
  )
}

function RecentServices({ services, loading }: { services: NetworkService[], loading: boolean }) {
  const recentServices = services.slice(0, 5) // Show only 5 most recent

  return (
    <Card className="border-0 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-gray-100 flex items-center gap-2">
          <Zap className="h-5 w-5 text-cyan-400" />
          Active Services
        </CardTitle>
        <CardDescription className="text-gray-400">
          Latest network services in the grid
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded bg-gray-700" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-32 bg-gray-700" />
                  <Skeleton className="h-3 w-24 bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        ) : recentServices.length > 0 ? (
          <div className="space-y-3">
            {recentServices.map((service) => {
              const Icon = getServiceTypeIcon(service.type)
              return (
                <div key={service.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200 border border-gray-700/50">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <Link 
                        href={`/services/${service.id}`}
                        className="text-sm font-medium text-gray-100 hover:text-cyan-400 transition-colors duration-200 truncate"
                      >
                        {service.name}
                      </Link>
                      <Badge 
                        variant="outline" 
                        className="text-xs border-cyan-500/30 text-cyan-400 bg-cyan-500/10"
                      >
                        {service.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 truncate">
                      {service.ipAddress} • {formatDate(service.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Server className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">No services found</p>
            <p className="text-gray-500 text-xs">Create your first service to get started</p>
          </div>
        )}
        
        {!loading && recentServices.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <Link href="/services">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-gray-900/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-200 backdrop-blur-sm"
              >
                View All Services
                <Plus className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Cyberpunk Recent groups component
function RecentGroups({ groups, loading }: { groups: Group[], loading: boolean }) {
  const recentGroups = groups.slice(0, 5) // Show only 5 most recent

  return (
    <Card className="border-0 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl hover:shadow-pink-500/20 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-gray-100 flex items-center gap-2">
          <Users className="h-5 w-5 text-pink-400" />
          Network Groups
        </CardTitle>
        <CardDescription className="text-gray-400">
          Organized service clusters
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded bg-gray-700" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-32 bg-gray-700" />
                  <Skeleton className="h-3 w-24 bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        ) : recentGroups.length > 0 ? (
          <div className="space-y-3">
            {recentGroups.map((group) => (
              <div key={group.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200 border border-gray-700/50">
                <div className="p-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <Link 
                      href={`/groups/${group.id}`}
                      className="text-sm font-medium text-gray-100 hover:text-pink-400 transition-colors duration-200 truncate"
                    >
                      {group.name}
                    </Link>
                    <Badge 
                      variant="outline" 
                      className="text-xs border-pink-500/30 text-pink-400 bg-pink-500/10"
                    >
                      {group.services?.length || 0} services
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {group.description || 'No description'} • {formatDate(group.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-sm">No groups found</p>
            <p className="text-gray-500 text-xs">Create your first group to organize services</p>
          </div>
        )}
        
        {!loading && recentGroups.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <Link href="/groups">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-gray-900/50 border-pink-500/30 text-pink-400 hover:bg-pink-500/20 hover:border-pink-500/50 transition-all duration-200 backdrop-blur-sm"
              >
                View All Groups
                <Plus className="ml-2 h-4 w-4" />
              </Button>
            </Link>
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
    <>
      <SEOHead {...seoConfigs.dashboard} />
      
      {/* Cyberpunk Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)] pointer-events-none" />
      
      <PageHeader 
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Network Grid
              </h1>
              <p className="text-sm text-gray-400">Infrastructure Source of Truth</p>
            </div>
          </div>
        }
        description="Real-time overview of your cybernetic infrastructure"
        action={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              asChild 
              variant="outline" 
              className="touch-target bg-gray-900/50 border-pink-500/50 text-pink-400 hover:bg-pink-500/20 hover:border-pink-500/70 hover:text-pink-300 transition-all duration-200 shadow-lg backdrop-blur-sm"
            >
              <Link href="/groups/new">
                <Users className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Add Group</span>
                <span className="sm:hidden">Group</span>
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="touch-target bg-gray-900/50 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/70 hover:text-cyan-300 transition-all duration-200 shadow-lg backdrop-blur-sm"
            >
              <Link href="/services/new">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Add Service</span>
                <span className="sm:hidden">Service</span>
              </Link>
            </Button>
          </div>
        }
      />
      
      <div className="flex flex-1 flex-col gap-6 container-responsive pt-0 relative z-10">
        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Services"
            value={stats.totalServices}
            description="Network services registered"
            loading={servicesLoading}
            icon={Network}
            color="cyan"
          />
          <StatsCard
            title="Network Groups"
            value={stats.totalGroups}
            description="Service groups configured"
            loading={groupsLoading}
            icon={Users}
            color="pink"
          />
          <StatsCard
            title="Active IPs"
            value={stats.activeIPs}
            description="IP addresses in use"
            loading={servicesLoading}
            icon={Globe}
            color="green"
          />
          <StatsCard
            title="VLANs"
            value={stats.vlans}
            description="Virtual LANs configured"
            loading={servicesLoading}
            icon={Cpu}
            color="purple"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentServices services={sortedServices} loading={servicesLoading} />
          <RecentGroups groups={sortedGroups} loading={groupsLoading} />
        </div>

        {/* Quick Actions */}
        <Card className="border-0 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center gap-2">
              <Activity className="h-5 w-5 text-yellow-400" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-gray-400">
              Rapid access to common operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/services">
                <Button 
                  variant="outline" 
                  className="w-full h-auto p-4 flex flex-col items-center gap-2 bg-gray-900/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-200 backdrop-blur-sm"
                >
                  <Server className="h-6 w-6" />
                  <span className="text-sm font-medium">All Services</span>
                  <span className="text-xs text-gray-400">Manage network services</span>
                </Button>
              </Link>
              
              <Link href="/groups">
                <Button 
                  variant="outline" 
                  className="w-full h-auto p-4 flex flex-col items-center gap-2 bg-gray-900/50 border-pink-500/30 text-pink-400 hover:bg-pink-500/20 hover:border-pink-500/50 transition-all duration-200 backdrop-blur-sm"
                >
                  <Users className="h-6 w-6" />
                  <span className="text-sm font-medium">All Groups</span>
                  <span className="text-xs text-gray-400">Organize services</span>
                </Button>
              </Link>
              
              <Link href="/services/new">
                <Button 
                  variant="outline" 
                  className="w-full h-auto p-4 flex flex-col items-center gap-2 bg-gray-900/50 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50 transition-all duration-200 backdrop-blur-sm"
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-sm font-medium">New Service</span>
                  <span className="text-xs text-gray-400">Add network service</span>
                </Button>
              </Link>
              
              <Link href="/groups/new">
                <Button 
                  variant="outline" 
                  className="w-full h-auto p-4 flex flex-col items-center gap-2 bg-gray-900/50 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all duration-200 backdrop-blur-sm"
                >
                  <Users className="h-6 w-6" />
                  <span className="text-sm font-medium">New Group</span>
                  <span className="text-xs text-gray-400">Create service group</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}