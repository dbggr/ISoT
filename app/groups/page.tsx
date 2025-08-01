"use client"

import Link from "next/link"
import { Plus, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { GroupsTableWithSkeleton } from "@/components/common/lazy-components"
import { SEOHead, seoConfigs } from "@/components/common/seo-head"
import { useGroups, useDeleteGroup, useGroupDeletionCheck } from "@/lib/hooks/use-groups"
import { useToast } from "@/hooks/use-toast"
import { Group } from "@/lib/types"

export default function GroupsPage() {
  const { data: groups, loading, error, refetch } = useGroups()
  const deleteGroup = useDeleteGroup()
  const { toast } = useToast()

  const handleDelete = async (group: Group) => {
    // Check if group has associated services
    if (group.services && group.services.length > 0) {
      toast({
        title: "Cannot delete group",
        description: `Group "${group.name}" has ${group.services.length} associated service(s). Please reassign or remove these services first.`,
        variant: "destructive",
      })
      return
    }

    try {
      await deleteGroup.mutate(group.id)
      toast({
        title: "Group deleted",
        description: `Group "${group.name}" has been deleted successfully.`,
      })
      refetch()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete group. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (error) {
    return (
      <>
        <SEOHead {...seoConfigs.groups} />
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)] pointer-events-none" />
        <PageHeader 
          title="Network Groups"
          description="Organize services into logical groups"
          action={
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
          }
        />
        <div className="flex flex-1 flex-col gap-4 container-responsive pt-0 relative z-10">
          <div className="rounded-lg border-0 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl hover:shadow-pink-500/20 transition-all duration-300">
            <div className="spacing-mobile p-6">
              <div className="text-center">
                <p className="text-sm text-red-400 mb-4">Error loading groups: {error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => refetch()}
                  className="mt-2 touch-target bg-gray-900/50 border-pink-500/30 text-pink-400 hover:bg-pink-500/20 hover:border-pink-500/50 transition-all duration-200 backdrop-blur-sm"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SEOHead {...seoConfigs.groups} />
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)] pointer-events-none" />
      <PageHeader 
        title="Network Groups"
        description="Organize services into logical groups"
        action={
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
        }
      />
      <div className="flex flex-1 flex-col gap-4 container-responsive pt-0 relative z-10">
        <GroupsTableWithSkeleton 
          groups={groups || []}
          loading={loading}
          onDelete={handleDelete}
        />
      </div>
    </>
  )
}