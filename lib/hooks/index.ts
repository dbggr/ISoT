/**
 * Custom hooks for data fetching and mutations
 * Centralized exports for all data management hooks
 */

// Services hooks
export {
  useServices,
  useService,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useBulkServiceOperations
} from './use-services'

// Groups hooks
export {
  useGroups,
  useGroup,
  useGroupServices,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useGroupDeletionCheck
} from './use-groups'