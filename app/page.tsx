"use client"

import { Monitor, Target, Users } from "lucide-react"
import TemplatePage from "../components/template/page"
import CommandPage from "./command/page"

export default function Dashboard() {
  return (
    <TemplatePage
      title="INFRASTRUCTURE"
      sections={[
        { id: "overview", icon: Monitor, label: "COMMAND", href: "/" },
        { id: "groups", icon: Users, label: "GROUPS", href: "/groups" },
        { id: "services", icon: Target, label: "SERVICES", href: "/services" },
      ]}
      currentSection="overview"
      showSystemStatus={true}
    >
      <CommandPage />
    </TemplatePage>
  )
}
