/**
 * Comprehensive tests for form validation components and schemas
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ServiceForm } from '@/components/services/service-form'
import { GroupForm } from '@/components/groups/group-form'
import { createServiceSchema, createGroupSchema } from '@/lib/validations'

// Mock the hooks
jest.mock('@/lib/hooks/use-groups', () => ({
  useGroups: () => ({
    data: [
      { id: '1', name: 'storage', description: 'Storage services', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', services: [] }
    ],
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
  useCreateGroup: () => ({
    mutate: jest.fn(),
    loading: false,
    error: null,
    reset: jest.fn(),
  }),
  useUpdateGroup: () => ({
    mutate: jest.fn(),
    loading: false,
    error: null,
    reset: jest.fn(),
  })
}))

jest.mock('@/lib/hooks/use-services', () => ({
  useServices: () => ({
    data: [],
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
  useCreateService: () => ({
    mutate: jest.fn(),
    loading: false,
    error: null,
    reset: jest.fn(),
  }),
  useUpdateService: () => ({
    mutate: jest.fn(),
    loading: false,
    error: null,
    reset: jest.fn(),
  })
}))

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
  })
}))

// Mock the form validation components
jest.mock('@/components/common/form-validation', () => ({
  ValidationDisplay: () => null,
  FormValidationSummary: () => null,
  FormSubmissionFeedback: () => null,
  useFormSubmission: () => ({
    state: {
      isSubmitting: false,
      hasErrors: false,
      errors: []
    },
    submit: jest.fn(),
    reset: jest.fn()
  })
}))

describe('Form Validation', () => {
  describe('Validation Schema Tests', () => {
    describe('createServiceSchema', () => {
      it('validates valid service data', () => {
        const validData = {
          name: 'test-service',
          type: 'web' as const,
          ip_addresses: ['192.168.1.1'],
          ports: [80, 443],
          vlan_id: 100,
          domain: 'example.com',
          group_id: '123e4567-e89b-12d3-a456-426614174000' // Valid UUID format
        }

        const result = createServiceSchema.safeParse(validData)
        if (!result.success) {
          console.log('Validation errors:', result.error.issues)
        }
        expect(result.success).toBe(true)
      })

      it('rejects invalid IP addresses', () => {
        const invalidData = {
          name: 'test-service',
          type: 'web' as const,
          ip_addresses: ['999.999.999.999'],
          ports: [80],
          group_id: 'group-1'
        }

        const result = createServiceSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Invalid IP address format')
        }
      })

      it('rejects invalid port numbers', () => {
        const invalidData = {
          name: 'test-service',
          type: 'web' as const,
          ip_addresses: ['192.168.1.1'],
          ports: [99999],
          group_id: 'group-1'
        }

        const result = createServiceSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('65535')
        }
      })

      it('rejects invalid VLAN IDs', () => {
        const invalidData = {
          name: 'test-service',
          type: 'web' as const,
          ip_addresses: ['192.168.1.1'],
          ports: [80],
          vlan_id: 5000,
          group_id: 'group-1'
        }

        const result = createServiceSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('4094')
        }
      })
    })

    describe('createGroupSchema', () => {
      it('validates valid group data', () => {
        const validData = {
          name: 'test-group',
          description: 'Test group description'
        }

        const result = createGroupSchema.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('rejects empty group name', () => {
        const invalidData = {
          name: '',
          description: 'Test description'
        }

        const result = createGroupSchema.safeParse(invalidData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('required')
        }
      })
    })
  })

  describe('Real-time Validation', () => {
    it('renders service form with validation fields', () => {
      render(<ServiceForm mode="create" onSuccess={jest.fn()} />)

      // Check that the form renders with validation-related elements
      expect(screen.getByLabelText(/service name/i)).toBeInTheDocument()
      expect(screen.getByText(/letters, numbers, underscores, and hyphens only/i)).toBeInTheDocument()
    })

    it('renders group form with validation fields', () => {
      render(<GroupForm mode="create" onSuccess={jest.fn()} />)

      // Check that the form renders with validation-related elements
      expect(screen.getByLabelText(/group name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    })
  })
})