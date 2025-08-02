"use client"

import Link from "next/link"
import { Plus, Users, Monitor, Target } from "lucide-react"
import TemplatePage from "@/components/template/page"
import { GroupForm } from "@/components/groups/group-form"

export default function NewGroupPage() {
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
      breadcrumb="NEW"
    >
      {/* New Group Page Content */}
      <div className="p-6">
        {/* Page Header */}
        <div className="border-b border-neutral-700 bg-neutral-800/50 backdrop-blur-sm rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Add New Group
                </h1>
                <p className="text-sm text-neutral-400">Create a new network group</p>
              </div>
            </div>
          </div>
        </div>

        {/* Group Form */}
        <div className="max-w-4xl">
          <GroupForm mode="create" />
        </div>
      </div>
    </TemplatePage>
  )
}