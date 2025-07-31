"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { GroupForm } from "@/components/groups/group-form"
import { useGroup } from "@/lib/hooks/use-groups"
import { Group } from "@/lib/types"

export default function EditGroupPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string
  
  const { group, loading, error, refetch } = useGroup(groupId)

  const handleSuccess = (updatedGroup: Group) => {
    router.push(`/groups/${updatedGroup.id}`)
  }

  const handleCancel = () => {
    router.back()
  }

  if (loading) {
    return (
      <>
        <PageHeader 
          title="Edit Group"
          description="Loading group details..."
        />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <div className="space-y-4">
                <div className="h-6 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                <div className="h-10 bg-muted animate-pulse rounded" />
                <div className="h-20 bg-muted animate-pulse rounded" />
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
          title="Edit Group"
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
        title={`Edit ${group.name}`}
        description="Update group information"
        action={
          <Button variant="outline" asChild>
            <Link href={`/groups/${group.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Group
            </Link>
          </Button>
        }
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Group Details</h3>
            <p className="text-sm text-muted-foreground">
              Update the group information below
            </p>
          </div>
          <div className="p-6 pt-0">
            <GroupForm 
              group={group}
              mode="edit"
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </>
  )
}