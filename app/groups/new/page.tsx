"use client"

import { PageHeader } from "@/components/layout/page-header"
import { GroupForm } from "@/components/groups/group-form"

export default function NewGroupPage() {
  return (
    <>
      <PageHeader 
        title="New Group"
        description="Create a new service group"
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Group Details</h3>
            <p className="text-sm text-muted-foreground">
              Enter the details for the new service group
            </p>
          </div>
          <div className="p-6 pt-0">
            <GroupForm mode="create" />
          </div>
        </div>
      </div>
    </>
  )
}