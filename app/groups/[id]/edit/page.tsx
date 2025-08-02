"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Users, Monitor, Target, Server } from "lucide-react"
import TemplatePage from "@/components/template/page"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
      <TemplatePage
        title="INFRASTRUCTURE"
        sections={[
          { id: "overview", icon: Monitor, label: "COMMAND", href: "/" },
          { id: "groups", icon: Users, label: "GROUPS", href: "/groups" },
          { id: "services", icon: Target, label: "SERVICES", href: "/services" },
        ]}
        currentSection="groups"
        showSystemStatus={true}
        breadcrumb="UPDATE"
      >
        <div className="p-6">
          {/* Loading Header */}
          <div className="border-b border-neutral-700 bg-neutral-800/50 backdrop-blur-sm rounded-lg mb-6">
            <div className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
                  <Edit className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </div>
          </div>

          {/* Loading Form */}
          <div className="max-w-4xl">
            <Card className="bg-neutral-900 border-neutral-700">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TemplatePage>
    )
  }

  if (error || !group) {
    return (
      <TemplatePage
        title="INFRASTRUCTURE"
        sections={[
          { id: "overview", icon: Monitor, label: "COMMAND", href: "/" },
          { id: "groups", icon: Users, label: "GROUPS", href: "/groups" },
          { id: "services", icon: Target, label: "SERVICES", href: "/services" },
        ]}
        currentSection="groups"
        showSystemStatus={true}
        breadcrumb="UPDATE"
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
                    Group Not Found
                  </h1>
                  <p className="text-sm text-neutral-400">Unable to load the requested group</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Content */}
          <div className="max-w-4xl">
            <Card className="bg-neutral-900 border-neutral-700">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2 text-white">Group Not Found</h3>
                  <p className="text-neutral-400 mb-4">
                    {error || "The requested group could not be found."}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => refetch()}
                      className="bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                    >
                      Try Again
                    </Button>
                    <Button 
                      asChild
                      className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                    >
                      <Link href="/groups">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Groups
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

  return (
    <TemplatePage
      title="INFRASTRUCTURE"
      sections={[
        { id: "overview", icon: Monitor, label: "COMMAND", href: "/" },
        { id: "groups", icon: Users, label: "GROUPS", href: "/groups" },
        { id: "services", icon: Target, label: "SERVICES", href: "/services" },
      ]}
      currentSection="groups"
      showSystemStatus={true}
      breadcrumb="UPDATE"
    >
      {/* Edit Group Page Content */}
      <div className="p-6">
        {/* Page Header */}
        <div className="border-b border-neutral-700 bg-neutral-800/50 backdrop-blur-sm rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
                <Edit className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Edit Group: {group.name}
                </h1>
                <p className="text-sm text-neutral-400">Update the group configuration</p>
              </div>
            </div>
          </div>
        </div>

        {/* Group Form */}
        <div className="max-w-4xl">
          <GroupForm 
            group={group}
            mode="edit"
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </TemplatePage>
  )
}