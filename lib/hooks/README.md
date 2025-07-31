# Custom Hooks for Data Fetching

This directory contains custom React hooks for managing data fetching, caching, and mutations for the Network Source of Truth application.

## Services Hooks

### `useServices(params?)`
Fetches multiple services with pagination, filtering, and sorting support.

```tsx
import { useServices } from '@/lib/hooks'

function ServicesPage() {
  const { data, loading, error, refetch, pagination } = useServices({
    page: 1,
    limit: 10,
    search: 'web',
    type: 'web'
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {data.map(service => (
        <div key={service.id}>{service.name}</div>
      ))}
    </div>
  )
}
```

### `useService(id)`
Fetches a single service by ID.

```tsx
import { useService } from '@/lib/hooks'

function ServiceDetail({ id }: { id: string }) {
  const { service, loading, error, refetch } = useService(id)

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!service) return <div>Service not found</div>

  return <div>{service.name}</div>
}
```

### `useCreateService()`
Hook for creating new services.

```tsx
import { useCreateService } from '@/lib/hooks'

function CreateServiceForm() {
  const { mutate, loading, error, reset } = useCreateService()

  const handleSubmit = async (data: CreateServiceData) => {
    try {
      const newService = await mutate(data)
      console.log('Created:', newService)
      // Handle success (e.g., redirect)
    } catch (err) {
      // Error is automatically set in hook state
      console.error('Failed to create service')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div>Error: {error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Service'}
      </button>
    </form>
  )
}
```

### `useUpdateService()`
Hook for updating existing services.

```tsx
import { useUpdateService } from '@/lib/hooks'

function EditServiceForm({ serviceId }: { serviceId: string }) {
  const { mutate, loading, error } = useUpdateService()

  const handleUpdate = async (data: UpdateServiceData) => {
    try {
      const updatedService = await mutate({ id: serviceId, data })
      console.log('Updated:', updatedService)
    } catch (err) {
      console.error('Failed to update service')
    }
  }

  return (
    <form onSubmit={handleUpdate}>
      {error && <div>Error: {error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Service'}
      </button>
    </form>
  )
}
```

### `useDeleteService()`
Hook for deleting services.

```tsx
import { useDeleteService } from '@/lib/hooks'

function DeleteServiceButton({ serviceId }: { serviceId: string }) {
  const { mutate, loading, error } = useDeleteService()

  const handleDelete = async () => {
    if (confirm('Are you sure?')) {
      try {
        await mutate(serviceId)
        console.log('Service deleted')
        // Handle success (e.g., refresh list)
      } catch (err) {
        console.error('Failed to delete service')
      }
    }
  }

  return (
    <div>
      {error && <div>Error: {error}</div>}
      <button onClick={handleDelete} disabled={loading}>
        {loading ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  )
}
```

### `useBulkServiceOperations()`
Hook for bulk operations on services.

```tsx
import { useBulkServiceOperations } from '@/lib/hooks'

function BulkActionsToolbar({ selectedIds }: { selectedIds: string[] }) {
  const { bulkDelete, bulkUpdateGroup, loading, error } = useBulkServiceOperations()

  const handleBulkDelete = async () => {
    try {
      await bulkDelete(selectedIds)
      console.log('Bulk delete completed')
    } catch (err) {
      console.error('Bulk delete failed')
    }
  }

  const handleBulkGroupChange = async (newGroupId: string) => {
    try {
      await bulkUpdateGroup(selectedIds, newGroupId)
      console.log('Bulk group update completed')
    } catch (err) {
      console.error('Bulk group update failed')
    }
  }

  return (
    <div>
      {error && <div>Error: {error}</div>}
      <button onClick={handleBulkDelete} disabled={loading}>
        Delete Selected ({selectedIds.length})
      </button>
      <button onClick={() => handleBulkGroupChange('new-group')} disabled={loading}>
        Change Group
      </button>
    </div>
  )
}
```

## Groups Hooks

### `useGroups()`
Fetches all groups.

```tsx
import { useGroups } from '@/lib/hooks'

function GroupsList() {
  const { data, loading, error, refetch } = useGroups()

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {data.map(group => (
        <div key={group.id}>{group.name}</div>
      ))}
    </div>
  )
}
```

### `useGroup(id)`
Fetches a single group by ID.

```tsx
import { useGroup } from '@/lib/hooks'

function GroupDetail({ id }: { id: string }) {
  const { group, loading, error } = useGroup(id)

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!group) return <div>Group not found</div>

  return <div>{group.name}</div>
}
```

### `useGroupServices(groupId)`
Fetches services associated with a specific group.

```tsx
import { useGroupServices } from '@/lib/hooks'

function GroupServicesView({ groupId }: { groupId: string }) {
  const { services, loading, error } = useGroupServices(groupId)

  if (loading) return <div>Loading services...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h3>Services in this group:</h3>
      {services.map(service => (
        <div key={service.id}>{service.name}</div>
      ))}
    </div>
  )
}
```

### `useGroupDeletionCheck(groupId)`
Checks if a group can be safely deleted.

```tsx
import { useGroupDeletionCheck } from '@/lib/hooks'

function DeleteGroupButton({ groupId }: { groupId: string }) {
  const { canDelete, associatedServices, loading } = useGroupDeletionCheck(groupId)

  if (loading) return <div>Checking...</div>

  return (
    <div>
      {!canDelete && (
        <div>
          Cannot delete: {associatedServices.length} services are associated with this group
        </div>
      )}
      <button disabled={!canDelete}>
        {canDelete ? 'Delete Group' : 'Cannot Delete'}
      </button>
    </div>
  )
}
```

## Features

- **Automatic Error Handling**: All hooks include error state management
- **Loading States**: Built-in loading indicators for all operations
- **Memory Leak Prevention**: Proper cleanup to prevent state updates after unmount
- **Type Safety**: Full TypeScript support with proper typing
- **Retry Logic**: Built-in retry mechanisms for failed requests
- **Optimistic Updates**: Support for optimistic UI updates
- **Caching**: Efficient data caching and refetching capabilities

## Error Handling

All hooks provide consistent error handling:

```tsx
const { data, loading, error, refetch } = useServices()

// Error is a string message that can be displayed to users
if (error) {
  return <div className="error">Error: {error}</div>
}
```

## Loading States

All hooks provide loading states for better UX:

```tsx
const { data, loading } = useServices()

if (loading) {
  return <div className="spinner">Loading...</div>
}
```

## Refetching Data

All query hooks provide a refetch function:

```tsx
const { data, refetch } = useServices()

// Manually refetch data
const handleRefresh = () => {
  refetch()
}
```