'use client'

import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { useGroups } from '@/lib/hooks/use-groups'
import { useCreateService, useUpdateService } from '@/lib/hooks/use-services'
import { createServiceSchema, updateServiceSchema, CreateServiceInput, UpdateServiceInput } from '@/lib/validations'
import { NetworkService } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { 
  ValidationDisplay, 
  FormValidationSummary, 
  FormSubmissionFeedback,
  useFormSubmission 
} from '@/components/common/form-validation'
import { 
  useServiceNameValidation,
  useIPAddressValidation,
  usePortValidation,
  useVLANValidation,
  useDomainValidation,
  useIPAddressArrayValidation,
  usePortArrayValidation
} from '@/lib/hooks/use-field-validation'
import { UnsavedChangesDialog } from '@/components/common/confirmation-dialog'

interface ServiceFormProps {
  mode: 'create' | 'edit'
  service?: NetworkService
  onSuccess?: (service: NetworkService) => void
  onCancel?: () => void
}

const serviceTypes = [
  { value: 'web', label: 'Web' },
  { value: 'database', label: 'Database' },
  { value: 'api', label: 'API' },
  { value: 'storage', label: 'Storage' },
  { value: 'security', label: 'Security' },
  { value: 'monitoring', label: 'Monitoring' },
] as const

