"use client"

import * as React from "react"
import { NetworkService, Group } from "@/lib/types"
import { TacticalModal } from "@/components/tactical/tactical-modal"
import { TacticalButton } from "@/components/tactical/tactical-button"
import { StatusIndicator } from "@/components/tactical/status-indicator"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Eye, Edit, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"

interface ServiceDetailModalProps {
  service: NetworkService | null
  group?: Group
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (service: NetworkService) => void
  onDelete?: (service: NetworkService) => void
}

export function ServiceDetailModal({
  service,
  group,
  open,
  onOpenChange,
  onEdit,
  onDelete
}: ServiceDetailModalProps) {
  if (!service) return null

  const getServiceStatus = (service: NetworkService) => {
    if (service.ipAddress && service.internalPorts?.length > 0) {
      return 'online'
    }
    if (!service.ipAddress) {
      return 'warning'
    }
    return 'offline'
  }

  const formatServiceType = (type: NetworkService['type']) => {
    if (!type) return 'UNKNOWN'
    return type.toUpperCase()
  }

  const formatIpAddresses = (addresses: string) => {
    if (!addresses) return []
    return addresses.split(',').map(ip => ip.trim()).filter(Boolean)
  }

  const formatPorts = (ports: number[]) => {
    if (!ports || ports.length === 0) return []
    return ports
  }

  const status = getServiceStatus(service)
  const ipAddresses = formatIpAddresses(service.ipAddress || '')
  const internalPorts = formatPorts(service.internalPorts || [])
  const externalPorts = formatPorts(service.externalPorts || [])

  return (
    <TacticalModal
      title={`Service Details`}
      description={`Detailed information for ${service.name}`}
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      footer={
        <div className="flex gap-2 w-full">
          <TacticalButton
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Close
          </TacticalButton>
          <TacticalButton
            variant="secondary"
            asChild
            className="flex-1"
          >
            <Link href={`/services/${service.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </TacticalButton>
          {onDelete && (
            <TacticalButton
              variant="danger"
              onClick={() => {
                onDelete(service)
                onOpenChange(false)
              }}
              className="flex-1"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </TacticalButton>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Service Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white font-mono tracking-wider">
              {service.name.toUpperCase()}
            </h3>
            <div className="flex items-center gap-3">
              <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 font-mono text-xs">
                {formatServiceType(service.type)}
              </Badge>
              <StatusIndicator 
                status={status} 
                label={status}
                showPulse={status === 'online'}
              />
            </div>
          </div>
          <TacticalButton
            variant="ghost"
            size="sm"
            asChild
          >
            <Link href={`/services/${service.id}`}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </TacticalButton>
        </div>

        <Separator className="bg-neutral-700" />

        {/* Network Configuration */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-neutral-300 tracking-wider">
            NETWORK CONFIGURATION
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* IP Addresses */}
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 tracking-wider">IP ADDRESSES</label>
              <div className="bg-neutral-800 border border-neutral-700 rounded p-3">
                {ipAddresses.length > 0 ? (
                  <div className="space-y-1">
                    {ipAddresses.map((ip, index) => (
                      <div key={index} className="font-mono text-sm text-white">
                        {ip}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-neutral-500 font-mono text-sm">NONE</span>
                )}
              </div>
            </div>

            {/* Internal Ports */}
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 tracking-wider">INTERNAL PORTS</label>
              <div className="bg-neutral-800 border border-neutral-700 rounded p-3">
                {internalPorts.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {internalPorts.map((port, index) => (
                      <Badge key={index} className="bg-neutral-700 text-white border-neutral-600 font-mono text-xs">
                        {port}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-neutral-500 font-mono text-sm">NONE</span>
                )}
              </div>
            </div>

            {/* External Ports */}
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 tracking-wider">EXTERNAL PORTS</label>
              <div className="bg-neutral-800 border border-neutral-700 rounded p-3">
                {externalPorts.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {externalPorts.map((port, index) => (
                      <Badge key={index} className="bg-neutral-700 text-white border-neutral-600 font-mono text-xs">
                        {port}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-neutral-500 font-mono text-sm">NONE</span>
                )}
              </div>
            </div>

            {/* VLAN */}
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 tracking-wider">VLAN ID</label>
              <div className="bg-neutral-800 border border-neutral-700 rounded p-3">
                {service.vlan ? (
                  <span className="font-mono text-sm text-white">{service.vlan}</span>
                ) : (
                  <span className="text-neutral-500 font-mono text-sm">NONE</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-neutral-700" />

        {/* Service Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-neutral-300 tracking-wider">
            SERVICE INFORMATION
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Domain */}
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 tracking-wider">DOMAIN</label>
              <div className="bg-neutral-800 border border-neutral-700 rounded p-3">
                {service.domain ? (
                  <span className="font-mono text-sm text-white">{service.domain}</span>
                ) : (
                  <span className="text-neutral-500 font-mono text-sm">NONE</span>
                )}
              </div>
            </div>

            {/* Group */}
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 tracking-wider">GROUP</label>
              <div className="bg-neutral-800 border border-neutral-700 rounded p-3">
                <span className="text-orange-500 font-mono text-sm">
                  {group?.name.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
            </div>

            {/* Created Date */}
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 tracking-wider">CREATED</label>
              <div className="bg-neutral-800 border border-neutral-700 rounded p-3">
                <span className="font-mono text-sm text-neutral-300">
                  {new Date(service.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Updated Date */}
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 tracking-wider">LAST UPDATED</label>
              <div className="bg-neutral-800 border border-neutral-700 rounded p-3">
                <span className="font-mono text-sm text-neutral-300">
                  {new Date(service.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TacticalModal>
  )
}