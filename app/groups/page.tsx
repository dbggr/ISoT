"use client"

import Link from "next/link"
import { Plus, Users, Monitor, Target } from "lucide-react"
import TemplatePage from "@/components/template/page"
import { Button } from "@/components/ui/button"
import { GroupsTable } from "@/components/groups/groups-table"
import { useGroups, useDeleteGroup } from "@/lib/hooks/use-groups"
import { useServices } from "@/lib/hooks/use-services"
import { useToast } from "@/hooks/use-toast"
import { Group } from "@/lib/types"
import { cacheInvalidation } from "@/lib/cache"

export default function GroupsPage() {
  const { data: groups, loading, error, refetch } = useGroups()
  const { data: services, refetch: refetchServices } = useServices()
  const deleteGroup = useDeleteGroup()
  const { toast } = useToast()

  const handleDelete = async (group: Group) => {
    // Check if group has associated services using actual services data
    const associatedServices = services.filter(service => service.groupId === group.id)
    if (associatedServices.length > 0) {
      toast({
        title: "Cannot delete group",
        description: `Group "${group.name}" has ${associatedServices.length} associated service(s). Please reassign or remove these services first.`,
        variant: "destructive",
      })
      return
    }

    try {
      console.log('Deleting group:', group.id, group.name)
      await deleteGroup.mutate(group.id)
      console.log('Group deleted successfully, clearing cache and refreshing data...')
      
      // Force cache invalidation to ensure fresh data
      cacheInvalidation.clearAll()
      
      // Force a complete refresh - wait for both to complete
      await Promise.all([refetch(), refetchServices()])
      console.log('Data refreshed')
      
      toast({
        title: "Group deleted",
        description: `Group "${group.name}" has been deleted successfully.`,
        variant: "success",
        duration: 4000, // 4 seconds
      })
    } catch (error) {
      console.error('Delete group error:', error)
      toast({
        title: "Error",
        description: "Failed to delete group. Please try again.",
        variant: "destructive",
        duration: 6000, // 6 seconds for errors
      })
    }
  }

  return (
    <TemplatePage
      currentSection="groups"
    >
      {/* Groups Page Content */}
      <div className="p-6">
        {/* Page Header */}
        <div className="border-b border-neutral-700 bg-neutral-800/50 backdrop-blur-sm rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    Network Groups
                  </h1>
                  <p className="text-sm text-neutral-400">Infrastructure group management and organization</p>
                </div>
              </div>
              <Button 
                asChild 
                variant="outline" 
                className="bg-neutral-900/50 border-orange-500/50 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/70 hover:text-orange-300 transition-all duration-200 shadow-lg backdrop-blur-sm"
              >
                <Link href="/groups/new">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Add Group</span>
                  <span className="sm:hidden">Group</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Groups Table */}
        <div className="flex flex-1 flex-col gap-4">
          {error ? (
            <div className="bg-neutral-900 border border-red-500/50 rounded-lg p-8 text-center">
              <p className="text-red-500 mb-4 font-mono">SYSTEM ERROR: {error}</p>
              <Button 
                variant="outline" 
                onClick={() => refetch()}
                className="bg-neutral-800 border-neutral-700 text-orange-400 hover:bg-orange-500/20 hover:border-orange-500/70"
              >
                RETRY OPERATION
              </Button>
            </div>
          ) : (
            <GroupsTable 
              groups={groups || []}
              loading={loading}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>
    </TemplatePage>
  )
}