export function ServiceForm({ mode, service, onSuccess, onCancel }: ServiceFormProps) {
  const { data: groups, loading: groupsLoading } = useGroups()
  const createService = useCreateService()
  const updateService = useUpdateService()
  const { success, error } = useToast()

  const isEditing = mode === 'edit'
  const isLoading = createService.loading || updateService.loading

  // Enhanced form submission state
  const formSubmission = useFormSubmission()
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

  // Form setup with appropriate schema based on mode
  const form = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: isEditing && service ? {
      name: service.name,
      type: service.type,
      ipAddress: service.ipAddress || '',
      internalPorts: service.internalPorts?.length > 0 ? service.internalPorts : [80],
      externalPorts: service.externalPorts?.length > 0 ? service.externalPorts : [80],
      vlan: typeof service.vlan === 'number' ? service.vlan : undefined,
      domain: service.domain || '',
      groupId: service.groupId,
    } : {
      name: '',
      type: 'web' as const,
      ipAddress: '',
      internalPorts: [80],
      externalPorts: [80],
      vlan: undefined,
      domain: '',
      groupId: '',
    },
  })

  // Enhanced state management for dynamic arrays
  const [internalPorts, setInternalPorts] = React.useState<number[]>(
    isEditing && service ? service.internalPorts : [80]
  )
  const [externalPorts, setExternalPorts] = React.useState<number[]>(
    isEditing && service ? service.externalPorts : [80]
  )

  // Watch form values for validation
  const watchedName = form.watch('name')
  const watchedVlan = form.watch('vlan')
  const watchedDomain = form.watch('domain')
  const watchedIpAddress = form.watch('ipAddress')

  // Field-level validation hooks
  const nameValidation = useServiceNameValidation(watchedName || '', service?.id)
  const vlanValidation = useVLANValidation(watchedVlan)
  const domainValidation = useDomainValidation(watchedDomain)
  // For single ipAddress field, validate as string
  const ipValidation = useIPAddressArrayValidation([watchedIpAddress])
  const internalPortArrayValidation = usePortArrayValidation(internalPorts)
  const externalPortArrayValidation = usePortArrayValidation(externalPorts)

  // Reset form when service changes (for edit mode)
  useEffect(() => {
    if (isEditing && service) {
      form.reset({
        name: service.name,
        type: service.type,
        ipAddress: service.ipAddress || '',
        internalPorts: service.internalPorts,
        externalPorts: service.externalPorts,
        vlan: typeof service.vlan === 'number' ? service.vlan : undefined,
        domain: service.domain || '',
        groupId: service.groupId,
      })
    }
  }, [service, isEditing, form])

  const onSubmit = async (data: CreateServiceInput) => {
    formSubmission.setSubmitting(true)
    try {
      // Merge form data with state arrays
      const submitData = {
        ...data,
        internalPorts: internalPorts.filter(port => port > 0),
        externalPorts: externalPorts.filter(port => port > 0),
        vlan: typeof data.vlan === 'number' ? String(data.vlan) : undefined,
      }
      let result: NetworkService | void
      if (isEditing && service) {
        result = await updateService.mutate({ 
          id: service.id, 
          data: submitData
        })
        if (result) {
          success(
            'Service updated',
            `Service "${result.name}" has been updated successfully.`
          )
        }
      } else {
        result = await createService.mutate(submitData)
        if (result) {
          success(
            'Service created',
            `Service "${result.name}" has been created successfully.`
          )
        }
      }
      formSubmission.setSuccess(isEditing ? 'Service updated successfully' : 'Service created successfully')
      if (onSuccess && result) {
        onSuccess(result)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      formSubmission.setError(errorMessage)
      error(
        isEditing ? 'Failed to update service' : 'Failed to create service',
        errorMessage
      )
    }
  }

  const handleCancel = () => {
    if (form.formState.isDirty) {
      setShowUnsavedDialog(true)
    } else {
      onCancel?.()
    }
  }

  const handleDiscardChanges = () => {
    form.reset()
    onCancel?.()
  }

  const handleSaveChanges = async () => {
    await form.handleSubmit(onSubmit)()
  }

  // Port handlers
  const handleAddInternalPort = () => {
    setInternalPorts([...internalPorts, 80])
  }
  const handleRemoveInternalPort = (index: number) => {
    if (internalPorts.length > 1) {
      setInternalPorts(internalPorts.filter((_, i) => i !== index))
    }
  }
  const handleInternalPortChange = (index: number, value: number) => {
    const newPorts = [...internalPorts]
    newPorts[index] = value
    setInternalPorts(newPorts)
    form.setValue('internalPorts', newPorts)
  }
  const handleAddExternalPort = () => {
    setExternalPorts([...externalPorts, 80])
  }
  const handleRemoveExternalPort = (index: number) => {
    if (externalPorts.length > 1) {
      setExternalPorts(externalPorts.filter((_, i) => i !== index))
    }
  }
  const handleExternalPortChange = (index: number, value: number) => {
    const newPorts = [...externalPorts]
    newPorts[index] = value
    setExternalPorts(newPorts)
    form.setValue('externalPorts', newPorts)
  }

  return (
    <Card className="card-responsive">
      <CardHeader className="spacing-mobile">
        <CardTitle className="text-responsive-base">
          {isEditing ? 'Edit Service' : 'Create New Service'}
        </CardTitle>
        <CardDescription className="text-responsive-sm">
          {isEditing 
            ? 'Update the service configuration below.' 
            : 'Fill in the details to create a new network service.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="spacing-mobile">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="form-responsive">
            {/* Service Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., web-server-01" 
                      {...field}
                      className="touch-target"
                    />
                  </FormControl>
                  <FormDescription>
                    A unique name for this service (letters, numbers, underscores, and hyphens only)
                  </FormDescription>
                  <ValidationDisplay state={nameValidation} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Service Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="touch-target">
                        <SelectValue placeholder="Select a service type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The category that best describes this service
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* IP Addresses */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>IP Addresses</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {}} // No add button for IP addresses
                  disabled={false} // No limit for IP addresses
                  className="touch-target"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Add IP</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="192.168.1.100"
                    value={watchedIpAddress}
                    onChange={(e) => form.setValue('ipAddress', e.target.value)}
                    className="touch-target"
                  />
                </div>
              </div>
              <FormDescription>
                IPv4 addresses where this service is accessible (maximum 10)
              </FormDescription>
              <ValidationDisplay state={ipValidation} />
            </div>

            {/* Ports */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Internal Ports</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddInternalPort}
                  disabled={internalPorts.length >= 50}
                  className="touch-target"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Add Port</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
              <div className="space-y-2">
                {internalPorts.map((port, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="80"
                      min="1"
                      max="65535"
                      value={port}
                      onChange={(e) => handleInternalPortChange(index, parseInt(e.target.value) || 0)}
                      className="touch-target"
                    />
                    {internalPorts.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveInternalPort(index)}
                        className="touch-target"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <FormDescription>
                Port numbers where this service listens (1-65535, maximum 50)
              </FormDescription>
              <ValidationDisplay state={internalPortArrayValidation} />
            </div>

            {/* External Ports */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>External Ports</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddExternalPort}
                  disabled={externalPorts.length >= 50}
                  className="touch-target"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Add Port</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
              <div className="space-y-2">
                {externalPorts.map((port, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="80"
                      min="1"
                      max="65535"
                      value={port}
                      onChange={(e) => handleExternalPortChange(index, parseInt(e.target.value) || 0)}
                      className="touch-target"
                    />
                    {externalPorts.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveExternalPort(index)}
                        className="touch-target"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <FormDescription>
                Port numbers where this service is accessible (1-65535, maximum 50)
              </FormDescription>
              <ValidationDisplay state={externalPortArrayValidation} />
            </div>

            {/* VLAN ID */}
            <FormField
              control={form.control}
              name="vlan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VLAN ID (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="100"
                      min="1"
                      max="4094"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      value={field.value || ''}
                      className="touch-target"
                    />
                  </FormControl>
                  <FormDescription>
                    VLAN identifier for network segmentation (1-4094)
                  </FormDescription>
                  <ValidationDisplay state={vlanValidation} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Domain */}
            <FormField
              control={form.control}
              name="domain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="example.com"
                      {...field}
                      className="touch-target"
                    />
                  </FormControl>
                  <FormDescription>
                    Domain name associated with this service
                  </FormDescription>
                  <ValidationDisplay state={domainValidation} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Group Selection */}
            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="touch-target">
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {groupsLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading groups...
                        </SelectItem>
                      ) : (
                        groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The group this service belongs to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Submission Feedback */}
            <FormSubmissionFeedback state={formSubmission.state} />

            {/* Form Actions - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="touch-target w-full sm:w-auto"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading || groupsLoading || formSubmission.state.isSubmitting}
                className="touch-target w-full sm:w-auto"
              >
                {(isLoading || formSubmission.state.isSubmitting) ? (
                  <>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {isEditing ? 'Update Service' : 'Create Service'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {/* Unsaved Changes Dialog */}
        <UnsavedChangesDialog
          open={showUnsavedDialog}
          onOpenChange={setShowUnsavedDialog}
          onSave={handleSaveChanges}
          onDiscard={handleDiscardChanges}
          loading={formSubmission.state.isSubmitting}
        />
      </CardContent>
    </Card>
  )
}