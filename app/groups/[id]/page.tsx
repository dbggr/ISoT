"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Trash2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/layout/page-header"
import { GroupServicesTable } from "@/components/groups/group-services-table"
import { ConfirmationDialog } from "@/components/common/confirmation-dialog"
import { useGroup, useDeleteGroup } from "@/lib/hooks/use-groups"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const groupId = params.id as string
  
  const { group, loading, error, refetch } = useGroup(groupId)
  const deleteGroup = useDeleteGroup()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDelete = async () => {
    if (!group) return

    // Check if group has associated services
    if (group.services && group.services.length > 0) {
      toast({
        title: "Cannot delete group",
        description: `Group "${group.name}" has ${group.services.length} associated service(s). Please reassign or remove these services first.`,
        variant: "destructive",
      })
      setShowDeleteDialog(false)
      return
    }

    try {
      await deleteGroup.mutate(group.id)
      toast({
        title: "Group deleted",
        description: `Group "${group.name}" has been deleted successfully.`,
      })
      router.push('/groups')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete group. Please try again.",
        variant: "destructive",
      })
    }
    setShowDeleteDialog(false)
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

  if (loading) {
    return (
      <>
        <PageHeader 
          title="Loading..."
          description="Loading group details"
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <div className="space-y-4">
                <div className="h-6 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error || !group) {
    return (
      <>
        <PageHeader 
          title="Error"
          description="Failed to load group"
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <div className="text-center">
                <p className="text-sm text-destructive mb-4">
                  {error || "Group not found"}
                </p>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => refetch()}>
                    Try Again
                  </Button>
                  <Button asChild>
                    <Link href="/groups">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Groups
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader 
        title={group.name}
        description={group.description || "Group details and associated services"}
        action={
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild>
              <Link href="/groups">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/groups/${group.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Group Information Card */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Group Information</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-sm font-medium">{group.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Services Count</label>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {group.services?.length || 0} services
                  </Badge>
                </div>
              </div>
              {group.description && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm">{group.description}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{formatDate(group.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{formatDate(group.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Associated Services */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Associated Services</h3>
                <p className="text-sm text-muted-foreground">
                  Services that belong to this group
                </p>
              </div>
              <Button asChild>
                <Link href={`/services/new?group=${group.id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Service
                </Link>
              </Button>
            </div>
          </div>
          <div className="p-6 pt-0">
            {group.services && group.services.length > 0 ? (
              <GroupServicesTable 
                services={group.services}
                loading={false}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No services are associated with this group yet.
                </p>
                <Button asChild>
                  <Link href={`/services/new?group=${group.id}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Service
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Group"
        description={
          <>
            Are you sure you want to delete the group "{group.name}"?
            {group.services && group.services.length > 0 && (
              <div className="mt-2 p-2 bg-destructive/10 rounded text-sm">
                <strong>Warning:</strong> This group has {group.services.length} associated service(s). 
                You must reassign or remove these services before deleting the group.
              </div>
            )}
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
        disabled={group.services && group.services.length > 0}
      />
    </>
  )
}