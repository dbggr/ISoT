"use client"

import { PageHeader } from "@/components/layout/page-header"
import { GroupForm } from "@/components/groups/group-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

export default function NewGroupPage() {
  return (
    <>
      {/* Cyberpunk Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)] pointer-events-none" />
      
      <PageHeader 
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                New Group
              </h1>
              <p className="text-sm text-gray-400">Create a new service group</p>
            </div>
          </div>
        }

      />
      
      <div className="flex flex-1 flex-col gap-6 container-responsive pt-0 relative z-10">
        <Card className="border-0 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl hover:shadow-pink-500/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center gap-2">
              <Users className="h-5 w-5 text-pink-400" />
              Group Details
            </CardTitle>
            <CardDescription className="text-gray-400">
              Enter the details for the new service group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GroupForm mode="create" />
          </CardContent>
        </Card>
      </div>
    </>
  )
}