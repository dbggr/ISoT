"use client"

import * as React from "react"
import { 
  StatusIndicator, 
  TacticalCard, 
  TacticalButton, 
  TacticalTable, 
  TacticalModal,
  TacticalConfirmationModal,
  type TacticalTableColumn 
} from "@/components/tactical"

// Sample data for testing the table
const sampleData = [
  { id: 1, name: "web-server-01", type: "HTTP", status: "online", ip: "192.168.1.10" },
  { id: 2, name: "db-server-01", type: "Database", status: "warning", ip: "192.168.1.20" },
  { id: 3, name: "api-gateway", type: "API", status: "error", ip: "192.168.1.30" },
]

const columns: TacticalTableColumn[] = [
  { key: "name", header: "Service Name" },
  { key: "type", header: "Type" },
  { 
    key: "status", 
    header: "Status",
    render: (value) => <StatusIndicator status={value as any} label={value} />
  },
  { key: "ip", header: "IP Address", className: "font-mono" },
]

export const TacticalShowcase: React.FC = () => {
  const [modalOpen, setModalOpen] = React.useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = React.useState(false)

  return (
    <div className="p-6 space-y-8 bg-black min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-white tracking-wider">TACTICAL COMPONENT SHOWCASE</h1>
        
        {/* Status Indicators */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-neutral-300 tracking-wider">STATUS INDICATORS</h2>
          <div className="flex flex-wrap gap-4">
            <StatusIndicator status="online" label="Online" />
            <StatusIndicator status="warning" label="Warning" />
            <StatusIndicator status="error" label="Error" />
            <StatusIndicator status="offline" label="Offline" />
            <StatusIndicator status="maintenance" label="Maintenance" />
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-neutral-300 tracking-wider">TACTICAL BUTTONS</h2>
          <div className="flex flex-wrap gap-4">
            <TacticalButton variant="primary">Primary Action</TacticalButton>
            <TacticalButton variant="secondary">Secondary Action</TacticalButton>
            <TacticalButton variant="danger">Danger Action</TacticalButton>
            <TacticalButton variant="ghost">Ghost Action</TacticalButton>
            <TacticalButton variant="outline">Outline Action</TacticalButton>
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-neutral-300 tracking-wider">TACTICAL CARDS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TacticalCard title="System Status" status="online">
              <div className="space-y-2">
                <p className="text-sm text-neutral-400">All systems operational</p>
                <div className="font-mono text-sm">
                  <div>CPU: 45%</div>
                  <div>Memory: 62%</div>
                  <div>Disk: 78%</div>
                </div>
              </div>
            </TacticalCard>
            
            <TacticalCard title="Network Services" status="warning" subtitle="2 services need attention">
              <div className="space-y-2">
                <p className="text-sm text-neutral-400">Service monitoring active</p>
                <div className="font-mono text-sm">
                  <div>Active: 15</div>
                  <div>Warning: 2</div>
                  <div>Error: 0</div>
                </div>
              </div>
            </TacticalCard>
            
            <TacticalCard title="Database Cluster" status="error">
              <div className="space-y-2">
                <p className="text-sm text-neutral-400">Connection issues detected</p>
                <div className="font-mono text-sm">
                  <div>Primary: Offline</div>
                  <div>Replica: Online</div>
                  <div>Backup: Online</div>
                </div>
              </div>
            </TacticalCard>
          </div>
        </section>

        {/* Table */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-neutral-300 tracking-wider">TACTICAL TABLE</h2>
          <TacticalTable 
            data={sampleData} 
            columns={columns}
            onRowClick={(row) => console.log('Row clicked:', row)}
          />
        </section>

        {/* Modals */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-neutral-300 tracking-wider">TACTICAL MODALS</h2>
          <div className="flex gap-4">
            <TacticalButton onClick={() => setModalOpen(true)}>
              Open Modal
            </TacticalButton>
            <TacticalButton 
              variant="danger" 
              onClick={() => setConfirmModalOpen(true)}
            >
              Open Confirmation
            </TacticalButton>
          </div>
        </section>
      </div>

      {/* Modal Examples */}
      <TacticalModal
        title="Service Details"
        description="Detailed information about the selected service"
        open={modalOpen}
        onOpenChange={setModalOpen}
        size="lg"
        footer={
          <div className="flex gap-2">
            <TacticalButton variant="secondary" onClick={() => setModalOpen(false)}>
              Close
            </TacticalButton>
            <TacticalButton onClick={() => setModalOpen(false)}>
              Save Changes
            </TacticalButton>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-neutral-400 tracking-wider">SERVICE NAME</label>
              <p className="font-mono text-white">web-server-01</p>
            </div>
            <div>
              <label className="text-sm text-neutral-400 tracking-wider">STATUS</label>
              <div className="mt-1">
                <StatusIndicator status="online" label="Online" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm text-neutral-400 tracking-wider">DESCRIPTION</label>
            <p className="text-white mt-1">Primary web server handling HTTP requests for the main application.</p>
          </div>
        </div>
      </TacticalModal>

      <TacticalConfirmationModal
        title="Confirm Deletion"
        description="Are you sure you want to delete this service? This action cannot be undone."
        open={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
        onConfirm={() => console.log('Confirmed!')}
        onCancel={() => console.log('Cancelled!')}
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}