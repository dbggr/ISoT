"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  createGroupSchema, 
  updateGroupSchema,
  createGroupNameUniqueSchema,
  updateGroupNameUniqueSchema,
  CreateGroupInput,
  UpdateGroupInput 
} from "@/lib/validations"
import { 
  useCreateGroup, 
  useUpdateGroup, 
  useGroups 
} from "@/lib/hooks/use-groups"
import { Group } from "@/lib/types"
import { 
  ValidationDisplay, 
  FormSubmissionFeedback,
  useFormSubmission 
} from "@/components/common/form-validation"
import { useGroupNameValidation } from "@/lib/hooks/use-field-validation"
import { UnsavedChangesDialog } from "@/components/common/confirmation-dialog"

interface GroupFormProps {
  group?: Group
  mode: 'create' | 'edit'
  onSuccess?: (group: Group) => void
  onCancel?: () => void
}

export function GroupForm({ group, mode, onSuccess, onCancel }: GroupFormProps) {
  const router = useRouter()
  const { success, error } = useToast()
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  
  // Hooks for data operations
  const createGroup = useCreateGroup()
  const updateGroup = useUpdateGroup()
  const { data: existingGroups } = useGroups()

  // Enhanced form submission state
  const formSubmission = useFormSubmission()

  // Create validation schema with uniqueness check
  const getValidationSchema = () => {
    const existingNames = existingGroups
      ?.filter(g => mode === 'edit' ? g.id !== group?.id : true)
      ?.map(g => g.name) || []

    if (mode === 'create') {
      return createGroupNameUniqueSchema(existingNames)
    } else {
      return updateGroupNameUniqueSchema(existingNames, group?.name)
    }
  }

  // Form setup
  const form = useForm<CreateGroupInput | UpdateGroupInput>({
    resolver: zodResolver(getValidationSchema()),
    defaultValues: {
      name: group?.name || "",
      description: group?.description || "",
    },
  })

  // Watch form values for validation
  const watchedName = form.watch('name')

  // Field-level validation hooks
  const nameValidation = useGroupNameValidation(watchedName || '', group?.id)

  // Update form validation when existing groups change
  useEffect(() => {
    const schema = getValidationSchema()
    form.clearErrors()
    // Re-validate current values with new schema
    const currentValues = form.getValues()
    const result = schema.safeParse(currentValues)
    if (!result.success) {
      result.error.errors.forEach((error) => {
        form.setError(error.path[0] as keyof (CreateGroupInput | UpdateGroupInput), {
          message: error.message
        })
      })
    }
  }, [existingGroups, form])

  const onSubmit = async (data: CreateGroupInput | UpdateGroupInput) => {
    formSubmission.setSubmitting(true)
    
    try {
      let result: Group
      
      if (mode === 'create') {
        result = await createGroup.mutate(data as CreateGroupInput)
        success(
          'Group created',
          `Group "${result.name}" has been created successfully.`
        )
      } else if (group) {
        result = await updateGroup.mutate({ 
          id: group.id, 
          data: data as UpdateGroupInput 
        })
        success(
          'Group updated',
          `Group "${result.name}" has been updated successfully.`
        )
      } else {
        throw new Error("Group ID is required for update")
      }

      formSubmission.setSuccess(mode === 'create' ? 'Group created successfully' : 'Group updated successfully')

      if (onSuccess) {
        onSuccess(result)
      } else {
        router.push(`/groups/${result.id}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      formSubmission.setError(errorMessage)
      error(
        mode === 'create' ? 'Failed to create group' : 'Failed to update group',
        errorMessage
      )
    }
  }

  const handleCancel = () => {
    if (form.formState.isDirty) {
      setShowUnsavedDialog(true)
    } else if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  const handleDiscardChanges = () => {
    form.reset()
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  const handleSaveChanges = async () => {
    await form.handleSubmit(onSubmit)()
  }

  // Check if form has been modified
  const isFormDirty = form.formState.isDirty

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="form-responsive">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter group name" 
                  {...field}
                  disabled={formSubmission.state.isSubmitting}
                  className="touch-target"
                />
              </FormControl>
              <FormDescription className="text-responsive-sm">
                A unique name for this group. This will be used to organize services.
              </FormDescription>
              <ValidationDisplay state={nameValidation} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter group description (optional)"
                  className="resize-none touch-target"
                  rows={3}
                  {...field}
                  disabled={formSubmission.state.isSubmitting}
                />
              </FormControl>
              <FormDescription className="text-responsive-sm">
                Optional description to explain the purpose of this group.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Submission Feedback */}
        <FormSubmissionFeedback state={formSubmission.state} />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={formSubmission.state.isSubmitting}
            className="touch-target w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={formSubmission.state.isSubmitting || !form.formState.isValid}
            className="touch-target w-full sm:w-auto"
          >
            {formSubmission.state.isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              mode === 'create' ? 'Create Group' : 'Update Group'
            )}
          </Button>
        </div>

        {/* Show warning if form is dirty and user tries to navigate away */}
        {isFormDirty && (
          <div className="text-sm text-muted-foreground text-responsive-sm">
            You have unsaved changes. Make sure to save before leaving this page.
          </div>
        )}

        {/* Unsaved Changes Dialog */}
        <UnsavedChangesDialog
          open={showUnsavedDialog}
          onOpenChange={setShowUnsavedDialog}
          onSave={handleSaveChanges}
          onDiscard={handleDiscardChanges}
          loading={formSubmission.state.isSubmitting}
        />
      </form>
    </Form>
  )
}