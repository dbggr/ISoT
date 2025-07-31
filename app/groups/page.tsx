"use client"

import Link from "next/link"
import { Plus } from "lucide-react"

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
        <PageHeader 
          title="Groups"
          description="Organize services into logical groups"
          action={
            <Button asChild>
              <Link href="/groups/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Group
              </Link>
            </Button>
          }
        />
        <div className="flex flex-1 flex-col gap-4 container-responsive pt-0">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="spacing-mobile">
              <div className="text-center">
                <p className="text-sm text-destructive">Error loading groups: {error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => refetch()}
                  className="mt-2 touch-target"
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
      <PageHeader 
        title="Groups"
        description="Organize services into logical groups"
        action={
          <Button asChild className="touch-target w-full sm:w-auto">
            <Link href="/groups/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Group</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </Button>
        }
      />
      <div className="flex flex-1 flex-col gap-4 container-responsive pt-0">
        <GroupsTableWithSkeleton 
          groups={groups || []}
          loading={loading}
          onDelete={handleDelete}
        />
      </div>
    </>
  )
}