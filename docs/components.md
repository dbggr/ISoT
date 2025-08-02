# Component Documentation

This document provides comprehensive documentation for all components in the Network Source of Truth (NSoT) frontend dashboard.

## Table of Contents

- [Layout Components](#layout-components)
- [Data Display Components](#data-display-components)
- [Form Components](#form-components)
- [Common Components](#common-components)
- [UI Components](#ui-components)
- [Hooks](#hooks)
- [Utilities](#utilities)

## Layout Components


The main navigation sidebar component using shadcn/ui Sidebar components.

**Props:**
- None (uses internal state and routing)

**Features:**
- Responsive collapsible navigation
- Active state indicators
- Touch-friendly mobile interactions
- Keyboard navigation support


## Data Display Components

### ServicesTable (`components/services/services-table.tsx`)

Comprehensive data table for displaying network services with sorting, filtering, and bulk operations.

**Props:**
```tsx
interface ServicesTableProps {
  onServiceSelect?: (service: NetworkService) => void
  onServiceEdit?: (service: NetworkService) => void
  onServiceDelete?: (service: NetworkService) => void
  onBulkDelete?: (serviceIds: string[]) => void
  onBulkGroupChange?: (serviceIds: string[], groupId: string) => void
}
```

**Features:**
- Sortable columns (name, type, group, created_at)
- Search and advanced filtering
- Pagination with configurable page sizes
- Row selection for bulk operations
- Responsive design with horizontal scrolling
- Loading states and error handling
- Accessibility support (ARIA labels, keyboard navigation)

**Usage:**
```tsx
<ServicesTable
  onServiceEdit={(service) => router.push(`/services/${service.id}/edit`)}
  onServiceDelete={handleDelete}
  onBulkDelete={handleBulkDelete}
/>
```

### GroupsTable (`components/groups/groups-table.tsx`)

Data table for displaying service groups with associated service counts.

**Props:**
```tsx
interface GroupsTableProps {
  onGroupSelect?: (group: Group) => void
  onGroupEdit?: (group: Group) => void
  onGroupDelete?: (group: Group) => void
}
```

**Features:**
- Similar to ServicesTable but optimized for group data
- Shows service count per group
- Prevents deletion of groups with associated services

### AccessibleTable (`components/common/accessible-table.tsx`)

Base accessible table component with ARIA support and keyboard navigation.

**Props:**
```tsx
interface AccessibleTableProps {
  data: any[]
  columns: ColumnDef<any>[]
  loading?: boolean
  error?: string
  onRowSelect?: (row: any) => void
  selectable?: boolean
  sortable?: boolean
  searchable?: boolean
  pagination?: boolean
}
```

**Features:**
- Full ARIA support for screen readers
- Keyboard navigation (arrow keys, Enter, Space)
- Focus management
- High contrast mode support
- Customizable column definitions

## Form Components

### ServiceForm (`components/services/service-form.tsx`)

Comprehensive form for creating and editing network services.

**Props:**
```tsx
interface ServiceFormProps {
  service?: NetworkService // For edit mode
  onSubmit: (data: CreateServiceData | UpdateServiceData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}
```

**Features:**
- React Hook Form integration with Zod validation
- Real-time validation with inline error messages
- Dynamic array fields for IP addresses and ports
- Group selection with search
- Accessibility support (proper labeling, error announcements)
- Mobile-optimized layout

**Validation Rules:**
- Name: Required, 1-100 characters
- Type: Required, one of predefined service types
- IP Addresses: Valid IPv4/IPv6 addresses or CIDR notation
- Ports: Valid port numbers (1-65535)
- VLAN ID: Optional, 1-4094
- Domain: Optional, valid domain format

**Usage:**
```tsx
<ServiceForm
  service={existingService}
  onSubmit={handleSubmit}
  onCancel={() => router.back()}
  loading={isSubmitting}
/>
```

### GroupForm (`components/groups/group-form.tsx`)

Form for creating and editing service groups.

**Props:**
```tsx
interface GroupFormProps {
  group?: Group // For edit mode
  onSubmit: (data: CreateGroupData | UpdateGroupData) => Promise<void>
  onCancel?: () => void
  loading?: boolean
}
```

**Features:**
- Simple form with name and description fields
- Name uniqueness validation
- Character count indicators
- Accessibility support

### FormValidation (`components/common/form-validation.tsx`)

Reusable form validation components and utilities.

**Components:**
- `FieldError`: Displays field-level validation errors
- `FormMessage`: Accessible form messages
- `ValidationSummary`: Summary of all form errors

**Usage:**
```tsx
<FieldError error={errors.name} />
<FormMessage type="error" message="Please fix the errors below" />
```

## Common Components

### ErrorBoundary (`components/common/error-boundary.tsx`)

React error boundary for graceful error handling.

**Props:**
```tsx
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}
```

**Features:**
- Catches JavaScript errors in component tree
- Displays user-friendly error messages
- Retry functionality
- Error logging integration
- Development mode error details

**Usage:**
```tsx
<ErrorBoundary onError={logError}>
  <MyComponent />
</ErrorBoundary>
```

### LoadingSpinner (`components/common/loading-spinner.tsx`)

Accessible loading indicator with customizable size and message.

**Props:**
```tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  className?: string
}
```

**Features:**
- Screen reader announcements
- Customizable size and styling
- Optional loading message

### ConfirmationDialog (`components/common/confirmation-dialog.tsx`)

Accessible confirmation dialog for destructive actions.

**Props:**
```tsx
interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  onConfirm: () => void
}
```

**Features:**
- Focus management (traps focus within dialog)
- Keyboard navigation (Escape to close, Enter to confirm)
- ARIA attributes for accessibility
- Customizable styling and text

### GlobalSearch (`components/common/global-search.tsx`)

Global search component with real-time results.

**Props:**
```tsx
interface GlobalSearchProps {
  placeholder?: string
  onResultSelect?: (result: SearchResult) => void
  className?: string
}
```

**Features:**
- Debounced search input
- Keyboard navigation through results
- Search across services and groups
- Highlighted search terms
- Mobile-optimized interface

### VirtualTable (`components/common/virtual-table.tsx`)

Virtualized table component for large datasets.

**Props:**
```tsx
interface VirtualTableProps {
  data: any[]
  columns: ColumnDef<any>[]
  height: number
  rowHeight?: number
  overscan?: number
}
```

**Features:**
- Renders only visible rows for performance
- Smooth scrolling
- Dynamic row heights
- Accessibility maintained with virtual scrolling

## UI Components

The application uses shadcn/ui components as the foundation. Key components include:

### Button (`components/ui/button.tsx`)
- Multiple variants: default, destructive, outline, secondary, ghost, link
- Size variants: default, sm, lg, icon
- Accessibility features built-in

### Card (`components/ui/card.tsx`)
- Structured content containers
- Components: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter

### Dialog (`components/ui/dialog.tsx`)
- Modal dialogs with focus management
- Components: Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription

### Form (`components/ui/form.tsx`)
- Form components integrated with React Hook Form
- Components: Form, FormField, FormItem, FormLabel, FormControl, FormMessage

### Table (`components/ui/table.tsx`)
- Base table components
- Components: Table, TableHeader, TableBody, TableHead, TableRow, TableCell

## Hooks

### useServices (`lib/hooks/use-services.ts`)

Hook for managing services data with caching and error handling.

**Returns:**
```tsx
{
  data: NetworkService[]
  loading: boolean
  error: string | null
  refetch: () => void
  pagination: PaginationInfo
}
```

**Features:**
- Automatic caching with cache invalidation
- Loading and error states
- Pagination support
- Search and filtering
- Optimistic updates

**Usage:**
```tsx
const { data: services, loading, error, refetch } = useServices({
  search: 'web',
  type: 'web',
  page: 1,
  limit: 10
})
```

### useGroups (`lib/hooks/use-groups.ts`)

Hook for managing groups data.

**Returns:**
```tsx
{
  data: Group[]
  loading: boolean
  error: string | null
  refetch: () => void
}
```

### useFieldValidation (`lib/hooks/use-field-validation.ts`)

Hook for real-time field validation.

**Usage:**
```tsx
const { validate, isValidating, error } = useFieldValidation({
  validator: (value) => validateIPAddress(value),
  debounceMs: 300
})
```

## Utilities

### API Client (`lib/api.ts`)

Centralized API client with error handling, retries, and caching.

**Features:**
- Automatic retries with exponential backoff
- Request/response interceptors
- Error handling and transformation
- TypeScript integration
- Cache integration

### Validation (`lib/validations.ts`)

Zod schemas for data validation.

**Schemas:**
- `serviceSchema`: Complete service validation
- `groupSchema`: Group validation
- `ipAddressSchema`: IP address validation
- `portSchema`: Port number validation
- `vlanSchema`: VLAN ID validation

### Cache (`lib/cache.ts`)

Intelligent caching system for API responses.

**Features:**
- LRU cache with configurable size
- TTL (Time To Live) support
- Cache invalidation strategies
- Memory usage optimization
- Cache statistics

### Error Logging (`lib/error-logging.ts`)

Comprehensive error logging and monitoring system.

**Features:**
- Error categorization by severity
- Performance metric tracking
- Local storage for debugging
- Production monitoring integration
- Session tracking

### Accessibility (`lib/accessibility.ts`)

Accessibility utilities and helpers.

**Features:**
- Focus management utilities
- ARIA attribute helpers
- Screen reader announcements
- Keyboard navigation utilities
- High contrast mode detection

## Best Practices

### Component Development

1. **TypeScript First**: All components are fully typed with proper interfaces
2. **Accessibility**: ARIA attributes, keyboard navigation, screen reader support
3. **Responsive Design**: Mobile-first approach with touch-friendly interactions
4. **Error Handling**: Graceful error states with user-friendly messages
5. **Performance**: Lazy loading, virtualization, and memoization where appropriate

### State Management

1. **Local State**: Use React hooks for component-specific state
2. **Server State**: Use custom hooks with caching for API data
3. **Form State**: React Hook Form for complex forms with validation
4. **Global State**: Context API for app-wide state (accessibility, theme)

### Testing

1. **Unit Tests**: Test individual component logic and utilities
2. **Integration Tests**: Test component interactions and API integration
3. **Accessibility Tests**: Automated accessibility testing with jest-axe
4. **Visual Tests**: Storybook for component documentation and visual testing

### Performance

1. **Code Splitting**: Route-based and component-based code splitting
2. **Lazy Loading**: Lazy load heavy components and images
3. **Caching**: Intelligent API response caching
4. **Virtualization**: Virtual scrolling for large datasets
5. **Bundle Optimization**: Tree shaking and bundle analysis

## Troubleshooting

### Common Issues

1. **Hydration Errors**: Ensure server and client render the same content
2. **Memory Leaks**: Clean up event listeners and subscriptions
3. **Performance Issues**: Use React DevTools Profiler to identify bottlenecks
4. **Accessibility Issues**: Use axe-core browser extension for testing
5. **Cache Issues**: Clear cache or check cache invalidation logic

### Debugging Tools

1. **React DevTools**: Component tree and props inspection
2. **Performance Monitor**: Built-in performance monitoring component
3. **Error Logging**: Comprehensive error tracking and reporting
4. **Cache Inspector**: View cache contents and statistics
5. **Accessibility Inspector**: Browser accessibility tools

## Contributing

When adding new components:

1. Follow the established patterns and conventions
2. Add comprehensive TypeScript types
3. Include accessibility features
4. Write unit tests
5. Update this documentation
6. Add Storybook stories for visual components
7. Consider performance implications
8. Test on multiple devices and screen sizes
#
# SEO and Open Graph Setup

### Open Graph Image

The application references `/og-image.png` for Open Graph and Twitter Card images. This image should be:

- **Dimensions**: 1200x630 pixels
- **Format**: PNG or JPG
- **Content**: Should include the application name "Network Source of Truth" and relevant branding
- **File size**: Optimized for web (under 1MB)

### Meta Tags

The `SEOHead` component automatically generates:

- Basic meta tags (title, description, keywords)
- Open Graph tags for social media sharing
- Twitter Card tags
- Structured data (JSON-LD) for search engines
- Canonical URLs for SEO
- Robots meta tags

### Page-Specific SEO

Each page should use the `SEOHead` component with appropriate configuration:

```tsx
import { SEOHead, seoConfigs } from '@/components/common/seo-head'

// Use predefined config
<SEOHead {...seoConfigs.services} />

// Or custom config
<SEOHead 
  title="Custom Page Title"
  description="Custom page description"
  keywords={['custom', 'keywords']}
/>
```